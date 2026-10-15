import { Router } from 'express'
import * as userController from '../controllers/user.controller.ts'
import * as mainController from '../controllers/main.controller.ts'
import { addPost, editPost } from '../controllers/user.controller.ts';
import { auth } from '../middlewares/auth.ts'

export const userRoutes = Router()

userRoutes.get('/favoritos', userController.getFavoritePosts)
userRoutes.get('/perfil', userController.getAccountProfile)
userRoutes.delete('/post/:slug', auth, userController.deletePost)
userRoutes.post('/posts', auth, userController.addPost)
userRoutes.post('/post/:slug', userController.editPost)