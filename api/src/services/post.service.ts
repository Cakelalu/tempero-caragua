import { v4 } from 'uuid'
import fs from 'fs/promises'
import slug from 'slug'
import { prisma } from '../libs/prisma'

export const getPostBySlug = async (slug: string) => {
    return await prisma.post.findUnique({
        where: { slug },
        include: {
            autor: {
                select: {
                    nome: true
                }
            }
        }
    })
}

export const handleCover = async (file: Express.Multer.File) => {
    const allowed = ['image/jpeg', 'image.png', 'image/jpg']
    if(allowed.includes(file.mimetype)) {
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
    let newSlug = slug(title)
    let keepTrying = true
    let postCount = 1

    while (keepTrying) {
        const existingPost = await getPostBySlug(newSlug)
        if (!existingPost) {
            keepTrying = false
        } else {
            newSlug = `${slug(title)}-${postCount++}`
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
    // cover: string
}

type CreateTaggedProps = {
    tagNome: string,
    postSlug: string
}

export const createPost = async (data: CreatePostProps) => {
    return await prisma.post.create({ data })
}

export const createTagged = async (data: CreateTaggedProps) => {
    return await prisma.tagged.create({ data })
}