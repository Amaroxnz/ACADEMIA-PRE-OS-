lucide.createIcons();

const form = document.getElementById('cadastroForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const termosInput = document.getElementById('termos');

const formContent = document.getElementById('form-content');
const feedbackScreen = document.getElementById('feedback-screen');
const feedbackIcon = document.getElementById('feedback-icon');
const feedbackTitle = document.getElementById('feedback-title');
const feedbackMessage = document.getElementById('feedback-message');
const btnVoltar = document.getElementById('btn-voltar');

emailInput.addEventListener('input', function() {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (this.value.length > 0 && !emailPattern.test(this.value)) {
    this.classList.add('invalid-input');
  } else {
    this.classList.remove('invalid-input');
  }
});

function validarSenha(input) {
  if (input.value.length > 0 && input.value.length < 8) {
    input.classList.add('invalid-input');
  } else {
    input.classList.remove('invalid-input');
  }
}

passwordInput.addEventListener('input', function() {
  validarSenha(this);
});

confirmPasswordInput.addEventListener('input', function() {
  validarSenha(this);
  if (this.value !== passwordInput.value && this.value.length > 0) {
    this.classList.add('invalid-input');
  }
});

termosInput.addEventListener('change', function() {
  if (this.checked) {
    this.parentElement.classList.remove('invalid-checkbox');
  }
});

let irParaLogin = false;
let emailCadastrado = '';

function showFeedback(sucesso, msgErro) {
  formContent.classList.add('hidden');
  feedbackScreen.classList.remove('hidden');

  if (sucesso) {
    feedbackIcon.innerHTML = '<i data-lucide="check-circle" style="color: #A3E635; width: 64px; height: 64px;"></i>';
    feedbackTitle.textContent = 'Cadastro realizado!';
    feedbackMessage.textContent = 'Sua conta foi criada com sucesso. Faça login para continuar.';
    btnVoltar.textContent = 'Fazer login';
    irParaLogin = true;
  } else {
    btnVoltar.textContent = 'Voltar';
    irParaLogin = false;
    feedbackIcon.innerHTML = '<i data-lucide="x-circle" style="color: #EF4444; width: 64px; height: 64px;"></i>';
    feedbackTitle.textContent = 'Erro no cadastro';
    feedbackMessage.textContent = msgErro || 'Ocorreu um erro ao tentar criar sua conta. Verifique os dados e tente novamente.';
  }
  lucide.createIcons();
}

btnVoltar.addEventListener('click', () => {
  if (irParaLogin) {
    window.location.href = Auth.URLS.login + (emailCadastrado ? '?email=' + encodeURIComponent(emailCadastrado) : '');
    return;
  }
  feedbackScreen.classList.add('hidden');
  formContent.classList.remove('hidden');
});

form.addEventListener('submit', async function(event) {
  event.preventDefault();

  let hasError = false;

  if (passwordInput.value.length < 8) {
    passwordInput.classList.add('invalid-input');
    hasError = true;
  }

  if (passwordInput.value !== confirmPasswordInput.value) {
    confirmPasswordInput.classList.add('invalid-input');
    hasError = true;
  }

  if (!termosInput.checked) {
    termosInput.parentElement.classList.add('invalid-checkbox');
    hasError = true;
  }

  const invalidInputs = document.querySelectorAll('.invalid-input');
  if (invalidInputs.length > 0 || hasError) {
    showFeedback(false);
    return;
  }

  try {
    const nome = document.getElementById('name').value;
    const r = await Auth.register({ nome, email: emailInput.value, senha: passwordInput.value });
    if (!r.ok) { showFeedback(false, r.erro); return; }
    emailCadastrado = r.user.email;
    showFeedback(true);
    form.reset();
  } catch (error) {
    showFeedback(false);
  }
});

function setupTogglePassword(toggleId, inputId) {
  const toggleBtn = document.getElementById(toggleId);
  const input = document.getElementById(inputId);

  toggleBtn.addEventListener('click', function() {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    toggleBtn.innerHTML = `<i data-lucide="${isPassword ? 'eye' : 'eye-off'}"></i>`;
    lucide.createIcons();
  });
}

setupTogglePassword('togglePassword', 'password');
setupTogglePassword('toggleConfirmPassword', 'confirm-password');

// Cadastro simulado via Google (fluxo apenas front-end, sem OAuth real)
const btnGoogle = document.getElementById('btn-google');
const btnGoogleText = document.getElementById('btn-google-text');

btnGoogle.addEventListener('click', async function () {
  btnGoogle.disabled = true;
  btnGoogleText.textContent = 'Conectando com o Google...';

  try {
    await Auth.loginGoogle(); // cria a conta (se não existir) e inicia a sessão
    showFeedback(true);
    feedbackMessage.textContent = 'Conta criada com o Google. Redirecionando...';
    btnVoltar.classList.add('hidden');
    setTimeout(() => Auth.go('inicio'), 1200);
  } catch (error) {
    showFeedback(false);
  } finally {
    btnGoogle.disabled = false;
    btnGoogleText.textContent = 'Cadastrar com Google (OAuth 2.0)';
  }
});
