# ADR 0005 — Fechamento da release v1.0.0: testes de integração de DOM, limites de cobertura e CI

**Status:** Aceita

## Contexto
Na preparação da release final, uma auditoria do repositório mostrou:

1. O merge do PR #12 (`feature/relatorio-testes`) removeu `docs/SDD.md` e
   `docs/ADR/` da `main`: a branch foi criada antes desses arquivos existirem e
   o merge os tratou como exclusão. README e `CLAUDE.md` apontavam para arquivos
   inexistentes.
2. O harness cobria só as funções puras: 53% das linhas de `prever.js` e 0% de
   `app.js`. Os manipuladores de DOM eram verificados apenas manualmente.
3. Sem testes de interface, três defeitos do `app.js` passaram despercebidos:
   `TypeError` em todas as páginas sem `#properties`; botão "Ver detalhes" com
   seletor que não encontra nenhum elemento; e dois handlers concorrentes no
   formulário de busca (filtrar **e** redirecionar).
4. O README anunciava favoritos (★), que não existem no código.

## Decisão
- Restaurar SDD e ADRs a partir do commit `239e237` e reescrever o SDD como
  **As-Built** da v1.0.0.
- Adicionar testes de integração com **jsdom carregando o HTML real das
  páginas** (`tests/prever.dom.test.js` e `tests/app.test.js`), sem alterar o
  código de produção além de uma exportação condicional em `app.js` (mesmo
  padrão já usado em `prever.js`).
- Corrigir os três defeitos com mudanças mínimas, cada um coberto por teste.
- Retirar o RF03 (favoritos) do escopo da v1.0.0 em vez de implementá-lo às
  pressas no fechamento.
- Fixar limites de cobertura no `jest.config.js` (`prever.js` = 100%;
  global ≥ 95% instruções/funções/linhas, ≥ 85% ramos) e rodar o harness em
  GitHub Actions a cada push/PR.

## Alternativas consideradas
- **Playwright/Cypress (E2E em navegador real):** mais fiel, porém exige
  navegador no container e aumenta o tempo do CI; jsdom cobre a lógica de
  eventos com o HTML real. Mantido como evolução futura.
- **Implementar favoritos:** descartado no fechamento por risco de introduzir
  defeitos sem ciclo completo de especificação/revisão.

## Consequências
- Positivo: 64 testes (antes 25), 100% de linhas e funções; defeitos de
  interface passam a ser detectados automaticamente.
- Positivo: PRs que reduzam a cobertura do motor de cálculo falham no CI.
- Negativo: jsdom não valida layout/CSS nem navegação real; isso segue manual.
- Lição de governança: branches de longa duração devem ser atualizadas a
  partir de `develop` antes do PR, e a revisão deve olhar o diff de arquivos
  removidos — a exclusão do SDD passou por um PR aprovado.
