import { RequestHandler } from 'express'
import { verifyJWT } from '../libs/jwt'
import { getUserById } from '../services/user.service'

export const authOptional: RequestHandler = async (req, res, next) => {
    // Suporte a token via cookie (HttpOnly) ou header Authorization
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1]

    if (!token) {
        ; (req as any).user = undefined
        return next()
    }

    const decoded = verifyJWT(token)

    if (!decoded || typeof decoded === 'string' || !('id' in decoded)) {
        ; (req as any).user = undefined
        return next()
    }

    try {
        const user = await getUserById(decoded.id as string)
        ; (req as any).user = user || undefined
    } catch {
        ; (req as any).user = undefined
    }

    next()
}
