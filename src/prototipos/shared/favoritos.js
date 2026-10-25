(function () {
  const CHAVE = 'akifit_favoritos_v2';
  const CHAVE_LEGADA = 'akifit_favoritos';
  const TEMPO_LIMITE = 8000;
  const ID_MAXIMO = 2147483647;

  const src = (document.currentScript && document.currentScript.src) || '';
  const RAIZ = src.replace(/shared\/favoritos\.js.*$/, '');
  const URL_FAVORITOS = RAIZ + 'semana-08/rf07-favoritos/RF007-Favoritos.html';

  const MSG = Object.freeze({
    adicionada: 'Academia adicionada aos Favoritos!',
    removida: 'Academia removida dos Favoritos.',
    visitante: 'Faça login para salvar esta academia nos seus favoritos.',
    vazia: 'Você ainda não possui academias favoritadas.',
    falha: 'Não foi possível atualizar seus favoritos. Tente novamente.',
    sessao: 'Sua sessão expirou. Faça login novamente para continuar.',
    indisponivel: 'Esta academia não está mais disponível.',
  });

  const base = (() => {
    const bruto = String((window.AKIFIT_CONFIG && window.AKIFIT_CONFIG.apiBase) || '').trim().replace(/\/+$/, '');
    return /^https?:\/\/[^\s]+$/i.test(bruto) ? bruto : '';
  })();

  const validarId = (valor) => {
    const texto = String(valor).trim();
    if (!/^[1-9]\d{0,9}$/.test(texto)) return null;
    const n = Number(texto);
    return n <= ID_MAXIMO ? n : null;
  };

  const urlSegura = (url) => (typeof url === 'string' && /^(https?:\/\/|data:image\/)/i.test(url) ? url : '');
  
  const normalizarHorarios = (lista) => {
    if (!Array.isArray(lista)) return [];
    return lista
      .filter((h) => h && Number.isInteger(h.dia) && /^\d{2}:\d{2}$/.test(h.abre) && /^\d{2}:\d{2}$/.test(h.fecha))
      .map((h) => ({ dia: h.dia, abre: h.abre, fecha: h.fecha }));
  };
  class ErroFavoritos extends Error {
    constructor(status) {
      super('favoritos');
      this.status = status;
    }
  }

  const usuarioAtual = () => {
    const u = window.Auth && Auth.getUser();
    return u && typeof u.email === 'string' && u.email ? u : null;
  };

  const mediaNotas = (academia) => {
    const avs = academia && Array.isArray(academia.avaliacoes) ? academia.avaliacoes : [];
    if (!avs.length) return null;
    return Math.round((avs.reduce((soma, a) => soma + Number(a.nota || 0), 0) / avs.length) * 10) / 10;
  };

  const local = {
    chave: (email) => 'u:' + email,
    lerTudo() {
      try {
        const bruto = JSON.parse(localStorage.getItem(CHAVE));
        return bruto && typeof bruto === 'object' && !Array.isArray(bruto) ? bruto : {};
      } catch (e) {
        return {};
      }
    },
    registros(email) {
      const lista = this.lerTudo()[this.chave(email)];
      if (!Array.isArray(lista)) return [];
      const vistos = new Set();
      return lista.reduce((acc, item) => {
        const id = item ? validarId(item.id) : null;
        if (id !== null && !vistos.has(id)) {
          vistos.add(id);
          acc.push({ id, criado_em: Number(item.criado_em) || 0 });
        }
        return acc;
      }, []);
    },
    salvar(email, registros) {
      const tudo = this.lerTudo();
      tudo[this.chave(email)] = registros;
      try {
        localStorage.setItem(CHAVE, JSON.stringify(tudo));
      } catch (e) {
        throw new ErroFavoritos(0);
      }
    },
    exigirUsuario() {
      const u = usuarioAtual();
      if (!u) throw new ErroFavoritos(401);
      return u;
    },
    async listar() {
      const u = this.exigirUsuario();
      return this.registros(u.email)
        .map(({ id, criado_em }) => {
          const academia = window.AcademiasData ? AcademiasData.porId(id) : null;
          return {
            id,
            nome: academia ? academia.nome : 'Academia indisponível',
            bairro: academia && academia.endereco ? academia.endereco.bairro : '',
            nota: mediaNotas(academia),
            capa: academia ? urlSegura(academia.capa) : '',
            ativa: !!(window.AcademiasData && AcademiasData.ativa(id)),
            criado_em,
          };
        })
        .sort((a, b) => b.criado_em - a.criado_em || b.id - a.id);
    },
    async adicionar(id) {
      const u = this.exigirUsuario();
      const registros = this.registros(u.email);
      if (registros.some((r) => r.id === id)) return;
      if (!window.AcademiasData || !AcademiasData.ativa(id)) throw new ErroFavoritos(404);
      registros.push({ id, criado_em: Date.now() });
      this.salvar(u.email, registros);
    },
    async remover(id) {
      const u = this.exigirUsuario();
      const registros = this.registros(u.email);
      const restantes = registros.filter((r) => r.id !== id);
      if (restantes.length !== registros.length) this.salvar(u.email, restantes);
    },
    idsIniciais() {
      const u = usuarioAtual();
      return u ? this.registros(u.email).map((r) => r.id) : [];
    },
  };

  const remoto = {
    async chamar(metodo, caminho, corpo) {
      const controle = new AbortController();
      const timer = setTimeout(() => controle.abort(), TEMPO_LIMITE);
      const cabecalhos = { Accept: 'application/json', 'X-AKIFIT-CSRF': '1' };
      if (corpo !== undefined) cabecalhos['Content-Type'] = 'application/json';
      let resposta;
      try {
        resposta = await fetch(base + caminho, {
          method: metodo,
          headers: cabecalhos,
          body: corpo === undefined ? undefined : JSON.stringify(corpo),
          credentials: 'include',
          cache: 'no-store',
          signal: controle.signal,
        });
      } catch (e) {
        throw new ErroFavoritos(0);
      } finally {
        clearTimeout(timer);
      }
      if (!resposta.ok) throw new ErroFavoritos(resposta.status);
      if (resposta.status === 204) return null;
      try {
        return await resposta.json();
      } catch (e) {
        throw new ErroFavoritos(502);
      }
    },
    async listar() {
      const dados = await this.chamar('GET', '/api/favoritos');
      const itens = dados && Array.isArray(dados.favoritos) ? dados.favoritos : [];
      return itens
        .map((i) => {
          const id = i ? validarId(i.id) : null;
          if (id === null) return null;
          return {
            id,
            nome: typeof i.nome === 'string' ? i.nome : '',
            bairro: typeof i.bairro === 'string' ? i.bairro : '',
            nota: typeof i.nota === 'number' ? i.nota : null,
            capa: urlSegura(i.capa),
            ativa: i.ativa === true,
            criado_em: Date.parse(i.criado_em) || 0,
          };
        })
        .filter(Boolean);
    },
    async adicionar(id) {
      await this.chamar('POST', '/api/favoritos', { academia_id: id });
    },
    async remover(id) {
      await this.chamar('DELETE', '/api/favoritos/' + id);
    },
  };

  const adaptador = base ? remoto : local;

  const confirmados = new Set();
  const visuais = new Set();
  const fila = new Map();
  let temporizadorRedirecionamento = null;

  const avisar = (id) => {
    document.dispatchEvent(new CustomEvent('akifit:favoritos', { detail: { id: id === undefined ? null : id, ids: Array.from(visuais) } }));
  };

  const substituirEstado = (ids) => {
    confirmados.clear();
    visuais.clear();
    ids.forEach((id) => {
      confirmados.add(id);
      visuais.add(id);
    });
    avisar();
  };

  const css = `
  .btn-fav{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;padding:0;background:rgba(11,15,14,.82);border:1px solid rgba(255,255,255,.22);border-radius:50%;color:#d1d5db;cursor:pointer;transition:transform .15s,border-color .2s,color .2s}
  .btn-fav svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:2;stroke-linejoin:round;transition:fill .15s}
  .btn-fav:hover{border-color:#a3e635;color:#a3e635}
  .btn-fav[aria-pressed="true"]{border-color:#a3e635;color:#a3e635}
  .btn-fav[aria-pressed="true"] svg{fill:#a3e635}
  .btn-fav:active{transform:scale(1.15)}
  .btn-fav:focus-visible,.btn-favorito:focus-visible{outline:3px solid #bef264;outline-offset:3px}
  .com-fav{position:relative}
  .fav-card{position:absolute;top:10px;right:10px;z-index:2}
  #fav-toasts{position:fixed;left:50%;top:16px;transform:translateX(-50%);z-index:1100;display:flex;flex-direction:column;align-items:center;gap:8px;width:max-content;max-width:calc(100% - 24px);pointer-events:none}
  .fav-toast{display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:center;padding:12px 18px;border-radius:10px;border:1px solid #a3e635;background:#121816;color:#fff;font:14px/1.4 'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.6);pointer-events:auto;overflow-wrap:anywhere}
  .fav-toast-erro{background:#7f1d1d;border-color:#fecaca}
  .fav-toast-aviso{border-color:#fde68a}
  .fav-toast button{background:#a3e635;color:#0b0f0e;border:none;border-radius:6px;padding:6px 12px;font:inherit;font-weight:bold;cursor:pointer}
  .fav-toast button:focus-visible{outline:3px solid #fff;outline-offset:2px}
  `;
  const estilo = document.createElement('style');
  estilo.textContent = css;
  document.head.appendChild(estilo);

  let regiao = null;
  const obterRegiao = () => {
    if (!regiao || !regiao.isConnected) {
      regiao = document.createElement('div');
      regiao.id = 'fav-toasts';
      regiao.setAttribute('aria-live', 'polite');
      document.body.appendChild(regiao);
    }
    return regiao;
  };

  let temporizadorAviso = null;
  const mensagem = (texto, tipo, acao, duracao) => {
    const el = document.createElement('div');
    el.className = 'fav-toast fav-toast-' + tipo;
    el.setAttribute('role', tipo === 'erro' ? 'alert' : 'status');
    const span = document.createElement('span');
    span.textContent = texto;
    el.appendChild(span);
    if (acao) {
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.textContent = acao.rotulo;
      botao.addEventListener('click', acao.executar);
      el.appendChild(botao);
    }
    obterRegiao().replaceChildren(el);
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => el.remove(), duracao || 3500);
  };

  const irParaLogin = () => {
    if (window.Auth) Auth.go('login');
  };

  const agendarLogin = (atraso, sair) => {
    if (temporizadorRedirecionamento) return;
    temporizadorRedirecionamento = setTimeout(() => {
      temporizadorRedirecionamento = null;
      if (sair && window.Auth) Auth.logout();
      else irParaLogin();
    }, atraso);
  };

  const avisarVisitante = () => {
    mensagem(MSG.visitante, 'aviso', { rotulo: 'Fazer login', executar: irParaLogin }, 3500);
    agendarLogin(3500, false);
  };

  const sessaoExpirada = () => {
    mensagem(MSG.sessao, 'erro', { rotulo: 'Fazer login', executar: () => (window.Auth ? Auth.logout() : irParaLogin()) }, 2600);
    agendarLogin(2600, true);
  };

  const executar = async (id, alvo) => {
    if (confirmados.has(id) === alvo) return { ok: true };
    try {
      if (alvo) await adaptador.adicionar(id);
      else await adaptador.remover(id);
      if (alvo) confirmados.add(id);
      else confirmados.delete(id);
      return { ok: true };
    } catch (e) {
      return { ok: false, status: e instanceof ErroFavoritos ? e.status : 0 };
    }
  };

  const finalizar = (id, resultado) => {
    const ativo = confirmados.has(id);
    if (visuais.has(id) !== ativo) {
      if (ativo) visuais.add(id);
      else visuais.delete(id);
      avisar(id);
    }
    if (resultado.ok) {
      mensagem(ativo ? MSG.adicionada : MSG.removida, 'sucesso');
      return { ok: true, ativo };
    }
    if (resultado.status === 401) {
      sessaoExpirada();
      return { ok: false, ativo, erro: 'sessao' };
    }
    if (resultado.status === 404) {
      mensagem(MSG.indisponivel, 'erro');
      return { ok: false, ativo, erro: 'indisponivel' };
    }
    mensagem(MSG.falha, 'erro');
    return { ok: false, ativo, erro: 'falha' };
  };

  const enfileirar = (id, alvo) => {
    const anterior = fila.get(id) || Promise.resolve();
    const atual = anterior.then(() => executar(id, alvo));
    fila.set(id, atual);
    return atual.then((resultado) => {
      if (fila.get(id) !== atual) return resultado;
      fila.delete(id);
      return finalizar(id, resultado);
    });
  };

  const alternar = (id) => {
    const n = validarId(id);
    if (n === null) return Promise.resolve({ ok: false, erro: 'id' });
    if (!usuarioAtual()) {
      avisarVisitante();
      return Promise.resolve({ ok: false, erro: 'visitante' });
    }
    const alvo = !visuais.has(n);
    if (alvo) visuais.add(n);
    else visuais.delete(n);
    avisar(n);
    return enfileirar(n, alvo);
  };

  const listar = async () => {
    if (!usuarioAtual()) {
      sessaoExpirada();
      throw new ErroFavoritos(401);
    }
    let itens;
    try {
      itens = await adaptador.listar();
    } catch (e) {
      const status = e instanceof ErroFavoritos ? e.status : 0;
      if (status === 401) sessaoExpirada();
      throw new ErroFavoritos(status);
    }
    if (fila.size === 0) substituirEstado(itens.map((i) => i.id));
    return itens;
  };

  const CORACAO = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';

  const rotulo = (ativo, nome) => {
    const texto = ativo ? 'Remover dos favoritos' : 'Favoritar';
    return nome ? texto + ': ' + nome : texto;
  };

  const ligarBotao = (botao, id, nome, aoConcluir) => {
    const n = validarId(id);
    if (!botao || n === null) return botao;
    if (botao.tagName === 'BUTTON') botao.type = 'button';
    let visto = false;
    const atualizar = () => {
      if (botao.isConnected) visto = true;
      else if (visto) {
        document.removeEventListener('akifit:favoritos', atualizar);
        return;
      }
      const ativo = visuais.has(n);
      const texto = rotulo(ativo, nome);
      botao.setAttribute('aria-pressed', String(ativo));
      botao.setAttribute('aria-label', texto);
      botao.title = texto;
    };
    botao.addEventListener('click', (evento) => {
      evento.preventDefault();
      evento.stopPropagation();
      alternar(n).then((resultado) => {
        if (typeof aoConcluir === 'function') aoConcluir(resultado);
      });
    });
    document.addEventListener('akifit:favoritos', atualizar);
    atualizar();
    return botao;
  };

  const criarBotao = (id, nome, aoConcluir) => {
    const botao = document.createElement('button');
    botao.className = 'btn-fav';
    botao.innerHTML = CORACAO;
    return ligarBotao(botao, id, nome, aoConcluir);
  };

  const iniciar = () => {
    try {
      localStorage.removeItem(CHAVE_LEGADA);
    } catch (e) { }
    if (!usuarioAtual()) return Promise.resolve();
    if (!base) {
      substituirEstado(local.idsIniciais());
      return Promise.resolve();
    }
    return listar().catch(() => { });
  };

  window.Favoritos = Object.freeze({
    MSG,
    URL: URL_FAVORITOS,
    tem: (id) => visuais.has(Number(id)),
    ids: () => Array.from(visuais),
    count: () => visuais.size,
    pendente: (id) => fila.has(Number(id)),
    alternar,
    listar,
    ligarBotao,
    criarBotao,
    mensagem,
    pronto: iniciar(),
  });
})();
