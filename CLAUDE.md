# Contexto para Claude Code — Projeto PrevsImob

> Este arquivo é lido automaticamente por agentes compatíveis (ex.: Claude Code)
> ao iniciar uma sessão neste repositório. As regras completas de orquestração
> de agentes e fluxo SDD estão em `.cursorrules` (mesmo conteúdo, mantido em
> ambos os arquivos para compatibilidade com diferentes ferramentas).

## Resumo rápido
- Projeto: site imobiliário estático + simulador de preços "Prever Imóvel".
- Especificação técnica: `docs/SDD.md`.
- Decisões de arquitetura: `docs/ADR/`.
- Testes: `tests/prever.test.js` (`npm test`).
- Ambiente padronizado: `Dockerfile` + `docker-compose.yml`.
- Regras de fluxo de trabalho (branches, PRs): `CONTRIBUTING.md` e `.cursorrules`.

## Registro de uso do agente nesta entrega
Ver `docs/ADR/0003-uso-de-agentes-de-ia.md` para o registro de como um agente
de IA foi utilizado na criação/organização deste pacote de entrega (SDD,
harness de testes, Docker e templates de governança).
