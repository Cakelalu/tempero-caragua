import { Router } from 'express'
import * as mainController from '../controllers/main.controller'
import { auth } from '../middlewares/auth'
import { authOptional } from '../middlewares/auth-optional'

export const mainRoutes = Router()

mainRoutes.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' })
})
mainRoutes.get('/posts', authOptional, mainController.getPosts)
mainRoutes.get('/posts/feed', authOptional, mainController.getPostsFeed)
mainRoutes.get('/post/:slug', authOptional, mainController.getPost)