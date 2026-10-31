import { RequestHandler, Response } from "express"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import bcrypt from "bcryptjs"
import ImageKit from "@imagekit/nodejs"
import { ExtendedRequest } from "../types/extended-request"
import { verifyToken } from "./auth.controller"
import { createPost, createPostSlug } from "../services/post.service"
import { prisma } from '../libs/prisma';

export const getImageKitAuth: RequestHandler = async (
    req: ExtendedRequest,
    res: Response
) => {
    // Verifica se o usuário está autenticado
    if (!req.user) {
        res.status(401).json({
            error: "Usuário não autenticado"
        });
        return;
    }

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;

    // Verifica se as credenciais estão configuradas
    if (!privateKey || !publicKey) {
        res.status(503).json({
            error: "O serviço de imagens não está configurado"
        });
        return;
    }

    try {
        const imagekit = new ImageKit({
            privateKey
        });

        const authenticationParameters =
            imagekit.helper.getAuthenticationParameters();

        res.status(200).json({
            ...authenticationParameters,
            publicKey
        });

    } catch (error) {
        console.error(
            "Erro ao gerar autenticação do ImageKit:",
            error
        );

        res.status(500).json({
            error: "Não foi possível gerar os parâmetros de autenticação"
        });
    }
};

export const updateAccountProfile: RequestHandler = async (
    req: ExtendedRequest,
    res: Response
) => {
    if (!req.user) {
        res.status(401).json({
            error: "Usuário não autenticado"
        });
        return;
    }

    const userId = req.user.id;

    const schema = z.object({
        nome: z.string().trim().min(1).max(300).optional(),
        nomeUsuario: z.string().trim().min(1).max(30).optional(),
        email: z.string().trim().email().max(191).optional(),
        numeroTel: z.string().max(30).optional(),
        biografia: z.string().max(5000).optional(),
        imagemPerfil: z.string().url().optional()
    });

    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
        res.status(400).json({
            error: parsed.error.flatten().fieldErrors
        });
        return;
    }

    // Valida se a imagem pertence ao domínio configurado do ImageKit
    if (parsed.data.imagemPerfil) {
        try {
            const imageUrl = new URL(parsed.data.imagemPerfil);
            const imageKitEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

            if (!imageKitEndpoint) {
                res.status(503).json({
                    error: "O serviço de imagens não está configurado"
                });
                return;
            }

            const allowedUrl = new URL(imageKitEndpoint);

            if (
                imageUrl.protocol !== "https:" ||
                imageUrl.host !== allowedUrl.host
            ) {
                res.status(400).json({
                    error: "URL de imagem inválida"
                });
                return;
            }
        } catch {
            res.status(400).json({
                error: "URL de imagem inválida"
            });
            return;
        }
    }

    try {
        const email = parsed.data.email?.toLowerCase();

        if (email) {
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser && existingUser.id !== userId) {
                res.status(409).json({
                    error: "Este e-mail já está cadastrado"
                });
                return;
            }
        }

        const profile = await prisma.user.update({
            where: { id: userId },
            data: {
                ...parsed.data,
                ...(email ? { email } : {})
            },
            select: {
                id: true,
                nome: true,
                nomeUsuario: true,
                email: true,
                numeroTel: true,
                biografia: true,
                imagemPerfil: true
            }
        });

        res.status(200).json({ profile });

    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            res.status(409).json({
                error: "Este e-mail já está cadastrado"
            });
            return;
        }

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2000"
        ) {
            res.status(400).json({
                error: "Um ou mais campos excedem o limite permitido."
            });
            return;
        }

        console.error("Erro ao atualizar perfil:", error);

        res.status(500).json({
            error: "Não foi possível atualizar o perfil"
        });
    }
};

export const updateAccountPassword: RequestHandler = async (req: ExtendedRequest, res: Response) => {
    if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado' })
        return
    }
    const userId = req.user.id

    const schema = z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8).max(72)
    })
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten().fieldErrors })
        return
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { senha: true }
        })
        if (!user || !(await bcrypt.compare(parsed.data.currentPassword, user.senha))) {
            res.status(400).json({ error: 'Senha atual incorreta' })
            return
        }

        const senha = await bcrypt.hash(parsed.data.newPassword, 10)
        await prisma.user.update({
            where: { id: userId },
            data: { senha }
        })
        res.status(200).json({ message: 'Senha alterada com sucesso' })
    } catch (error) {
        console.error('Erro ao alterar senha:', error)
        res.status(500).json({ error: 'Não foi possível alterar a senha' })
    }
}

