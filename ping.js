// ping.js
const mysql = require('mysql2/promise');

async function manterBancoVivo() {
  let connection;
  try {
    // Usamos uma variável de ambiente para não expor a senha no GitHub
    if (!import.meta.env.AIVEN_URL) {
      throw new Error("A variável AIVEN_URL não foi definida.");
    }

    connection = await mysql.createConnection(import.meta.env.AIVEN_URL);
    await connection.query('SELECT 1');
    console.log('Ping enviado com sucesso! Banco ativo no Aiven.');
  } catch (error) {
    console.error('Erro ao conectar no Aiven:', error.message);
    process.exit(1); // Força o erro no GitHub Actions se falhar
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

manterBancoVivo();