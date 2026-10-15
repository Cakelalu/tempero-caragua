import { User } from '@prisma/client'
import express from 'express'

type UserWithoutPassword = Omit<User, 'senha'>

export type ExtendedRequest = express.Request & {
    user?: UserWithoutPassword
    file: Express.Multer.File
}