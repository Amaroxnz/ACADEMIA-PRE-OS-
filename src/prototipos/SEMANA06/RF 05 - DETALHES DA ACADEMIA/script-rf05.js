/* ==========================================================================
   AKIFIT - RF-005 - Detalhes da Academia (protótipo front-end)
   - Dados simulados espelham as colunas do docs/schema.sql (ADR-001, PostgreSQL).
   - Em produção: trocar buscarAcademiaPorId() por fetch('/api/academias/' + id).
   - RNF-05: em produção todo o tráfego é HTTPS/TLS.
   - RNF-06: a tela de erro garante degradação elegante se o serviço cair.
   - ADR-003: cacheAcademias (Map) equivale ao Cache-Control da API.
   ========================================================================== */

// Caminho da tela de busca (RF-004) a partir da pasta SEMANA06
const URL_BUSCA = '../../SEMANA03/RF%2005%20-%20TELA%20INICIAL/inicio.html';

// Gera os 7 dias da semana (0=Domingo ... 6=Sábado). "00:00-00:00" = fechado.
function horariosSemana(seg_sex, sab, dom) {
    const linha = (dia, h) => ({ dia: dia, abre: h[0], fecha: h[1] });
    return [1, 2, 3, 4, 5].map(d => linha(d, seg_sex)).concat([linha(6, sab), linha(0, dom)]);
}
const FECHADO = ["00:00", "00:00"];
const ABERTO_24H = ["00:00", "23:59"];

