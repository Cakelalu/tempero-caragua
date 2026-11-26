import { RequestHandler, Response } from "express"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import bcrypt from "bcryptjs"
import ImageKit from "@imagekit/nodejs"
import { ExtendedRequest } from "../types/extended-request"
import { verifyToken } from "./auth.controller"
import { createPostSlug } from "../services/post.service"
import { prisma } from '../libs/prisma';
import { imagekit } from '../libs/imagekit';
import { v4 } from 'uuid';
import { invalidateUserCache } from '../libs/userCache';

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

        if (email) {
            invalidateUserCache(email);
        }

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
        autorId: z.string(),
        imagens: z.array(z.string().url()).optional(),
        legendas: z.array(z.string()).optional(),
    })
    const data = schema.safeParse(req.body)
    if (!data.success) {
        return res.status(400).json({ error: data.error.flatten().fieldErrors })
    }

    // Segurança: somente o próprio usuário autenticado pode criar posts na sua conta
    if (data.data.autorId !== req.user.id) {
        return res.status(403).json({ error: 'Você não tem permissão para criar postagens nesta conta.' })
    }

    const slug = await createPostSlug(data.data.titulo)

    const tagsInUse = [...new Set(
        (data.data.tags ?? '')
            .split(',')
            .map(tag => tag.trim())
            .filter(Boolean)
    )]

    if (tagsInUse.length > 20) {
        return res.status(400).json({ error: 'Limite de tags excedido' })
    }

    const newPost = await prisma.$transaction(async (transaction) => {
        const post = await transaction.post.create({
            data: {
                id: v4(),
                autorId: req.user.id,
                slug,
                titulo: data.data.titulo,
                conteudo: data.data.conteudo,
                imagens: data.data.imagens ? JSON.stringify(data.data.imagens) : null,
                legendas: data.data.legendas ? JSON.stringify(data.data.legendas) : null,
            }
        })

        for (const tag of tagsInUse) {
            await transaction.tag.upsert({
                where: { nome: tag },
                update: {},
                create: { id: v4(), nome: tag }
            })
            await transaction.tagged.create({
                data: { id: v4(), postSlug: slug, tagNome: tag }
            })
        }

        return post
    })

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
        imagens: z.array(z.string()).max(10).optional(),
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

export const deletePost: RequestHandler = async (req: ExtendedRequest, res) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Não autorizado'
        })
    }

    const { slug } = req.params

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

    // Extrai URLs das imagens para excluí-las do ImageKit
    let imageUrls: string[] = []
    try {
        imageUrls = post.imagens ? JSON.parse(post.imagens) : []
    } catch {
        imageUrls = []
    }

    // Exclui arquivos do ImageKit (não bloqueia a exclusão no banco se falhar)
    for (const url of imageUrls) {
        try {
            if (!url || typeof url !== 'string') continue

            // Remove query parameters (transformações do ImageKit) se existirem
            const cleanUrl = url.split('?')[0]
            const urlObj = new URL(cleanUrl)

            // O fileId do ImageKit é o caminho do arquivo no storage
            // Ex: "https://ik.imagekit.io/Teca/posts/abc123.jpg" -> "/posts/abc123.jpg" ou "posts/abc123.jpg"
            let fileId = urlObj.pathname

            // Tenta deletar com o path completo (com barra inicial)
            try {
                await imagekit.deleteFile({ fileId: fileId })
                continue
            } catch {
                // Se falhar, tenta sem a barra inicial
            }

            const fileIdNoLeadingSlash = fileId.replace(/^\//, '')
            try {
                await imagekit.deleteFile({ fileId: fileIdNoLeadingSlash })
                continue
            } catch {
                // Se falhar, tenta extrair apenas os últimos 2 segmentos do path
            }

            const pathParts = fileIdNoLeadingSlash.split('/')
            if (pathParts.length >= 2) {
                const shortFileId = pathParts.slice(-2).join('/')
                try {
                    await imagekit.deleteFile({ fileId: shortFileId })
                    continue
                } catch {
                    // Última tentativa falhou, segue para próxima imagem
                }
            }

            console.error('Não foi possível excluir a imagem do ImageKit:', url)
        } catch (err) {
            console.error('Erro ao processar URL de imagem para exclusão:', err)
        }
    }

    await prisma.$transaction(async (tx) => {
        await tx.liked.deleteMany({ where: { postSlug: slug } })
        await tx.favorited.deleteMany({ where: { postSlug: slug } })
        await tx.tagged.deleteMany({ where: { postSlug: slug } })
        await tx.post.delete({ where: { slug } })
    })

    res.status(200).json({ message: 'Postagem excluída com sucesso' })
}

