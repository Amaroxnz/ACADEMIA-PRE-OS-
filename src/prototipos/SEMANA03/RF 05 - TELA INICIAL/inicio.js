const academias = [
    {
        id: 1,
        nome: "Smart Fit - Guará II",
        bairro: "Guará II",
        distancia: "1.2 km",
        preco: 109.90,
        imagem: "https://placehold.co/400x200/222c26/a3e635?text=Smart+Fit",
        modalidades: ["Musculação"],
        avaliacao: 4.5
    },
    {
        id: 2,
        nome: "Bluefit - Águas Claras",
        bairro: "Águas Claras",
        distancia: "4.5 km",
        preco: 119.90,
        imagem: "https://placehold.co/400x200/222c26/a3e635?text=Bluefit",
        modalidades: ["Musculação", "Lutas"],
        avaliacao: 4.7
    },
    {
        id: 3,
        nome: "Crossfit Selva",
        bairro: "Asa Sul",
        distancia: "8.0 km",
        preco: 250.00,
        imagem: "https://placehold.co/400x200/222c26/a3e635?text=Crossfit",
        modalidades: ["Crossfit"],
        avaliacao: 4.9
    },
    {
        id: 4,
        nome: "Academia Corpo & Água",
        bairro: "Guará I",
        distancia: "2.1 km",
        preco: 79.90,
        imagem: "https://placehold.co/400x200/222c26/a3e635?text=Corpo+%26+Agua",
        modalidades: ["Musculação", "Natação"],
        avaliacao: 4.2
    }
];

const listaAcademias = document.getElementById('listaAcademias');
const inputBusca = document.getElementById('inputBusca');
const btnBuscar = document.getElementById('btnBuscar');
const filtroPreco = document.getElementById('filtroPreco');
const filtroModalidade = document.getElementById('filtroModalidade');
const mensagemVazia = document.getElementById('mensagemVazia');
const tituloResultados = document.getElementById('tituloResultados');

function renderizarAcademias(lista) {
    listaAcademias.innerHTML = '';

    if (lista.length === 0) {
        mensagemVazia.classList.remove('hidden');
        tituloResultados.classList.add('hidden');
        return;
    }

    mensagemVazia.classList.add('hidden');
    tituloResultados.classList.remove('hidden');

    lista.forEach(academia => {
        const card = document.createElement('div');
        card.className = 'card';

        const tagsHTML = academia.modalidades.map(mod => `<span class="tag">${mod}</span>`).join('');

        card.innerHTML = `
            <img src="${academia.imagem}" alt="${academia.nome}" class="card-img">
            <div class="card-content">
                <h3 class="card-title">${academia.nome}</h3>
                <p class="card-info">📍 ${academia.bairro} (${academia.distancia})</p>
                <p class="card-info">⭐ ${academia.avaliacao} / 5.0</p>
                <div class="tags">
                    ${tagsHTML}
                </div>
                <p class="card-price">R$ ${academia.preco.toFixed(2).replace('.', ',')}<span style="font-size:12px; color:#9ca3af; font-weight:normal;">/mês</span></p>
                <a href="#" class="btn-outline">Ver Detalhes</a>
            </div>
        `;

        listaAcademias.appendChild(card);
    });
}

function filtrarAcademias() {
    const termoBusca = inputBusca.value.toLowerCase();
    const precoSelecionado = filtroPreco.value;
    const modalidadeSelecionada = filtroModalidade.value;

    const resultados = academias.filter(academia => {
        const atendeBusca = academia.nome.toLowerCase().includes(termoBusca) || academia.bairro.toLowerCase().includes(termoBusca);

        let atendePreco = true;
        if (precoSelecionado === 'barato') atendePreco = academia.preco <= 80;
        else if (precoSelecionado === 'medio') atendePreco = academia.preco > 80 && academia.preco <= 120;
        else if (precoSelecionado === 'caro') atendePreco = academia.preco > 120;

        let atendeModalidade = true;
        if (modalidadeSelecionada !== 'todos') {
            atendeModalidade = academia.modalidades.includes(modalidadeSelecionada);
        }

        return atendeBusca && atendePreco && atendeModalidade;
    });

    tituloResultados.textContent = termoBusca || precoSelecionado !== 'todos' || modalidadeSelecionada !== 'todos' ? "Resultados da Busca" : "Academias em destaque";

    renderizarAcademias(resultados);
}

btnBuscar.addEventListener('click', filtrarAcademias);
inputBusca.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') filtrarAcademias();
});
filtroPreco.addEventListener('change', filtrarAcademias);
filtroModalidade.addEventListener('change', filtrarAcademias);

renderizarAcademias(academias);