// As médias de nota batem com os cartões da tela inicial (RF-004): 4.5 / 4.7 / 4.9 / 4.2
const BANCO_SIMULADO = [
    {
        id: 1,
        nome: "Smart Fit - Guará II",
        endereco: { rua: "QE 40", numero: "Lote 2", bairro: "Guará II", cidade: "Brasília", uf: "DF", cep: "71070400" },
        latitude: -15.823, longitude: -47.975,
        telefone: "61999999991",
        capa: "https://placehold.co/1200x400/222c26/a3e635?text=Smart+Fit",
        galeria: [
            { url: "https://placehold.co/800x600/222c26/a3e635?text=Frente", legenda: "Fachada da unidade" },
            { url: "https://placehold.co/800x600/222c26/a3e635?text=Musculacao", legenda: "Área de musculação" },
            { url: "https://placehold.co/800x600/222c26/a3e635?text=Cardio", legenda: "Esteiras e bicicletas" },
            { url: "https://placehold.co/800x600/222c26/a3e635?text=Funcional", legenda: "Espaço funcional" },
            { url: "https://placehold.co/800x600/222c26/a3e635?text=Vestiario", legenda: "Vestiário" },
            { url: "https://placehold.co/800x600/222c26/a3e635?text=Aulas", legenda: "Sala de aulas coletivas" }
        ],
        modalidades: ["Musculação", "Cardio", "Zumba"],
        infraestrutura: ["Vestiário", "Chuveiro quente", "Ar-condicionado", "Armários", "Bebedouro", "Wi-Fi"],
        horarios: horariosSemana(["06:00", "23:00"], ["08:00", "18:00"], ["09:00", "15:00"]),
        planos: [
            { tipo: 'mensal', valor: 109.90, beneficios: ["Acesso livre", "App de treinos"], modalidades_cobertas: ["Musculação", "Cardio"] },
            { tipo: 'trimestral', valor: 299.70, beneficios: ["Acesso livre", "App de treinos", "1 avaliação física"], modalidades_cobertas: ["Musculação", "Cardio", "Zumba"] },
            { tipo: 'anual', valor: 1078.80, beneficios: ["Acesso VIP", "Camiseta exclusiva", "Avaliações físicas trimestrais"], modalidades_cobertas: ["Todas as modalidades"] }
        ],
        // Fora de ordem de propósito: prova a ordenação decrescente por data (RN-04)
        avaliacoes: [
            { aluno: "Maria Souza", nota: 4, comentario: "Fica cheia às 18h, mas os equipamentos são ótimos.", data: "2026-09-28T14:30:00Z" },
            { aluno: "João Silva", nota: 5, comentario: "Muito boa, equipamentos novos.", data: "2026-10-01T10:00:00Z" },
            { aluno: "Ana Paula", nota: 5, comentario: "Ambiente limpo e instrutores atenciosos.", data: "2026-09-15T09:10:00Z" },
            { aluno: "Rafael Lima", nota: 4, comentario: "Bom custo-benefício para o bairro.", data: "2026-08-30T19:45:00Z" },
            { aluno: "Beatriz Alves", nota: 5, comentario: "As aulas de Zumba são excelentes!", data: "2026-08-12T07:20:00Z" },
            { aluno: "Lucas Prado", nota: 4, comentario: "Chuveiros ótimos, só falta mais estacionamento.", data: "2026-07-22T21:00:00Z" }
        ]
    },
    {
        id: 2,
        nome: "Bluefit - Águas Claras",
        endereco: { rua: "Rua 36 Sul", numero: "Lote 4", bairro: "Águas Claras", cidade: "Brasília", uf: "DF", cep: "71931360" },
        latitude: -15.836, longitude: -48.025,
        telefone: "61988888888",
        capa: "https://placehold.co/1200x400/222c26/a3e635?text=Bluefit",
        galeria: [
            { url: "https://placehold.co/800x600/222c26/a3e635?text=Musculacao", legenda: "Musculação" },
            { url: "https://placehold.co/800x600/222c26/a3e635?text=Lutas", legenda: "Tatame de lutas" },
            { url: "https://placehold.co/800x600/222c26/a3e635?text=Danca", legenda: "Sala de dança" }
        ],
        modalidades: ["Musculação", "Lutas", "Danças"],
        infraestrutura: ["Vestiário", "Estacionamento", "Wi-Fi", "Tatame", "Chuveiro"],
        horarios: horariosSemana(ABERTO_24H, ABERTO_24H, ABERTO_24H),
        planos: [
            { tipo: 'mensal', valor: 119.90, beneficios: ["Todas as modalidades", "Funcionamento 24h"], modalidades_cobertas: ["Musculação", "Lutas", "Danças"] },
            { tipo: 'anual', valor: 1198.80, beneficios: ["Todas as modalidades", "Funcionamento 24h", "2 meses grátis"], modalidades_cobertas: ["Musculação", "Lutas", "Danças"] }
        ],
        avaliacoes: [
            { aluno: "Carlos Mendes", nota: 4, comentario: "Gosto por ser 24h.", data: "2026-09-20T10:00:00Z" },
            { aluno: "Patrícia Rocha", nota: 5, comentario: "Treino de madrugada sem fila.", data: "2026-10-02T02:15:00Z" },
            { aluno: "Diego Nunes", nota: 5, comentario: "Tatame excelente para o jiu-jitsu.", data: "2026-09-05T20:30:00Z" },
            { aluno: "Camila Freitas", nota: 5, comentario: "Equipe simpática e aparelhos novos.", data: "2026-08-18T18:00:00Z" },
            { aluno: "Hugo Barreto", nota: 5, comentario: "Melhor da região.", data: "2026-08-02T06:40:00Z" },
            { aluno: "Sofia Carvalho", nota: 5, comentario: "Aulas de dança muito animadas.", data: "2026-07-14T19:00:00Z" },
            { aluno: "Mateus Gomes", nota: 4, comentario: "Às vezes lota no começo da noite.", data: "2026-06-30T21:10:00Z" }
        ]
    },
    {
        id: 3,
        nome: "Crossfit Selva",
        endereco: { rua: "SGAS 902", numero: "Bloco B", bairro: "Asa Sul", cidade: "Brasília", uf: "DF", cep: "70390020" },
        latitude: -15.822, longitude: -47.925,
        telefone: "61977777777",
        capa: "https://placehold.co/1200x400/222c26/a3e635?text=Crossfit+Selva",
        galeria: [
            { url: "https://placehold.co/800x600/222c26/a3e635?text=Box", legenda: "Box principal" },
            { url: "https://placehold.co/800x600/222c26/a3e635?text=LPO", legenda: "Área de levantamento olímpico" },
            { url: "https://placehold.co/800x600/222c26/a3e635?text=WOD", legenda: "Quadro do WOD" }
        ],
        modalidades: ["Crossfit", "LPO"],
        infraestrutura: ["Vestiário", "Bebedouro", "Estacionamento livre", "Chuveiro"],
        horarios: horariosSemana(["06:00", "21:00"], ["08:00", "12:00"], FECHADO),
        planos: [
            { tipo: 'mensal', valor: 250.00, beneficios: ["Acesso livre", "WOD diário com coach"], modalidades_cobertas: ["Crossfit", "LPO"] }
        ],
        avaliacoes: [
            { aluno: "Fernanda Dias", nota: 5, comentario: "Comunidade top!", data: "2026-10-01T08:00:00Z" },
            { aluno: "Bruno Teixeira", nota: 5, comentario: "Coaches excelentes, evolução rápida.", data: "2026-09-18T07:00:00Z" },
            { aluno: "Larissa Moura", nota: 5, comentario: "Box limpo e muito bem equipado.", data: "2026-09-02T19:20:00Z" },
            { aluno: "Thiago Ramos", nota: 4, comentario: "Caro, mas vale cada centavo.", data: "2026-08-21T20:00:00Z" },
            { aluno: "Isabela Cruz", nota: 5, comentario: "Aulas desafiadoras e acolhedoras.", data: "2026-08-05T06:30:00Z" },
            { aluno: "Gustavo Pires", nota: 5, comentario: "Me fez amar o treino.", data: "2026-07-19T18:40:00Z" },
            { aluno: "Renata Lopes", nota: 5, comentario: "Ambiente motivador.", data: "2026-07-01T07:15:00Z" },
            { aluno: "Eduardo Faria", nota: 5, comentario: "Recomendo para iniciantes também.", data: "2026-06-12T12:00:00Z" }
        ]
    },
    {
        id: 4,
        nome: "Academia Corpo & Água",
        endereco: { rua: "QE 11", numero: "Área Especial 3", bairro: "Guará I", cidade: "Brasília", uf: "DF", cep: "71020000" },
        latitude: -15.832, longitude: -47.987,
        telefone: "61966666666",
        capa: "https://placehold.co/1200x400/222c26/a3e635?text=Corpo+%26+Agua",
        galeria: [
            { url: "https://placehold.co/800x600/222c26/a3e635?text=Piscina", legenda: "Piscina aquecida" },
            { url: "https://placehold.co/800x600/222c26/a3e635?text=Musculacao", legenda: "Musculação" },
            { url: "https://placehold.co/800x600/222c26/a3e635?text=Hidro", legenda: "Aula de hidroginástica" }
        ],
        modalidades: ["Musculação", "Natação", "Hidroginástica"],
        infraestrutura: ["Piscina", "Vestiário", "Chuveiro quente", "Acessibilidade", "Armários"],
        horarios: horariosSemana(["06:00", "22:00"], ["07:00", "14:00"], FECHADO),
        planos: [
            { tipo: 'mensal', valor: 79.90, beneficios: ["Musculação + Piscina"], modalidades_cobertas: ["Musculação", "Natação"] },
            { tipo: 'trimestral', valor: 219.90, beneficios: ["Musculação + Piscina", "1 aula experimental de hidro"], modalidades_cobertas: ["Musculação", "Natação", "Hidroginástica"] }
        ],
        avaliacoes: [
            { aluno: "Renato Campos", nota: 4, comentario: "Piscina ótima.", data: "2026-09-01T10:00:00Z" },
            { aluno: "Silvia Neves", nota: 5, comentario: "Água sempre na temperatura certa.", data: "2026-09-25T08:30:00Z" },
            { aluno: "Otávio Reis", nota: 4, comentario: "Preço justo e equipe atenciosa.", data: "2026-08-14T17:00:00Z" },
            { aluno: "Helena Duarte", nota: 4, comentario: "Vestiário poderia ser maior.", data: "2026-07-27T13:20:00Z" },
            { aluno: "Vinícius Melo", nota: 4, comentario: "Ótima para quem quer natação.", data: "2026-07-03T09:00:00Z" }
        ]
    },
    {
        id: 5,
        nome: "Studio Pulse",
        endereco: { rua: "Rua das Paineiras", numero: "S/N", bairro: "Águas Claras", cidade: "Brasília", uf: "DF", cep: "71900000" },
        latitude: -15.830, longitude: -48.020,
        telefone: "61955555555",
        capa: "https://placehold.co/1200x400/222c26/a3e635?text=Studio+Pulse",
        galeria: [{ url: "https://placehold.co/800x600/222c26/a3e635?text=Studio", legenda: "Studio funcional" }],
        modalidades: ["Treino Funcional", "Pilates"],
        infraestrutura: ["Wi-Fi", "Ar-condicionado"],
        horarios: horariosSemana(["07:00", "20:00"], ["08:00", "12:00"], FECHADO),
        planos: [{ tipo: 'mensal', valor: 150.00, beneficios: ["Aulas ilimitadas"], modalidades_cobertas: ["Treino Funcional", "Pilates"] }],
        avaliacoes: [] // academia nova: testa FA-02 (sem avaliações)
    },
    {
        id: 6,
        nome: "Iron House",
        endereco: { rua: "QNM 17", numero: "Lote 2", bairro: "Ceilândia Centro", cidade: "Brasília", uf: "DF", cep: "72215170" },
        latitude: -15.815, longitude: -48.110,
        telefone: "61944444444",
        capa: "https://placehold.co/1200x400/222c26/a3e635?text=Iron+House",
        galeria: [], // sem fotos: testa RN-05 (placeholder AKIFIT)
        modalidades: ["Musculação Old School"],
        infraestrutura: ["Bebedouro"],
        horarios: horariosSemana(["05:30", "22:00"], ["07:00", "16:00"], FECHADO),
        planos: [{ tipo: 'mensal', valor: 70.00, beneficios: ["Só ferro"], modalidades_cobertas: ["Musculação"] }],
        avaliacoes: [{ aluno: "Bruno Almeida", nota: 5, comentario: "Academia raiz", data: "2026-08-01T10:00:00Z" }]
    },
    {
        id: 7,
        nome: "Academia Fantasma",
        endereco: { rua: "Rua do Ouro", numero: "1", bairro: "Centro", cidade: "Brasília", uf: "DF", cep: "70000000" },
        latitude: -15.800, longitude: -48.000,
        telefone: "61900000000",
        capa: "",
        galeria: [], modalidades: [], infraestrutura: [], horarios: [], planos: [], avaliacoes: [] // sem plano: viola RN-03 -> tela de erro
    }
];

