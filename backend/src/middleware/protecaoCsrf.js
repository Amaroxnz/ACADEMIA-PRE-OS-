const config = require('../config');

const METODOS_SEGUROS = new Set(['GET', 'HEAD', 'OPTIONS']);

module.exports = function protecaoCsrf(req, res, next) {
  if (METODOS_SEGUROS.has(req.method) || req.tokenOrigem === 'header') return next();

  const origem = req.get('origin');
  const marcador = req.get('x-akifit-csrf');
  if (!origem || !config.origensPermitidas.includes(origem) || marcador !== '1') {
    return res.status(403).json({
      erro: 'requisicao_bloqueada',
      mensagem: 'Não foi possível atualizar seus favoritos. Tente novamente.',
    });
  }
  return next();
};
