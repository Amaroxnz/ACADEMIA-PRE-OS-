const URL_BUSCA = '../../semana-03/rf05-tela-inicial/inicio.html';


if (window.Auth) Auth.renderNav('navLinks', 'detalhes');

const API_BASE = '';

const iconesInfra = { "Vestiário": "🚪", "Chuveiro": "🚿", "Chuveiro quente": "🚿", "Ar-condicionado": "❄️", "Armários": "🗄️", "Estacionamento": "🚗", "Estacionamento livre": "🚗", "Wi-Fi": "📶", "Bebedouro": "🚰", "Piscina": "🏊", "Acessibilidade": "♿", "Tatame": "🥋" };

const cacheAcademias = new Map();
let currentGallery = [];
let currentImageIndex = 0;
let lightboxIndex = 0;
let ultimoFocoAntesLightbox = null;

document.getElementById('btn-voltar').addEventListener('click', () => {
    const veioDaBusca = document.referrer && document.referrer.includes('inicio.html');
    if (veioDaBusca && window.history.length > 1) window.history.back();
    else window.location.href = URL_BUSCA;
});

document.getElementById('btn-erro-voltar').addEventListener('click', () => window.location.href = URL_BUSCA);

async function buscarAcademiaPorId(id) {
    if (cacheAcademias.has(id)) return cacheAcademias.get(id);
    if (!/^[1-9]\d*$/.test(id)) throw new Error('ID inválido');

    let academia = null;

    // 1) Tenta a API real, se API_BASE estiver configurado (ex.: 'http://localhost:3000')
    if (API_BASE) {
        try {
            const resp = await fetch(`${API_BASE}/api/academias/${encodeURIComponent(id)}`, { headers: { 'Accept': 'application/json' } });
            if (resp.ok) academia = await resp.json();
        } catch (e) { /* sem back-end: usa a base local */ }
    }

    // 2) Fallback: base local (shared/academias-data.js)
    if (!academia && window.AcademiasData) academia = window.AcademiasData.porId(id);

    if (!academia) throw new Error('Academia não encontrada');
    cacheAcademias.set(id, academia);
    return academia;
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
        img.width = 800; 
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

        const wpLink = `https://wa.me/55${String(telefone || '').replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Tenho interesse no plano ' + tipo + ' da academia.')}`;
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
            e.stopPropagation(); 
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
