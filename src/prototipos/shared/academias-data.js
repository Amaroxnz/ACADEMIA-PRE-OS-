/* Base local de academias (substitui a API enquanto não houver back-end).
   Formato idêntico ao retornado por GET /api/academias/:id (docs/rota-academia.js).
   dia: 0 = Domingo ... 6 = Sábado */
(function () {
  // Imagem SVG embutida (não depende de internet)
  const img = (cor, txt) => {
    const t = String(txt).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="#222c26"/><text x="50%" y="50%" fill="#${cor}" font-family="sans-serif" font-size="40" text-anchor="middle" dominant-baseline="middle">${t}</text></svg>`;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  };
  const semana = (abre, fecha, sab, dom) => [
    ...[1, 2, 3, 4, 5].map(d => ({ dia: d, abre, fecha })),
    { dia: 6, abre: sab[0], fecha: sab[1] },
    { dia: 0, abre: dom[0], fecha: dom[1] },
  ];

  const ACADEMIAS = {
    1: {
      id: 1, nome: 'Smart Fit - Guará II',
      endereco: { rua: 'QE 38 Conjunto A', numero: '10', bairro: 'Guará II', cidade: 'Brasília', uf: 'DF', cep: '71070600' },
      latitude: -15.8342, longitude: -47.9795, telefone: '61999990001',
      capa: img('a3e635', 'Smart Fit - Guará II'),
      galeria: [
        { url: img('a3e635', 'Área de musculação'), legenda: 'Área de musculação' },
        { url: img('a3e635', 'Cardio'), legenda: 'Área de cardio' },
        { url: img('a3e635', 'Vestiário'), legenda: 'Vestiários amplos' },
      ],
      modalidades: ['Musculação', 'Ginástica', 'Cardio'],
      infraestrutura: ['Vestiário', 'Chuveiro', 'Ar-condicionado', 'Armários', 'Bebedouro', 'Wi-Fi', 'Acessibilidade'],
      horarios: semana('06:00', '23:00', ['08:00', '18:00'], ['09:00', '13:00']),
      planos: [
        { tipo: 'mensal', valor: 109.90, beneficios: ['Acesso a todas as unidades', 'Sem taxa de matrícula'], modalidades_cobertas: ['Musculação', 'Cardio'] },
        { tipo: 'trimestral', valor: 299.90, beneficios: ['Acesso a todas as unidades', 'Avaliação física grátis'], modalidades_cobertas: ['Musculação', 'Cardio', 'Ginástica'] },
        { tipo: 'anual', valor: 1099.00, beneficios: ['Acesso a todas as unidades', 'Avaliação física grátis', 'Traga um amigo 1x/mês'], modalidades_cobertas: ['Musculação', 'Cardio', 'Ginástica'] },
      ],
      avaliacoes: [
        { aluno: 'Carlos M.', nota: 5, comentario: 'Equipamentos novos e sempre limpa.', data: '2026-09-18' },
        { aluno: 'Juliana R.', nota: 4, comentario: 'Boa estrutura, mas lota no fim da tarde.', data: '2026-08-30' },
        { aluno: 'Pedro H.', nota: 4, comentario: 'Ótimo custo-benefício.', data: '2026-07-12' },
      ],
    },
    2: {
      id: 2, nome: 'Bluefit - Águas Claras',
      endereco: { rua: 'Av. Araucárias', numero: '1500', bairro: 'Águas Claras', cidade: 'Brasília', uf: 'DF', cep: '71936250' },
      latitude: -15.8344, longitude: -48.0262, telefone: '61999990002',
      capa: img('a3e635', 'Bluefit - Águas Claras'),
      galeria: [
        { url: img('a3e635', 'Musculação'), legenda: 'Salão de musculação' },
        { url: img('a3e635', 'Sala de lutas'), legenda: 'Sala de lutas' },
        { url: img('a3e635', 'Recepção'), legenda: 'Recepção' },
        { url: img('a3e635', 'Funcional'), legenda: 'Espaço funcional' },
      ],
      modalidades: ['Musculação', 'Lutas', 'Funcional', 'Spinning'],
      infraestrutura: ['Vestiário', 'Chuveiro quente', 'Ar-condicionado', 'Armários', 'Estacionamento', 'Wi-Fi', 'Bebedouro', 'Tatame'],
      horarios: semana('05:30', '23:00', ['07:00', '19:00'], ['08:00', '14:00']),
      planos: [
        { tipo: 'mensal', valor: 119.90, beneficios: ['Aulas coletivas inclusas', 'App de treinos'], modalidades_cobertas: ['Musculação', 'Funcional', 'Spinning'] },
        { tipo: 'trimestral', valor: 329.90, beneficios: ['Aulas coletivas inclusas', 'App de treinos', '1 avaliação física'], modalidades_cobertas: ['Musculação', 'Funcional', 'Spinning', 'Lutas'] },
        { tipo: 'anual', valor: 1199.00, beneficios: ['Aulas coletivas inclusas', 'App de treinos', '2 avaliações físicas'], modalidades_cobertas: ['Musculação', 'Funcional', 'Spinning', 'Lutas'] },
      ],
      avaliacoes: [
        { aluno: 'Mariana S.', nota: 5, comentario: 'Aulas de muay thai excelentes!', data: '2026-10-02' },
        { aluno: 'Rafael T.', nota: 5, comentario: 'Professores atenciosos e academia bem cuidada.', data: '2026-09-10' },
        { aluno: 'Bruna L.', nota: 4, comentario: 'Estacionamento é um pouco apertado.', data: '2026-08-05' },
      ],
    },
    3: {
      id: 3, nome: 'Crossfit Selva',
      endereco: { rua: 'CLS 408 Bloco B', numero: '25', bairro: 'Asa Sul', cidade: 'Brasília', uf: 'DF', cep: '70257520' },
      latitude: -15.8140, longitude: -47.9066, telefone: '61999990003',
      capa: img('a3e635', 'Crossfit Selva'),
      galeria: [
        { url: img('a3e635', 'Box de Crossfit'), legenda: 'Box principal' },
        { url: img('a3e635', 'Anilhas'), legenda: 'Área de levantamento olímpico' },
      ],
      modalidades: ['Crossfit', 'Levantamento Olímpico', 'Mobilidade'],
      infraestrutura: ['Vestiário', 'Chuveiro', 'Armários', 'Bebedouro', 'Estacionamento livre', 'Wi-Fi'],
      horarios: [
        ...[1, 2, 3, 4, 5].map(d => ({ dia: d, abre: '06:00', fecha: '21:00' })),
        { dia: 6, abre: '08:00', fecha: '12:00' },
        { dia: 0, abre: '00:00', fecha: '00:00' },
      ],
      planos: [
        { tipo: 'mensal', valor: 250.00, beneficios: ['Aulas em turma reduzida', 'Acompanhamento de coach'], modalidades_cobertas: ['Crossfit', 'Mobilidade'] },
        { tipo: 'trimestral', valor: 690.00, beneficios: ['Aulas em turma reduzida', 'Acompanhamento de coach', 'Camiseta do box'], modalidades_cobertas: ['Crossfit', 'Mobilidade', 'Levantamento Olímpico'] },
        { tipo: 'anual', valor: 2500.00, beneficios: ['Aulas em turma reduzida', 'Acompanhamento de coach', 'Kit de boas-vindas'], modalidades_cobertas: ['Crossfit', 'Mobilidade', 'Levantamento Olímpico'] },
      ],
      avaliacoes: [
        { aluno: 'Lucas A.', nota: 5, comentario: 'Comunidade incrível e coaches muito bons.', data: '2026-09-25' },
        { aluno: 'Fernanda C.', nota: 5, comentario: 'Evolução real em poucos meses.', data: '2026-09-01' },
      ],
    },
    4: {
      id: 4, nome: 'Academia Corpo & Água',
      endereco: { rua: 'QI 12 Conjunto C', numero: '8', bairro: 'Guará I', cidade: 'Brasília', uf: 'DF', cep: '71010120' },
      latitude: -15.8236, longitude: -47.9802, telefone: '61999990004',
      capa: img('a3e635', 'Corpo & Água'),
      galeria: [
        { url: img('a3e635', 'Piscina'), legenda: 'Piscina aquecida' },
        { url: img('a3e635', 'Musculação'), legenda: 'Sala de musculação' },
        { url: img('a3e635', 'Hidroginástica'), legenda: 'Aula de hidroginástica' },
      ],
      modalidades: ['Musculação', 'Natação', 'Hidroginástica'],
      infraestrutura: ['Piscina', 'Vestiário', 'Chuveiro quente', 'Armários', 'Acessibilidade', 'Bebedouro'],
      horarios: semana('06:00', '22:00', ['07:00', '13:00'], ['00:00', '00:00']),
      planos: [
        { tipo: 'mensal', valor: 79.90, beneficios: ['Piscina aquecida', 'Sem taxa de matrícula'], modalidades_cobertas: ['Musculação'] },
        { tipo: 'trimestral', valor: 219.90, beneficios: ['Piscina aquecida', '1 aula experimental de natação'], modalidades_cobertas: ['Musculação', 'Natação'] },
        { tipo: 'anual', valor: 799.00, beneficios: ['Piscina aquecida', 'Aulas de natação inclusas', 'Avaliação física'], modalidades_cobertas: ['Musculação', 'Natação', 'Hidroginástica'] },
      ],
      avaliacoes: [
        { aluno: 'Ana P.', nota: 4, comentario: 'Piscina ótima, vestiário poderia ser maior.', data: '2026-09-14' },
        { aluno: 'Marcos V.', nota: 4, comentario: 'Bom atendimento e preço justo.', data: '2026-08-20' },
        { aluno: 'Sônia K.', nota: 5, comentario: 'Adoro as aulas de hidroginástica.', data: '2026-07-30' },
      ],
    },
  };

  window.AcademiasData = {
    todas: () => Object.values(ACADEMIAS),
    porId: (id) => ACADEMIAS[Number(id)] || null,
  };
})();
