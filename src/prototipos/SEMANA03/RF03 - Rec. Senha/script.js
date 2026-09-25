lucide.createIcons();

const form = document.getElementById('recuperarForm');
const emailInput = document.getElementById('email');

const formContent = document.getElementById('form-content');
const feedbackScreen = document.getElementById('feedback-screen');
const feedbackIcon = document.getElementById('feedback-icon');
const feedbackTitle = document.getElementById('feedback-title');
const feedbackMessage = document.getElementById('feedback-message');
const btnVoltar = document.getElementById('btn-voltar');
const btnSubmit = document.getElementById('btn-submit');

// Validação visual de e-mail ao digitar
emailInput.addEventListener('input', function () {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (this.value.length > 0 && !emailPattern.test(this.value)) {
    this.classList.add('invalid-input');
  } else {
    this.classList.remove('invalid-input');
  }
});

// Exibir tela de feedback (Sucesso ou Erro)
function showFeedback(sucesso) {
  formContent.classList.add('hidden');
  feedbackScreen.classList.remove('hidden');

  if (sucesso) {
    feedbackIcon.innerHTML = '<i data-lucide="mail-check" style="color: #A3E635; width: 64px; height: 64px;"></i>';
    feedbackTitle.textContent = 'Verifique seu e-mail';
    feedbackMessage.textContent = 'Se o endereço informado estiver cadastrado, você receberá um link para redefinir sua senha em instantes.';
    btnVoltar.classList.add('hidden');
  } else {
    feedbackIcon.innerHTML = '<i data-lucide="x-circle" style="color: #EF4444; width: 64px; height: 64px;"></i>';
    feedbackTitle.textContent = 'Não foi possível enviar';
    feedbackMessage.textContent = 'Ocorreu um erro ao tentar enviar o link de recuperação. Verifique o e-mail informado e tente novamente.';
    btnVoltar.classList.remove('hidden');
  }
  lucide.createIcons();
}

// Botão de tentar novamente na tela de erro
btnVoltar.addEventListener('click', () => {
  feedbackScreen.classList.add('hidden');
  formContent.classList.remove('hidden');
});

// Envio do formulário (Recuperação de senha)
form.addEventListener('submit', async function (event) {
  event.preventDefault();

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailInput.value || !emailPattern.test(emailInput.value)) {
    emailInput.classList.add('invalid-input');
    return;
  }

  btnSubmit.textContent = 'Enviando...';
  btnSubmit.disabled = true;

  try {
    // Simulação de requisição ao Backend
    await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      body: JSON.stringify({ status: 'simulacao_api_recuperar_senha' }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });

    showFeedback(true);
    form.reset();
  } catch (error) {
    showFeedback(false);
  } finally {
    btnSubmit.textContent = 'Enviar link de recuperação';
    btnSubmit.disabled = false;
  }
});
