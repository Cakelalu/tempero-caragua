import { User } from '@prisma/client'
import { createJWT, verifyJWT } from '../libs/jwt.ts'
import type { TokenPayload } from '../types/token-payload.ts'
import { getUserById } from './user.service.ts'
import type { Request } from 'express'

export const createToken = (user: User) => {
    return createJWT({ id: user.id })
}

export const verifyRequest = async (req: Request) => {
    const { authorization } = req.headers
    if (authorization) {
        const token = authorization.split(' ')[1]
        if (token) {
            const payload = verifyJWT(token)
            if (payload) {
                const user_id = (payload as TokenPayload).id
                console.log('Token payload:', payload) // Log para depuração
                console.log('User ID from token:', user_id) // Log para depuração
                const user = await getUserById(Number(user_id))
                if (user) return user
            }
        }
    }
    return false
}