lucide.createIcons();

const form = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

const formContent = document.getElementById('form-content');
const feedbackScreen = document.getElementById('feedback-screen');
const feedbackIcon = document.getElementById('feedback-icon');
const feedbackTitle = document.getElementById('feedback-title');
const feedbackMessage = document.getElementById('feedback-message');
const btnVoltar = document.getElementById('btn-voltar');
const btnSubmit = document.getElementById('btn-submit');

// Validação visual de e-mail ao digitar
emailInput.addEventListener('input', function() {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (this.value.length > 0 && !emailPattern.test(this.value)) {
    this.classList.add('invalid-input');
  } else {
    this.classList.remove('invalid-input');
  }
});

// Remove borda vermelha ao digitar a senha
passwordInput.addEventListener('input', function() {
  this.classList.remove('invalid-input');
});

// Exibir tela de feedback (Sucesso ou Erro)
function showFeedback(sucesso) {
  formContent.classList.add('hidden');
  feedbackScreen.classList.remove('hidden');

  if (sucesso) {
    feedbackIcon.innerHTML = '<i data-lucide="check-circle" style="color: #A3E635; width: 64px; height: 64px;"></i>';
    feedbackTitle.textContent = 'Login realizado!';
    feedbackMessage.textContent = 'Autenticação concluída com sucesso. Redirecionando...';
    btnVoltar.classList.add('hidden'); // Oculta botão voltar em caso de sucesso
  } else {
    feedbackIcon.innerHTML = '<i data-lucide="x-circle" style="color: #EF4444; width: 64px; height: 64px;"></i>';
    feedbackTitle.textContent = 'Acesso Negado';
    feedbackMessage.textContent = 'E-mail ou senha incorretos. Verifique os dados e tente novamente.';
    btnVoltar.classList.remove('hidden');
    
    // Regra FA-04: Limpa o campo de senha por segurança em caso de erro
    passwordInput.value = '';
    passwordInput.type = 'password';
    document.getElementById('togglePassword').innerHTML = '<i data-lucide="eye-off"></i>';
  }
  lucide.createIcons();
}

// Botão de voltar na tela de erro
btnVoltar.addEventListener('click', () => {
  feedbackScreen.classList.add('hidden');
  formContent.classList.remove('hidden');
});

// Envio do Formulário (Login)
form.addEventListener('submit', async function(event) {
  event.preventDefault();

  let hasError = false;

  // Força borda vermelha se campos estiverem vazios
  if (!emailInput.value) {
    emailInput.classList.add('invalid-input');
    hasError = true;
  }
  if (!passwordInput.value) {
    passwordInput.classList.add('invalid-input');
    hasError = true;
  }

  const invalidInputs = document.querySelectorAll('.invalid-input');
  if (invalidInputs.length > 0 || hasError) {
    return; // Para aqui se tiver erro estrutural (sem mostrar a tela de feedback)
  }

  btnSubmit.textContent = 'Autenticando...';
  
  try {
    // Simulação de requisição ao Backend
    await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      body: JSON.stringify({ status: 'simulacao_api_login' }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    
    // Você pode simular um erro mudando o true para false abaixo (ex: testar senha incorreta)
    showFeedback(true); 
    
    if (true) { // Se sucesso, redireciona após 2 segundos
        setTimeout(() => {
            // window.location.href = '/painel.html';
            alert("Redirecionando para o sistema...");
        }, 2000);
    }
  } catch (error) {
    showFeedback(false);
  } finally {
    btnSubmit.textContent = 'Entrar';
  }
});

// Mostrar/Ocultar Senha
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