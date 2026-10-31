import type { user } from '@prisma/client'
import express from 'express'

type UserWithoutPassword = Omit<user, 'senha'>

export type ExtendedRequest = express.Request & {
    user?: UserWithoutPassword
    file?: Express.Multer.File
}