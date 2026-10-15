import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { mainRoutes } from './routes/main.routes.ts'
import { authRoutes } from './routes/auth.routes.ts'
import { adminRoutes } from './routes/admin.routes.ts'
import { userRoutes } from './routes/user.routes.ts'
import { guestRoutes } from './routes/guest.routes.ts'

const server = express()

server.use(cors())
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))
server.use(express.json())

server.use('/auth', authRoutes)
server.use('/admin', adminRoutes)
server.use('/user', userRoutes)
server.use('/guest', guestRoutes)
server.use('/', mainRoutes)

server.listen(4000, () => {
    console.log('BlogAPI BackEnd rodando....')
})