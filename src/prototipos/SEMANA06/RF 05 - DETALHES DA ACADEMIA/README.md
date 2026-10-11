# RF-05 — Detalhes da Academia (AKIFIT)

front-end (HTML + CSS + JS puro) da tela de detalhes da academia

## Estrutura
```
src/prototipos/semana-06/rf05-detalhes-da-academia/
├── RF-05.html          estrutura da página
├── style-rf05.css      estilos
└── script-rf05.js      lógica da tela

docs/ (na raiz do repositório)
└── rota-academia.js    exemplo de rota Express GET /api/academias/:id
```

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
