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


function validarSenhas() {
  const pass = passwordInput.value;
  const confPass = confirmPasswordInput.value;

  
  if (pass.length > 0 && pass.length < 8) {
    passwordInput.classList.add('invalid-input');
  } else {
    passwordInput.classList.remove('invalid-input');
  }

  
  if (confPass.length > 0) {
    if (pass !== confPass) {
      confirmPasswordInput.classList.add('invalid-input');
    } else {
      confirmPasswordInput.classList.remove('invalid-input');
    }
  } else {
    confirmPasswordInput.classList.remove('invalid-input');
  }
}


passwordInput.addEventListener('input', validarSenhas);
confirmPasswordInput.addEventListener('input', validarSenhas);


const btnGoogle = document.getElementById('btn-google');
btnGoogle.addEventListener('click', function() {
  formContent.classList.add('hidden');
  feedbackScreen.classList.remove('hidden');
  
  feedbackIcon.innerHTML = '<i data-lucide="check-circle" style="color: #A3E635; width: 64px; height: 64px;"></i>';
  feedbackTitle.textContent = 'Autenticado com Google!';
  feedbackMessage.textContent = 'Sua conta Google (OAuth 2.0) foi vinculada com sucesso.';
  
  lucide.createIcons();
});

termosInput.addEventListener('change', function() {
  if (this.checked) {
    this.parentElement.classList.remove('invalid-checkbox');
  }
});

function showFeedback(sucesso) {
  formContent.classList.add('hidden');
  feedbackScreen.classList.remove('hidden');

  if (sucesso) {
    feedbackIcon.innerHTML = '<i data-lucide="check-circle" style="color: #A3E635; width: 64px; height: 64px;"></i>';
    feedbackTitle.textContent = 'Cadastro realizado!';
    feedbackMessage.textContent = 'Sua conta foi criada com sucesso.';
  } else {
    feedbackIcon.innerHTML = '<i data-lucide="x-circle" style="color: #EF4444; width: 64px; height: 64px;"></i>';
    feedbackTitle.textContent = 'Erro no cadastro';
    feedbackMessage.textContent = 'Ocorreu um erro ao tentar criar sua conta. Verifique os dados e tente novamente.';
  }
  lucide.createIcons();
}

btnVoltar.addEventListener('click', () => {
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
    await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      body: JSON.stringify({
        status: 'simulacao_api_sucesso'
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    
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
