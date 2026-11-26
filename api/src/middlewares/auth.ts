import { RequestHandler } from 'express'
import { verifyJWT } from '../libs/jwt'
import { getUserById } from '../services/user.service'
import { prisma } from '../libs/prisma'

export const auth: RequestHandler = async (req, res, next) => {
    // Suporte a token via cookie (HttpOnly) ou header Authorization
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1]

    if (!token) {
        return res.status(401).json({ error: 'Token não enviado' })
    }

    const decoded = verifyJWT(token)

    if (!decoded || typeof decoded === 'string' || !('id' in decoded)) {
        return res.status(401).json({ error: 'Token inválido' })
    }

    // Bloqueia tokens revogados (logout)
    if (decoded.jti) {
        const revoked = await prisma.revokedToken.findUnique({
            where: { jti: decoded.jti as string }
        })

        if (revoked) {
            return res.status(401).json({ error: 'Token revogado. Faça login novamente.' })
        }
    }

    try {
        const user = await getUserById(decoded.id as string)

        if (!user) {
            return res.status(401).json({ error: 'Usuário não encontrado' })
        }

        ; (req as any).user = user
        next()
    } catch (error) {
        console.error('Erro na autenticação:', error)

        return res.status(401).json({
            error: 'Falha na autenticação'
        })
    }
}