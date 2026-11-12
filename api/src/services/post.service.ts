import { v4 } from 'uuid'
import fs from 'fs/promises'
import { prisma } from '../libs/prisma'

// Função nativa para substituir a biblioteca 'slug' que quebra no build do Render
const generateSlug = (text: string): string => {
    return text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
}

export const getPostBySlug = async (slug: string) => {
    return await prisma.post.findUnique({
        where: { slug },
        include: {
            user: {
                select: {
                    nome: true
                }
            }
        }
    })
}

export const handleCover = async (file: Express.Multer.File) => {
    const allowed = ['image/jpeg', 'image.png', 'image/jpg']
    if (allowed.includes(file.mimetype)) {
        const coverName = `${v4()}.jpg`
        try {
            await fs.rename(
                file.path,
                `./public/images/covers/${coverName}`
            )
        }
        catch (error) {
            return false
        }
        return coverName
    }
    return false
}

export const createPostSlug = async (title: string) => {
    const baseSlug = generateSlug(title)
    let newSlug = baseSlug
    let keepTrying = true
    let postCount = 1

    while (keepTrying) {
        const existingPost = await getPostBySlug(newSlug)
        if (!existingPost) {
            keepTrying = false
        } else {
            newSlug = `${baseSlug}-${postCount++}`
        }
    }

    return newSlug
}

type CreatePostProps = {
    autorId: string,
    slug: string,
    titulo: string,
    conteudo: string,
    imagens?: string[],
    legendas?: string[],
}

type CreateTaggedProps = {
    tagNome: string,
    postSlug: string
}

export const createPost = async (data: CreatePostProps) => {
    return await prisma.post.create({
        data: {
            id: v4(), // Gera o UUID obrigatório exigido pelo seu model post
            autorId: data.autorId,
            slug: data.slug,
            titulo: data.titulo,
            conteudo: data.conteudo,
            // Converte os arrays em texto JSON para o Prisma aceitar no campo String?
            imagens: data.imagens ? JSON.stringify(data.imagens) : null,
            legendas: data.legendas ? JSON.stringify(data.legendas) : null,
        }
    })
}

export const createTagged = async (data: CreateTaggedProps) => {
    return await prisma.tagged.create({ data })
}
