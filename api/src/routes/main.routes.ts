import { Router } from 'express'
import * as mainController from '../controllers/main.controller'
import { auth } from '../middlewares/auth'
import { authOptional } from '../middlewares/auth-optional'

export const mainRoutes = Router()

mainRoutes.get('/api/teste', (req, res) => {
    res.json({ message: 'API funcionando!' })
})
mainRoutes.get('/posts', authOptional, mainController.getPosts)
mainRoutes.get('/post/:slug', mainController.getPost)