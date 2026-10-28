import bcrypt from 'bcryptjs'
import { prisma } from '../libs/prisma'

type CreateUserProps = {
    name: string,
    username: string,
    email: string,
    password: string
}

export const createUser = async ({ name, username, email, password }: CreateUserProps) => {
    email = email.toLowerCase()
    const nome = name
    const nomeUsuario = username

    const user = await prisma.user.findFirst({
        where: { email }
    })

    if (user) return false

    const hashedPassword = await bcrypt.hash(password, 10)

    return await prisma.user.create({
        data: {
            nome: nome,
            nomeUsuario: nomeUsuario,
            email: email,
            senha: hashedPassword
        }
    })
}

type VerifyUserProps = {
    email: string,
    password: string
}

export const verifyUser = async ({ email, password }: VerifyUserProps) => {
    email = email.toLowerCase()

    const user = await prisma.user.findFirst({
        where: { email }
    })
    if (!user) return false
    const isMatch = await bcrypt.compareSync(password, user.senha)
    if (!isMatch) return false

    return user
}

export const findUserByEmail = async (email: string) => {
    return await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
    })
}

export const getUserById = async (id: string) => {
    return await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
        }
    })
}