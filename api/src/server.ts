import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { mainRoutes } from './routes/main.routes'
import { authRoutes } from './routes/auth.routes'
import { adminRoutes } from './routes/admin.routes'
import { userRoutes } from './routes/user.routes'
import { guestRoutes } from './routes/guest.routes'
import mysql from 'mysql2/promise';

async function manterBancoVivo() {
  try {
    const connection = await mysql.createConnection("SUA_URI_DE_CONEXAO_DO_AIVEN");
    
    // Executa uma consulta levíssima apenas para registrar atividade
    await connection.query('SELECT 1;'); 
    
    console.log('Ping enviado com sucesso! Banco ativo.');
    await connection.end();
  } catch (error) {
    console.error('Erro ao conectar no Aiven:', error);
  }
}

// Executa o ping a cada 10 minutos (600000 milissegundos)
setInterval(manterBancoVivo, 600000);


const server = express()

server.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:4500",
        "https://tempero-caragua-app.onrender.com",
        "https://dev-teca-app.onrender.com"
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