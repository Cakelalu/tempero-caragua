import type { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

// Listar todos os posts
export const getAllPosts = async (req: Request, res: Response) => {
    try {
        const posts = await prisma.post.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                author: {
                    select: {
                        name: true
                    }
                }
            }
        })

        return res.json({
            posts: posts.map(post => ({
                id: post.id,
                slug: post.slug,
                title: post.title,
                tags: post.tags,
                body: post.body,
                cover: post.cover,
                createdAt: post.createdAt,
                authorName: post.author.name
            }))
        })
    } catch (error) {
        console.error('Erro ao buscar posts:', error)
        return res.status(500).json({
            error: 'Erro interno ao buscar posts'
        })
    }
}

// Buscar um post pelo slug
export const getPost = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params

        const post = await prisma.post.findUnique({
            where: { slug },
            include: {
                author: {
                    select: {
                        name: true
                    }
                }
            }
        })

        if (!post) {
            return res.status(404).json({
                error: 'Post não encontrado'
            })
        }

        return res.json({
            post: {
                id: post.id,
                slug: post.slug,
                title: post.title,
                tags: post.tags,
                body: post.body,
                cover: post.cover,
                createdAt: post.createdAt,
                authorName: post.author.name
            }
        })
    } catch (error) {
        console.error('Erro ao buscar post:', error)
        return res.status(500).json({
            error: 'Erro interno ao buscar post'
        })
    }
}

// Buscar posts relacionados por tags
export const getRelatedPosts = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params

        const currentPost = await prisma.post.findUnique({
            where: { slug },
            select: {
                id: true,
                tags: true
            }
        })

        if (!currentPost) {
            return res.status(404).json({
                error: 'Post não encontrado'
            })
        }

        const relatedPosts = await prisma.post.findMany({
            where: {
                id: {
                    not: currentPost.id
                },
                tags: {
                    contains: currentPost.tags,
                    mode: 'insensitive'
                }
            },
            take: 4,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                author: {
                    select: {
                        name: true
                    }
                }
            }
        })

        return res.json({
            posts: relatedPosts.map(post => ({
                id: post.id,
                slug: post.slug,
                title: post.title,
                tags: post.tags,
                cover: post.cover,
                createdAt: post.createdAt,
                authorName: post.author.name
            }))
        })
    } catch (error) {
        console.error('Erro ao buscar posts relacionados:', error)
        return res.status(500).json({
            error: 'Erro interno ao buscar posts relacionados'
        })
    }
}