import { Router } from 'express'
import * as authController from '../controllers/auth.controller'
import { privateRoute } from '../middlewares/private-route'

export const authRoutes = Router()

authRoutes.post('/signin', authController.signIn)
authRoutes.post('/signup', authController.signUp)
authRoutes.post('/validate', privateRoute, authController.validate)