const iconesInfra = { "Vestiário": "🚪", "Chuveiro": "🚿", "Chuveiro quente": "🚿", "Ar-condicionado": "❄️", "Armários": "🗄️", "Estacionamento": "🚗", "Estacionamento livre": "🚗", "Wi-Fi": "📶", "Bebedouro": "🚰", "Piscina": "🏊", "Acessibilidade": "♿", "Tatame": "🥋" };

const cacheAcademias = new Map();
let currentGallery = [];
let currentImageIndex = 0;
let lightboxIndex = 0;
let ultimoFocoAntesLightbox = null;

// "Voltar para Busca": volta no histórico se veio da busca; senão vai direto para ela
document.getElementById('btn-voltar').addEventListener('click', () => {
    const veioDaBusca = document.referrer && document.referrer.includes('inicio.html');
    if (veioDaBusca && window.history.length > 1) window.history.back();
    else window.location.href = URL_BUSCA;
});

document.getElementById('btn-erro-voltar').addEventListener('click', () => window.location.href = URL_BUSCA);

async function buscarAcademiaPorId(id) {
    if (cacheAcademias.has(id)) return cacheAcademias.get(id);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const academia = /^\d+$/.test(id) ? BANCO_SIMULADO.find(a => a.id === Number(id)) : null;
            if (academia) {
                cacheAcademias.set(id, academia);
                resolve(academia);
            } else reject("Academia não encontrada");
        }, 300);
    });
}

