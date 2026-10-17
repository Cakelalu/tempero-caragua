import { Router } from 'express'
import * as adminController from '../controllers/admin.controller'
import { privateRoute } from '../middlewares/private-route';
import { upload } from '../libs/multer';

export const adminRoutes = Router()

