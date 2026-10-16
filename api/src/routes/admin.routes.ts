import { Router } from 'express'
import * as adminController from '../controllers/admin.controller.ts'
import { privateRoute } from '../middlewares/private-route.ts';
import { upload } from '../libs/multer.ts';

export const adminRoutes = Router()

