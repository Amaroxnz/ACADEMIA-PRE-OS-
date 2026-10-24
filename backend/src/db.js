const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const config = require('./config');

const montarSsl = () => {
  if (!config.bancoSsl) return undefined;
  const ssl = { rejectUnauthorized: config.bancoSslVerificar };
  if (config.bancoCaArquivo) ssl.ca = fs.readFileSync(path.resolve(config.bancoCaArquivo), 'utf8');
  return ssl;
};

const pool = new Pool({
  connectionString: config.bancoUrl,
  ssl: montarSsl(),
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  statement_timeout: 5000,
  query_timeout: 6000,
});

pool.on('error', (erro) => {
  console.error('Erro inesperado no pool do banco:', erro.code || erro.message);
});

module.exports = {
  query: (texto, parametros) => pool.query(texto, parametros),
  encerrar: () => pool.end(),
};
