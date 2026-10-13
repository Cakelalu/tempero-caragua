import { RequestHandler, Response } from "express"
import { ExtendedRequest } from '../types/extended-request'
import z from 'zod'
import { getUserById } from '../services/user.service'
import { handleCover, createPostSlug, createPost } from "../services/post.service"
import { coverToUrl } from "../utils/cover-to-url"

const prisma = require('../utils/prisma-client').prisma

// const user = z.object({
//     id: z.string(),
//     name: z.string(),
//     email: z.string().email()
// })