function mostrarErro() {
    document.getElementById('skeleton').classList.add('hidden');
    document.getElementById('conteudo-principal').classList.add('hidden');
    document.getElementById('tela-erro').classList.remove('hidden');
    let cont = 5;
    const el = document.getElementById('contador-erro');
    const intervalo = setInterval(() => {
        cont--;
        el.textContent = cont;
        if (cont <= 0) { clearInterval(intervalo); window.location.href = URL_BUSCA; }
    }, 1000);
}

function carregarFavorito(id) {
    let favs = JSON.parse(localStorage.getItem('akifit_favoritos') || '[]');
    const btn = document.getElementById('btn-favorito');
    
    function updateAria() {
        const isF = btn.getAttribute('aria-pressed') === 'true';
        btn.setAttribute('aria-label', isF ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
    }
    
    if (favs.includes(id)) btn.setAttribute('aria-pressed', 'true');
    updateAria();
    
    btn.onclick = () => {
        favs = JSON.parse(localStorage.getItem('akifit_favoritos') || '[]');
        if (favs.includes(id)) {
            favs = favs.filter(f => f !== id);
            btn.setAttribute('aria-pressed', 'false');
        } else {
            favs.push(id);
            btn.setAttribute('aria-pressed', 'true');
        }
        localStorage.setItem('akifit_favoritos', JSON.stringify(favs));
        updateAria();
    };
}

function calcularMedia(avaliacoes) {
    if (!avaliacoes || avaliacoes.length === 0) return 0;
    let soma = 0;
    for (let i = 0; i < avaliacoes.length; i++) soma += avaliacoes[i].nota;
    return parseFloat((soma / avaliacoes.length).toFixed(1));
}

function formatarMoeda(valor) {
    return 'R$ ' + Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function textoAvaliacoes(qtd) {
    return qtd === 1 ? '1 avaliação' : qtd + ' avaliações';
}

function gerarEstrelas(nota) {
    // Estrela cheia, meia estrela (preenchida pela metade) ou vazia
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (nota >= i) html += '<span class="star full">★</span>';
        else if (nota >= i - 0.75) html += '<span class="star half">★</span>';
        else html += '<span class="star empty">★</span>';
    }
    return `<span class="stars-container" role="img" aria-label="Nota ${nota.toFixed(1)} de 5">${html}</span>`;
}

function escapeHTML(str) {
    const p = document.createElement('p');
    p.appendChild(document.createTextNode(str));
    return p.innerHTML;
}

function formatarEndereco(end) {
    return `${end.rua}, ${end.numero} - ${end.bairro}, ${end.cidade} - ${end.uf}, CEP: ${end.cep}`;
}

function renderizarHero(academia, media) {
    const heroImg = new Image();
    heroImg.src = academia.capa;
    heroImg.onload = () => document.getElementById('hero-section').style.backgroundImage = `url('${academia.capa}')`;
    heroImg.onerror = () => document.getElementById('hero-section').style.backgroundImage = `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='400' viewBox='0 0 1200 400'%3E%3Crect fill='%23222c26' width='1200' height='400'/%3E%3Ctext fill='%23a3e635' font-family='sans-serif' font-size='48' x='50%25' y='50%25' text-anchor='middle'%3E%26%239889%3B AKIFIT%3C/text%3E%3C/svg%3E")`;

    document.getElementById('nome-academia').textContent = academia.nome;
    const divNota = document.getElementById('nota-academia');
    
    if (media > 0) {
        divNota.innerHTML = `${gerarEstrelas(media)} <span style="margin-left:5px">${media.toFixed(1)} (${textoAvaliacoes(academia.avaliacoes.length)})</span>`;
    } else {
        divNota.innerHTML = `<span class="badge">Novo</span> <span style="margin-left:10px; font-size:14px">Sem avaliações ainda</span>`;
    }
    
    document.getElementById('bairro-academia').textContent = academia.endereco.bairro;
    document.getElementById('endereco-hero').textContent = formatarEndereco(academia.endereco);
    
    const badgesHero = document.getElementById('badges-hero');
    badgesHero.innerHTML = '';
    for (let i = 0; i < Math.min(3, academia.modalidades.length); i++) {
        const b = document.createElement('span');
        b.className = 'badge';
        b.textContent = academia.modalidades[i];
        badgesHero.appendChild(b);
    }
}

function abrirLightbox(index) {
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const cap = document.getElementById('lightbox-caption');
    lightboxIndex = index;
    img.src = currentGallery[index].url;
    img.alt = currentGallery[index].legenda;
    cap.textContent = currentGallery[index].legenda;
    if (lb.classList.contains('hidden')) ultimoFocoAntesLightbox = document.activeElement;
    lb.classList.remove('hidden');
    document.getElementById('lightbox-close').focus();
}

function fecharLightbox() {
    document.getElementById('lightbox').classList.add('hidden');
    if (ultimoFocoAntesLightbox && ultimoFocoAntesLightbox.focus) ultimoFocoAntesLightbox.focus();
}

function moverLightbox(delta) {
    if (currentGallery.length === 0) return;
    abrirLightbox((lightboxIndex + delta + currentGallery.length) % currentGallery.length);
}

function setupGaleria(galeria) {
    currentGallery = galeria;
    const container = document.getElementById('carrossel-container');
    const track = document.getElementById('galeria-track');
    const indicadores = document.getElementById('carrossel-indicadores');
    
    if (!galeria || galeria.length === 0) {
        container.innerHTML = `<div class="galeria-placeholder">⚡ AKIFIT<br>Sem imagens cadastradas</div>`;
        indicadores.innerHTML = '';
        return;
    }
    
    track.innerHTML = '';
    indicadores.innerHTML = '';
    
    for (let i = 0; i < galeria.length; i++) {
        const wrap = document.createElement('div');
        wrap.className = 'img-wrap';
        wrap.onclick = () => abrirLightbox(i);
        wrap.tabIndex = 0;
        wrap.setAttribute('role', 'button');
        wrap.setAttribute('aria-label', 'Ampliar foto: ' + galeria[i].legenda);
        wrap.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirLightbox(i); } });
        
        const img = document.createElement('img');
        img.src = galeria[i].url;
        img.alt = galeria[i].legenda;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.width = 800;  // evita layout shift (RNF-01)
        img.height = 600;
        img.onerror = function() {
            this.onerror = null;
            this.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect fill='%23222c26' width='800' height='600'/%3E%3Ctext fill='%23a3e635' font-family='sans-serif' font-size='32' x='50%25' y='50%25' text-anchor='middle'%3E%26%239889%3B Imagem indisponível%3C/text%3E%3C/svg%3E";
        };
        
        const leg = document.createElement('div');
        leg.className = 'img-legenda';
        leg.textContent = galeria[i].legenda;
        
        wrap.appendChild(img);
        wrap.appendChild(leg);
        track.appendChild(wrap);
        
        const ind = document.createElement('div');
        ind.className = 'indicador' + (i === 0 ? ' ativo' : '');
        ind.onclick = () => goToSlide(i);
        indicadores.appendChild(ind);
    }
    
    function goToSlide(index) {
        currentImageIndex = index;
        track.style.transform = `translateX(-${index * 100}%)`;
        Array.from(indicadores.children).forEach((d, i) => d.className = 'indicador' + (i === index ? ' ativo' : ''));
    }
    
    document.getElementById('btn-prev').onclick = () => {
        if (currentImageIndex > 0) goToSlide(currentImageIndex - 1);
        else goToSlide(galeria.length - 1);
    };
    
    document.getElementById('btn-next').onclick = () => {
        if (currentImageIndex < galeria.length - 1) goToSlide(currentImageIndex + 1);
        else goToSlide(0);
    };
    
    let startX = 0;
    track.addEventListener('touchstart', e => startX = e.changedTouches[0].screenX);
    track.addEventListener('touchend', e => {
        let endX = e.changedTouches[0].screenX;
        if (endX < startX - 40) document.getElementById('btn-next').click();
        if (endX > startX + 40) document.getElementById('btn-prev').click();
    });
}

