# RF-05 — Detalhes da Academia (AKIFIT)

Protótipo front-end (HTML + CSS + JS puro) da tela de detalhes da academia, em Dark Mode com Verde Neon.

## Estrutura
```
SEMANA04/RF 05 - DETALHES DA ACADEMIA/
├── RF-05.html          estrutura da página
├── style-rf05.css      estilos (Dark Mode + Verde Neon)
├── script-rf05.js      lógica + dados simulados (BANCO_SIMULADO)
└── docs/
    ├── schema.sql         modelo PostgreSQL (ADR-001)
    └── rota-academia.js   exemplo de rota Express GET /api/academias/:id
```

## Como rodar (Live Server)
1. Abra a pasta do projeto no VS Code (extensão **Live Server**).
2. Abra `SEMANA03/RF 05 - TELA INICIAL/inicio.html` com o Live Server.
3. Clique em **qualquer parte de um cartão** (ou em "Ver Detalhes").

## Como testar cada cenário (`RF-05.html?id=...`)
| ID | Cenário | O que observar |
|----|---------|----------------|
| 1 | Completa (6 fotos, 3 planos, 6 avaliações) | galeria, abas Mensal/Trimestral/Anual, tabela comparativa, comentários em ordem decrescente |
| 2 | Aberta 24h, planos mensal e anual | aba "Trimestral" mostra aviso de plano indisponível |
| 3 | Crossfit, só plano mensal, fecha aos domingos | horário "Fechado" no domingo |
| 4 | Natação, planos mensal e trimestral | infraestrutura com piscina |
| 5 | Academia nova | selo "Novo" + "Seja o primeiro aluno a avaliar esta academia!" (FA-02) |
| 6 | Sem fotos | placeholder AKIFIT (RN-05) |
| 7 | Sem plano de preço | viola RN-03 → tela de erro e redirecionamento |
| 999 ou sem `?id` | Inexistente | tela de erro com contagem regressiva de 5 s |

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
- Os dados de `BANCO_SIMULADO` têm o mesmo formato do JSON devolvido por `docs/rota-academia.js`; para ligar ao back-end basta trocar `buscarAcademiaPorId()` por um `fetch('/api/academias/' + id)`.
