# RF-05 — Detalhes da Academia (AKIFIT)

Tela de detalhes de uma academia, em HTML, CSS e JavaScript puro (Dark Mode com Verde Neon).
É aberta pela tela de busca com o ID na URL: `RF-05.html?id=1`.

## Arquivos

- `RF-05.html` — estrutura da página
- `style-rf05.css` — estilos
- `script-rf05.js` — lógica da tela

## O que a tela mostra

- Nome, nota média, endereço e galeria de fotos
- Planos e preços (mensal, trimestral e anual) com botão de contato no WhatsApp
- Modalidades, infraestrutura e horários de funcionamento
- Mapa, botão "Como chegar" e distância até o CEP do usuário
- Avaliações dos alunos
- Favoritar a academia e menu com Meu Perfil e Sair

## Como rodar

1. Abra o projeto no VS Code com **Live Server**.
2. Abra o `index.html` da raiz e faça login.
3. Na busca, clique em uma academia.

## Dados

A tela busca os dados em `GET /api/academias/:id`. O endereço do servidor fica em `API_BASE`, no topo do `script-rf05.js`. O formato da resposta é o da rota `docs/rota-academia.js`.

Se a API não responder ou a academia não existir, aparece um aviso de erro e a tela volta para a busca em 5 segundos. Sem back-end no ar, isso acontece com qualquer academia.
