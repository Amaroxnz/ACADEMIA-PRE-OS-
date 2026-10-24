const jwt = require('jsonwebtoken');
const config = require('../src/config');
const { idAcademia } = require('../src/validacao');

const usuarioId = idAcademia(process.argv[2]);
const minutos = Number(process.argv[3] || 60);

if (usuarioId === null || !Number.isFinite(minutos) || minutos <= 0) {
  console.error('Uso: npm run token -- <usuario_id> [minutos]');
  process.exit(1);
}

const token = jwt.sign({}, config.jwtSegredo, {
  algorithm: 'HS256',
  issuer: config.jwtEmissor,
  subject: String(usuarioId),
  expiresIn: Math.round(minutos * 60),
});

console.log(token);
