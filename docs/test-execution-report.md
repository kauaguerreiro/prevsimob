# Relatório de Execução do Test Harness — PrevsImob

## Ambiente de execução

- Node.js (imagem `node:20-alpine` via Docker, ou Node local ≥ 18)
- Runner: Jest 29 (`testEnvironment: jsdom`)
- Comando: `npm install && npm test`
- Alternativa 100% containerizada: `docker compose run test`
- Última execução: 17/10/2026 — **25/25 testes aprovados (100%)**, 2 suítes

## Escopo coberto

As suítes cobrem a função de cálculo do simulador (`calcularPrecoImovel`), a
validação do contrato de entrada (`validarDadosImovel`) e a formatação monetária
(`formatarMoeda`), conforme `docs/SDD.md`:

- **`tests/prever.test.js` (12 testes, entrega anterior):** cenários principais
  (venda, aluguel ÷120, faixa ±15%, bônus de amenidades, varredura cidade × tipo)
  e casos de borda (cidade/tipo inexistentes, área 0, amenidade desconhecida,
  `quartos: 5`).
- **`tests/prever.validacao.test.js` (13 testes, novo):** cobre os 6 achados da
  auditoria final (ADR 0004): idade/conservação inválidas, quartos/banheiros/
  garagem fora da faixa, área negativa/NaN/texto/infinita, amenidades ausente ou
  inválida, finalidade fora do contrato, e mensagens específicas por campo.

## Log de execução — `npm test`

```
$ npx jest --colors=false

PASS tests/prever.test.js
  calcularPrecoImovel — cenários principais
    ✓ calcula corretamente uma venda de apartamento em São Paulo, sem amenidades (2 ms)
    ✓ aplica divisor de aluguel (÷120) sobre o valor de venda equivalente (1 ms)
    ✓ faixa de preço tem variação de ±15% em torno do valor estimado (1 ms)
    ✓ soma corretamente o bônus de múltiplas amenidades
    ✓ valida todas as combinações de cidade x tipo presentes na tabela de preços (7 ms)
  calcularPrecoImovel — casos de borda
    ✓ retorna null e alerta o usuário para cidade inexistente (1 ms)
    ✓ retorna null para tipo de imóvel inexistente em uma cidade válida
    ✓ área igual a 0 resulta em preço total igual a 0, sem lançar erro (1 ms)
    ✓ amenidade desconhecida é ignorada no cálculo do bônus (não quebra e não altera preço)
    ✓ quartos "5" (chave string na tabela) é interpretado corretamente
  formatarMoeda
    ✓ formata valores numéricos como moeda brasileira (BRL) (20 ms)
    ✓ formata zero corretamente (1 ms)

PASS tests/prever.validacao.test.js
  validação de entradas — achados da auditoria (SDD RF08 / regra 8)
    ✓ dados válidos de referência continuam retornando resultado numérico (1 ms)
    ✓ achado 1: idade inválida retorna null com mensagem específica (antes: NaN) (1 ms)
    ✓ achado 1: conservação inválida retorna null (antes: NaN) (1 ms)
    ✓ achado 1: chaves herdadas do protótipo ("constructor") não passam na validação (1 ms)
    ✓ achado 2: quartos fora da faixa (6) retorna null (antes: NaN)
    ✓ achado 2: banheiros e garagem fora da faixa retornam null
    ✓ achado 3: área negativa retorna null (antes: preço negativo) (1 ms)
    ✓ achado 3: área NaN, texto ou infinita retorna null
    ✓ achado 3: área 0 continua aceita e resulta em preço 0 (regra do SDD preservada)
    ✓ achado 4: amenidades ausentes são tratadas como lista vazia (antes: TypeError)
    ✓ achado 4: amenidades que não é lista retorna null
    ✓ achado 5: finalidade "compra" (valor antigo do formulário) não é mais aceita; "venda" e "aluguel" sim (1 ms)
    ✓ achado 6: cada campo inválido gera mensagem específica, não a genérica (2 ms)

Test Suites: 2 passed, 2 total
Tests:       25 passed, 25 total
Snapshots:   0 total
Time:        1.204 s
Ran all test suites.
```

## Log de execução — `npm run test:coverage`

```
-----------|---------|----------|---------|---------|---------------------
File       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s   
-----------|---------|----------|---------|---------|---------------------
All files  |   53.04 |    74.07 |   33.33 |   48.54 |                     
 prever.js |   53.04 |    74.07 |   33.33 |   48.54 | 184-308,318-321,327 
-----------|---------|----------|---------|---------|---------------------
Test Suites: 2 passed, 2 total
Tests:       25 passed, 25 total
Snapshots:   0 total
Time:        0.838 s, estimated 1 s
Ran all test suites.
```

**Observação sobre a cobertura:** a cobertura de instruções subiu de 37,93% para
cerca de 53% (ramos: de 44% para 74%). As linhas não cobertas correspondem aos
manipuladores de evento de DOM (submit do formulário, `exibirResultado`,
`IntersectionObserver`), que exigem navegador real ou testes E2E
(Playwright/Cypress); isso permanece como próximo passo (SDD, seção 7). A lógica
de negócio pura (cálculo e validação) está coberta pelos casos principais, de
borda e de entrada inválida.

## Histórico de correções (erro lógico → correção → teste)

| # | Erro identificado | Correção | Teste |
|---|---|---|---|
| 1 | idade/conservação inválidas geravam `NaN` | validação por `hasOwnProperty` | achado 1 (3 testes) |
| 2 | quartos/banheiros/garagem fora da faixa geravam `NaN` | validação de chave | achado 2 (2 testes) |
| 3 | área negativa gerava preço negativo | área deve ser finita e ≥ 0 | achado 3 (3 testes) |
| 4 | `amenidades` ausente lançava `TypeError` | padrão `[]`; não-lista é inválida | achado 4 (2 testes) |
| 5 | formulário enviava `finalidade = "compra"` (fora do SDD) | `option` passa a enviar `venda`; função só aceita venda/aluguel | achado 5 (1 teste) |
| 6 | mensagem de erro genérica | mensagem específica por campo | achado 6 (1 teste) |

## Como reproduzir

```bash
# Opção 1 — local
npm install
npm test
npm run test:coverage   # opcional, com relatório de cobertura

# Opção 2 — ambiente padronizado via Docker (recomendado para a entrega)
docker compose run test
```
