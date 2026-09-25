document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formPerfil');
    const inputCep = document.getElementById('cep');
    const inputEmail = document.getElementById('email');
    const inputFoto = document.getElementById('inputFoto');
    const imgAvatar = document.getElementById('imgAvatar');
    const btnRemoverFoto = document.getElementById('btnRemoverFoto');
    const msgSucesso = document.getElementById('msgSucesso');

    const IMAGEM_PADRAO = "https://via.placeholder.com/120/222c26/a3e635?text=Foto";
    const LIMITE_TAMANHO_FOTO = 5 * 1024 * 1024; 

    inputCep.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '');
    });

    inputFoto.addEventListener('change', function(event) {
        const file = event.target.files[0];
        const erroFoto = document.getElementById('erroFoto');
        
        if (file) {
            if (file.size > LIMITE_TAMANHO_FOTO) {
                erroFoto.classList.remove('hidden');
                inputFoto.value = ''; 
                return;
            } else {
                erroFoto.classList.add('hidden');
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                imgAvatar.src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    });

    btnRemoverFoto.addEventListener('click', () => {
        imgAvatar.src = IMAGEM_PADRAO;
        inputFoto.value = ''; 
    });

    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        msgSucesso.classList.add('hidden');
        resetarErros();

        let formularioValido = true;

        if (!validarEmail(inputEmail.value)) {
            mostrarErro('Email');
            formularioValido = false;
        }

        if (inputCep.value.length !== 8) {
            mostrarErro('Cep');
            formularioValido = false;
        }

        if (formularioValido) {
            msgSucesso.classList.remove('hidden');
            console.log("Preferências salvas com sucesso!");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    function mostrarErro(campo) {
        const input = document.getElementById(campo.toLowerCase());
        const spanErro = document.getElementById(`erro${campo}`);
        
        input.classList.add('input-error');
        spanErro.classList.remove('hidden');
    }

    function resetarErros() {
        const inputs = form.querySelectorAll('input');
        const mensagens = form.querySelectorAll('.error-text');
        
        inputs.forEach(input => input.classList.remove('input-error'));
        mensagens.forEach(msg => msg.classList.add('hidden'));
    }
});