import { RequestHandler, Response } from "express"
import { ExtendedRequest } from '../types/extended-request.ts'
import z from 'zod'
import { getUserById } from '../services/user.service.ts'
import { handleCover, createPostSlug, createPost } from "../services/post.service.ts"
import { coverToUrl } from "../utils/cover-to-url.ts"

const prisma = require('../utils/prisma-client').prisma