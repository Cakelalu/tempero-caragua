import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { mainRoutes } from './routes/main.routes'
import { authRoutes } from './routes/auth.routes'
import { adminRoutes } from './routes/admin.routes'
import { userRoutes } from './routes/user.routes'
import { guestRoutes } from './routes/guest.routes'
import { imageRoutes } from './routes/image.routes'

const server = express()

server.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:4500",
        "https://tempero-caragua-app.onrender.com",
        "https://dev-teca-app.onrender.com"
    ],
    credentials: true
}))
// server.use(bodyParser.json())
// server.use(bodyParser.urlencoded({ extended: true }))
server.use(express.json())

server.use('/imagens', imageRoutes)

server.use('/auth', authRoutes)
server.use('/admin', adminRoutes)
server.use('/user', userRoutes)
server.use('/guest', guestRoutes)
server.use('/', mainRoutes)

server.listen(4500, () => {
    console.log('API Online...')
})