export const getFavoritePosts: RequestHandler = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado' })
    }
    const user = req.user
    if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
    }
    const pageQuery = typeof req.query.page === 'string' ? req.query.page : undefined;
    const page = pageQuery ? parseInt(pageQuery, 10) : 1;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 12;
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
        prisma.favorited.findMany({
            where: {
                userId: user.id
            },
            include: {
                post: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                nome: true,
                                nomeUsuario: true,
                                imagemPerfil: true,
                            }
                        },
                        _count: {
                            select: { liked: true }
                        }
                    }
                }
            },
            orderBy: { id: 'desc' },
            take: limit,
            skip: skip
        }),
        prisma.favorited.count({
            where: {
                userId: user.id
            }
        })
    ]);

    return res.status(200).json({
        favorites: favorites.map(f => ({
            id: f.id,
            postSlug: f.postSlug,
            post: f.post
        })),
        pagination: {
            currentPage: page,
            limit: limit,
            total,
            hasMore: total > page * limit
        }
    })
}

export const addFavoritePost: RequestHandler = async (req, res) => {
    // 1. Verifica se o usuário está autenticado
    if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado' })
    }

    // 2. Extrai e valida se o parâmetro obrigatório existe
    // A rota está definida como /post/:slug/favoritar, então o parâmetro se chama 'slug'
    const { slug } = req.params
    const postSlug = slug
    if (!postSlug) {
        return res.status(400).json({ error: 'O parâmetro postSlug é obrigatório.' })
    }

    const user = req.user

    try {
        // 3. Verifica se o post existe antes de favoritar
        const postExists = await prisma.post.findUnique({
            where: { slug: postSlug },
            select: { id: true }
        });

        if (!postExists) {
            return res.status(404).json({ error: 'Postagem não encontrada' });
        }

        // 4. Verifica se já existe favorito desse usuário neste post
        const existing = await prisma.favorited.findFirst({
            where: { userId: user.id, postSlug }
        });

        if (existing) {
            // Desfavoritar: remove o registro
            await prisma.favorited.delete({ where: { id: existing.id } });
            return res.status(200).json({ favorited: false, message: 'Post removido dos favoritos' });
        }

        // Favoritar: cria o registro
        const created = await prisma.favorited.create({
            data: {
                id: v4(),
                userId: user.id,
                postSlug: postSlug
            }
        });

        return res.status(200).json({ favorited: true, message: 'Post adicionado aos favoritos', favorited: created });
    } catch (error: any) {
        console.error('Erro ao favoritar postagem:', error);

        // Trata erro de chave estrangeira do Prisma (P2003)
        if (error?.code === 'P2003') {
            return res.status(404).json({ error: 'Postagem não encontrada' });
        }

        return res.status(500).json({ error: 'Erro interno ao favoritar o post.' })
    }
};

export const likePost: RequestHandler = async (req, res) => {
    // 1. Verifica se o middleware de autenticação validou o usuário
    if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado' });
    }

    // 2. Lê o slug do parâmetro de rota (consistente com a definição /post/:slug/curtir)
    const { slug } = req.params;
    const postSlug = slug;

    // Validação básica do parâmetro de rota
    if (!postSlug) {
        return res.status(400).json({ error: 'O slug do post é obrigatório' });
    }

    try {
        // 3. O usuário já foi resolvido pelo middleware de autenticação (auth)
        const user = req.user;
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // 4. Verifica se o post existe e não está deletado (soft delete)
        const postExists = await prisma.post.findUnique({
            where: { slug: postSlug },
            select: { id: true, dataDelecao: true }
        });

        if (!postExists) {
            return res.status(404).json({ error: 'Postagem não encontrada' });
        }

        if (postExists.dataDelecao !== null) {
            return res.status(400).json({ error: 'Não é possível curtir uma postagem excluída' });
        }

        // 5. Verifica se já existe curtida desse usuário neste post
        const existing = await prisma.liked.findFirst({
            where: { userId: user.id, postSlug }
        });

        if (existing) {
            // Descurtir: remove o registro
            await prisma.liked.delete({ where: { id: existing.id } });

            // Conta quantas curtidas restam no post
            const likesCount = await prisma.liked.count({
                where: { postSlug }
            });

            return res.status(200).json({ liked: false, message: 'Curtida removida', likesCount });
        }

        // Curtir: cria o registro
        await prisma.liked.create({
            data: {
                id: v4(),
                userId: user.id,
                postSlug
            }
        });

        // Conta quantas curtidas o post tem agora
        const likesCount = await prisma.liked.count({
            where: { postSlug }
        });

        return res.status(200).json({ liked: true, message: 'Post curtido', likesCount });

    } catch (error: any) {
        console.error('Erro ao curtir o post:', error);

        // Trata erro de chave estrangeira do Prisma (P2003)
        if (error?.code === 'P2003') {
            return res.status(404).json({ error: 'Postagem não encontrada' });
        }

        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
};


