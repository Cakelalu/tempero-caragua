import { Router } from 'express'

export const guestRoutes = Router()

guestRoutes.get('/easter', (req, res) => {
    res.json({ message: 'egg' })
})

// guestRoutes.get('/posts', guestController.getAllPosts)
// guestRoutes.get('/posts/:slug', guestController.getPost)