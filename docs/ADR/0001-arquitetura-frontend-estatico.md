# ADR 0001 — Arquitetura como site estático (sem backend/framework)

**Status:** Aceita

## Contexto
O escopo do projeto é uma demonstração de site imobiliário com um simulador
de preços. Não há requisito de persistência multiusuário, autenticação real
ou integração com base de dados de transações reais nesta fase.

## Decisão
Manter o projeto como um conjunto de páginas HTML estáticas, com CSS e
JavaScript puro (sem framework de frontend e sem backend), usando
`localStorage` para favoritos.

## Consequências
- Positivo: zero dependências de build, fácil de rodar (`index.html` direto
  no navegador) e de padronizar via Docker/Nginx.
- Positivo: lógica de negócio do simulador pode ser isolada em funções puras
  e testada com Jest sem subir um servidor.
- Negativo: não há persistência real de dados entre dispositivos/usuários;
  os dados de imóveis e preços são estáticos (hardcoded em `app.js`/`prever.js`).
- Ação futura: caso o projeto evolua para múltiplos usuários reais, avaliar
  migração para uma arquitetura com backend/API (ver README, seção "Próximos
  passos sugeridos").
