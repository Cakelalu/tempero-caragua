import { Router } from 'express'
import * as userController from '../controllers/user.controller'
import * as mainController from '../controllers/main.controller'
import { addPost, editPost } from '../controllers/user.controller';
import { auth } from '../middlewares/auth'

export const userRoutes = Router()

userRoutes.get('/favoritos', auth, userController.getFavoritePosts)
userRoutes.post('/post/:slug/favoritar', auth, userController.addFavoritePost)
userRoutes.post('/post/:slug/curtir', auth, userController.likePost)
userRoutes.get('/u/', auth, userController.getAccountProfile)
userRoutes.post('/u/:id/seguir', auth, userController.followUser)
userRoutes.delete('/post/:slug', auth, userController.deletePost)
userRoutes.post('/posts', auth, userController.addPost)
userRoutes.post('/post/:slug', auth, userController.editPost)