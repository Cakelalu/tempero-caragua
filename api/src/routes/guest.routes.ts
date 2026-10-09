import { Router } from 'express'
import * as guestController from '../controllers/guest.controller'
import * as mainController from '../controllers/user.controller'

export const guestRoutes = Router()

guestRoutes.get('/api/teste', (req, res) => {
    res.json({ message: 'API funcionando!' })
})

// guestRoutes.get('/posts', guestController.getAllPosts)
// guestRoutes.get('/posts/:slug', guestController.getPost)