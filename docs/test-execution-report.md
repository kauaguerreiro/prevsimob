# Relatório de Execução do Test Harness — PrevsImob v1.0.0

## Resultado

| Indicador | Valor |
|-----------|-------|
| Suítes | **4 de 4 aprovadas** |
| Testes | **64 de 64 aprovados (100%)** — 0 falhas, 0 ignorados |
| Cobertura — linhas | **100%** (197/197) |
| Cobertura — funções | **100%** (48/48) |
| Cobertura — instruções | **99,58%** (241/242) |
| Cobertura — ramos | **93,75%** (120/128) |
| `prever.js` (módulo crítico) | **100%** em instruções, ramos, funções e linhas |
| Limites mínimos (`coverageThreshold`) | Atendidos |

## Ambiente de execução

- Node.js v22.22.2 (local) — equivalente ao container `node:20-alpine`
- Jest 29 + jest-environment-jsdom 29
- Comando: `npm ci && npm run test:coverage`
- Containerizado: `docker compose run --rm coverage`
- CI: `.github/workflows/ci.yml` (a cada push/PR em `main` e `develop`)

## Escopo por suíte

| Suíte | Tipo | Testes | O que cobre |
|-------|------|--------|-------------|
| `tests/prever.test.js` | Unitário | 12 | Cálculo (venda, aluguel ÷120, faixa ±15%, amenidades, 30 combinações cidade × tipo), bordas e `formatarMoeda` |
| `tests/prever.validacao.test.js` | Unitário | 13 | Os 6 achados da auditoria de entradas (RF08, ADR 0004) |
| `tests/prever.dom.test.js` | Integração | 13 | `prever.html` real: coerência formulário × tabelas, fluxo completo, erros, botões pós-resultado, animação |
| `tests/app.test.js` | Integração | 26 | Listagem/busca/filtros/ordenação, debounce, detalhes, formulários, inicialização sem erro das 8 páginas sem listagem |

## Ramos não cobertos (todos em `app.js`, sem impacto funcional)

Os 8 ramos restantes são alternativas de dados de exemplo (cards com/sem
etiqueta ou texto de preço próprio), fallbacks de `getFilters()` para páginas
sem campos de filtro e o caso `document.readyState !== 'loading'` (script
carregado após o DOM). Estão acima do limite global de 85% e documentados no
SDD As-Built.

## Log completo — `npm run test:coverage`

