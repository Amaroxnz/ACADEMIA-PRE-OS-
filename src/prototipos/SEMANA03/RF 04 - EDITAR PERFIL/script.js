document.addEventListener('DOMContentLoaded', () => {
    // Página protegida: só para usuários logados
    if (!Auth.requireAuth()) return;
    Auth.renderNav('navLinks', 'perfil');

    const form = document.getElementById('formPerfil');
    const inputNome = document.getElementById('nome');
    const inputEmail = document.getElementById('email');
    const inputTelefone = document.getElementById('telefone');
    const inputCep = document.getElementById('cep');
    const inputFoto = document.getElementById('inputFoto');
    const imgAvatar = document.getElementById('imgAvatar');
    const btnRemoverFoto = document.getElementById('btnRemoverFoto');
    const msgSucesso = document.getElementById('msgSucesso');

    const IMAGEM_PADRAO = imgAvatar.getAttribute('src');
    const LIMITE_TAMANHO_FOTO = 5 * 1024 * 1024;
    let fotoAtual = '';

    // Preenche o formulário com os dados salvos
    const user = Auth.getUser();
    inputNome.value = user.nome || '';
    inputEmail.value = user.email || '';
    inputTelefone.value = user.telefone || '';
    inputCep.value = user.cep || '';
    fotoAtual = user.foto || '';
    if (fotoAtual) imgAvatar.src = fotoAtual;
    document.querySelectorAll('input[name="treino"]').forEach(cb => {
        cb.checked = (user.preferencias || []).includes(cb.value);
    });

    inputCep.addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, '');
    });

    inputTelefone.addEventListener('input', function () {
        let v = this.value.replace(/\D/g, '').slice(0, 11);
        if (v.length > 6) v = `(${v.slice(0, 2)}) ${v.slice(2, v.length - 4)}-${v.slice(-4)}`;
        else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
        this.value = v;
    });

    // Reduz a foto para caber no localStorage
    function redimensionar(dataUrl, max = 240) {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => {
                const escala = Math.min(1, max / Math.max(img.width, img.height));
                const c = document.createElement('canvas');
                c.width = Math.round(img.width * escala);
                c.height = Math.round(img.height * escala);
                c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
                resolve(c.toDataURL('image/jpeg', 0.85));
            };
            img.onerror = () => resolve('');
            img.src = dataUrl;
        });
    }

    inputFoto.addEventListener('change', function (event) {
        const file = event.target.files[0];
        const erroFoto = document.getElementById('erroFoto');
        if (!file) return;

        if (file.size > LIMITE_TAMANHO_FOTO) {
            erroFoto.classList.remove('hidden');
            inputFoto.value = '';
            return;
        }
        erroFoto.classList.add('hidden');

        const reader = new FileReader();
        reader.onload = async (e) => {
            fotoAtual = await redimensionar(e.target.result);
            if (fotoAtual) imgAvatar.src = fotoAtual;
        };
        reader.readAsDataURL(file);
    });

    btnRemoverFoto.addEventListener('click', () => {
        imgAvatar.src = IMAGEM_PADRAO;
        fotoAtual = '';
        inputFoto.value = '';
    });

    function validarEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        msgSucesso.classList.add('hidden');
        resetarErros();

        let valido = true;
        if (!inputNome.value.trim()) { mostrarErro('Nome'); valido = false; }
        if (!validarEmail(inputEmail.value)) { mostrarErro('Email'); valido = false; }
        if (inputCep.value.length !== 8) { mostrarErro('Cep'); valido = false; }
        if (!valido) return;

        const resultado = Auth.updateUser({
            nome: inputNome.value.trim(),
            email: inputEmail.value.trim(),
            telefone: inputTelefone.value,
            cep: inputCep.value,
            foto: fotoAtual,
            preferencias: [...document.querySelectorAll('input[name="treino"]:checked')].map(cb => cb.value),
        });

        if (resultado === 'email-duplicado') {
            const span = document.getElementById('erroEmail');
            span.textContent = 'Este e-mail já está em uso por outra conta.';
            mostrarErro('Email');
            return;
        }
        if (resultado !== true) {
            alert('Não foi possível salvar. Faça login novamente.');
            return;
        }

        // CEP usado na tela de detalhes da academia (cálculo de distância)
        try { localStorage.setItem('akifit_cep', inputCep.value); } catch (e) {}

        Auth.renderNav('navLinks', 'perfil');
        msgSucesso.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    function mostrarErro(campo) {
        document.getElementById(campo.toLowerCase()).classList.add('input-error');
        document.getElementById(`erro${campo}`).classList.remove('hidden');
    }

    function resetarErros() {
        form.querySelectorAll('input').forEach(i => i.classList.remove('input-error'));
        form.querySelectorAll('.error-text').forEach(m => m.classList.add('hidden'));
    }
});