export const deleteAccount: RequestHandler = async (req: ExtendedRequest, res: Response) => {
    if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado' })
        return
    }
    const userId = req.user.id

    const schema = z.object({ currentPassword: z.string().min(1) })
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
        res.status(400).json({ error: 'Informe sua senha para excluir a conta' })
        return
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { senha: true }
        })
        if (!user || !(await bcrypt.compare(parsed.data.currentPassword, user.senha))) {
            res.status(400).json({ error: 'Senha incorreta' })
            return
        }

        await prisma.$transaction(async (transaction) => {
            const posts = await transaction.post.findMany({
                where: { autorId: userId },
                select: { slug: true }
            })
            const postSlugs = posts.map((post) => post.slug)

            await transaction.liked.deleteMany({ where: { userId } })
            await transaction.favorited.deleteMany({ where: { userId } })
            if (postSlugs.length > 0) {
                await transaction.liked.deleteMany({ where: { postSlug: { in: postSlugs } } })
                await transaction.favorited.deleteMany({ where: { postSlug: { in: postSlugs } } })
                await transaction.tagged.deleteMany({ where: { postSlug: { in: postSlugs } } })
                await transaction.post.deleteMany({ where: { slug: { in: postSlugs } } })
            }
            await transaction.followed.deleteMany({
                where: {
                    OR: [
                        { perfilId: userId },
                        { seguidorId: userId }
                    ]
                }
            })
            await transaction.user.delete({ where: { id: userId } })
        })

        res.status(200).json({ message: 'Conta excluída com sucesso' })
    } catch (error) {
        console.error('Erro ao excluir conta:', error)
        res.status(500).json({ error: 'Não foi possível excluir a conta' })
    }
}

export const addPost: RequestHandler = async (req: ExtendedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({
        error: 'Usuário não autenticado'
    })

    const schema = z.object({
        titulo: z.string(),
        tags: z.string().optional(),
        conteudo: z.string(),
        imagens: z.array(z.string()).optional(),
        legendas: z.array(z.string()).optional(),
        autorId: z.string()
    })
    const data = schema.safeParse(req.body)
    if (!data.success) {
        return res.status(400).json({ error: data.error.flatten().fieldErrors })
    }

    const slug = await createPostSlug(data.data.titulo)

    const newPost = await createPost({
        autorId: req.user.id,
        slug,
        titulo: data.data.titulo,
        conteudo: data.data.conteudo,
        imagens: data.data.imagens ? JSON.stringify(data.data.imagens) : null,
        legendas: data.data.legendas ? JSON.stringify(data.data.legendas) : null,
    })

    const tags = data.data.tags

    if (tags && tags.trim() !== '') {
        const tagsInUse = tags
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)

        console.log(tagsInUse)

        // 1. Transforma o array de strings no formato que o Prisma espera
        const tagsParaInserir = tagsInUse.map((tag: string) => ({
            postSlug: slug,
            tagNome: tag,
        }))

        // 2. Faz um ÚNICO insert no banco do Aiven com todas as tags de uma vez só
        await prisma.tag.createMany({
            data: tagsParaInserir,
            skipDuplicates: true // Ignora erros caso o usuário envie tags duplicadas no mesmo post
        })
    }

    res.status(201).json({
        post: {
            slug: newPost.slug,
            titulo: newPost.titulo,
            dataPostagem: newPost.dataPostagem,
            // cover: coverToUrl(newPost.cover),
            imagens: newPost.imagens ? JSON.parse(newPost.imagens) : [],
            legendas: newPost.legendas ? JSON.parse(newPost.legendas) : [],
            // autorName: author?.nome || 'Unknown'
        }
    })
}

