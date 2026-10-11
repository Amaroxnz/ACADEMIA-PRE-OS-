const express = require('express');
const router = express.Router();
const db = require('./db');

const MSG_ERRO = "Academia não encontrada ou temporariamente indisponível.";


const hhmm = (t) => (t ? String(t).substring(0, 5) : "00:00");
const lista = (txt) => (txt ? txt.split(',').map(x => x.trim()).filter(Boolean) : []);

router.get('/api/academias/:id', async (req, res) => {
    try {
        const id = req.params.id;

        
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
           
            db.query(`SELECT u.nome AS aluno, av.nota, av.comentario, av.data_avaliacao AS data
                      FROM avaliacoes av
                      JOIN usuarios u ON u.id = av.usuario_id
                      WHERE av.academia_id = $1
                      ORDER BY av.data_avaliacao DESC`, [id])
        ]);

    
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
            galeria: midias.rows,                    
            modalidades: mods.rows.map(m => m.nome),
            infraestrutura: infra.rows.map(i => i.item),
            horarios: horarios.rows.map(h => ({
                dia: h.dia_semana,                    
                abre: hhmm(h.hora_abre),
                fecha: hhmm(h.hora_fecha)
            })),
            planos: planos.rows.map(p => ({
                tipo: p.tipo,
                valor: parseFloat(p.valor),
                beneficios: lista(p.beneficios),
                modalidades_cobertas: lista(p.modalidades_cobertas)
            })),
            avaliacoes: avs.rows                    
        };

     
        res.setHeader('Cache-Control', 'public, max-age=60');
        res.json(academia);
    } catch (erro) {
        console.error('Erro em GET /api/academias/:id', erro); 
        res.status(500).json({ erro: MSG_ERRO });           
    }
});

module.exports = router;
