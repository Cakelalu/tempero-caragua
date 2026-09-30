import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { mainRoutes } from './routes/main.routes'
import { authRoutes } from './routes/auth.routes'
import { adminRoutes } from './routes/admin.routes'

const server = express()

server.use(cors())
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))
server.use(express.static('public'))

server.use('/api/auth', authRoutes)
server.use('/api/admin', adminRoutes)
server.use('/api', mainRoutes)

server.listen(4000, () => {
    console.log('BlogAPI BackEnd rodando....')
})