import type { RequestHandler, Response } from "express"
import z from 'zod'
import { getUserById } from '../services/user.service.ts'
import { handleCover, createPostSlug, createPost } from "../services/post.service.ts"
import { coverToUrl } from "../utils/cover-to-url.ts"
import type { ExtendedRequest } from '../types/extended-request.ts';
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export const getPost: RequestHandler = async (req, res) => {
    if (!req.user) return

    const { slug } = req.params
    if (!slug) {
        return res.status(400).json({ error: 'A slug is required' })
    }

    const post = await prisma.post.findUnique({ where: { slug } })
    if (!post) {
        return res.status(404).json({ error: 'Post not found' })
    }

    res.status(200).json({ post })
}

export const getPostWithTags: RequestHandler = async (req, res) => {
    if (!req.user) return

    const { tags } = req.query
    if (!tags || typeof tags !== 'string') {
        return res.status(400).json({ error: 'Tags are required' })
    }
    const tagsArray = tags.split(',').map(tag => tag.trim())
    const posts = await prisma.post.findMany({
        where: {
            tags: {
                hasSome: tagsArray
            }
        }
    })
    res.status(200).json({ posts })
}

export const getAllPosts: RequestHandler = async (req, res) => {
    const posts = await prisma.post.findMany()
    res.status(200).json({ posts })
}