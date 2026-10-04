# AKIFIT
Plataforma web para localização e comparação de academias.

## Como rodar
Abra a pasta no VS Code com a extensão **Live Server** e abra o `index.html` da raiz (ele leva ao login).
Funciona também com `python3 -m http.server` na raiz do projeto.

## Fluxo
Cadastro → Login → Início/Busca → Detalhes da academia → Meu Perfil (e Sair).

- Os dados (usuários, sessão, perfil, favoritos) ficam no `localStorage` do navegador.
- `src/prototipos/shared/auth.js` concentra cadastro, login, sessão e recuperação de senha.
  Para ligar a um back-end, basta trocar as funções desse arquivo por chamadas à API.
- Recuperação de senha: o e-mail é simulado; após informar um e-mail cadastrado, aparece um botão que abre o link de redefinição.
- Login/cadastro com Google são simulados (sem OAuth real).
