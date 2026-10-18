# AKIFIT
Plataforma web para localização e comparação de academias.

## Como rodar
Abra a pasta no VS Code com a extensão **Live Server** e abra o `index.html` da raiz (ele leva ao login).
Funciona também com `python3 -m http.server` na raiz do projeto.

## Fluxo
Cadastro → Login → Início/Busca → Detalhes da academia → Comparar academias → Meu Perfil (e Sair).

- **Comparação:** "Adicionar à Comparação" na busca e nos detalhes (mín. 2, máx. 3). A matriz fica em `semana-07/rf06-comparar/comparar.html`; o estado fica em `shared/comparacao.js` e os dados em `shared/academias-data.js`.

- Os dados (usuários, sessão, perfil, favoritos) ficam no `localStorage` do navegador.
- `src/prototipos/shared/auth.js` concentra cadastro, login, sessão e recuperação de senha.
  Para ligar a um back-end, basta trocar as funções desse arquivo por chamadas à API.
- Recuperação de senha: o e-mail é simulado; após informar um e-mail cadastrado, aparece um botão que abre o link de redefinição.
- Login/cadastro com Google são simulados (sem OAuth real).
