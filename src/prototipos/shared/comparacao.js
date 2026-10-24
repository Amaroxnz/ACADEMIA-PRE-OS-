(function () {
  const KEY = 'akifit_comparacao';
  const MAX = 3;
  const MIN = 2;

  const src = (document.currentScript && document.currentScript.src) || '';
  const ROOT = src.replace(/shared\/comparacao\.js.*$/, '');
  const URL_COMPARAR = ROOT + 'semana-07/rf06-comparar/comparar.html';

  const ler = () => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY));
      return Array.isArray(v) ? v.map(Number).filter(Number.isInteger) : [];
    } catch (e) { return []; }
  };
  const gravar = (ids) => {
    try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch (e) {}
    notificar();
  };
  const nomeDe = (id) => {
    const a = window.AcademiasData && window.AcademiasData.porId(id);
    return a ? a.nome : 'Academia ' + id;
  };

  function notificar() {
    document.dispatchEvent(new CustomEvent('akifit:comparacao', { detail: ler() }));
    if (window.Auth && Auth._nav) Auth.renderNav(Auth._nav[0], Auth._nav[1]);
    desenharBarra();
  }

  const Comparacao = {
    MAX, MIN, URL: URL_COMPARAR,
    ids: ler,
    tem: (id) => ler().includes(Number(id)),
    count: () => ler().length,

    add(id) {
      id = Number(id);
      const ids = ler();
      if (ids.includes(id)) return { ok: true };
      if (ids.length >= MAX) {
        const msg = `Você pode comparar no máximo ${MAX} academias. Remova uma para adicionar outra.`;
        toast(msg);
        return { ok: false, erro: msg };
      }
      ids.push(id);
      gravar(ids);
      return { ok: true };
    },
    remove(id) { gravar(ler().filter(x => x !== Number(id))); },
    toggle(id) { return this.tem(id) ? (this.remove(id), { ok: true, removida: true }) : this.add(id); },
    limpar() { gravar([]); },
    ir() { window.location.href = URL_COMPARAR; },

    ligarBotao(btn, id) {
      let visto = false;
      const atualizar = () => {
        if (btn.isConnected) visto = true;
        else if (visto) { document.removeEventListener('akifit:comparacao', atualizar); return; }
        const on = this.tem(id);
        btn.classList.toggle('ativo', on);
        btn.setAttribute('aria-pressed', String(on));
        btn.textContent = on ? '✓ Na comparação' : '+ Adicionar à Comparação';
      };
      btn.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        this.toggle(id);
      });
      document.addEventListener('akifit:comparacao', atualizar);
      atualizar();
    },
  };

  const css = `
  .btn-comparar{display:inline-block;width:100%;margin-top:10px;padding:10px 16px;background:transparent;color:#d1d5db;border:2px dashed #4b5563;border-radius:8px;font-weight:bold;font-size:14px;cursor:pointer;transition:.2s;font-family:inherit}
  .btn-comparar:hover{border-color:#a3e635;color:#a3e635}
  .btn-comparar.ativo{background:rgba(163,230,53,.12);color:#a3e635;border:2px solid #a3e635}
  .btn-comparar-hero{width:auto;margin:14px 0 0;align-self:flex-start;background:rgba(11,15,14,.7)}
  .nav-links .nav-count{background:#a3e635;color:#0b0f0e;border-radius:10px;padding:0 7px;font-size:12px;font-weight:bold;margin-left:4px}
  #cmp-bar{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:900;display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:center;max-width:calc(100% - 24px);background:#121816;border:1px solid #a3e635;border-radius:14px;padding:10px 14px;box-shadow:0 8px 30px rgba(0,0,0,.6);color:#fff;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif}
  #cmp-bar.hidden{display:none}
  #cmp-bar .cmp-chips{display:flex;gap:8px;flex-wrap:wrap}
  #cmp-bar .cmp-chip{display:inline-flex;align-items:center;gap:6px;background:rgba(163,230,53,.12);color:#a3e635;border-radius:20px;padding:4px 6px 4px 12px;font-size:13px;font-weight:bold}
  #cmp-bar .cmp-chip button{background:none;border:none;color:#a3e635;cursor:pointer;font-size:16px;line-height:1;padding:0 4px}
  #cmp-bar .cmp-info{font-size:13px;color:#9ca3af}
  #cmp-bar .cmp-go{background:#a3e635;color:#0b0f0e;border:none;border-radius:8px;padding:9px 18px;font-weight:bold;cursor:pointer;font-family:inherit}
  #cmp-bar .cmp-go:disabled{opacity:.4;cursor:not-allowed}
  #cmp-bar .cmp-clear{background:none;border:none;color:#9ca3af;cursor:pointer;text-decoration:underline;font-size:13px;font-family:inherit}
  #cmp-toast{position:fixed;left:50%;top:20px;transform:translateX(-50%);z-index:1000;background:#7f1d1d;color:#fff;padding:12px 20px;border-radius:10px;font-size:14px;box-shadow:0 8px 30px rgba(0,0,0,.6);max-width:calc(100% - 24px);font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  let toastTimer;
  function toast(msg) {
    let t = document.getElementById('cmp-toast');
    if (!t) { t = document.createElement('div'); t.id = 'cmp-toast'; t.setAttribute('role', 'alert'); document.body.appendChild(t); }
    t.textContent = msg; t.style.display = 'block';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.style.display = 'none'; }, 3500);
  }

  function desenharBarra() {
    if (!document.body || document.body.hasAttribute('data-sem-barra')) return;
    let bar = document.getElementById('cmp-bar');
    const ids = ler();
    if (!bar) { bar = document.createElement('div'); bar.id = 'cmp-bar'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Comparação de academias'); document.body.appendChild(bar); }
    if (ids.length === 0) { bar.classList.add('hidden'); return; }
    bar.classList.remove('hidden');
    const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    bar.innerHTML = `
      <span class="cmp-info">${ids.length}/${MAX} para comparar</span>
      <div class="cmp-chips">${ids.map(i => `<span class="cmp-chip">${esc(nomeDe(i))}<button type="button" data-rm="${i}" aria-label="Remover ${esc(nomeDe(i))} da comparação">×</button></span>`).join('')}</div>
      <button type="button" class="cmp-go" ${ids.length < MIN ? 'disabled title="Selecione pelo menos 2 academias"' : ''}>Comparar${ids.length < MIN ? ' (mín. 2)' : ''}</button>
      <button type="button" class="cmp-clear">Limpar</button>`;
    bar.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => Comparacao.remove(b.dataset.rm));
    bar.querySelector('.cmp-go').onclick = () => { if (ler().length >= MIN) Comparacao.ir(); };
    bar.querySelector('.cmp-clear').onclick = () => Comparacao.limpar();
  }

  Comparacao.toast = toast;
  window.Comparacao = Comparacao;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', desenharBarra);
  else desenharBarra();
})();
