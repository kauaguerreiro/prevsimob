# PrevsImob — Site imobiliário com simulador de previsão de preços

[![CI — Test Harness](https://github.com/kauaguerreiro/prevsimob/actions/workflows/ci.yml/badge.svg)](https://github.com/kauaguerreiro/prevsimob/actions/workflows/ci.yml)
![Versão](https://img.shields.io/badge/versão-1.0.0-0052cc)
![Testes](https://img.shields.io/badge/testes-64%2F64-success)
![Cobertura](https://img.shields.io/badge/cobertura%20de%20linhas-100%25-success)

PrevsImob é um site imobiliário estático (HTML, CSS e JavaScript puro, sem
backend) com listagem de imóveis — busca, filtros, ordenação e página de
detalhes — e um **simulador de preços** (aba **"Prever Imóvel"**) que estima o
valor de venda ou aluguel de um imóvel a partir de cidade, tipo, área,
quartos, banheiros, garagem, idade, conservação e amenidades.

- Especificação As-Built (arquitetura, regras, contratos): [`docs/SDD.md`](docs/SDD.md)
- Decisões de arquitetura: [`docs/ADR/`](docs/ADR) (0001 a 0005)
- Relatório de testes e cobertura: [`docs/test-execution-report.md`](docs/test-execution-report.md)
- Histórico de versões: [`CHANGELOG.md`](CHANGELOG.md)

## Início rápido (comando único)

Pré-requisito: Docker com Docker Compose v2.

```bash
git clone https://github.com/kauaguerreiro/prevsimob.git
cd prevsimob
docker compose up --build          # site em http://localhost:8080
```

Testes, também com comando único:

```bash
docker compose run --rm test       # 64 testes
docker compose run --rm coverage   # testes + relatório de cobertura em ./coverage/
```

## Variáveis de ambiente

O projeto não usa chaves de API, banco de dados nem segredos. A única
variável é opcional:

| Variável | Padrão | Uso |
|----------|--------|-----|
| `PORT` | `8080` | Porta do host onde o `docker compose` publica o site |

```bash
cp .env.example .env   # opcional; edite PORT se a 8080 estiver ocupada
```

## Outras formas de executar

**Sem instalar nada:** abra `index.html` direto no navegador.

**Com Node.js 18+ (sem Docker):**

```bash
npm ci                   # instala as dependências exatas do package-lock.json
npm start                # http://localhost:8080
npm test                 # roda a suíte
npm run test:coverage    # roda com cobertura (falha se ficar abaixo dos limites)
```

O relatório HTML de cobertura fica em `coverage/lcov-report/index.html`.

## Como usar

**Listagem (`index.html`):** digite na busca (filtra enquanto você digita),
escolha tipo, finalidade e ordenação por preço. "Ver detalhes" mostra o
resumo do imóvel.

**Propriedades (`propriedades.html`):** "Ver Detalhes" abre a página completa
do imóvel (`detalhes.html`).

**Prever Imóvel (`prever.html`):**
1. Preencha cidade, tipo, finalidade (compra/venda ou aluguel), área, quartos,
   banheiros, vagas, idade e conservação; marque as amenidades.
2. Clique em "Calcular Preço".
3. Veja o valor estimado, o preço por m², a faixa de ±15% e o indicador.
4. Use "Nova simulação" para recomeçar ou "Consultar especialista" para ir ao contato.

Exemplo: São Paulo, apartamento, venda, 80 m², 3 quartos, 2 banheiros, 1 vaga,
intermediário, regular → **R$ 768.000,00** (R$ 9.600,00/m²).

> Os valores são paramétricos e ilustrativos (ver ADR 0002), não uma avaliação real de mercado.

## Testes automatizados

| Suíte | Tipo | Testes |
|-------|------|--------|
| `tests/prever.test.js` | Unitário — motor de cálculo | 12 |
| `tests/prever.validacao.test.js` | Unitário — validação de entradas | 13 |
| `tests/prever.dom.test.js` | Integração — página do simulador | 13 |
| `tests/app.test.js` | Integração — listagem, detalhes, formulários | 26 |

Os testes de integração carregam o HTML real de cada página no jsdom e
disparam eventos reais. O CI (GitHub Actions) roda tudo a cada push/PR e
bloqueia regressões de cobertura (`prever.js` exige 100%).

## Estrutura

```
├── index.html, propriedades.html, detalhes.html, servicos.html,
│   sobre.html, contato.html, login.html, cadastro.html  — páginas do site
├── prever.html / prever.js   — simulador de preços (motor + interface)
├── app.js                    — listagem, filtros, detalhes, formulários, UI comum
├── style.css                 — tema e responsividade
├── tests/                    — test harness (Jest + jsdom)
├── docs/SDD.md               — especificação As-Built
├── docs/ADR/                 — decisões de arquitetura
├── Dockerfile, docker-compose.yml, .env.example — ambiente padronizado
├── .github/                  — CI, templates de Issue e PR
└── .cursorrules, CLAUDE.md   — regras de contexto para agentes de IA
```

## Fluxo SDD e agentes de IA

Toda mudança de comportamento passa primeiro pela especificação
(`docs/SDD.md`), depois por ADR quando afeta arquitetura ou regras de negócio,
e só então por código + testes. Um agente de IA apoiou diagnóstico,
especificação, testes e empacotamento; as regras que ele segue estão em
[`.cursorrules`](.cursorrules) e [`CLAUDE.md`](CLAUDE.md), e o registro de uso
em [`docs/ADR/0003-uso-de-agentes-de-ia.md`](docs/ADR/0003-uso-de-agentes-de-ia.md).

## Governança

Branches `main` (protegida) / `develop` / `feature/*`, PR com revisão
obrigatória e CI verde. Detalhes em [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Limitações conhecidas e próximos passos

- Preços paramétricos; integrar a uma base de transações reais.
- Contato, login e cadastro são demonstrativos (sem envio nem autenticação).
- Favoritos ficaram fora da v1.0.0 (backlog).
- Testes E2E em navegador real (Playwright) para layout e responsividade.
- Backend/API para carregar imóveis dinamicamente.

## Contato

Dúvidas sobre o projeto: abra uma [Issue](https://github.com/kauaguerreiro/prevsimob/issues).
