import { RequestHandler, Response } from "express"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { v4 } from "uuid"
import { createUser, findUserByEmail, verifyUser } from "../services/user.service"
import { createToken } from "../services/auth.service"
import { verifyJWT } from "../libs/jwt"
import { sendPasswordResetEmail } from "../libs/brevo"
import { ExtendedRequest } from "../types/extended-request"
import { prisma } from "../libs/prisma"
import { googleOAuthClient } from "../libs/googleClient"
import { getCachedUserByEmail, invalidateUserCache } from "../libs/userCache"

export const signIn: RequestHandler = async (req, res) => {
    const schema = z.object({
        email: z.string().email(),
        password: z.string()
    })
    const data = schema.safeParse(req.body)
    if (!data.success) {
        return res.status(400).json({ error: data.error.flatten().fieldErrors })
    }
    const user = await verifyUser(data.data)
    if (!user) {
        return res.status(400).json({ error: 'Email ou senha inválidos' })
    }
    const token = createToken(user)

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
        path: '/',
    })

    res.json({
        message: 'Login bem-sucedido',
        user: {
            id: user.id,
            name: user.nome,
            email: user.email,
            tipo: user.tipo
        }
    })
}

export const googleSignIn: RequestHandler = async (req, res) => {
    const schema = z.object({
        credential: z.string().min(1)
    })
    const data = schema.safeParse(req.body)
    if (!data.success) {
        return res.status(400).json({ error: data.error.flatten().fieldErrors })
    }

    const clientId = process.env.GOOGLE_CLIENT_ID
    if (!clientId) {
        return res.status(500).json({ error: 'Login com Google não está configurado no servidor' })
    }

    let payload
    try {
        const ticket = await googleOAuthClient.verifyIdToken({
            idToken: data.data.credential,
            audience: clientId
        })
        payload = ticket.getPayload()
    } catch {
        return res.status(401).json({ error: 'Credencial do Google inválida' })
    }

    if (!payload?.email || payload.email_verified !== true) {
        return res.status(401).json({ error: 'Não foi possível verificar o e-mail do Google' })
    }

    const user = await getCachedUserByEmail(payload.email, () => findUserByEmail(payload.email))
    if (!user) {
        return res.status(403).json({ error: 'Este e-mail não possui cadastro. Crie uma conta antes de entrar com o Google.' })
    }

    const token = createToken(user)

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
    })

        return res.status(200).json({
        message: 'Login bem-sucedido',
        user: {
            id: user.id,
            name: user.nome,
            email: user.email,
            tipo: user.tipo
        }
    })
}

export const signUp: RequestHandler = async (req, res) => {
    const schema = z.object({
        name: z.string(),
        username: z.string(),
        email: z.string().email(),
        password: z.string()
    })
    const data = schema.safeParse(req.body)
    if(!data.success) {
        return res.status(400).json({ error: data.error.flatten().fieldErrors })
    }
    const newUser = await createUser(data.data)
    if (!newUser) {
        return res.status(400).json({ error: 'Email já cadastrado' })
    }

    invalidateUserCache(data.data.email.toLowerCase())

    const token = createToken(newUser)

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
    })

    res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: {
            id: newUser.id,
            name: newUser.nome,
            username: newUser.nomeUsuario,
            email: newUser.email,
            tipo: newUser.tipo
        }
    })
}

export const validate: RequestHandler = async (
    req: ExtendedRequest,
    res: Response
) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
    }
    res.status(200).json({
        message: 'Token válido',
        user: {
            id: req.user.id,
            nome: req.user.nome,
            email: req.user.email,
            tipo: req.user.tipo
        }
    })
}

export const verifyToken: RequestHandler = (
    req: ExtendedRequest,
    res: Response
) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
    }
    return res.status(200).json({
        message: 'Token válido',
        user: {
            id: req.user.id,
            nome: req.user.nome,
            email: req.user.email
        }
    })
}

export const logout: RequestHandler = async (req, res) => {
    const authHeader = req.headers.authorization
    const token = authHeader?.split(' ')[1]

    if (token) {
        try {
            const decoded = verifyJWT(token) as any
            if (decoded?.jti) {
                await prisma.revokedToken.create({
                    data: {
                        jti: decoded.jti,
                        expiresAt: new Date(decoded.exp * 1000)
                    }
                })
            }
        } catch {
            // Token já expirado ou inválido; ainda assim considera logout no cliente
        }
    }

    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
    })

    res.status(200).json({ message: 'Logout realizado com sucesso' })
};

export const forgotPassword: RequestHandler = async (req, res) => {
    const schema = z.object({
        email: z.string().email(),
    })
    const data = schema.safeParse(req.body)
    if (!data.success) {
        return res.status(400).json({ error: data.error.flatten().fieldErrors })
    }

    const email = data.data.email.toLowerCase()

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
        // Não revela se o e-mail existe (segurança contra enumeração)
        return res.status(200).json({
            message: 'Se este e-mail estiver cadastrado, você receberá instruções de redefinição.',
        })
    }

    // Invalida tokens anteriores não usados deste usuário
    await prisma.passwordReset.updateMany({
        where: { userId: user.id, used: false },
        data: { used: true },
    })

    const token = v4()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutos

    await prisma.passwordReset.create({
        data: {
            id: v4(),
            userId: user.id,
            token,
            expiresAt,
            used: false,
        },
    })

    const frontendUrl = (process.env.FRONTEND_URL ?? 'http://localhost:5173').replace(/\/$/, '')
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`

    await sendPasswordResetEmail({
        toEmail: user.email,
        toName: user.nome,
        resetUrl,
    })

    res.status(200).json({
        message: 'Se este e-mail estiver cadastrado, você receberá instruções de redefinição.',
    })
}

export const resetPassword: RequestHandler = async (req, res) => {
    const schema = z.object({
        token: z.string().min(1),
        password: z.string().min(8).max(72),
    })
    const data = schema.safeParse(req.body)
    if (!data.success) {
        return res.status(400).json({ error: data.error.flatten().fieldErrors })
    }

    const reset = await prisma.passwordReset.findUnique({
        where: { token: data.data.token },
        include: { user: true },
    })

    if (!reset || reset.used || reset.expiresAt < new Date()) {
        return res.status(400).json({ error: 'Token inválido ou expirado.' })
    }

    // Impede que a nova senha seja igual à senha atual
    const senhaIgual = await bcrypt.compare(data.data.password, reset.user.senha)
    if (senhaIgual) {
        return res.status(400).json({ error: 'A nova senha deve ser diferente da senha atual.' })
    }

    const hashedPassword = await bcrypt.hash(data.data.password, 10)

    await prisma.$transaction([
        prisma.user.update({
            where: { id: reset.userId },
            data: { senha: hashedPassword },
        }),
        prisma.passwordReset.delete({
            where: { id: reset.id },
        }),
    ])

    res.status(200).json({ message: 'Senha redefinida com sucesso. Você já pode fazer login.' })
}