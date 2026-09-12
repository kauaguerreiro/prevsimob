# Guia de Contribuição — PrevsImob

## Estrutura de branches

- `main` — sempre estável e "deployável". **Proibido commit direto.**
- `develop` — branch de integração das features prontas para a próxima entrega.
- `feature/<descricao-curta>` — uma branch por tarefa/issue, criada a partir
  de `develop` (ex.: `feature/simulador-precos`, `feature/harness-testes`).

Fluxo básico:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/minha-tarefa

# ... commits ...

git push origin feature/minha-tarefa
# Abrir Pull Request: feature/minha-tarefa -> develop
```

Somente `develop` é promovida para `main` via Pull Request revisado, tipicamente
ao final de uma sprint/entrega.

## Pull Requests

- Toda PR deve referenciar a Issue correspondente (ex.: `Closes #12`).
- É obrigatório pelo menos **1 aprovação de outro integrante** antes do merge.
- Use o checklist do template de PR (`.github/PULL_REQUEST_TEMPLATE.md`).
- Rode `npm test` localmente (ou `docker compose run test`) antes de abrir a PR.

## Issues / GitHub Projects

- Toda tarefa da sprint deve virar uma Issue, usando os templates em
  `.github/ISSUE_TEMPLATE/`.
- Issues devem ser adicionadas ao quadro do GitHub Projects da equipe,
  com status (`A fazer` / `Em progresso` / `Em revisão` / `Concluído`) e,
  quando aplicável, responsável atribuído.
- Tarefas grandes devem ser decompostas em subtarefas independentes
  (ex.: "Simulador de preços" → "modelar tabela de preços", "criar
  formulário", "implementar cálculo", "estilizar página", "testar cálculo").

## Commits

- Mensagens no imperativo e em português, descrevendo o que a alteração faz
  (ex.: `Adiciona testes de borda para cidade inválida`).
- Evite commits genéricos como "ajustes" ou "fix"; prefira granularidade que
  facilite o code review.
