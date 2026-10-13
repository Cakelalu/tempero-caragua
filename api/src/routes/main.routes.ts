import { Router } from 'express'
import * as mainController from '../controllers/main.controller'

export const mainRoutes = Router()

mainRoutes.get('/api/teste', (req, res) => {
    res.json({ message: 'API funcionando!' })
})

mainRoutes.get('/posts', mainController.getAllPosts)
mainRoutes.get('/post/:slug', mainController.getPost)
mainRoutes.get('/posts/:tags', mainController.getPostWithTags)