import { RequestHandler, Response } from "express"
import { z } from "zod"
import { createUser, verifyUser, getUserById } from "../services/user.service"
import { createToken } from "../services/auth.service"
import { ExtendedRequest } from "../types/extended-request"
import { verifyToken } from "./auth.controller"
import { createPost, createPostSlug, handleCover, createTagged } from "../services/post.service"
import { prisma } from '../libs/prisma'

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

    // if (!req.file) {
    //     return res.status(400).json({ error: 'Image is required' })
    // }

    // const coverName = await handleCover(req.file)
    // if(!coverName) {
    //     return res.status(400).json({ error: 'Invalid cover image' })
    // }

    const slug = await createPostSlug(data.data.titulo)

    const newPost = await createPost({
        autorId: req.user.id,
        slug,
        titulo: data.data.titulo,
        conteudo: data.data.conteudo,
        imagens: data.data.imagens,
        legendas: data.data.legendas,
        // cover: coverName
    })

    const tags = data.data.tags

    if (tags != null && tags != [] && tags != '') {
        const tagsInUse = tags.split(',').map(tag => tag.trim())
        console.log(tagsInUse)
        tagsInUse.forEach(async (tag: string) => {await createTagged({
            postSlug: slug,
            tagNome: tag
        })})
    }
    // const author = await getUserById(newPost.autorId)

    res.status(201).json({
        post: {
            slug: newPost.slug,
            titulo: newPost.titulo,
            dataPostagem: newPost.dataPostagem,
            // cover: coverToUrl(newPost.cover),
            imagens: newPost.imagens,
            legendas: newPost.legendas,
            // autorName: author?.nome || 'Unknown'
        }
    })
}

export const editPost: RequestHandler = async (req: ExtendedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Não autorizado' })

    const schema = z.object({
        titulo: z.string(),
        tags: z.string().optional(),
        imagens: z.array(z.string()).optional(),    // Recebe array do Front
        legendas: z.array(z.string()).optional(),   // Recebe array do Front
        conteudo: z.string()
    })

    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten().fieldErrors })
    }

    const { slug } = req.params
    const post = await prisma.post.findUnique({ where: { slug } })
    if (!post) return res.status(404).json({ error: 'Postagem não encontrada' })

    const tags = parsed.data.tags
    const tagsInUse = tags ? tags.split(',').map(tag => tag.trim()) : []

    
    post.titulo = parsed.data.titulo
    post.conteudo = parsed.data.conteudo

    // CORREÇÃO AQUI: Transforma os arrays recebidos em String JSON antes de salvar no Prisma
    post.imagens = parsed.data.imagens ? JSON.stringify(parsed.data.imagens) : null
    post.legendas = parsed.data.legendas ? JSON.stringify(parsed.data.legendas) : null

    // Gerenciamento das Tags do post
    await prisma.tagged.deleteMany({ where: { postSlug: slug } })
    
    // Usando for...of para lidar corretamente com loops assíncronos (evita problemas de concorrência)
    for (const tag of tagsInUse) {
        await createTagged({
            postSlug: slug,
            tagNome: tag
        })
    }

    // Salva as alterações no banco de dados
    await prisma.post.update({
        where: { slug },
        data: post
    })

    res.status(200).json({ message: 'Atualização de postagem bem-sucedida' })
}

export const deletePost: RequestHandler = async (req, res) => {
    // console.log('Params:', req.params)
    // console.log('Slug:', req.params.slug)
    if (!req.user) return

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

    const postTags = await prisma.tagged.findMany({
        where: {
            postSlug: slug
        }
    })
    // console.log('Tags encontradas:', postTags.length)
    await prisma.tagged.delete(postTags)

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
    if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado' })
    }
    if (!req.params) {
        return res.status(400).json({ error: 'Requisição inválida' })
    }
    const { postSlug } = req.params
    const user = req.user
    if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
    }
    const updatedFavorites = await prisma.favorited.create({
        data: {
            userId: user.id,
            postSlug: postSlug
        }
    })
    res.status(200).json({ favorited: updatedFavorites })
}

export const likePost: RequestHandler = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado' })
    }
    const { postSlug } = req.body
    const user = await verifyToken(req.user.token)
    if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
    }
    const updatedLikes = await prisma.liked.create({
        data: {
            userId: user.id,
            likedPosts: {
                connect: { postSlug: postSlug }
            }
        }
    })
    res.status(200).json({ liked: updatedLikes })
}

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
            perfilId: perfilId
        }
    })
    res.status(200).json({ followed: updatedFollowings })
}

export const getAccountProfile: RequestHandler = async (req: ExtendedRequest, res: Response) => {
    // 1. Garante que o middleware 'auth' injetou o objeto user na requisição
    if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado' })
    }

    try {
        const userId = req.user.id
        
        // 2. Lê a página atual enviada por query string (ex: /api/u?page=1), padrão é a página 1
        const page = parseInt(req.query.page as string) || 1
        const limit = 5
        const skip = (page - 1) * limit

        // 3. Busca os dados essenciais e agrega os contadores usando _count (alta performance)
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
                        post: true,
                        followed_followed_perfilIdTouser: true,   // Seguidores
                        followed_followed_seguidorIdTouser: true, // Seguindo
                    }
                }
            }
        })

        if (!profileData) {
            return res.status(404).json({ error: 'Usuário não encontrado' })
        }

        // 4. Busca os posts de forma isolada respeitando o limite de 5 registros
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

        // 5. Retorna uma estrutura de payload limpa e explícita para o seu React ler
        return res.status(200).json({
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
                    postsCount: profileData._count.post,
                    followersCount: profileData._count.followed_followed_perfilIdTouser,
                    followingCount: profileData._count.followed_followed_seguidorIdTouser,
                }
            },
            posts: userPosts,
            pagination: {
                currentPage: page,
                limit: limit,
                hasMore: profileData._count.post > (page * limit) // Informa ao front se há mais páginas para buscar
            }
        })

    } catch (error) {
        console.error("Erro ao carregar perfil da conta:", error)
        return res.status(500).json({ error: 'Erro interno do servidor' })
    }
}

export const getAccountPosts: RequestHandler = async (req: ExtendedRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado' })
    }

    try {
        const userId = req.user.id
        const page = parseInt(req.query.page as string) || 1
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