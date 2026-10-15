import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { mainRoutes } from './routes/main.routes'
import { authRoutes } from './routes/auth.routes'
import { adminRoutes } from './routes/admin.routes'
import { userRoutes } from './routes/user.routes'
import { guestRoutes } from './routes/guest.routes'

const server = express()

server.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:4500"
    ]
}))
// server.use(bodyParser.json())
// server.use(bodyParser.urlencoded({ extended: true }))
server.use(express.json())
server.use('/auth', authRoutes)
server.use('/admin', adminRoutes)
server.use('/user', userRoutes)
server.use('/guest', guestRoutes)
server.use('/', mainRoutes)

server.listen(4500, () => {
    console.log('API Online...')
})