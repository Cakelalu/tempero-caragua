import { RequestHandler } from 'express'
import { verifyJWT } from '../libs/jwt'
import { getUserById } from '../services/user.service'

export const auth: RequestHandler = async (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return res.status(401).json({ error: 'Token não enviado' })
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
        return res.status(401).json({ error: 'Token inválido' })
    }

    const decoded = verifyJWT(token)

    if (!decoded || typeof decoded === 'string' || !('id' in decoded)) {
        return res.status(401).json({ error: 'Token inválido' })
    }

    try {
        console.log('ID do token:', decoded.id)

        const user = await getUserById(decoded.id as string)

        console.log('Usuário encontrado:', user)

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