export const followUser: RequestHandler = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Não encontrado' })
    }
    const { id: userFlwdId } = req.params

    const existing = await prisma.followed.findUnique({
        where: {
            perfilId_seguidorId: {
                perfilId: userFlwdId,
                seguidorId: req.user.id
            }
        }
    });

    if (existing) {
        return res.status(409).json({ error: 'Você já está seguindo este usuário' });
    }

    const updatedFollowings = await prisma.followed.create({
        data: {
            id: v4(),
            seguidorId: req.user.id,
            perfilId: userFlwdId
        }
    })
    res.status(200).json({ followed: updatedFollowings })
}

export const unfollowUser: RequestHandler = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado' })
    }
    const { id: userId } = req.params
    await prisma.followed.delete({
        where: {
            perfilId_seguidorId: {
                perfilId: userId,
                seguidorId: req.user.id
            }
        }
    })
    res.status(200).json({ message: 'Deixou de seguir com sucesso' })
}

export const checkIfFollowing: RequestHandler = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado' })
    }
    const { id: userId } = req.params
    const existingFollow = await prisma.followed.findUnique({
        where: {
            perfilId_seguidorId: {
                perfilId: userId,
                seguidorId: req.user.id
            }
        }
    })
    res.status(200).json({ isFollowing: !!existingFollow })
}

export const getAccountProfile: RequestHandler = async (req: ExtendedRequest, res: Response) => {
    // 1. Garante que o middleware 'auth' injetou o objeto user na requisição
    if (!req.user) {
        res.status(401).json({ error: 'Não autorizado' });
        return;
    }

    try {
        // 2. Determina qual usuário deve ser carregado: ID da URL (outro perfil) ou ID do logado (próprio perfil)
        const targetUserId = req.params.id || req.user.id;

        // 3. Lê a página atual enviada por query string
        const pageQuery = typeof req.query.page === 'string' ? req.query.page : undefined;
        const page = pageQuery ? parseInt(pageQuery, 10) : 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        // 4. Busca os dados essenciais e agrega os contadores de seguidores/seguindo em paralelo
        const [profileData, userPosts, totalPostsAtivos, isFollowing] = await Promise.all([
            prisma.user.findUnique({
                where: { id: targetUserId },
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
            }),
            prisma.post.findMany({
                where: { autorId: targetUserId, dataDelecao: null },
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
            }),
            prisma.post.count({
                where: { autorId: targetUserId, dataDelecao: null }
            }),
            prisma.followed.findUnique({
                where: {
                    perfilId_seguidorId: {
                        perfilId: targetUserId,
                        seguidorId: req.user.id
                    }
                }
            })
        ]);

        if (!profileData) {
            res.status(404).json({ error: 'Usuário não encontrado' });
            return;
        }

        // 8. Retorna uma estrutura de payload limpa com os dados corrigidos
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
                isFollowing: !!isFollowing,
                stats: {
                    postsCount: totalPostsAtivos,
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

        // Busca posts e total em paralelo
        const [userPosts, totalPosts] = await Promise.all([
            prisma.post.findMany({
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
            }),
            prisma.post.count({
                where: { autorId: userId, dataDelecao: null }
            })
        ])

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

export const searchUsers: RequestHandler = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado' })
    }

    try {
        const { q } = req.query;
        const pageQuery = typeof req.query.page === 'string' ? req.query.page : undefined;
        const page = pageQuery ? parseInt(pageQuery, 10) : 1;
        const limit = 20;
        const skip = (page - 1) * limit;

        if (!q || typeof q !== 'string') {
            return res.status(200).json([]);
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where: {
                    NOT: { id: req.user.id },
                    OR: [
                        { nomeUsuario: { contains: q } },
                        { nome: { contains: q } },
                    ]
                },
                select: {
                    id: true,
                    nome: true,
                    nomeUsuario: true,
                    imagemPerfil: true,
                },
                orderBy: { nomeUsuario: 'asc' },
                take: limit,
                skip: skip
            }),
            prisma.user.count({
                where: {
                    NOT: { id: req.user.id },
                    OR: [
                        { nomeUsuario: { contains: q } },
                        { nome: { contains: q } },
                    ]
                }
            })
        ]);

        // Busca quais usuários o usuário logado já está seguindo (depois de saber os IDs de users)
        const userFollowings = await prisma.followed.findMany({
            where: {
                seguidorId: req.user.id,
                perfilId: { in: users.map(u => u.id) }
            },
            select: {
                perfilId: true,
            }
        });
        const followingIds = new Set(userFollowings.map(f => f.perfilId));

        const usersWithFollowStatus = users.map(user => ({
            ...user,
            isFollowing: followingIds.has(user.id)
        }));

        return res.status(200).json({
            users: usersWithFollowStatus,
            pagination: {
                currentPage: page,
                limit: limit,
                hasMore: total > page * limit,
                total,
            }
        });
    } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

