const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db');
const { idAcademia } = require('../validacao');

const MENSAGEM = 'Sua sessão expirou. Faça login novamente para continuar.';

const negar = (res) => res.status(401).json({ erro: 'sessao_invalida', mensagem: MENSAGEM });

const extrairToken = (req) => {
  const cabecalho = req.headers.authorization;
  if (typeof cabecalho === 'string' && /^Bearer\s+\S+$/i.test(cabecalho)) {
    return { token: cabecalho.replace(/^Bearer\s+/i, ''), origem: 'header' };
  }
  const cookie = req.cookies && req.cookies[config.cookieNome];
  if (typeof cookie === 'string' && cookie) return { token: cookie, origem: 'cookie' };
  return null;
};

module.exports = async function autenticar(req, res, next) {
  const extraido = extrairToken(req);
  if (!extraido || extraido.token.length > 2048) return negar(res);

  let payload;
  try {
    payload = jwt.verify(extraido.token, config.jwtSegredo, {
      algorithms: ['HS256'],
      issuer: config.jwtEmissor,
    });
  } catch (erro) {
    return negar(res);
  }

  const usuarioId = idAcademia(payload && payload.sub);
  if (usuarioId === null) return negar(res);

  try {
    const existe = await db.query('SELECT 1 FROM usuarios WHERE id = $1', [usuarioId]);
    if (existe.rowCount === 0) return negar(res);
  } catch (erro) {
    return next(erro);
  }

  req.usuarioId = usuarioId;
  req.tokenOrigem = extraido.origem;
  return next();
};
