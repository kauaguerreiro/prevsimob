# ADR 0003 — Uso de agente de IA no fluxo de desenvolvimento (SDD)

**Status:** Aceita

## Contexto
O projeto adota Spec-Driven Development (SDD) e parte do fluxo de trabalho é
apoiado por uma ferramenta de geração/auxílio de código com suporte a
arquivos de contexto versionados no repositório (padrão `.cursorrules` /
`CLAUDE.md`).

## Decisão
Utilizar Claude Code como agente de apoio ao desenvolvimento nas seguintes
atividades:
- leitura e diagnóstico do estado atual do repositório frente aos requisitos
  da disciplina;
- redação da especificação técnica (`docs/SDD.md`) a partir da engenharia
  reversa das regras de negócio já implementadas em `prever.js`;
- criação do harness de testes automatizados (`tests/`, `jest.config.js`)
  cobrindo cenários principais e casos de borda do cálculo de preços;
- criação dos artefatos de padronização de ambiente (`Dockerfile`,
  `docker-compose.yml`) e dos templates de governança (`.github/`).

As regras que o agente deve seguir (fluxo SDD, o que pode/não pode alterar
sem confirmação humana, comandos permitidos) estão registradas em
`.cursorrules` e `CLAUDE.md`.

## Consequências
- Positivo: rastreabilidade de como e onde a IA contribuiu para a entrega,
  atendendo ao requisito de "Orquestração de Agentes" e "Contexto & Regras".
- Positivo: qualquer novo membro da equipe (ou o próprio agente, em uma nova
  sessão) tem acesso ao mesmo contexto de regras, evitando decisões
  inconsistentes entre sessões diferentes.
- Responsabilidade da equipe: revisar e aprovar via Pull Request qualquer
  código gerado com apoio de IA antes do merge em `develop`/`main`, conforme
  o fluxo descrito em `CONTRIBUTING.md`.
