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
        return res.status(400).json({ error: 'Um slug é requerido' })
    }

    const post = await prisma.post.findUnique({ where: { slug } })
    if (!post) {
        return res.status(404).json({ error: 'Postagem não encontrada' })
    }

    res.status(200).json({ post })
}

export const getPostWithTags: RequestHandler = async (req, res) => {
    if (!req.user) return

    const { tags } = req.query
    if (!tags || typeof tags !== 'string') {
        return res.status(400).json({ error: 'Tags são requeridas' })
    }
    const tagsArray = tags.split(',').map(tag => tag.trim())
    const posts = await prisma.tagged.findMany({
        where: {
            tagNome: {
                in: tagsArray
            }
        }
    })
    res.status(200).json({ posts })
}

export const getPosts: RequestHandler = async (req, res) => {
    try {
        const { query } = req.query;
        if (query) {
            const tags = query.split(',').map(tag => tag.trim());
            const taggedPosts = await prisma.tagged.findMany({
                where: {
                    tagNome: {
                        in: tags
                    }
                },
                include: {
                    post: true
                }
            });
            const posts = taggedPosts.map(tagged => tagged.post);
            return res.status(200).json(posts);
        }
        const allPosts = await prisma.post.findMany();
        return res.status(200).json(allPosts);
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar postagens' });
    }
}