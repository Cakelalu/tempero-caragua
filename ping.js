// ping.js
import mysql from 'mysql2/promise';

async function manterBancoVivo() {
  let connection;
  try {
    if (!process.env.AIVEN_URL) {
      throw new Error("A variável AIVEN_URL não foi definida no ambiente.");
    }

    connection = await mysql.createConnection(process.env.AIVEN_URL);
    await connection.query('SELECT 1');
    console.log('Ping enviado com sucesso! Banco ativo no Aiven.');
  } catch (error) {
    console.error('Erro ao conectar no Aiven:', error.message);
    process.exit(1); 
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

manterBancoVivo();