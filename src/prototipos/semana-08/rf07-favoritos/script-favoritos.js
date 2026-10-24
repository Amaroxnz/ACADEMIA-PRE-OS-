(function () {
    if (!Auth.requireAuth()) return;
    Auth.renderNav('navLinks', 'favoritos');

    const URL_DETALHES = '../../semana-06/rf05-detalhes-da-academia/RF-05.html?id=';
    const ESTADOS = ['carregando', 'erro', 'vazio', 'conteudo'];

    const $ = (id) => document.getElementById(id);

    const criar = (tag, classe, texto) => {
        const no = document.createElement(tag);
        if (classe) no.className = classe;
        if (texto !== undefined) no.textContent = texto;
        return no;
    };

    const mostrar = (nome) => {
        ESTADOS.forEach((estado) => $(estado).classList.toggle('hidden', estado !== nome));
        $('principal').setAttribute('aria-busy', String(nome === 'carregando'));
    };

    const textoNota = (nota) => (nota === null ? 'Sem avaliações' : '★ ' + nota.toFixed(1).replace('.', ',') + ' de 5');

    const atualizarContagem = () => {
        const total = $('grade').children.length;
        $('contagem').textContent = total === 1 ? '1 academia salva' : total + ' academias salvas';
        return total;
    };

    const focoEstavaNoCartao = (cartao) => cartao.contains(document.activeElement) || document.activeElement === document.body;

    const removerCartao = (cartao) => {
        const grade = $('grade');
        const posicao = Array.prototype.indexOf.call(grade.children, cartao);
        const devolverFoco = focoEstavaNoCartao(cartao);
        cartao.remove();
        const total = atualizarContagem();
        if (total === 0) {
            mostrar('vazio');
            $('contagem').textContent = Favoritos.MSG.vazia;
            if (devolverFoco) $('vazio-titulo').focus();
            return;
        }
        if (devolverFoco) {
            const proximo = grade.children[Math.min(posicao, total - 1)];
            const alvo = proximo && proximo.querySelector('button');
            if (alvo) alvo.focus();
        }
    };

    const criarCartao = (item) => {
        const cartao = criar('li', 'cartao com-fav' + (item.ativa ? '' : ' indisponivel'));
        cartao.dataset.id = String(item.id);

        const concluir = (resultado) => {
            if (!resultado || !resultado.ok) return;
            if (Favoritos.tem(item.id) || Favoritos.pendente(item.id)) return;
            removerCartao(cartao);
        };

        if (item.capa) {
            const imagem = criar('img', 'cartao-img');
            imagem.alt = '';
            imagem.loading = 'lazy';
            imagem.decoding = 'async';
            imagem.src = item.capa;
            cartao.appendChild(imagem);
        } else {
            const vazio = criar('div', 'cartao-img sem-capa', '🏋️');
            vazio.setAttribute('aria-hidden', 'true');
            cartao.appendChild(vazio);
        }

        const botaoFavorito = Favoritos.criarBotao(item.id, item.nome, concluir);
        botaoFavorito.classList.add('fav-card');
        cartao.appendChild(botaoFavorito);

        const corpo = criar('div', 'cartao-corpo');
        if (!item.ativa) corpo.appendChild(criar('span', 'selo-indisponivel', 'Indisponível'));
        corpo.appendChild(criar('h2', 'cartao-nome', item.nome));
        if (item.bairro) corpo.appendChild(criar('p', 'cartao-info', '📍 ' + item.bairro));
        corpo.appendChild(criar('p', 'cartao-info nota', textoNota(item.nota)));

        if (item.ativa) {
            const acoes = criar('div', 'cartao-acoes');
            const detalhes = criar('a', 'btn-detalhes', 'Ver Detalhes');
            detalhes.href = URL_DETALHES + item.id;
            const comparar = criar('button', 'btn-comparar', '+ Adicionar à Comparação');
            comparar.type = 'button';
            Comparacao.ligarBotao(comparar, item.id);
            acoes.append(detalhes, comparar);
            corpo.appendChild(acoes);
        } else {
            corpo.appendChild(criar('p', 'aviso-indisponivel', Favoritos.MSG.indisponivel));
            const remover = criar('button', 'btn-remover-fav', 'Remover dos favoritos');
            remover.type = 'button';
            remover.addEventListener('click', () => Favoritos.alternar(item.id).then(concluir));
            corpo.appendChild(remover);
        }

        cartao.appendChild(corpo);
        return cartao;
    };

    const desenhar = (itens) => {
        $('grade').replaceChildren(...itens.map(criarCartao));
        if (itens.length === 0) {
            $('contagem').textContent = Favoritos.MSG.vazia;
            mostrar('vazio');
            return;
        }
        atualizarContagem();
        mostrar('conteudo');
    };

    const carregar = async () => {
        mostrar('carregando');
        try {
            desenhar(await Favoritos.listar());
        } catch (erro) {
            $('erro-texto').textContent = erro && erro.status === 401 ? Favoritos.MSG.sessao : Favoritos.MSG.falha;
            $('contagem').textContent = '';
            mostrar('erro');
        }
    };

    $('vazio-titulo').textContent = Favoritos.MSG.vazia;
    $('btn-explorar').href = Auth.URLS.inicio;
    $('btn-voltar').addEventListener('click', () => {
        window.location.href = Auth.URLS.inicio;
    });
    $('btn-tentar').addEventListener('click', carregar);

    carregar();
})();
