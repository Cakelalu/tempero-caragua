import { RequestHandler, Response } from "express"
import { z } from "zod"
import { OAuth2Client } from "google-auth-library"
import { createUser, findUserByEmail, verifyUser } from "../services/user.service"
import { createToken } from "../services/auth.service"
import { ExtendedRequest } from "../types/extended-request"

const googleOAuthClient = new OAuth2Client()

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
    res.json({
        message: 'Login bem-sucedido',
        user: {
            id: user.id,
            name: user.nome,
            email: user.email
        },
        token
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

    const user = await findUserByEmail(payload.email)
    if (!user) {
        return res.status(403).json({ error: 'Este e-mail não possui cadastro. Crie uma conta antes de entrar com o Google.' })
    }

    const token = createToken(user)
    return res.status(200).json({
        message: 'Login bem-sucedido',
        user: {
            id: user.id,
            name: user.nome,
            email: user.email
        },
        token
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

    const token = createToken(newUser)
    res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: {
            id: newUser.id,
            name: newUser.nome,
            username: newUser.nomeUsuario,
            email: newUser.email
        },
        token
    })
}

export const validate: RequestHandler = async (
    req: ExtendedRequest,
    res: Response
) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
    }
    const token = createToken(req.user)
    res.status(200).json({
        message: 'Token válido',
        user: {
            id: req.user.id,
            nome: req.user.nome,
            email: req.user.email
        },
        token
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