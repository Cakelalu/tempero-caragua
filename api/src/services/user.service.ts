import { prisma } from '../libs/prisma'
import bcrypt from 'bcryptjs'

type CreateUserProps = {
    name: string,
    email: string,
    password: string
}

export const createUser = async ({ name, email, password }: CreateUserProps) => {
    email = email.toLowerCase()

    const user = await prisma.user.findFirst({
        where: { email }
    })

    if (user) return false

    const hashedPassword = await bcrypt.hash(password, 10)

    return await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword
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
    const isMatch = await bcrypt.compareSync(password, user.password)
    if (!isMatch) return false

    return user
}

export const getUserById = async (id: number) => {
    return await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            status: true,
        }
    })
}