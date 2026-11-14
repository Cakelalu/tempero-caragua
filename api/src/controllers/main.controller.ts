import type { RequestHandler, Response } from "express"
import z from 'zod'
import { getUserById } from '../services/user.service'
import { handleCover, createPostSlug, createPost } from "../services/post.service"
import { coverToUrl } from "../utils/cover-to-url"
import type { ExtendedRequest } from '../types/extended-request';
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export const getPost: RequestHandler = async (req, res) => {
    const { slug } = req.params
    if (!slug) {
        return res.status(400).json({ error: 'Um slug é requerido' })
    }

    const post = await prisma.post.findUnique({
        where: { slug },
        include: {
            user: {
                select: {
                    nomeUsuario: true,
                    imagemPerfil: true,
                    nome: true,
                }
            },
            tagged: {
                select: {
                    tagNome: true,
                }
            },
            _count: {
                select: { liked: true }
            }
        }
    })
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
            const posts = await prisma.post.findMany({
                where: {
                    titulo: {
                        contains: query as string,
                    },
                },
                include: {
                    user: {
                        select: {
                            nomeUsuario: true,
                            imagemPerfil: true,
                        }
                    }
                },
                orderBy: { dataPostagem: 'desc' }
            });
            return res.status(200).json(posts);
        }

        const following = req.query.following === 'true';
        const sort = req.query.sort;

        if (following) {
            if (!req.user) {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            const follows = await prisma.followed.findMany({
                where: { seguidorId: req.user.id },
                select: { perfilId: true }
            });
            const perfilIds = follows.map(f => f.perfilId);
            const allPosts = await prisma.post.findMany({
                where: { autorId: { in: perfilIds } },
                include: {
                    user: {
                        select: {
                            nomeUsuario: true,
                            imagemPerfil: true,
                        }
                    }
                },
                orderBy: { dataPostagem: 'desc' }
            });
            return res.status(200).json(allPosts);
        }

        if (sort === 'popular') {
            const popularPosts = await prisma.post.findMany({
                include: {
                    user: {
                        select: {
                            nomeUsuario: true,
                            imagemPerfil: true,
                        }
                    },
                    _count: {
                        select: { liked: true }
                    }
                },
                orderBy: {
                    liked: { _count: 'desc' }
                },
                take: 30
            });
            return res.status(200).json(popularPosts);
        }

        const allPosts = await prisma.post.findMany({
            include: {
                user: {
                    select: {
                        nomeUsuario: true,
                        imagemPerfil: true,
                    }
                }
            },
            orderBy: { dataPostagem: 'desc' }
        });
        return res.status(200).json(allPosts);
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar postagens' });
    }
}