export const createComentario: RequestHandler = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado' });
    }

    const { slug } = req.params;
    const postSlug = slug;

    if (!postSlug) {
        return res.status(400).json({ error: 'O slug do post é obrigatório' });
    }

    const schema = z.object({
        conteudo: z.string().trim().min(1).max(2000)
    });

    const data = schema.safeParse(req.body);
    if (!data.success) {
        return res.status(400).json({ error: data.error.flatten().fieldErrors });
    }

    const user = req.user;

    try {
        // Verifica se o post existe e não está deletado
        const postExists = await prisma.post.findUnique({
            where: { slug: postSlug },
            select: { id: true, dataDelecao: true }
        });

        if (!postExists) {
            return res.status(404).json({ error: 'Postagem não encontrada' });
        }

        if (postExists.dataDelecao !== null) {
            return res.status(400).json({ error: 'Não é possível comentar em uma postagem excluída' });
        }

        const comentario = await prisma.comentario.create({
            data: {
                id: v4(),
                conteudo: data.data.conteudo,
                autorId: user.id,
                postSlug: postSlug
            },
            include: {
                autor: {
                    select: {
                        id: true,
                        nome: true,
                        nomeUsuario: true,
                        imagemPerfil: true
                    }
                }
            }
        });

        return res.status(201).json({ comentario, message: 'Comentário adicionado' });
    } catch (error: any) {
        console.error('Erro ao criar comentário:', error);

        if (error?.code === 'P2003') {
            return res.status(404).json({ error: 'Postagem não encontrada' });
        }

        return res.status(500).json({ error: 'Erro interno ao criar comentário' });
    }
};

export const getComentariosPorPost: RequestHandler = async (req, res) => {
    const { slug } = req.params;
    const postSlug = slug;

    if (!postSlug) {
        return res.status(400).json({ error: 'O slug do post é obrigatório' });
    }

    const pageQuery = typeof req.query.page === 'string' ? req.query.page : undefined;
    const page = pageQuery ? parseInt(pageQuery, 10) : 1;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
    const skip = (page - 1) * limit;

    try {
        const [comentarios, total] = await Promise.all([
            prisma.comentario.findMany({
                where: {
                    postSlug: postSlug,
                    dataDelecao: null
                },
                include: {
                    autor: {
                        select: {
                            id: true,
                            nome: true,
                            nomeUsuario: true,
                            imagemPerfil: true
                        }
                    }
                },
                orderBy: { createdAt: 'asc' },
                take: limit,
                skip: skip
            }),
            prisma.comentario.count({
                where: {
                    postSlug: postSlug,
                    dataDelecao: null
                }
            })
        ]);

        return res.status(200).json({
            comentarios,
            pagination: {
                currentPage: page,
                limit: limit,
                total,
                hasMore: total > page * limit
            }
        });
    } catch (error) {
        console.error('Erro ao buscar comentários:', error);
        return res.status(500).json({ error: 'Erro interno ao buscar comentários' });
    }
};

export const deleteComentario: RequestHandler = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado' });
    }

    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'O ID do comentário é obrigatório' });
    }

    const user = req.user;

    try {
        const comentario = await prisma.comentario.findUnique({
            where: { id },
            select: { id: true, autorId: true, dataDelecao: true }
        });

        if (!comentario) {
            return res.status(404).json({ error: 'Comentário não encontrado' });
        }

        if (comentario.dataDelecao !== null) {
            return res.status(400).json({ error: 'Comentário já foi excluído' });
        }

        // Apenas o autor ou moderador pode excluir
        const isModerator = user.tipo === 'MODERATOR';
        if (comentario.autorId !== user.id && !isModerator) {
            return res.status(403).json({ error: 'Você não tem permissão para excluir este comentário' });
        }

        await prisma.comentario.delete({
            where: { id }
        });

        return res.status(200).json({ message: 'Comentário excluído' });
    } catch (error) {
        console.error('Erro ao excluir comentário:', error);
        return res.status(500).json({ error: 'Erro interno ao excluir comentário' });
    }
};