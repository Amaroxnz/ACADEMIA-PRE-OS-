# RF-05 — Detalhes da Academia (AKIFIT)

Protótipo front-end (HTML + CSS + JS puro) da tela de detalhes da academia, em Dark Mode com Verde Neon.

## Estrutura
```
src/prototipos/semana-06/rf05-detalhes-da-academia/
├── RF-05.html          estrutura da página
├── style-rf05.css      estilos (Dark Mode + Verde Neon)
└── script-rf05.js      lógica da tela (busca os dados na API)

docs/ (na raiz do repositório)
├── schema.sql          modelo PostgreSQL (ADR-001)
└── rota-academia.js    exemplo de rota Express GET /api/academias/:id
```

## Como rodar (Live Server)
1. Abra a pasta do projeto no VS Code (extensão **Live Server**).
2. Abra `src/prototipos/semana-03/rf05-tela-inicial/inicio.html` com o Live Server.
3. Com o back-end no ar, clique em **qualquer parte de um cartão** (ou em "Ver Detalhes").

## Dados (API)
A tela busca `GET {API_BASE}/api/academias/:id` (configure `API_BASE` no topo de `script-rf05.js`). O formato do JSON é o devolvido por `docs/rota-academia.js`. Se a API não responder ou o ID não existir, a tela mostra o aviso de erro e volta para a busca em 5 s (RNF-06).

## Requisitos atendidos
- **RN-01** valores com periodicidade; equivalente mensal e economia calculados em JS.
- **RN-02** nota = média das avaliações, calculada na hora (com meia estrela).
- **RN-03** nome, endereço completo, ≥ 1 plano e ≥ 1 horário; senão, tela de erro.
- **RN-04** comentários do mais recente para o mais antigo.
- **RN-05** placeholder AKIFIT quando não há foto (ou se a imagem falhar).
- **FA-01** abas de plano · **FA-02** academia sem avaliações · **FA-03** favoritar (coração verde neon, salvo no `localStorage`).
- **RNF-05** textos vindos dos dados são escapados (sem XSS).
- **ADR-003** cache em memória por ID (equivale ao `Cache-Control` da API).

## Observações
- O CEP do usuário fica em `localStorage` (`akifit_cep`); a conversão CEP → coordenadas é simulada por prefixo. Em produção usar uma API de geocodificação.
- Fotos de exemplo vêm do `placehold.co` (precisa de internet); o mapa usa o Google Maps embutido.
