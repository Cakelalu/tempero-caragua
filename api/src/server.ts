import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import { mainRoutes } from './routes/main.routes'
import { authRoutes } from './routes/auth.routes'
import { adminRoutes } from './routes/admin.routes'
import { userRoutes } from './routes/user.routes'
import { guestRoutes } from './routes/guest.routes'
import { imageRoutes } from './routes/image.routes'
import { prisma } from './libs/prisma'
import { startPasswordResetCleanupJob } from './jobs/cleanup-password-reset'

const server = express()
const port = process.env.PORT || 4500

server.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:4173",
        "http://localhost:5174",
        "https://tempero-caragua-app.onrender.com",
        "https://dev-teca-app.onrender.com"
    ],
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type"],
    maxAge: 86400
}))
// server.use(bodyParser.json())
// server.use(bodyParser.urlencoded({ extended: true }))
server.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false
    return compression.filter(req, res)
  },
  threshold: 1024,
  level: 6
}))
server.use(express.json())
server.use(cookieParser())

server.use('/imagens', imageRoutes)

server.use('/auth', authRoutes)
server.use('/admin', adminRoutes)
server.use('/user', userRoutes)
server.use('/guest', guestRoutes)
server.use('/', mainRoutes)

server.listen(port, () => {
    console.log('API Online...')
})

// Keep-alive: mantém conexões com o banco ativas a cada 8 minutos
setInterval(async () => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        console.log('[Keep-Alive] Conexão com o banco mantida ativa.');
    } catch (err) {
        console.error('[Keep-Alive] Erro ao manter conexão com o banco:', err);
    }
}, 8 * 60 * 1000);

// Job de limpeza: remove tokens de reset de senha expirados ou já usados
startPasswordResetCleanupJob();