export const editPost: RequestHandler = async (req: ExtendedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Não autorizado' })

    const schema = z.object({
        titulo: z.string(),
        tags: z.string().optional(),
        imagens: z.array(z.string()).max(10).optional(), // Proteção contra payloads gigantes
        legendas: z.array(z.string()).max(10).optional(),
        conteudo: z.string()
    })

    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten().fieldErrors })
    }

    const { slug } = req.params

    // 1. Busca o post para verificar a existência e o autor
    const post = await prisma.post.findUnique({ where: { slug } })
    if (!post) return res.status(404).json({ error: 'Postagem não encontrada' })

    // VALIDAÇÃO DE SEGURANÇA (Anti-IDOR): Compara com o autorId do seu Model
    // Certifique-se de que req.user.id possui o mesmo tipo (String)
    if (post.autorId !== req.user.id) {
        return res.status(403).json({ error: 'Você não tem permissão para editar este post' })
    }

    const tags = parsed.data.tags
    const tagsInUse = tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : []

    if (tagsInUse.length > 20) {
        return res.status(400).json({ error: 'Limite de tags excedido' })
    }

    try {
        // 2. Transação garantindo consistência atômica no banco de dados
        await prisma.$transaction(async (tx) => {
            // Remove vínculos antigos de tags
            await tx.tagged.deleteMany({ where: { postSlug: slug } })

            // Insere as novas tags usando o cliente da transação (tx)
            for (const tag of tagsInUse) {
                await tx.tagged.create({
                    data: {
                        postSlug: slug,
                        tagNome: tag
                    }
                })
            }

            // Atualiza os dados do post (e atualiza o campo dataAtualizacao)
            await tx.post.update({
                where: { slug },
                data: {
                    titulo: parsed.data.titulo,
                    conteudo: parsed.data.conteudo,
                    imagens: parsed.data.imagens ? JSON.stringify(parsed.data.imagens) : null,
                    legendas: parsed.data.legendas ? JSON.stringify(parsed.data.legendas) : null,
                    dataAtualizacao: new Date() // Atualiza explicitamente já que não está com @updatedAt no model
                }
            })
        })

        return res.status(200).json({ message: 'Atualização de postagem bem-sucedida' })
    } catch (error) {
        console.error('Erro ao editar post:', error)
        return res.status(500).json({ error: 'Erro interno ao atualizar a postagem' })
    }
}

export const deletePost: RequestHandler = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Não autorizado'
        })
    }

    const { slug } = req.params
    const postTeste = await prisma.post.findFirst({
        where: { slug }
    })

    // console.log('Post encontrado:', postTeste)
    if (!slug) {
        return res.status(400).json({ error: 'Um slug é requerido' })
    }
    const post = await prisma.post.findUnique({ where: { slug } })
    if (!post) {
        return res.status(404).json({ error: 'Postagem não encontrada' })
    }
    if (post.autorId !== req.user.id) {
        return res.status(403).json({ error: 'Você não está autorizado a deletar essa postagem' })
    }
    await prisma.post.delete({ where: { slug } })

    const postLikes = await prisma.liked.findMany({
        where: {
            postSlug: slug
        }
    })
    // console.log('Curtidas encontradas:', postLikes.length)
    await prisma.liked.delete(postLikes)

    await prisma.liked.deleteMany({
        where: {
            postSlug: slug
        }
    })
    // console.log('Tags encontradas:', postTags.length)
    await prisma.tagged.deleteMany({
        where: {
            postSlug: slug
        }
    })

    res.status(200).json({ message: 'Deleção de postagem bem-sucedida' })
}

export const getFavoritePosts: RequestHandler = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado' })
    }
    const user = req.user
    if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
    }
    const favoritePosts = await prisma.favorited.findMany({
        where: {
            userId: user.id
        }
    })
    res.status(200).json({ favoritePosts })
}

export const addFavoritePost: RequestHandler = async (req, res) => {
    // 1. Verifica se o usuário está autenticado
    if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado' })
    }

    // 2. Extrai e valida se o parâmetro obrigatório existe
    const { postSlug } = req.params
    if (!postSlug) {
        return res.status(400).json({ error: 'O parâmetro postSlug é obrigatório.' })
    }

    const user = req.user

    try {
        // 3. Cria o registro no banco
        const updatedFavorites = await prisma.favorited.create({
            data: {
                userId: user.id,
                postSlug: postSlug
            }
        })

        return res.status(200).json({ favorited: updatedFavorites })
    } catch (error) {
        // 4. Tratamento de erro (Ex: se o post já foi favoritado e a relação for única)
        console.error(error)
        return res.status(500).json({ error: 'Erro interno ao favoritar o post.' })
    }
};

export const likePost: RequestHandler = async (req, res) => {
    // 1. Verifica se o middleware de autenticação validou o usuário
    if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado' });
    }

    const { postSlug } = req.body;

    // Validação básica do corpo da requisição
    if (!postSlug) {
        return res.status(400).json({ error: 'O slug do post é obrigatório' });
    }

    try {
        // 2. Valida o token / busca o usuário no banco
        const user = await verifyToken(req.user.token);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // 3. Usa o upsert para criar se não existir, ou atualizar se já existir
        const updatedLikes = await prisma.liked.upsert({
            where: {
                userId: user.id
            },
            update: {
                likedPosts: {
                    connect: { postSlug: postSlug }
                }
            },
            create: {
                userId: user.id,
                likedPosts: {
                    connect: { postSlug: postSlug }
                }
            },
            // Opcional: inclui os posts curtidos na resposta se necessário
            include: { likedPosts: true }
        });

        return res.status(200).json({ liked: updatedLikes });

    } catch (error) {
        console.error('Erro ao curtir o post:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
};


export const followUser: RequestHandler = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Não encontrado' })
    }
    const { userFlwdId } = req.body
    const user = await verifyToken(req.user.token)
    if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
    }
    const updatedFollowings = await prisma.followed.create({
        data: {
            seguidorId: user.id,
            perfilId: userFlwdId
        }
    })
    res.status(200).json({ followed: updatedFollowings })
}

