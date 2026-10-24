if (!Auth.requireAuth()) throw new Error('não autenticado');
Auth.renderNav('navLinks', 'comparar');

const URL_BUSCA = Auth.URLS.inicio;
const URL_DETALHES = '../../semana-06/rf05-detalhes-da-academia/RF-05.html?id=';
const TIPOS = [
    { tipo: 'mensal', rotulo: 'Mensal', meses: 1 },
    { tipo: 'trimestral', rotulo: 'Trimestral', meses: 3 },
    { tipo: 'anual', rotulo: 'Anual', meses: 12 },
];
const INFRA = ['Estacionamento', 'Ar-condicionado', 'Armários', 'Wi-Fi'];

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const moeda = (v) => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const norm = (t) => String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const media = (av) => av && av.length ? av.reduce((s, a) => s + a.nota, 0) / av.length : 0;
const temInfra = (a, item) => a.infraestrutura.some(i => norm(i).startsWith(norm(item)));
const temModalidade = (a, m) => a.modalidades.some(x => norm(x) === norm(m));
const marcador = (ok, nome) => ok
    ? `<span class="sim" role="img" aria-label="Possui ${esc(nome)}">✓</span>`
    : `<span class="nao" role="img" aria-label="Não possui ${esc(nome)}">✕</span>`;

$('btn-voltar').onclick = () => { window.location.href = URL_BUSCA; };
$('link-busca').href = URL_BUSCA;
$('link-add-mais').href = URL_BUSCA;
$('btn-limpar').onclick = () => Comparacao.limpar();

function carregar() {

    return Comparacao.ids().map(id => window.AcademiasData.porId(id)).filter(Boolean);
}

function celulasPreco(lista, t) {
    const planos = lista.map(a => a.planos.find(p => p.tipo === t.tipo));
    const eqs = planos.map(p => p ? p.valor / t.meses : null);
    const validos = eqs.filter(v => v !== null);
    const menor = validos.length >= 2 ? Math.min(...validos.map(v => Math.round(v * 100))) : null;
    return planos.map((p, i) => {
        if (!p) return `<td><span class="sem-plano">Não oferece</span></td>`;
        const eMenor = menor !== null && Math.round(eqs[i] * 100) === menor;
        const eq = t.meses > 1 ? `<div class="preco-eq">Equivale a ${moeda(eqs[i])}/mês</div>` : `<div class="preco-eq">por mês</div>`;
        const per = { mensal: '/mês', trimestral: '/trimestre', anual: '/ano' }[t.tipo];
        return `<td class="${eMenor ? 'melhor' : ''}">
            <div class="preco-valor">${moeda(p.valor)}<small style="font-size:12px;font-weight:normal;color:#9ca3af">${per}</small></div>
            ${eq}
            ${eMenor ? '<span class="selo-menor">★ Menor preço</span>' : ''}
        </td>`;
    }).join('');
}

function render() {
    const lista = carregar();
    const vazio = lista.length < Comparacao.MIN;
    $('estado-vazio').classList.toggle('hidden', !vazio);
    $('area-comparacao').classList.toggle('hidden', vazio);
    $('link-add-mais').classList.toggle('hidden', lista.length >= Comparacao.MAX);
    if (vazio) {
        $('vazio-titulo').textContent = lista.length === 1 ? 'Falta mais uma academia' : 'Selecione pelo menos 2 academias';
        $('vazio-texto').textContent = lista.length === 1
            ? `Você escolheu ${lista[0].nome}. Adicione ao menos mais uma (máximo ${Comparacao.MAX}) para comparar.`
            : `Na busca ou nos detalhes, clique em “Adicionar à Comparação” em 2 ou 3 academias (máximo ${Comparacao.MAX}).`;
        $('subtitulo').textContent = 'Compare preços, modalidades e infraestrutura lado a lado.';
        return;
    }
    $('subtitulo').textContent = `Comparando ${lista.length} academias.`;

    
    $('linha-cabecalho').innerHTML = '<th class="col-rotulo" scope="col"></th>' + lista.map(a => {
        const m = media(a.avaliacoes);
        return `<th scope="col">
            <img class="cab-capa" src="${a.capa}" alt="Capa da ${esc(a.nome)}">
            <div class="cab-nome">${esc(a.nome)}</div>
            <div class="cab-nota">${m > 0 ? `<span class="estrela">★</span> ${m.toFixed(1).replace('.', ',')} (${a.avaliacoes.length})` : 'Sem avaliações'}</div>
            <div class="cab-acoes">
                <a class="btn-detalhes" href="${URL_DETALHES}${a.id}">Ver Detalhes</a>
                <button type="button" class="btn-remover" data-rm="${a.id}">Remover</button>
            </div>
        </th>`;
    }).join('');

    const secao = (t) => `<tr class="secao"><th colspan="${lista.length + 1}" scope="colgroup">${t}</th></tr>`;
    let html = secao('Preços');
    TIPOS.forEach(t => { html += `<tr><th class="col-rotulo" scope="row">${t.rotulo}</th>${celulasPreco(lista, t)}</tr>`; });

    html += secao('Modalidades oferecidas');
    const mods = [...new Map(lista.flatMap(a => a.modalidades).map(m => [norm(m), m])).values()].sort((x, y) => x.localeCompare(y, 'pt-BR'));
    mods.forEach(m => { html += `<tr><th class="col-rotulo" scope="row">${esc(m)}</th>${lista.map(a => `<td>${marcador(temModalidade(a, m), m)}</td>`).join('')}</tr>`; });

    html += secao('Infraestrutura e comodidades');
    INFRA.forEach(i => { html += `<tr><th class="col-rotulo" scope="row">${i}</th>${lista.map(a => `<td>${marcador(temInfra(a, i), i)}</td>`).join('')}</tr>`; });

    $('corpo-matriz').innerHTML = html;
    document.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => Comparacao.remove(b.dataset.rm));
}

document.addEventListener('akifit:comparacao', render);
render();
