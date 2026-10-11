lucide.createIcons();

const token = new URLSearchParams(location.search).get('token') || '';
const formContent = document.getElementById('form-content');
const feedbackScreen = document.getElementById('feedback-screen');
const icon = document.getElementById('feedback-icon');
const titulo = document.getElementById('feedback-title');
const msg = document.getElementById('feedback-message');

function mostrar(ok, t, m) {
  formContent.classList.add('hidden');
  feedbackScreen.classList.remove('hidden');
  icon.innerHTML = ok
    ? '<i data-lucide="check-circle" style="color: #A3E635; width: 64px; height: 64px;"></i>'
    : '<i data-lucide="x-circle" style="color: #EF4444; width: 64px; height: 64px;"></i>';
  titulo.textContent = t; msg.textContent = m;
  lucide.createIcons();
}

if (!Auth.tokenValido(token)) {
  mostrar(false, 'Link inválido ou expirado', 'Solicite um novo link de recuperação de senha.');
  document.getElementById('btn-acao').href = 'index.html';
  document.getElementById('btn-acao').textContent = 'Solicitar novo link';
}

document.getElementById('redefinirForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const s = document.getElementById('senha'), c = document.getElementById('confirma');
  s.classList.toggle('invalid-input', s.value.length < 8);
  c.classList.toggle('invalid-input', c.value !== s.value);
  if (s.value.length < 8 || c.value !== s.value) return;
  const ok = await Auth.redefinirSenha(token, s.value);
  ok ? mostrar(true, 'Senha redefinida!', 'Agora você já pode entrar com a nova senha.')
     : mostrar(false, 'Não foi possível redefinir', 'O link é inválido ou expirou.');
});
