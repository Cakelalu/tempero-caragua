import { RequestHandler } from 'express'
import { verifyJWT } from '../libs/jwt'
import { getUserById } from '../services/user.service'

export const authOptional: RequestHandler = async (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        ; (req as any).user = undefined
        return next()
    }

    const token = authHeader.split(' ')[1]
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
