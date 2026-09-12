# PrevsImob — Site imobiliário com simulador de previsão de preços

## Visão Geral

PrevsImob é um site imobiliário (front-end estático, sem backend) com listagem
de imóveis (busca, filtros, favoritos) e um simulador inteligente de preços —
a aba **"Prever Imóvel"** — que estima o valor de venda/aluguel de um imóvel
a partir de características informadas pelo usuário (cidade, tipo, área,
quartos, banheiros, garagem, idade, conservação e amenidades).

A especificação completa do problema (requisitos funcionais/não funcionais,
regras de negócio e contratos de entrada/saída) está em
[`docs/SDD.md`](docs/SDD.md). As decisões de arquitetura estão registradas
como ADRs em [`docs/ADR/`](docs/ADR).

## Como instalar e executar

### Opção 1 — Direto no navegador (mais simples)

1. Abra `index.html` no navegador (duplo clique ou arraste no browser).
2. Use a busca, filtros e ordenação para explorar os imóveis de exemplo.
3. Clique em "Ver imóvel" para detalhes e no ★ para favoritar (salvo em `localStorage`).
4. Acesse a aba **"Prever Imóvel"** para usar o simulador de preços.

### Opção 2 — Ambiente padronizado com Docker (recomendado)

Pré-requisito: Docker + Docker Compose instalados.

```bash
docker compose up --build
```

O site ficará disponível em `http://localhost:8080`.

### Opção 3 — Servidor local via Node (sem Docker)

```bash
npm install
npm start   # sobe http-server em http://localhost:8080
```

## Testes automatizados (Test Harness)

O motor de cálculo do simulador (`calcularPrecoImovel` e `formatarMoeda`, em
`prever.js`) possui uma suíte de testes automatizados com Jest, cobrindo
cenários principais e casos de borda (cidade/tipo inválidos, área zero,
amenidade desconhecida, divisor de aluguel, faixa ±15%, etc.).

```bash
npm install
npm test               # roda a suíte de testes
npm run test:coverage  # roda com relatório de cobertura

# ou, 100% containerizado:
docker compose run test
```

O log de execução mais recente (12/12 testes passando) e a análise de
cobertura estão documentados em
[`docs/test-execution-report.md`](docs/test-execution-report.md).

## Agentes de IA e fluxo SDD

Este projeto adota Spec-Driven Development (SDD): mudanças de comportamento
passam primeiro pela especificação (`docs/SDD.md`), depois por ADRs quando
afetam arquitetura/regras de negócio, e só então por código + testes.

Um agente de IA foi utilizado como apoio ao desenvolvimento (diagnóstico do
repositório, redação do SDD, criação do harness de testes, Dockerfile e
templates de governança). As regras de contexto que o agente segue estão em
[`.cursorrules`](.cursorrules) e [`CLAUDE.md`](CLAUDE.md); o registro de como
e onde ele foi usado está em
[`docs/ADR/0003-uso-de-agentes-de-ia.md`](docs/ADR/0003-uso-de-agentes-de-ia.md).

## Governança do repositório

- Fluxo de branches (`main` / `develop` / `feature/*`), regras de Pull
  Request e uso de Issues/Projects: ver [`CONTRIBUTING.md`](CONTRIBUTING.md).
- Templates de Issue e PR: [`.github/ISSUE_TEMPLATE/`](.github/ISSUE_TEMPLATE)
  e [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md).

## Simulador de Previsão de Imóveis

Ferramenta que permite aos usuários:
- **Simular preços** de imóveis baseado em múltiplos critérios
- **Comparar valores** em diferentes cidades e localidades
- **Considerar amenidades** e condições do imóvel
- **Visualizar faixas de preço** com indicador de valor estimado

**Como usar:**
1. Clique em "Prever Imóvel" na navegação
2. Preencha o formulário com cidade/localização, tipo de imóvel, finalidade
   (compra/venda ou aluguel), área em m², quartos, banheiros, vagas de
   garagem, idade e estado de conservação, e amenidades
3. Clique em "Calcular Preço"
4. Receba a estimativa: valor estimado, preço por m², faixa mínima/máxima e
   comparativo com os detalhes inseridos

**Tecnologia:**
- Algoritmo baseado em tabelas de preço por cidade/tipo (ver `docs/SDD.md`)
- Múltiplos fatores de ajuste (idade, conservação, amenidades)
- Variação de exibição de ±15%
- Cálculo diferenciado para vendas e aluguel

## Estrutura de arquivos (principais)

- `index.html`, `propriedades.html`, `sobre.html`, `contato.html`,
  `login.html`, `cadastro.html`, `detalhes.html`, `servicos.html` — páginas do site
- `style.css` — estilos e tema (azul + teal)
- `app.js` — dados de exemplo e interações (busca, filtros, favoritos)
- `prever.html` / `prever.js` — página e lógica do simulador de preços
- `docs/SDD.md` — especificação técnica do problema
- `docs/ADR/` — registro de decisões de arquitetura
- `docs/test-execution-report.md` — log de execução dos testes
- `tests/` — suíte de testes automatizados (Jest)
- `Dockerfile`, `docker-compose.yml` — ambiente padronizado e reprodutível
- `.cursorrules`, `CLAUDE.md` — contexto/regras para agentes de IA

## Próximos passos sugeridos

- Integrar com backend / API real para carregar imóveis dinamicamente.
- Substituir `alert` por modal customizado com galeria de imagens.
- Adicionar paginação e formulário de contato funcional.
- Conectar simulador com base de dados de transações reais para melhor precisão.
- Adicionar gráficos e análises de tendência de mercado.
- Permitir usuários salvarem simulações e comparações.
- Estender o harness com testes E2E (Playwright/Cypress) para os
  manipuladores de DOM do formulário (ver `docs/test-execution-report.md`).
