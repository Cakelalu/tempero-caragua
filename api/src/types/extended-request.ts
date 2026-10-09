import { User } from '../generated/prisma/client'
import { Request } from 'express'

type UserWithoutPassword = Omit<User, 'password'>

export type ExtendedRequest = Request & {
    user?: UserWithoutPassword
    file: Express.Multer.File
}