import { Router } from 'express'
import * as userController from '../controllers/user.controller'
import * as mainController from '../controllers/main.controller'
import { addPost, editPost } from '../controllers/user.controller';

export const userRoutes = Router()

userRoutes.get('/favoritos', userController.getFavoritePosts)
userRoutes.get('/perfil', userController.getAccountProfile)
userRoutes.delete('/posts', userController.deletePost)
userRoutes.post('/posts', userController.addPost)
userRoutes.post('/post/:slug', userController.editPost)