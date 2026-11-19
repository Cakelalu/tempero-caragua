import type { RequestHandler, Response } from "express"
import z from 'zod'
import { getUserById } from '../services/user.service'
import { handleCover, createPostSlug, createPost } from "../services/post.service"
import { coverToUrl } from "../utils/cover-to-url"
import type { ExtendedRequest } from '../types/extended-request';
import { prisma } from "../libs/prisma"

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

export const getPostsFeed: RequestHandler = async (req, res) => {
    try {
        const [recentes, populares, seguindo] = await Promise.all([
            prisma.post.findMany({
                include: {
                    user: {
                        select: {
                            nomeUsuario: true,
                            imagemPerfil: true,
                        }
                    }
                },
                orderBy: { dataPostagem: 'desc' },
                take: 12
            }),
            prisma.post.findMany({
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
                take: 12
            }),
            (async () => {
                if (!req.user) return [];
                const follows = await prisma.followed.findMany({
                    where: { seguidorId: (req as any).user.id },
                    select: { perfilId: true }
                });
                const perfilIds = follows.map(f => f.perfilId);
                if (perfilIds.length === 0) return [];
                return prisma.post.findMany({
                    where: { autorId: { in: perfilIds } },
                    include: {
                        user: {
                            select: {
                                nomeUsuario: true,
                                imagemPerfil: true,
                            }
                        }
                    },
                    orderBy: { dataPostagem: 'desc' },
                    take: 12
                });
            })()
        ]);

        return res.status(200).json({ recentes, populares, seguindo });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar feed de postagens' });
    }
}

export const getPosts: RequestHandler = async (req, res) => {
    try {
        const { query } = req.query;
        const pageQuery = typeof req.query.page === 'string' ? req.query.page : undefined;
        const page = pageQuery ? parseInt(pageQuery, 10) : 1;
        const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 12;
        const skip = (page - 1) * limit;

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
                orderBy: { dataPostagem: 'desc' },
                take: limit,
                skip: skip
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
                where: { seguidorId: (req as any).user.id },
                select: { perfilId: true }
            });
            const perfilIds = follows.map(f => f.perfilId);
            if (perfilIds.length === 0) {
                return res.status(200).json([]);
            }
            const posts = await prisma.post.findMany({
                where: { autorId: { in: perfilIds } },
                include: {
                    user: {
                        select: {
                            nomeUsuario: true,
                            imagemPerfil: true,
                        }
                    }
                },
                orderBy: { dataPostagem: 'desc' },
                take: limit,
                skip: skip
            });
            return res.status(200).json(posts);
        }

        if (sort === 'popular') {
            const posts = await prisma.post.findMany({
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
                take: limit,
                skip: skip
            });
            return res.status(200).json(posts);
        }

        const posts = await prisma.post.findMany({
            include: {
                user: {
                    select: {
                        nomeUsuario: true,
                        imagemPerfil: true,
                    }
                }
            },
            orderBy: { dataPostagem: 'desc' },
            take: limit,
            skip: skip
        });
        return res.status(200).json(posts);
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar postagens' });
    }
}