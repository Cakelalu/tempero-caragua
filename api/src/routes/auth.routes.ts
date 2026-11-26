import { Router } from 'express'
import * as authController from '../controllers/auth.controller'
// import { privateRoute } from '../middlewares/private-route.ts'

export const authRoutes = Router()

authRoutes.post('/signin', authController.signIn)
authRoutes.post('/google', authController.googleSignIn)
authRoutes.post('/signup', authController.signUp)
authRoutes.post('/validate', authController.validate)
authRoutes.post('/logout', authController.logout)
authRoutes.post('/forgot-password', authController.forgotPassword)
authRoutes.post('/reset-password', authController.resetPassword)
// authRoutes.post('/refresh', authController.refreshToken)
authRoutes.get('/verifyToken', authController.verifyToken)