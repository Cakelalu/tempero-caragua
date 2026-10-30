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

// // Ligar banco de dados
// const AIVENDB_TOKEN = process.env.AIVEN_TOKEN
// const PROJECT_NAME = "kevenoliveraduarte2020-7edb";
// const SERVICE_NAME = "mysql-teca1";

// async function ligarBancoAiven() {
//   const url = `https://aiven.io${PROJECT_NAME}/service/${SERVICE_NAME}`;

//   try {
//     console.log("Verificando status do banco no Aiven...");
    
//     // 1. Altera o estado do banco para 'true' (Ligar)
//     const response = await fetch(url, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${AIVENDB_TOKEN}`
//       },
//       body: JSON.stringify({
//         powered: true // Define como 'true' para ligar o serviço
//       })
//     });

//     if (!response.ok) {
//       throw new Error(`Erro na API do Aiven: ${response.statusText}`);
//     }

//     console.log("Comando de inicialização enviado! Aguardando o banco ficar pronto...");
    
//     // 2. Loop para esperar o banco ficar em status 'RUNNING'
//     let operando = false;
//     while (!operando) {
//       const statusRes = await fetch(url, {
//         headers: { "Authorization": `Bearer ${AIVENDB_TOKEN}` }
//       });
//       const data = await statusRes.json();
      
//       if (data.service.state === "RUNNING") {
//         console.log("🚀 Banco de dados está ONLINE e pronto para conexões!");
//         operando = true;
//       } else {
//         console.log(`Status atual: ${data.service.state}. Aguardando 15 segundos...`);
//         await new Promise(resolve => setTimeout(resolve, 15000)); // Espera 15s antes de checar de novo
//       }
//     }

//   } catch (error) {
//     console.error("Falha ao tentar ligar o banco via API:", error);
//   }
// }

// // Chame essa função antes de conectar o ORM/Driver do seu banco de dados
// // await ligarBancoAiven();


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