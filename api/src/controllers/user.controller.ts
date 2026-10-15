import { forEach } from './../../node_modules/effect/src/Array';
import { RequestHandler, Response } from "express"
import { includes, z } from "zod"
import { createUser, verifyUser, getUserById } from "../services/user.service.ts"
import { createToken } from "../services/auth.service.ts"
import { ExtendedRequest } from "../types/extended-request.ts"
import { verifyToken } from "./auth.controller.ts"
import { createPost, createPostSlug, handleCover, createTagged } from "../services/post.service.ts"
import { prisma } from '../libs/prisma.ts'

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

    if (tags != null) {
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

export const editPost: RequestHandler = async (req, res) => {
    if (!req.user) return

    const schema = z.object({
        titulo: z.string(),
        conteudo: z.string()
    })
    const data = schema.safeParse(req.body)
    if (!data.success) {
        return res.status(400).json({ error: data.error.flatten().fieldErrors })
    }
}

export const deletePost: RequestHandler = async (req, res) => {
    console.log('Params:', req.params)
    console.log('Slug:', req.params.slug)
    if (!req.user) return

    const { slug } = req.params
    const postTeste = await prisma.post.findFirst({
        where: { slug }
    })

    console.log('Post encontrado:', postTeste)
    if (!slug) {
        return res.status(400).json({ error: 'A slug is required' })
    }
    const post = await prisma.post.findUnique({ where: { slug } })
    if (!post) {
        return res.status(404).json({ error: 'Post not found' })
    }
    if (post.autorId !== req.user.id) {
        return res.status(403).json({ error: 'You are not authorized to delete this post' })
    }
    await prisma.post.delete({ where: { slug } })
    res.status(200).json({ message: 'Post deleted successfully' })
}

export const getFavoritePosts: RequestHandler = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' })
    }
    const user = req.user
    if (!user) {
        return res.status(404).json({ error: 'User not found' })
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
        return res.status(401).json({ error: 'Unauthorized' })
    }
    const { postSlug } = req.body
    const user = req.user
    if (!user) {
        return res.status(404).json({ error: 'User not found' })
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
        return res.status(401).json({ error: 'Unauthorized' })
    }
    const { postSlug } = req.body
    const user = await verifyToken(req.user.token)
    if (!user) {
        return res.status(404).json({ error: 'User not found' })
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
        return res.status(401).json({ error: 'Unauthorized' })
    }
    const { userFlwdId } = req.body
    const user = await verifyToken(req.user.token)
    if (!user) {
        return res.status(404).json({ error: 'User not found' })
    }
    const updatedFollowings = await prisma.followed.create({
        data: {
            userId: user.id,
            followedUser: {
                connect: { userFollowedId: userFlwdId }
            }
        }
    })
    res.status(200).json({ followed: updatedFollowings })
}

export const getAccountProfile: RequestHandler = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' })
    }
    const user = await verifyToken(req.user.token)
    if (!user) {
        return res.status(404).json({ error: 'User not found' })
    }
    res.status(200).json({ user })
}