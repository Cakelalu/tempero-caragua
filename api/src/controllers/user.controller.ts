import { RequestHandler, Response } from "express"
import { z } from "zod"
import { createUser, verifyUser } from "../services/user.service"
import { createToken } from "../services/auth.service"
import { ExtendedRequest } from "../types/extended-request"

