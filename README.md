# AKIFIT
Plataforma web para localização e comparação de academias.

## Como rodar
Abra a pasta no VS Code com a extensão **Live Server** e abra o `index.html` da raiz (ele leva ao login).
Funciona também com `python3 -m http.server` na raiz do projeto.

## Fluxo
Cadastro → Login → Início/Busca → Detalhes da academia → Comparar academias → Meu Perfil (e Sair).

- **Comparação:** "Adicionar à Comparação" na busca e nos detalhes (mín. 2, máx. 3). A matriz fica em `semana-07/rf06-comparar/comparar.html`; o estado fica em `shared/comparacao.js` e os dados em `shared/academias-data.js`.

- **Favoritos (RF007):** o coração aparece na busca e nos detalhes, e a lista fica em `semana-08/rf07-favoritos/RF007-Favoritos.html` (menu "Meus Favoritos"). O estado fica em `shared/favoritos.js`. Sem back-end, os favoritos são salvos no `localStorage` separados por usuário; com a API ligada, vão para o PostgreSQL.
- Para simular uma academia desativada pelo gestor, rode no console: `localStorage.setItem('akifit_academias_inativas', '[3]')` e recarregue (ela some da busca e aparece como "Indisponível" nos favoritos).

- Os dados (usuários, sessão, perfil, favoritos) ficam no `localStorage` do navegador.
- `src/prototipos/shared/auth.js` concentra cadastro, login, sessão e recuperação de senha.
  Para ligar a um back-end, basta trocar as funções desse arquivo por chamadas à API.
- Recuperação de senha: o e-mail é simulado; após informar um e-mail cadastrado, aparece um botão que abre o link de redefinição.
- Login/cadastro com Google são simulados (sem OAuth real).

## API de favoritos (backend)
Fica em `backend/` (Node 18+, Express e PostgreSQL).

1. Rode os scripts de `backend/sql/` no banco, em ordem. O `000` e o `002` só servem para ambiente de teste; em produção use o `001`, que cria a tabela `usuarios_favoritos` em cima das tabelas `usuarios` e `academias` que já existem.
2. Copie `backend/.env.example` para `backend/.env` e preencha `DATABASE_URL`, `JWT_SECRET` (mínimo de 32 caracteres) e `ALLOWED_ORIGINS` (a origem do site, como `http://127.0.0.1:5500`).
3. Dentro de `backend/`, rode `npm install` e `npm start`.
4. Em `src/prototipos/shared/config.js`, troque `apiBase` pela URL da API (por exemplo `http://localhost:3000`). Enquanto estiver vazio, o site usa o `localStorage`.

Rotas (todas exigem sessão):

| Método | Rota | O que faz |
| ------ | ---- | --------- |
| GET | `/api/favoritos` | Lista os favoritos de quem está logado |
| POST | `/api/favoritos` | Favorita uma academia. Corpo: `{ "academia_id": 1 }` |
| DELETE | `/api/favoritos/:academiaId` | Remove o favorito |

O usuário vem sempre do token (cookie `akifit_token` ou cabeçalho `Authorization: Bearer`), nunca do corpo ou da URL. O token é um JWT HS256 emitido pelo login (RF002) com o mesmo `JWT_SECRET`, com o id do usuário em `sub`. Para testar sem o login, use `npm run token -- 1` e mande o resultado no cabeçalho `Authorization`.

### Usando o Supabase
Os scripts em `backend/sql/supabase/` criam o banco completo no Supabase (usuários, academias, planos, horários, modalidades, infraestrutura, avaliações e favoritos).

1. No painel do Supabase, abra **SQL Editor**, cole o conteúdo de `01_schema.sql` e clique em **Run**.
2. Cole e rode o `02_seed_academias.sql` para cadastrar as 4 academias da demonstração com os mesmos ids do site.
3. Em **Project Settings > Database**, copie a connection string (use a do Session pooler) e coloque em `DATABASE_URL` no `backend/.env`, sem `?sslmode`. Troque `[YOUR-PASSWORD]` pela senha do banco.
4. No `.env`, use `DB_SSL=true`. Baixe o certificado em **Database Settings > SSL Configuration**, salve em `backend/certs/` e aponte `DB_SSL_CA_FILE` para ele. Sem o certificado a conexão é recusada, e só em último caso dá para usar `DB_SSL_VERIFICAR=false`, que é menos seguro.

O script liga o RLS em todas as tabelas e tira o acesso dos papéis `anon` e `authenticated`. Assim ninguém consegue ler ou alterar os dados pela API pública do Supabase usando a chave anon; só o backend, conectado pela `DATABASE_URL`, acessa as tabelas. Não coloque a `service_role` nem a senha do banco no frontend.
