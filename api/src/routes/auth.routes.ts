import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import * as authController from '../controllers/auth.controller'
// import { privateRoute } from '../middlewares/private-route.ts'

export const authRoutes = Router()

// Rate limiting específico para login com Google (protege contra abuso de verificação externa)
const googleLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // 10 tentativas por IP por janela
    message: { error: 'Muitas tentativas de login com Google. Tente novamente mais tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
})

authRoutes.post('/signin', authController.signIn)
authRoutes.post('/google', googleLoginLimiter, authController.googleSignIn)
authRoutes.post('/signup', authController.signUp)
authRoutes.post('/validate', authController.validate)
authRoutes.post('/logout', authController.logout)
authRoutes.post('/forgot-password', authController.forgotPassword)
authRoutes.post('/reset-password', authController.resetPassword)
// authRoutes.post('/refresh', authController.refreshToken)
authRoutes.get('/verifyToken', authController.verifyToken)