function renderizarPlanos(planos, telefone) {
    const container = document.getElementById('conteudo-planos');
    const tbody = document.querySelector('#tabela-planos tbody');
    const abasBtns = Array.from(document.querySelectorAll('.aba-btn'));
    const listAbas = document.getElementById('lista-abas');
    const TIPOS = ['mensal', 'trimestral', 'anual'];
    const MESES = { mensal: 1, trimestral: 3, anual: 12 };
    const rotulo = t => t.charAt(0).toUpperCase() + t.slice(1);

    container.innerHTML = '';
    tbody.innerHTML = '';

    const pMensal = planos.find(p => p.tipo === 'mensal');

    // FA-01: um painel para CADA aba; se a academia não oferece o plano, mostra aviso amigável
    TIPOS.forEach(tipo => {
        const p = planos.find(x => x.tipo === tipo);
        const panel = document.createElement('div');
        panel.className = 'tab-panel';
        panel.id = 'panel-' + tipo;
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', 'tab-' + tipo);

        if (!p) {
            panel.innerHTML = `<div class="plano-card"><p class="plano-indisponivel">Esta academia não oferece o plano ${tipo}.</p></div>`;
            container.appendChild(panel);
            return;
        }

        const wpLink = `https://wa.me/55${telefone}?text=${encodeURIComponent('Olá! Tenho interesse no plano ' + tipo + ' da academia.')}`;
        const eqMensal = p.valor / MESES[tipo];
        let economia = 0;
        if (pMensal && tipo !== 'mensal') economia = Math.round(100 - (eqMensal / pMensal.valor) * 100);

        const htmlBens = p.beneficios.map(b => `<li>${escapeHTML(b)}</li>`).join('');
        const htmlMods = p.modalidades_cobertas.map(m => `<li>${escapeHTML(m)}</li>`).join('');
        const periodicidade = { mensal: '/mês', trimestral: '/trimestre', anual: '/ano' }[tipo];
        let infoEco = '';
        if (tipo !== 'mensal') {
            infoEco = `<p class="plano-equiv">Equivale a ${formatarMoeda(eqMensal)} / mês${economia > 0 ? ` (economia de ${economia}%)` : ''}</p>`;
        }

        panel.innerHTML = `
            <div class="plano-card">
                <div class="preco-destaque">${formatarMoeda(p.valor)}<small>${periodicidade}</small></div>
                ${infoEco}
                <div class="plano-detalhes">
                    <strong>Benefícios:</strong><ul>${htmlBens}</ul><br>
                    <strong>Modalidades cobertas:</strong><ul>${htmlMods}</ul>
                </div>
                <a href="${wpLink}" target="_blank" rel="noopener noreferrer" class="btn-neon">Entrar em contato</a>
            </div>
        `;
        container.appendChild(panel);

        // Tabela comparativa (RN-01: valor + periodicidade explícitos)
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${rotulo(tipo)}</strong></td>
            <td>${formatarMoeda(p.valor)} ${periodicidade}</td>
            <td>${formatarMoeda(eqMensal)}</td>
            <td class="${economia > 0 ? 'eco-verde' : ''}">${economia > 0 ? economia + '%' : '-'}</td>
            <td><a href="${wpLink}" target="_blank" rel="noopener noreferrer" class="btn-outline btn-tabela">Entrar em contato</a></td>
        `;
        tbody.appendChild(tr);
    });

    function ativarAba(alvo, focar) {
        abasBtns.forEach(b => {
            const isAtivo = b.dataset.alvo === alvo;
            b.classList.toggle('ativo', isAtivo);
            b.setAttribute('aria-selected', String(isAtivo));
            b.tabIndex = isAtivo ? 0 : -1; // roving tabindex (padrão WAI-ARIA)
            if (isAtivo && focar) b.focus();
        });
        document.querySelectorAll('.tab-panel').forEach(p => {
            p.classList.toggle('ativo', p.id === 'panel-' + alvo);
        });
    }

    abasBtns.forEach(btn => btn.onclick = () => ativarAba(btn.dataset.alvo, false));

    listAbas.addEventListener('keydown', e => {
        const idx = abasBtns.findIndex(b => b.classList.contains('ativo'));
        let novo = -1;
        if (e.key === 'ArrowRight') novo = (idx + 1) % abasBtns.length;
        else if (e.key === 'ArrowLeft') novo = (idx - 1 + abasBtns.length) % abasBtns.length;
        else if (e.key === 'Home') novo = 0;
        else if (e.key === 'End') novo = abasBtns.length - 1;
        if (novo >= 0) {
            e.preventDefault();
            e.stopPropagation(); // não deixa a seta mexer na galeria
            ativarAba(abasBtns[novo].dataset.alvo, true);
        }
    });

    ativarAba(pMensal ? 'mensal' : planos[0].tipo, false);
}

function renderizarModInfra(academia) {
    const listMod = document.getElementById('lista-modalidades');
    listMod.innerHTML = '';
    academia.modalidades.forEach(m => {
        const s = document.createElement('span');
        s.className = 'badge';
        s.textContent = m;
        listMod.appendChild(s);
    });
    
    const listInf = document.getElementById('lista-infra');
    listInf.innerHTML = '';
    academia.infraestrutura.forEach(i => {
        const d = document.createElement('div');
        d.className = 'infra-item';
        const icone = iconesInfra[i] || '✓';
        d.innerHTML = `<span>${icone}</span> <span>${escapeHTML(i)}</span>`;
        listInf.appendChild(d);
    });
}

function calcularDistanciaKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
}

function pegarCoordsCep(cep) {
    const pref = cep.substring(0, 2);
    if (pref === '71') return { lat: -15.83, lon: -48.02 };
    if (pref === '70') return { lat: -15.79, lon: -47.88 };
    if (pref === '72') return { lat: -15.81, lon: -48.11 };
    return { lat: -15.8, lon: -47.9 };
}

function renderizarLocalizacao(academia) {
    const endStr = formatarEndereco(academia.endereco);
    document.getElementById('endereco-completo').textContent = endStr;
    const mapQ = encodeURIComponent(endStr);
    document.getElementById('mapa-container').innerHTML = `<iframe src="https://www.google.com/maps?q=${mapQ}&output=embed" loading="lazy" title="Mapa da Academia"></iframe>`;
    document.getElementById('link-rota').href = `https://www.google.com/maps/dir/?api=1&destination=${academia.latitude},${academia.longitude}`;
    
    const distBox = document.getElementById('distancia-cep');
    let userCep = localStorage.getItem('akifit_cep');
    if (userCep && !/^\d{8}$/.test(userCep)) { localStorage.removeItem('akifit_cep'); userCep = null; } // valor salvo inválido
    
    function atualizarDist(cepStr) {
        if (cepStr && cepStr.length === 8) {
            const coord = pegarCoordsCep(cepStr);
            const dist = calcularDistanciaKm(coord.lat, coord.lon, academia.latitude, academia.longitude);
            distBox.innerHTML = `<span>A <strong>${dist} km</strong> do seu CEP (${cepStr})</span> <button id="btn-trocar-cep" class="btn-outline" style="padding:4px 8px; font-size:12px; width:auto;">Trocar</button>`;
            document.getElementById('btn-trocar-cep').onclick = () => { localStorage.removeItem('akifit_cep'); renderizarLocalizacao(academia); };
        }
    }
    
    if (userCep) {
        atualizarDist(userCep);
    } else {
        distBox.innerHTML = `
            <input type="text" id="input-cep-dist" class="cep-input" placeholder="Seu CEP" maxlength="8" inputmode="numeric" aria-label="Informe seu CEP">
            <button id="btn-calc-dist" class="btn-neon" style="padding:6px 12px; font-size:12px; width:auto;">Calcular</button>
            <div id="erro-cep" style="color:#f87171; font-size:12px; width:100%;" class="hidden" role="alert">CEP inválido. Digite os 8 números.</div>
        `;
        const inputCep = document.getElementById('input-cep-dist');
        const calcular = () => {
            const v = inputCep.value.trim();
            if (/^\d{8}$/.test(v)) {
                localStorage.setItem('akifit_cep', v);
                atualizarDist(v);
            } else {
                document.getElementById('erro-cep').classList.remove('hidden');
            }
        };
        inputCep.addEventListener('input', () => { inputCep.value = inputCep.value.replace(/\D/g, ''); });
        inputCep.addEventListener('keydown', e => { if (e.key === 'Enter') calcular(); });
        document.getElementById('btn-calc-dist').onclick = calcular;
    }
}

function renderizarHorarios(horarios) {
    const list = document.getElementById('lista-horarios');
    list.innerHTML = '';
    const hoje = new Date().getDay();
    const dias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    let horHoje = null;
    
    for (let i = 1; i <= 7; i++) {
        let d = i % 7;
        const h = horarios.find(x => x.dia === d);
        const li = document.createElement('li');
        if (d === hoje) { li.className = 'hoje'; horHoje = h; }
        
        let textoHora = "Fechado";
        if (h && h.abre === "00:00" && h.fecha === "23:59") textoHora = "24 horas";
        else if (h && !(h.abre === "00:00" && h.fecha === "00:00")) textoHora = `${h.abre} - ${h.fecha}`;
        
        li.innerHTML = `<span>${dias[d]}</span><span>${textoHora}</span>`;
        list.appendChild(li);
    }
    
    const statDiv = document.getElementById('status-funcionamento');
    if (!horHoje || (horHoje.abre === "00:00" && horHoje.fecha === "00:00")) {
        statDiv.innerHTML = '<span class="status-fechado">Fechado agora</span>';
    } else if (horHoje.abre === "00:00" && horHoje.fecha === "23:59") {
        statDiv.innerHTML = '<span class="status-aberto">Aberto agora</span>';
    } else {
        const agora = new Date();
        const hrAt = agora.getHours() + agora.getMinutes() / 60;
        const [aH, aM] = horHoje.abre.split(':').map(Number);
        const [fH, fM] = horHoje.fecha.split(':').map(Number);
        const abreDec = aH + aM / 60;
        const fechaDec = fH + fM / 60;
        
        if (hrAt >= abreDec && hrAt < fechaDec) statDiv.innerHTML = '<span class="status-aberto">Aberto agora</span>';
        else statDiv.innerHTML = '<span class="status-fechado">Fechado agora</span>';
    }
}

function renderizarAvaliacoes(avaliacoes, media) {
    const res = document.getElementById('resumo-notas');
    const lis = document.getElementById('lista-comentarios');
    lis.innerHTML = '';
    
    if (!avaliacoes || avaliacoes.length === 0) {
        res.innerHTML = '<p>Sem avaliações ainda</p>';
        lis.innerHTML = '<p>Seja o primeiro aluno a avaliar esta academia!</p>';
        return;
    }
    
    res.innerHTML = `<h3>Média Geral: ${gerarEstrelas(media)} ${media.toFixed(1)} (${textoAvaliacoes(avaliacoes.length)})</h3>`;
    
    const avOrdem = [...avaliacoes].sort((a, b) => new Date(b.data) - new Date(a.data));
    
    avOrdem.forEach(a => {
        const card = document.createElement('div');
        card.className = 'comentario-card';
        const dStr = new Date(a.data).toLocaleDateString('pt-BR');
        card.innerHTML = `
            <div class="comentario-header">
                <span class="comentario-nome">${escapeHTML(a.aluno)} <span style="margin-left:10px;">${gerarEstrelas(a.nota)}</span></span>
                <span class="comentario-data">${dStr}</span>
            </div>
            <div class="comentario-texto">${escapeHTML(a.comentario)}</div>
        `;
        lis.appendChild(card);
    });
}

document.getElementById('lightbox-close').addEventListener('click', fecharLightbox);
document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') fecharLightbox();
});
document.addEventListener('keydown', (e) => {
    const lb = document.getElementById('lightbox');
    const lightboxAberto = !lb.classList.contains('hidden');

    if (lightboxAberto) {
        if (e.key === 'Escape') fecharLightbox();
        else if (e.key === 'ArrowRight') moverLightbox(1);
        else if (e.key === 'ArrowLeft') moverLightbox(-1);
        return;
    }

    // Setas só controlam o carrossel quando o foco está nele ou na página (nunca em abas, campos ou botões)
    const alvo = e.target;
    const foraDoCarrossel = alvo !== document.body && !alvo.closest('#carrossel-container');
    if (foraDoCarrossel || currentGallery.length === 0) return;
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    if (e.key === 'ArrowRight' && btnNext) btnNext.click();
    if (e.key === 'ArrowLeft' && btnPrev) btnPrev.click();
});

async function init() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if (!id) throw new Error("ID ausente");
        
        const academia = await buscarAcademiaPorId(id);
        const end = academia.endereco;
        
        if (!academia.nome || !end || !end.rua || !end.numero || !end.bairro || !end.cidade || !end.uf || !end.cep || !academia.planos || academia.planos.length === 0 || !academia.horarios || academia.horarios.length === 0) {
            throw new Error("RN-03: Dados obrigatórios ausentes");
        }
        
        const media = calcularMedia(academia.avaliacoes);
        
        renderizarHero(academia, media);
        setupGaleria(academia.galeria);
        renderizarPlanos(academia.planos, academia.telefone);
        renderizarModInfra(academia);
        renderizarLocalizacao(academia);
        renderizarHorarios(academia.horarios);
        renderizarAvaliacoes(academia.avaliacoes, media);
        carregarFavorito(academia.id);
        
        document.getElementById('skeleton').classList.add('hidden');
        document.getElementById('conteudo-principal').classList.remove('hidden');
        
    } catch (e) {
        console.error(e);
        mostrarErro();
    }
}

init();