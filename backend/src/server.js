const app = require('./app');
const config = require('./config');
const db = require('./db');

const servidor = app.listen(config.porta, () => {
  console.log(`API do AKIFIT ouvindo na porta ${config.porta}`);
});

const encerrar = () => {
  servidor.close(async () => {
    await db.encerrar().catch(() => { });
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGTERM', encerrar);
process.on('SIGINT', encerrar);
