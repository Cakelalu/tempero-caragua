import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { mainRoutes } from './routes/main.routes'
import { authRoutes } from './routes/auth.routes'
import { adminRoutes } from './routes/admin.routes'
import { userRoutes } from './routes/user.routes'
import { guestRoutes } from './routes/guest.routes'

const server = express()

server.use(cors())
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))
server.use(express.static('public'))

server.use('/api/auth', authRoutes)
server.use('/api/admin', adminRoutes)
server.use('/api/user', userRoutes)
server.use('/api/guest', guestRoutes)
server.use('/api', mainRoutes)

server.listen(4000, () => {
    console.log('BlogAPI BackEnd rodando....')
})