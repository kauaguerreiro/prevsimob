# Changelog — PrevsImob

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.0.0] — Release final

### Adicionado
- Testes de integração de interface: `tests/prever.dom.test.js` (13) e `tests/app.test.js` (26). Total: **64 testes, 4 suítes**.
- Limites mínimos de cobertura no `jest.config.js` (`prever.js` 100%).
- CI no GitHub Actions (`.github/workflows/ci.yml`): testes + cobertura + build Docker.
- Serviço `coverage` no `docker-compose.yml`; `.env.example` (porta configurável via `PORT`).
- `package-lock.json` versionado para instalações reproduzíveis (`npm ci`).
- ADR 0005 e este CHANGELOG.

### Corrigido
- `app.js`: `TypeError` ao abrir qualquer página sem listagem dinâmica (8 de 9 páginas), que interrompia rodapé, cabeçalho fixo, rolagem suave e animações.
- `app.js`: botão "Ver detalhes" dos cards de `index.html` não respondia (seletor incorreto).
- `app.js`: busca em `index.html` filtrava e em seguida redirecionava para `propriedades.html` (handler duplicado removido).
- `docs/SDD.md` e `docs/ADR/0001–0004` restaurados na `main` (removidos por engano no merge do PR #12).

### Alterado
- `docs/SDD.md` reescrito como **As-Built v1.0.0** (arquitetura, contratos, dados de negócio, rastreabilidade RF → testes).
- `docker-compose.yml`: remove o campo obsoleto `version`; testes usam `npm ci` e perfil `test`.
- `.dockerignore`: a imagem Nginx recebe apenas os arquivos do site.

### Removido
- `TESTE_PREVER.html` e `IMPLEMENTACAO_PREVER.md` (arquivos temporários/desatualizados).
- RF03 (favoritos) retirado do escopo — não estava implementado.

## [0.2.0] — Entrega 2
- Validação de entradas do motor de cálculo (RF08, ADR 0004); 25 testes.

## [0.1.0] — Entrega 1
- SDD inicial, ADRs 0001–0003, Docker, harness com 12 testes e governança do repositório.
