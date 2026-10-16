import { Router } from 'express'
import * as mainController from '../controllers/main.controller.ts'

export const mainRoutes = Router()

mainRoutes.get('/api/teste', (req, res) => {
    res.json({ message: 'API funcionando!' })
})
mainRoutes.get('/posts', mainController.getPosts)
mainRoutes.get('/post/:slug', mainController.getPost)