```
$ npx jest --coverage
PASS tests/app.test.js
  index.html — listagem, busca, filtros e ordenação (RF02)
    ✓ renderiza todos os imóveis de exemplo ao carregar (200 ms)
    ✓ busca textual filtra por título, cidade ou descrição (138 ms)
    ✓ submeter o formulário de busca filtra na própria página (sem redirecionar) (93 ms)
    ✓ filtro de tipo e de finalidade restringem a lista (107 ms)
    ✓ ordenação por preço crescente e decrescente (104 ms)
    ✓ busca rápida usa debounce de 300 ms (86 ms)
    ✓ botão "Ver detalhes" do card exibe as informações do imóvel (105 ms)
    ✓ openModal ignora imóvel inexistente; formatCurrency só formata valores ≥ 1000 (79 ms)
    ✓ ano do rodapé, cabeçalho fixo e animação de revelação (40 ms)
    ✓ links de navegação com âncora (#) rolam suavemente; links de página não (90 ms)
  animação de revelação (app.js)
    ✓ elementos .reveal visíveis recebem a classe "is-visible" (51 ms)
  páginas sem listagem dinâmica (RF01)
    ✓ propriedades.html inicializa sem erros e atualiza o ano do rodapé (14 ms)
    ✓ prever.html inicializa sem erros e atualiza o ano do rodapé (36 ms)
    ✓ contato.html inicializa sem erros e atualiza o ano do rodapé (11 ms)
    ✓ sobre.html inicializa sem erros e atualiza o ano do rodapé (6 ms)
    ✓ servicos.html inicializa sem erros e atualiza o ano do rodapé (6 ms)
    ✓ login.html inicializa sem erros e atualiza o ano do rodapé (13 ms)
    ✓ cadastro.html inicializa sem erros e atualiza o ano do rodapé (10 ms)
    ✓ detalhes.html inicializa sem erros e atualiza o ano do rodapé (6 ms)
  detalhes do imóvel — propriedades.html → detalhes.html (RF09)
    ✓ verDetalhes salva o imóvel e navega para detalhes.html (11 ms)
    ✓ verDetalhes com id inexistente não faz nada (8 ms)
    ✓ carregarDetalhes renderiza venda (R$ total) e aluguel (R$/mês) (17 ms)
    ✓ carregarDetalhes sem imóvel selecionado redireciona para propriedades.html (5 ms)
    ✓ carregarDetalhes não quebra em página sem contêiner de detalhes (11 ms)
  formulários demonstrativos (contato e login)
    ✓ contato.html confirma o envio e limpa o formulário (19 ms)
    ✓ login.html registra o e-mail em localStorage e volta para a página inicial (12 ms)
PASS tests/prever.dom.test.js
  prever.html — inicialização da página
    ✓ resultado começa oculto e o ano do rodapé é atualizado (33 ms)
    ✓ opções de finalidade do formulário respeitam o contrato do SDD (venda | aluguel) (46 ms)
    ✓ todas as cidades e tipos do formulário existem na tabela de preços (46 ms)
    ✓ todas as amenidades do formulário possuem bônus definido (25 ms)
  prever.html — fluxo principal de simulação (RF04/RF05)
    ✓ submissão válida exibe valor estimado, faixa ±15%, detalhes e indicador (86 ms)
    ✓ amenidades marcadas no formulário são enviadas ao motor de cálculo (19 ms)
    ✓ finalidade aluguel exibe valor mensal (÷120) (21 ms)
  prever.html — validações e erros (RF06/RF08)
    ✓ campo obrigatório vazio alerta o usuário e não exibe resultado (22 ms)
    ✓ finalidade não selecionada é barrada pelo motor com mensagem específica (22 ms)
  prever.html — ações pós-resultado (RF07)
    ✓ botão fechar oculta o resultado (42 ms)
    ✓ "Nova simulação" limpa o formulário e oculta o resultado (32 ms)
    ✓ "Consultar especialista" redireciona para contato.html (120 ms)
  prever.js — animação de revelação ao rolar
    ✓ elementos .reveal recebem a classe "revealed" ao entrar na tela (35 ms)
PASS tests/prever.test.js
  calcularPrecoImovel — cenários principais
    ✓ calcula corretamente uma venda de apartamento em São Paulo, sem amenidades (1 ms)
    ✓ aplica divisor de aluguel (÷120) sobre o valor de venda equivalente
    ✓ faixa de preço tem variação de ±15% em torno do valor estimado (1 ms)
    ✓ soma corretamente o bônus de múltiplas amenidades
    ✓ valida todas as combinações de cidade x tipo presentes na tabela de preços (16 ms)
  calcularPrecoImovel — casos de borda
    ✓ retorna null e alerta o usuário para cidade inexistente (1 ms)
    ✓ retorna null para tipo de imóvel inexistente em uma cidade válida
    ✓ área igual a 0 resulta em preço total igual a 0, sem lançar erro
    ✓ amenidade desconhecida é ignorada no cálculo do bônus (não quebra e não altera preço) (1 ms)
    ✓ quartos "5" (chave string na tabela) é interpretado corretamente
  formatarMoeda
    ✓ formata valores numéricos como moeda brasileira (BRL) (1 ms)
    ✓ formata zero corretamente
PASS tests/prever.validacao.test.js
  validação de entradas — achados da auditoria (SDD RF08 / regra 8)
    ✓ dados válidos de referência continuam retornando resultado numérico (1 ms)
    ✓ achado 1: idade inválida retorna null com mensagem específica (antes: NaN)
    ✓ achado 1: conservação inválida retorna null (antes: NaN) (1 ms)
    ✓ achado 1: chaves herdadas do protótipo ("constructor") não passam na validação
    ✓ achado 2: quartos fora da faixa (6) retorna null (antes: NaN) (1 ms)
    ✓ achado 2: banheiros e garagem fora da faixa retornam null (5 ms)
    ✓ achado 3: área negativa retorna null (antes: preço negativo)
    ✓ achado 3: área NaN, texto ou infinita retorna null
    ✓ achado 3: área 0 continua aceita e resulta em preço 0 (regra do SDD preservada)
    ✓ achado 4: amenidades ausentes são tratadas como lista vazia (antes: TypeError) (1 ms)
    ✓ achado 4: amenidades que não é lista retorna null
    ✓ achado 5: finalidade "compra" (valor antigo do formulário) não é mais aceita; "venda" e "aluguel" sim
    ✓ achado 6: cada campo inválido gera mensagem específica, não a genérica (2 ms)
-----------|---------|----------|---------|---------|-----------------------------
File       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s           
-----------|---------|----------|---------|---------|-----------------------------
All files  |   99.58 |    93.75 |     100 |     100 |                             
 app.js    |   99.21 |    89.33 |     100 |     100 | 302-310,324-326,356,388,416 
 prever.js |     100 |      100 |     100 |     100 |                             
-----------|---------|----------|---------|---------|-----------------------------
=============================== Coverage summary ===============================
Statements   : 99.58% ( 241/242 )
Branches     : 93.75% ( 120/128 )
Functions    : 100% ( 48/48 )
Lines        : 100% ( 197/197 )
================================================================================
Test Suites: 4 passed, 4 total
Tests:       64 passed, 64 total
Snapshots:   0 total
Time:        2.743 s, estimated 3 s
Ran all test suites.
```

O relatório HTML navegável é gerado em `coverage/lcov-report/index.html`
(não versionado; publicado como artefato `coverage-report` no CI).
