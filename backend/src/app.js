const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { rateLimit } = require('express-rate-limit');
const config = require('./config');
const favoritos = require('./routes/favoritos');

const MSG_FALHA = 'Não foi possível atualizar seus favoritos. Tente novamente.';

const app = express();

app.disable('x-powered-by');
if (config.confiarProxy) app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: config.origensPermitidas,
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-AKIFIT-CSRF'],
    maxAge: 600,
  })
);
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res) => res.status(429).json({ erro: 'muitas_requisicoes', mensagem: MSG_FALHA }),
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '1kb', strict: true }));

app.get('/saude', (req, res) => res.json({ status: 'ok' }));
app.use('/api/favoritos', favoritos);

app.use((req, res) => res.status(404).json({ erro: 'nao_encontrado', mensagem: 'Recurso não encontrado.' }));

app.use((erro, req, res, next) => {
  if (res.headersSent) return next(erro);
  if (erro && erro.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'requisicao_invalida', mensagem: MSG_FALHA });
  }
  if (erro && erro.type === 'entity.too.large') {
    return res.status(413).json({ erro: 'requisicao_invalida', mensagem: MSG_FALHA });
  }
  console.error('Erro não tratado:', (erro && (erro.code || erro.message)) || 'desconhecido');
  return res.status(500).json({ erro: 'erro_interno', mensagem: MSG_FALHA });
});

module.exports = app;
