# Relatório de Execução do Test Harness — PrevsImob

## Ambiente de execução

- Node.js (imagem `node:20-alpine` via Docker, ou Node local ≥ 18)
- Runner: Jest 29 (`testEnvironment: jsdom`)
- Comando: `npm install && npm test`
- Alternativa 100% containerizada: `docker compose run test`

## Escopo coberto

A suíte (`tests/prever.test.js`) cobre a função de cálculo do simulador
(`calcularPrecoImovel`) e a formatação monetária (`formatarMoeda`), conforme
os contratos definidos em `docs/SDD.md`:

- **Cenários principais:** cálculo de venda, cálculo de aluguel (÷120), faixa
  de variação ±15%, soma de bônus de amenidades, e uma varredura de todas as
  combinações válidas de cidade × tipo de imóvel da tabela de preços.
- **Casos de borda:** cidade inexistente, tipo de imóvel inexistente, área
  igual a zero, amenidade desconhecida (deve ser ignorada) e a chave especial
  `quartos: 5` (5+ quartos).

## Log de execução — `npm test`

```
$ npx jest --colors=false

PASS tests/prever.test.js
  calcularPrecoImovel — cenários principais
    ✓ calcula corretamente uma venda de apartamento em São Paulo, sem amenidades (2 ms)
    ✓ aplica divisor de aluguel (÷120) sobre o valor de venda equivalente (1 ms)
    ✓ faixa de preço tem variação de ±15% em torno do valor estimado (1 ms)
    ✓ soma corretamente o bônus de múltiplas amenidades
    ✓ valida todas as combinações de cidade x tipo presentes na tabela de preços (18 ms)
  calcularPrecoImovel — casos de borda
    ✓ retorna null e alerta o usuário para cidade inexistente (1 ms)
    ✓ retorna null para tipo de imóvel inexistente em uma cidade válida
    ✓ área igual a 0 resulta em preço total igual a 0, sem lançar erro (1 ms)
    ✓ amenidade desconhecida é ignorada no cálculo do bônus (não quebra e não altera preço)
    ✓ quartos "5" (chave string na tabela) é interpretado corretamente (2 ms)
  formatarMoeda
    ✓ formata valores numéricos como moeda brasileira (BRL) (24 ms)
    ✓ formata zero corretamente

Test Suites: 1 passed, 1 total
Tests:       12 passed, 12 total
Snapshots:   0 total
Time:        0.962 s
Ran all test suites.
```

## Log de execução — `npm run test:coverage`

```
PASS tests/prever.test.js
  (mesmos 12 testes, todos ✓)

-----------|---------|----------|---------|---------|---------------------
File       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------|---------|----------|---------|---------|---------------------
All files  |   37.93 |       44 |   23.07 |   38.37 |
 prever.js |   37.93 |       44 |   23.07 |   38.37 | 155-279,289-292,298
-----------|---------|----------|---------|---------|---------------------

Test Suites: 1 passed, 1 total
Tests:       12 passed, 12 total
Time:        1.13 s
```

**Observação sobre a cobertura:** as linhas não cobertas (155–279, 289–292,
298) correspondem aos manipuladores de evento de DOM (submit do formulário,
`exibirResultado`, `IntersectionObserver` de animação de scroll), que exigem
um navegador real (ou testes E2E com Playwright/Cypress) para serem
exercitados — ver `docs/SDD.md`, seção 7 ("Refinamento por Feedback"), que
registra isso como próximo passo. A lógica de negócio pura (o motor de
cálculo, que concentra as regras de precificação) está 100% coberta pelos
casos principais e de borda listados acima.

## Como reproduzir

```bash
# Opção 1 — local
npm install
npm test
npm run test:coverage   # opcional, com relatório de cobertura

# Opção 2 — ambiente padronizado via Docker (recomendado para a entrega)
docker compose run test
```
