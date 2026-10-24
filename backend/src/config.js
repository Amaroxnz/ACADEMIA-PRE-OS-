require('dotenv').config();

const exigir = (nome) => {
  const valor = process.env[nome];
  if (!valor || !valor.trim()) throw new Error(`Variável de ambiente ausente: ${nome}`);
  return valor.trim();
};

const segredo = exigir('JWT_SECRET');
if (segredo.length < 32) throw new Error('JWT_SECRET precisa ter pelo menos 32 caracteres');

const origens = exigir('ALLOWED_ORIGINS')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

if (origens.some((o) => o === '*' || !/^https?:\/\/[^\s/]+$/i.test(o))) {
  throw new Error('ALLOWED_ORIGINS deve listar origens completas, como https://akifit.com.br');
}

const porta = Number(process.env.PORT || 3000);
if (!Number.isInteger(porta) || porta < 1 || porta > 65535) throw new Error('PORT inválida');

module.exports = Object.freeze({
  porta,
  producao: process.env.NODE_ENV === 'production',
  bancoUrl: exigir('DATABASE_URL'),
  bancoSsl: process.env.DB_SSL === 'true',
  bancoCaArquivo: (process.env.DB_SSL_CA_FILE || '').trim(),
  bancoSslVerificar: process.env.DB_SSL_VERIFICAR !== 'false',
  jwtSegredo: segredo,
  jwtEmissor: (process.env.JWT_ISSUER || 'akifit').trim(),
  cookieNome: (process.env.COOKIE_NAME || 'akifit_token').trim(),
  origensPermitidas: Object.freeze(origens),
  confiarProxy: process.env.TRUST_PROXY === 'true',
});