export const getAccountProfile: RequestHandler = async (req: ExtendedRequest, res: Response) => {
    // 1. Garante que o middleware 'auth' injetou o objeto user na requisição
    if (!req.user) {
        res.status(401).json({ error: 'Não autorizado' });
        return;
    }

    try {
        const userId = req.user.id;

        // 2. Lê a página atual enviada por query string
        const pageQuery = typeof req.query.page === 'string' ? req.query.page : undefined;
        const page = pageQuery ? parseInt(pageQuery, 10) : 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        // 3. Busca os dados essenciais e agrega os contadores de seguidores/seguindo
        const profileData = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                nome: true,
                nomeUsuario: true,
                biografia: true,
                imagemPerfil: true,
                imagemBanner: true,
                numeroTel: true,
                email: true,
                _count: {
                    select: {
                        followed_followed_perfilIdTouser: true, // Seguidores
                        followed_followed_seguidorIdTouser: true, // Seguindo
                    }
                }
            }
        });

        if (!profileData) {
            res.status(404).json({ error: 'Usuário não encontrado' });
            return;
        }

        // 4. Busca os posts de forma isolada respeitando o limite e paginação
        const userPosts = await prisma.post.findMany({
            where: { autorId: userId, dataDelecao: null },
            select: {
                id: true,
                slug: true,
                titulo: true,
                imagens: true,
                dataPostagem: true,
            },
            orderBy: { dataPostagem: 'desc' },
            take: limit,
            skip: skip
        });

        // 4.1. Conta com precisão apenas os posts ativos do usuário
        const totalPostsAtivos = await prisma.post.count({
            where: { autorId: userId, dataDelecao: null }
        });

        // 5. Retorna uma estrutura de payload limpa com os dados corrigidos
        res.status(200).json({
            profile: {
                id: profileData.id,
                nome: profileData.nome,
                nomeUsuario: profileData.nomeUsuario,
                biografia: profileData.biografia,
                imagemPerfil: profileData.imagemPerfil,
                imagemBanner: profileData.imagemBanner,
                numeroTel: profileData.numeroTel,
                email: profileData.email,
                stats: {
                    postsCount: totalPostsAtivos, // Contagem exata sem os deletados
                    followersCount: profileData._count.followed_followed_perfilIdTouser,
                    followingCount: profileData._count.followed_followed_seguidorIdTouser,
                }
            },
            posts: userPosts,
            pagination: {
                currentPage: page,
                limit: limit,
                hasMore: totalPostsAtivos > (page * limit) // Cálculo do hasMore baseado no total real
            }
        });
        return;

    } catch (error) {
        console.error("Erro ao carregar perfil da conta:", error);
        res.status(500).json({ error: 'Erro interno do servidor' });
        return;
    }
};

export const getAccountPosts: RequestHandler = async (req: ExtendedRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado' })
    }

    try {
        const userId = req.user.id
        const pageQuery = typeof req.query.page === 'string' ? req.query.page : undefined;
        const page = pageQuery ? parseInt(pageQuery, 10) : 1;
        const limit = 5
        const skip = (page - 1) * limit

        // Busca APENAS os posts daquela página específica
        const userPosts = await prisma.post.findMany({
            where: {
                autorId: userId,
                dataDelecao: null
            },
            select: {
                id: true,
                slug: true,
                titulo: true,
                imagens: true,
                dataPostagem: true,
            },
            orderBy: {
                dataPostagem: 'desc'
            },
            take: limit,
            skip: skip
        })

        // Conta o total apenas para saber se ainda tem mais páginas pela frente
        const totalPosts = await prisma.post.count({
            where: { autorId: userId, dataDelecao: null }
        })

        return res.status(200).json({
            posts: userPosts,
            pagination: {
                currentPage: page,
                limit: limit,
                hasMore: totalPosts > (page * limit)
            }
        })

    } catch (error) {
        console.error("Erro ao carregar posts do perfil:", error)
        return res.status(500).json({ error: 'Erro interno do servidor' })
    }
}