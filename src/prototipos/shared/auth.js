/* AKIFIT - módulo compartilhado de autenticação (front-end, localStorage).
   Em produção, troque estas funções por chamadas à API/back-end. */
(function () {
  const KEY_USERS = 'akifit_usuarios';
  const KEY_SESSION = 'akifit_sessao';
  const KEY_RESET = 'akifit_reset_tokens';

  // Raiz de /prototipos/ calculada a partir do próprio caminho deste script
  const src = (document.currentScript && document.currentScript.src) || '';
  const ROOT = src.replace(/shared\/auth\.js.*$/, '');

  const URLS = {
    login: ROOT + 'SEMANA02/RF02%20-%20Login/index.html',
    cadastro: ROOT + 'SEMANA-01/RF01%20-%20Cadastro/index.html',
    recuperar: ROOT + 'SEMANA02/RF02%20-%20Login/RF03%20-%20Rec.%20Senha/index.html',
    redefinir: ROOT + 'SEMANA02/RF02%20-%20Login/RF03%20-%20Rec.%20Senha/redefinir.html',
    inicio: ROOT + 'SEMANA03/RF%2005%20-%20TELA%20INICIAL/inicio.html',
    perfil: ROOT + 'SEMANA03/RF%2004%20-%20EDITAR%20PERFIL/index.html',
  };

  const read = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch (e) { return def; } };
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const norm = (e) => String(e || '').trim().toLowerCase();

  async function hash(txt) {
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) { return 'b64:' + btoa(unescape(encodeURIComponent(txt))); }
  }

  const users = () => read(KEY_USERS, []);
  const setSession = (u) => write(KEY_SESSION, { email: u.email, nome: u.nome, desde: Date.now() });

  const Auth = {
    URLS,
    go(nome) { window.location.href = URLS[nome]; },

    getSession() { return read(KEY_SESSION, null); },
    getUser() {
      const s = this.getSession();
      return s ? users().find(u => u.email === s.email) || null : null;
    },

    async register({ nome, email, senha, google }) {
      email = norm(email);
      const lista = users();
      if (lista.some(u => u.email === email)) return { ok: false, erro: 'Este e-mail já está cadastrado. Faça login.' };
      const u = { nome: nome.trim(), email, senhaHash: google ? null : await hash(senha), google: !!google,
                  telefone: '', cep: '', foto: '', preferencias: [], criadoEm: Date.now() };
      lista.push(u); write(KEY_USERS, lista);
      return { ok: true, user: u };
    },

    async login(email, senha) {
      email = norm(email);
      const u = users().find(x => x.email === email);
      if (!u || !u.senhaHash || u.senhaHash !== await hash(senha)) return { ok: false };
      setSession(u);
      return { ok: true, user: u };
    },

    // Simulação de login/cadastro com Google (sem OAuth real)
    async loginGoogle() {
      const email = 'usuario.google@gmail.com';
      let u = users().find(x => x.email === email);
      if (!u) u = (await this.register({ nome: 'Usuário Google', email, google: true })).user;
      setSession(u);
      return { ok: true, user: u };
    },

    logout() { localStorage.removeItem(KEY_SESSION); window.location.href = URLS.login; },

    requireAuth() {
      if (!this.getUser()) { window.location.replace(URLS.login); return false; }
      return true;
    },

    updateUser(dados) {
      const s = this.getSession(); const lista = users();
      const i = lista.findIndex(u => u.email === (s && s.email));
      if (i < 0) return false;
      const novoEmail = norm(dados.email || lista[i].email);
      if (novoEmail !== lista[i].email && lista.some(u => u.email === novoEmail)) return 'email-duplicado';
      lista[i] = { ...lista[i], ...dados, email: novoEmail };
      write(KEY_USERS, lista); setSession(lista[i]);
      return true;
    },

    // Recuperação de senha (o "e-mail" é simulado: o token fica no localStorage)
    solicitarReset(email) {
      email = norm(email);
      const u = users().find(x => x.email === email);
      if (!u) return null;
      const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
      const t = read(KEY_RESET, {});
      t[token] = { email, exp: Date.now() + 30 * 60 * 1000 };
      write(KEY_RESET, t);
      return token;
    },
    tokenValido(token) {
      const r = read(KEY_RESET, {})[token];
      return !!r && r.exp > Date.now();
    },
    async redefinirSenha(token, senha) {
      const t = read(KEY_RESET, {}); const r = t[token];
      if (!r || r.exp < Date.now()) return false;
      const lista = users(); const u = lista.find(x => x.email === r.email);
      if (!u) return false;
      u.senhaHash = await hash(senha);
      write(KEY_USERS, lista); delete t[token]; write(KEY_RESET, t);
      return true;
    },

    // Monta os links do menu conforme o estado de login
    renderNav(containerId, ativo) {
      const el = document.getElementById(containerId);
      if (!el) return;
      const u = this.getUser();
      const a = (nome, txt) => `<a href="${URLS[nome]}"${ativo === nome ? ' class="active"' : ''}>${txt}</a>`;
      el.innerHTML = a('inicio', 'Início/Busca') +
        (u ? a('perfil', 'Meu Perfil') +
             `<span class="nav-user">Olá, ${u.nome.split(' ')[0].replace(/[<>&"]/g, '')}</span>
              <button type="button" class="nav-logout" id="btnSair">Sair</button>`
           : a('login', 'Login') + a('cadastro', 'Cadastro'));
      const b = document.getElementById('btnSair');
      if (b) b.addEventListener('click', () => Auth.logout());
    },
  };

  window.Auth = Auth;
})();
