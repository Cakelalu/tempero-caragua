import { RequestHandler, Response } from "express"
import { z } from "zod"
import { createUser, verifyUser } from "../services/user.service"
import { createToken } from "../services/auth.service"
import { ExtendedRequest } from "../types/extended-request"
import { verifyToken } from "./auth.controller"

const prisma = require('../utils/prisma-client').prisma

export const addPost: RequestHandler = async (req: ExtendedRequest, res: Response) => {
    if (!req.user) return

    const schema = z.object({
        title: z.string(),
        tags: z.string(),
        body: z.string(),
        images: z.array(z.string()).optional(),
        legends: z.array(z.string()).optional()
    })
    const data = schema.safeParse(req.body)
    if (!data.success) {
        return res.status(400).json({ error: data.error.flatten().fieldErrors })
    }

    if (!req.file) {
        return res.status(400).json({ error: 'Image is required' })
    }

    const coverName = await handleCover(req.file)
    if(!coverName) {
        return res.status(400).json({ error: 'Invalid cover image' })
    }

    const slug = await createPostSlug(data.data.title)

    const newPost = await createPost({
        authorId: req.user.id,
        slug,
        title: data.data.title,
        tags: data.data.tags,
        body: data.data.body,
        images: data.data.images,
        legends: data.data.legends,
        cover: coverName
    })

    const author = await getUserById(newPost.authorId)

    res.status(201).json({
        post: {
            id: newPost.id,
            slug: newPost.slug,
            title: newPost.title,
            createdAt: newPost.createdAt,
            cover: coverToUrl(newPost.cover),
            tags: newPost.tags,
            images: newPost.images,
            legends: newPost.legends,
            authorName: author?.name || 'Unknown'
        }
    })
}

export const editPost: RequestHandler = async (req, res) => {
    if (!req.user) return

    const schema = z.object({
        title: z.string(),
        tags: z.string(),
        body: z.string()
    })
    const data = schema.safeParse(req.body)
    if (!data.success) {
        return res.status(400).json({ error: data.error.flatten().fieldErrors })
    }
}

export const deletePost: RequestHandler = async (req, res) => {
    if (!req.user) return

    const { slug } = req.params
    if (!slug) {
        return res.status(400).json({ error: 'A slug is required' })
    }
    const post = await prisma.post.findUnique({ where: { slug } })
    if (!post) {
        return res.status(404).json({ error: 'Post not found' })
    }
    if (post.authorId !== req.user.id) {
        return res.status(403).json({ error: 'You are not authorized to delete this post' })
    }
    await prisma.post.delete({ where: { slug } })
    res.status(200).json({ message: 'Post deleted successfully' })
}

export const getFavoritePosts: RequestHandler = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' })
    }
    const user = await verifyToken(req.user.token)
    if (!user) {
        return res.status(404).json({ error: 'User not found' })
    }
    const favoritePosts = await prisma.post.findMany({
        where: {
            favoritedBy: {
                some: {
                    userId: user.id
                }
            }
        }
    })
    res.status(200).json({ favoritePosts })
}

export const addFavoritePost: RequestHandler = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' })
    }
    const { postSlug } = req.body
    const user = await verifyToken(req.user.token)
    if (!user) {
        return res.status(404).json({ error: 'User not found' })
    }
    const updatedUser = await prisma.favorited.create({
        data: {
            userId: user.id,
            favoritedPosts: {
                connect: { postSlug: postSlug }
            }
        }
    })
    res.status(200).json({ user: updatedUser })
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