const express = require('express');
const { rateLimit } = require('express-rate-limit');
const db = require('../db');
const autenticar = require('../middleware/autenticar');
const protecaoCsrf = require('../middleware/protecaoCsrf');
const { idAcademia } = require('../validacao');

const router = express.Router();

const MSG_INVALIDA = 'Não foi possível atualizar seus favoritos. Tente novamente.';
const MSG_INDISPONIVEL = 'Esta academia não está mais disponível.';

const SQL_LISTAR = `
  SELECT a.id,
         a.nome,
         a.bairro,
         a.capa_url AS capa,
         a.ativa,
         f.criado_em,
         (SELECT ROUND(AVG(av.nota)::numeric, 1)::float
            FROM avaliacoes av
           WHERE av.academia_id = a.id) AS nota
    FROM usuarios_favoritos f
    JOIN academias a ON a.id = f.academia_id
   WHERE f.usuario_id = $1
   ORDER BY f.criado_em DESC, a.id DESC
   LIMIT 500`;

const SQL_INSERIR = `
  INSERT INTO usuarios_favoritos (usuario_id, academia_id)
  SELECT $1, a.id
    FROM academias a
   WHERE a.id = $2 AND a.ativa = TRUE
  ON CONFLICT (usuario_id, academia_id) DO NOTHING
  RETURNING academia_id`;

const SQL_EXISTE = 'SELECT 1 FROM usuarios_favoritos WHERE usuario_id = $1 AND academia_id = $2';

const SQL_REMOVER = 'DELETE FROM usuarios_favoritos WHERE usuario_id = $1 AND academia_id = $2';

const requisicaoInvalida = (res) => res.status(400).json({ erro: 'requisicao_invalida', mensagem: MSG_INVALIDA });

const limitePorUsuario = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => 'usuario:' + req.usuarioId,
  handler: (req, res) => res.status(429).json({ erro: 'muitas_requisicoes', mensagem: MSG_INVALIDA }),
});

router.use(autenticar, protecaoCsrf, limitePorUsuario);

router.get('/', async (req, res, next) => {
  try {
    const resultado = await db.query(SQL_LISTAR, [req.usuarioId]);
    res.set('Cache-Control', 'no-store');
    res.json({ favoritos: resultado.rows });
  } catch (erro) {
    next(erro);
  }
});

router.post('/', async (req, res, next) => {
  try {
    if (!req.is('application/json')) return requisicaoInvalida(res);

    const corpo = req.body;
    const chaves = corpo && typeof corpo === 'object' && !Array.isArray(corpo) ? Object.keys(corpo) : [];
    if (chaves.length !== 1 || chaves[0] !== 'academia_id') return requisicaoInvalida(res);

    const academiaId = idAcademia(corpo.academia_id);
    if (academiaId === null) return requisicaoInvalida(res);

    const inserido = await db.query(SQL_INSERIR, [req.usuarioId, academiaId]);
    res.set('Cache-Control', 'no-store');
    if (inserido.rowCount === 1) return res.status(201).json({ academia_id: academiaId, favorito: true });

    const existente = await db.query(SQL_EXISTE, [req.usuarioId, academiaId]);
    if (existente.rowCount === 1) return res.status(200).json({ academia_id: academiaId, favorito: true });

    return res.status(404).json({ erro: 'academia_indisponivel', mensagem: MSG_INDISPONIVEL });
  } catch (erro) {
    return next(erro);
  }
});

router.delete('/:academiaId', async (req, res, next) => {
  try {
    const academiaId = idAcademia(req.params.academiaId);
    if (academiaId === null) return requisicaoInvalida(res);

    await db.query(SQL_REMOVER, [req.usuarioId, academiaId]);
    res.set('Cache-Control', 'no-store');
    return res.status(204).end();
  } catch (erro) {
    return next(erro);
  }
});

module.exports = router;
