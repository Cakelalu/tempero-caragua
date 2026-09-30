import { Router } from 'express'
import * as adminController from '../controllers/admin.controller'
import { privateRoute } from '../middlewares/private-route';
import { upload } from '../libs/multer';

export const adminRoutes = Router()

adminRoutes.post('/posts', privateRoute, upload.single('cover'), adminController.addPost)
adminRoutes.put('/posts/:slug', privateRoute, adminController.editPost)
adminRoutes.delete('/posts/:slug', privateRoute, adminController.deletePost)
adminRoutes.get('/posts', privateRoute, adminController.getAllPosts)
adminRoutes.get('/posts/:slug', privateRoute, adminController.getPost)