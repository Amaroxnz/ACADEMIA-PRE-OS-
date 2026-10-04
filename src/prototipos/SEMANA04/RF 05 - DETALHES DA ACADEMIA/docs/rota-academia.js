// GET /api/academias/:id  -  Detalhes da Academia (RF-005)
// Devolve o MESMO formato do BANCO_SIMULADO do front (script-rf05.js).
// Uso: app.use(require('./rota-academia'));  (db.js exporta { query } do pacote "pg")
const express = require('express');
const router = express.Router();
const db = require('./db');

const MSG_ERRO = "Academia não encontrada ou temporariamente indisponível.";

// "07:30:00" -> "07:30" ; horário nulo (dia fechado) -> "00:00"
const hhmm = (t) => (t ? String(t).substring(0, 5) : "00:00");
const lista = (txt) => (txt ? txt.split(',').map(x => x.trim()).filter(Boolean) : []);

router.get('/api/academias/:id', async (req, res) => {
    try {
        const id = req.params.id;

        // id precisa ser inteiro positivo; senão responde 404 amigável (e não 500 do banco)
        if (!/^[1-9]\d*$/.test(id)) {
            return res.status(404).json({ erro: MSG_ERRO });
        }

        const resultAcademia = await db.query(
            `SELECT * FROM academias WHERE id = $1 AND ativa = TRUE`, [id]
        );
        if (resultAcademia.rows.length === 0) {
            return res.status(404).json({ erro: MSG_ERRO });
        }
        const a = resultAcademia.rows[0];

        const [planos, midias, horarios, mods, infra, avs] = await Promise.all([
            db.query(`SELECT tipo, valor, beneficios, modalidades_cobertas
                      FROM planos_precos WHERE academia_id = $1
                      ORDER BY CASE tipo WHEN 'mensal' THEN 1 WHEN 'trimestral' THEN 2 ELSE 3 END`, [id]),
            db.query(`SELECT url, legenda FROM midias_academia WHERE academia_id = $1 ORDER BY id`, [id]),
            db.query(`SELECT dia_semana, hora_abre, hora_fecha FROM horarios_funcionamento WHERE academia_id = $1`, [id]),
            db.query(`SELECT nome FROM modalidades WHERE academia_id = $1 ORDER BY nome`, [id]),
            db.query(`SELECT item FROM infraestrutura WHERE academia_id = $1 ORDER BY item`, [id]),
            // RN-04: mais recentes primeiro. RN-02: a média é calculada no front a partir desta lista
            db.query(`SELECT u.nome AS aluno, av.nota, av.comentario, av.data_avaliacao AS data
                      FROM avaliacoes av
                      JOIN usuarios u ON u.id = av.usuario_id
                      WHERE av.academia_id = $1
                      ORDER BY av.data_avaliacao DESC`, [id])
        ]);

        // RN-03: sem ao menos 1 plano e 1 horário não existe página de detalhes
        if (planos.rows.length === 0 || horarios.rows.length === 0) {
            return res.status(404).json({ erro: MSG_ERRO });
        }

        const academia = {
            id: a.id,
            nome: a.nome,
            endereco: { rua: a.rua, numero: a.numero, bairro: a.bairro, cidade: a.cidade, uf: a.uf, cep: a.cep },
            latitude: parseFloat(a.latitude),
            longitude: parseFloat(a.longitude),
            telefone: a.telefone,
            capa: a.capa_url,
            galeria: midias.rows,                       // [{ url, legenda }]
            modalidades: mods.rows.map(m => m.nome),
            infraestrutura: infra.rows.map(i => i.item),
            horarios: horarios.rows.map(h => ({
                dia: h.dia_semana,                      // 0 = domingo ... 6 = sábado
                abre: hhmm(h.hora_abre),
                fecha: hhmm(h.hora_fecha)
            })),
            planos: planos.rows.map(p => ({
                tipo: p.tipo,
                valor: parseFloat(p.valor),
                beneficios: lista(p.beneficios),
                modalidades_cobertas: lista(p.modalidades_cobertas)
            })),
            avaliacoes: avs.rows                        // [{ aluno, nota, comentario, data }]
        };

        // ADR-003: cache curto para aliviar o banco em páginas muito acessadas
        res.setHeader('Cache-Control', 'public, max-age=60');
        res.json(academia);
    } catch (erro) {
        console.error('Erro em GET /api/academias/:id', erro); // detalhe só no servidor
        res.status(500).json({ erro: MSG_ERRO });             // o usuário vê a mensagem amigável
    }
});

module.exports = router;
