# Especificação Técnica — PrevsImob (SDD **As-Built** · v1.0.0)

> **Status:** As-Built — reflete exatamente o que foi entregue na release
> `v1.0.0`. Toda divergência entre a especificação original e o código final
> foi resolvida (corrigindo o código) ou registrada (ajustando o escopo) na
> seção 10, "Registro de refinamentos".

| Item | Valor |
|------|-------|
| Versão do produto | 1.0.0 (`package.json`, tag Git `v1.0.0`) |
| Repositório | https://github.com/kauaguerreiro/prevsimob |
| Tipo de aplicação | Site estático multipágina (HTML5 + CSS3 + JavaScript ES6, sem framework e sem backend) |
| Execução | Navegador (arquivo local), `npm start` (http-server) ou Docker (Nginx 1.27-alpine) |
| Test harness | Jest 29 + jsdom — 4 suítes, 64 testes, 100% aprovados |
| Cobertura | 100% linhas / 100% funções / 99,58% instruções / 93,75% ramos (`prever.js` 100% em todos os critérios) |

## 1. Problema

Construir um site imobiliário de demonstração que, além de listar imóveis
(busca, filtros, ordenação e página de detalhes), ofereça um **simulador de
previsão de preços** ("Prever Imóvel"): dado um conjunto de características de
um imóvel, o sistema estima um valor de mercado (venda ou aluguel), uma faixa
de variação e o preço por m², sem depender de backend ou base de dados externa.

## 2. Arquitetura entregue

```
                ┌──────────────────────── Navegador ────────────────────────┐
                │                                                            │
  index.html ───┤  app.js  (todas as páginas)                                │
  propriedades  │   ├─ dados: properties[] (listagem) · imoveis[] (detalhes) │
  detalhes.html │   ├─ listagem: renderProperties / applyFilters / getFilters│
  servicos.html │   ├─ detalhes: verDetalhes → localStorage → carregarDetalhes│
  sobre.html    │   ├─ UI comum: ano do rodapé, cabeçalho fixo, rolagem,     │
  contato.html  │   │            animação .reveal                            │
  login.html    │   └─ formulários demonstrativos: contato, login            │
  cadastro.html │                                                            │
                │  prever.js (somente prever.html)                           │
  prever.html ──┤   ├─ dados: tabelaPrecos · fatoresAjuste · bonusAmenidades │
                │   ├─ núcleo puro: validarDadosImovel → calcularPrecoImovel │
                │   │              formatarMoeda                             │
                │   └─ interface: submit do formulário → exibirResultado     │
                │                                                            │
                │  style.css (tema azul + teal, responsivo)                  │
                │  localStorage: imovelSelecionado · userLogado              │
                └────────────────────────────────────────────────────────────┘
     Empacotamento: Dockerfile (Nginx serve os arquivos estáticos, porta 80)
     Testes: Node 20 + Jest/jsdom carregam o HTML real das páginas e os scripts
```

Decisões de arquitetura: ver `docs/ADR/0001` a `0005`.

## 3. Requisitos Funcionais (RF) — situação na v1.0.0

| ID | Descrição | Situação | Evidência (testes) |
|----|-----------|----------|--------------------|
| RF01 | Navegação entre as páginas (Início, Serviços, Propriedades, Prever Imóvel, Sobre, Contato) por menu comum; todas as páginas inicializam sem erro. | ✅ Entregue | `app.test.js` › páginas sem listagem dinâmica; links de navegação |
| RF02 | Buscar, filtrar (tipo, finalidade) e ordenar (preço ↑/↓) imóveis na listagem dinâmica de `index.html`, sem recarregar a página. | ✅ Entregue | `app.test.js` › index.html — listagem, busca, filtros e ordenação |
| RF03 | Favoritar imóvel com persistência em `localStorage`. | ⛔ **Não entregue** — retirado do escopo da v1.0.0 (ver seção 10) | — |
| RF04 | Formulário de simulação em `prever.html` com cidade, tipo, finalidade, área, quartos, banheiros, garagem, idade, conservação e amenidades. | ✅ Entregue | `prever.dom.test.js` › inicialização; fluxo principal |
| RF05 | Exibir valor estimado, preço por m², faixa mínima/máxima (±15%) e indicador visual de posição na faixa. | ✅ Entregue | `prever.test.js`; `prever.dom.test.js` › fluxo principal |
| RF06 | Cidade ou tipo inexistentes → mensagem de erro e nenhum resultado exibido. | ✅ Entregue | `prever.test.js` › casos de borda |
| RF07 | Reiniciar a simulação ("Nova simulação"), fechar o resultado ou ir para a página de contato ("Consultar especialista"). | ✅ Entregue | `prever.dom.test.js` › ações pós-resultado |
| RF08 | O motor de cálculo valida todos os campos; valor fora do contrato → `null` + mensagem específica (nunca `NaN`, preço negativo ou exceção). | ✅ Entregue | `prever.validacao.test.js`; `prever.dom.test.js` › validações |
| RF09 | Ver detalhes de um imóvel: em `propriedades.html`, "Ver Detalhes" salva o imóvel e abre `detalhes.html`; em `index.html`, o botão do card exibe um resumo do imóvel. | ✅ Entregue (documentado nesta versão) | `app.test.js` › detalhes do imóvel; botão "Ver detalhes" |
| RF10 | Formulários de contato e login demonstrativos (confirmação via `alert`, sem envio real; login guarda o e-mail em `localStorage`). | ✅ Entregue (demonstrativo) | `app.test.js` › formulários demonstrativos |

## 4. Requisitos Não Funcionais (RNF)

| ID | Descrição | Como foi atendido |
|----|-----------|-------------------|
| RNF01 | Funcionar inteiramente no navegador, sem backend. | Site estático; dados em `app.js`/`prever.js`; `localStorage` para estado local. |
| RNF02 | Ambiente reprodutível via Docker. | `docker compose up --build` (site) e `docker compose run --rm test` / `coverage` (harness), com `npm ci` sobre `package-lock.json`. |
| RNF03 | Lógica de cálculo testável isoladamente do DOM. | `validarDadosImovel`, `calcularPrecoImovel`, `formatarMoeda` são funções puras, exportadas por `module.exports` condicional. |
| RNF04 | Layout responsivo. | `style.css` com media queries (validação visual manual). |
| RNF05 | Textos e moeda em pt-BR. | `Intl.NumberFormat('pt-BR', { currency: 'BRL' })`; testado em `prever.test.js`. |
| RNF06 | Mudança em tabelas/fatores exige ADR + teste antes do merge. | Regra em `.cursorrules`, `CLAUDE.md`, `CONTRIBUTING.md` e ADR 0002. |
| RNF07 | Cobertura mínima garantida automaticamente. | `coverageThreshold` no `jest.config.js`: `prever.js` 100% em todos os critérios; global ≥ 95% instruções/funções/linhas e ≥ 85% ramos. Abaixo disso, `npm run test:coverage` falha. |
| RNF08 | Integração contínua. | `.github/workflows/ci.yml`: em todo push/PR para `main`/`develop` roda o harness com cobertura e o build da imagem Docker. |

## 5. Regras de Negócio (motor de cálculo — `prever.js`)

1. Cada combinação **cidade × tipo** possui preço-base por m² e multiplicador de
   localidade (`tabelaPrecos`). Cidades: `sao-paulo`, `campinas`, `ibirapuera`,
   `itatiba`, `outras`. Tipos: `apartamento`, `casa`, `loft`, `penthouse`,
   `chacara`, `comercial` (30 combinações).
2. O preço por m² = `base × multiplicador`, ajustado multiplicativamente por
   idade, conservação, quartos, banheiros e garagem (valores na seção 6).
3. Amenidades somam um bônus percentual **aditivo** (somado antes de aplicar):
   `precoPorM2 × (1 + Σ bônus)`. Amenidade desconhecida vale 0.
4. Preço total = preço por m² ajustado × área.
5. Finalidade **aluguel**: preço total ÷ **120** (valor mensal aproximado).
6. Faixa exibida: **±15%** (`valorMinimo = total × 0,85`; `valorMaximo = total × 1,15`).
7. Cidade ou tipo inexistentes → retorna `null` e alerta o usuário.
8. Validação de entrada (RF08) — retorna `null` e alerta com mensagem específica quando:
   `finalidade` ∉ {`venda`, `aluguel`}; `area` não é número finito ≥ 0;
   `idade`, `conservacao`, `quartos`, `banheiros` ou `garagem` não existem em
   `fatoresAjuste`; `amenidades` existe e não é lista. `amenidades` omitida =
   lista vazia. Chaves herdadas do protótipo (ex.: `"constructor"`) são inválidas.
9. **Validação da interface (camada adicional, `prever.html`):** antes de chamar o
   motor, o formulário exige cidade, tipo, área, quartos, banheiros, idade e
   conservação preenchidos ("Por favor, preencha todos os campos obrigatórios.").
   Por isso, **área 0 é aceita pelo motor mas barrada pela interface**; o campo
   HTML também declara `min="10"`, `max="10000"`, `step="0.1"`. A finalidade não é
   checada pela interface e, se vazia, é barrada pelo motor (regra 8).

## 6. Dados de negócio (valores exatos da v1.0.0)

### 6.1 `tabelaPrecos` — base (R$/m²) × multiplicador

| Cidade | apartamento | casa | loft | penthouse | chacara | comercial |
|--------|-------------|------|------|-----------|---------|-----------|
| sao-paulo | 8000 × 1,20 | 12000 × 1,10 | 9500 × 1,15 | 15000 × 1,30 | 10000 × 0,90 | 11000 × 1,00 |
| campinas | 5000 × 1,00 | 7500 × 0,95 | 6000 × 1,05 | 9000 × 1,10 | 6500 × 0,85 | 6500 × 0,90 |
| ibirapuera | 12000 × 1,35 | 16000 × 1,25 | 13000 × 1,30 | 20000 × 1,40 | 14000 × 1,15 | 15000 × 1,20 |
| itatiba | 4500 × 0,95 | 6800 × 0,90 | 5500 × 1,00 | 8500 × 1,05 | 12000 × 1,30 | 6000 × 0,85 |
| outras | 5500 × 1,00 | 8000 × 0,95 | 6500 × 1,05 | 10000 × 1,15 | 7500 × 0,90 | 7000 × 0,95 |

### 6.2 `fatoresAjuste`

| Fator | Valores |
|-------|---------|
| idade | novo 1,15 · recente 1,05 · intermediario 1,00 · velho 0,85 |
| conservacao | excelente 1,20 · bom 1,05 · regular 1,00 · ruim 0,75 |
| quartos | 1 → 0,80 · 2 → 0,95 · 3 → 1,00 · 4 → 1,10 · 5 (5+) → 1,20 |
| banheiros | 1 → 0,85 · 2 → 1,00 · 3 → 1,10 · 4 (4+) → 1,20 |
| garagem | 0 → 0,90 · 1 → 1,00 · 2 → 1,10 · 3 → 1,15 · 4 (4+) → 1,25 |

### 6.3 `bonusAmenidades`

piscina +8% · academia +5% · churrasqueira +4% · area_lazer +6% · smart_home +10% · seguranca_24h +7%

### 6.4 Exemplo de referência (usado nos testes)

São Paulo, apartamento, venda, 80 m², 3 quartos, 2 banheiros, 1 vaga, intermediário, regular,
sem amenidades → 8000 × 1,2 = **R$ 9.600,00/m²** → total **R$ 768.000,00**;
faixa R$ 652.800,00 – R$ 883.200,00. Com piscina + smart home (×1,18): **R$ 906.240,00**.
Como aluguel: **R$ 6.400,00/mês**.

## 7. Contratos (API JavaScript)

### 7.1 `prever.js`

```txt
validarDadosImovel(dados) → string | null
  Retorna a mensagem de erro do primeiro campo inválido, na ordem:
  dados ausentes → cidade → tipoImovel → finalidade → area → idade →
  conservacao → quartos → banheiros → garagem → amenidades. null = válido.

calcularPrecoImovel(dados) → Resultado | null
  dados = {
    cidade: string,                 // chave de tabelaPrecos
    tipoImovel: string,             // chave de tabelaPrecos[cidade]
    finalidade: "venda" | "aluguel",
    area: number,                   // finito, >= 0
    quartos: 1..5 (number|string),
    banheiros: 1..4 (number|string),
    garagem: 0..4 (number|string),
    idade: "novo" | "recente" | "intermediario" | "velho",
    conservacao: "excelente" | "bom" | "regular" | "ruim",
    amenidades?: string[]           // padrão []
  }
  Resultado = { precoPorM2, precoTotal, valorMinimo, valorMaximo, area }  // números
  Erro: null + alert(mensagem de validarDadosImovel)

formatarMoeda(valor: number) → string        // ex.: "R$ 768.000,00"
```

Mensagens de erro (exatas): "Dados do imóvel não informados." · "Cidade inválida." ·
"Tipo de imóvel inválido para a localização selecionada." · "Finalidade inválida (use
venda ou aluguel)." · "Área inválida: informe um número maior ou igual a zero." ·
"Idade do imóvel inválida." · "Estado de conservação inválido." · "Número de quartos
inválido (use de 1 a 5)." · "Número de banheiros inválido (use de 1 a 4)." · "Número de
vagas de garagem inválido (use de 0 a 4)." · "Lista de amenidades inválida."

Funções de interface: `exibirResultado(calculo, dadosOriginais)` preenche
`#valorEstimado`, `#valorMinimo`, `#valorMaximo`, `#detalheCidade`, `#detalheTipo`,
`#detalheArea`, `#detalhePrecoPorM2` e posiciona `#indicadorPreco` (sempre 50%, pois a
faixa é simétrica).

### 7.2 `app.js`

```txt
renderProperties(lista)   // desenha cards em #properties; sem #properties, não faz nada
getFilters() → { q, type, purpose, sort }   // lê #q, #typeFilter, #purposeFilter, #sort
applyFilters()            // busca textual (título+cidade+descrição) → tipo → finalidade → ordenação
openModal(imovel)         // resumo do imóvel via alert (ignora imóvel inexistente)
formatCurrency(valor)     // BRL para valores >= 1000; abaixo disso devolve o número
debounce(fn, ms)          // busca rápida em #q usa 300 ms
verDetalhes(id)           // salva imoveis[id] em localStorage.imovelSelecionado → detalhes.html?id=
carregarDetalhes()        // lê localStorage e preenche #detalhes-container; sem dados → propriedades.html
init()                    // listagem, filtros, ano do rodapé, cabeçalho fixo (> 40 px), rolagem, .reveal
```

### 7.3 Chaves de `localStorage`

| Chave | Escrita por | Conteúdo |
|-------|-------------|----------|
| `imovelSelecionado` | `verDetalhes` | JSON do imóvel escolhido em `propriedades.html` |
| `userLogado` | formulário de login | e-mail digitado (demonstrativo, sem autenticação) |

## 8. Decomposição em unidades e estratégia de testes

| Componente | Tipo de teste | Arquivo | Testes |
|------------|---------------|---------|--------|
| Motor de cálculo + formatação | Unitário | `tests/prever.test.js` | 12 |
| Validação de entradas (RF08 / ADR 0004) | Unitário | `tests/prever.validacao.test.js` | 13 |
| Interface do simulador (`prever.html` real no jsdom) | Integração | `tests/prever.dom.test.js` | 13 |
| Listagem, detalhes, formulários e UI comum (8 páginas reais) | Integração | `tests/app.test.js` | 26 |
| **Total** | | **4 suítes** | **64** |

Os testes de integração carregam o HTML real de cada página, executam o
script de produção sem alterações (apenas a exportação condicional) e
disparam eventos reais (`submit`, `click`, `change`, `input`, `scroll`).
APIs que o jsdom não implementa (`IntersectionObserver`, `scrollIntoView`,
`alert`, navegação) são simuladas em `tests/setup.js` ou no próprio teste.

## 9. Limitações conhecidas (v1.0.0)

1. Preços do simulador são **paramétricos/ilustrativos**, não derivados de dados reais de mercado (ADR 0002).
2. Listagem de `index.html` (`properties`, 9 itens) e de `propriedades.html` (6 cards estáticos + `imoveis`) usam bases de exemplo distintas.
3. "Ver detalhes" em `index.html` mostra o resumo em `alert` (não abre `detalhes.html`).
4. Contato, login e cadastro são **demonstrativos**: não há envio de e-mail, autenticação nem armazenamento seguro de senha.
5. Validação visual de responsividade (RNF04) é manual; não há testes E2E em navegador real.
6. Favoritos (RF03) não foram implementados.

## 10. Registro de refinamentos

| Data | Ajuste | Motivo |
|------|--------|--------|
| Entrega 1 | Regras de negócio 1–7 documentadas a partir do `prever.js` existente. | O simulador existia sem especificação formal. |
| Entrega 1 | Separação entre lógica pura e manipulação de DOM. | Viabilizar testes automatizados (RNF03). |
| 17/10/2026 | RF08 e regra 8 (validação de entradas); `finalidade` = `venda`/`aluguel`; `area` ≥ 0; `amenidades` opcional. | Auditoria encontrou `NaN`, preço negativo, exceção e valor `compra` fora do contrato. ADR 0004. |
| Release v1.0.0 | **SDD e ADRs restaurados na `main`.** | O merge do PR #12 (`feature/relatorio-testes`, criada antes do SDD existir) removeu `docs/SDD.md` e `docs/ADR/` da `main`. ADR 0005. |
| Release v1.0.0 | **Correção:** `renderProperties` não faz nada quando a página não tem `#properties`. | `init()` lançava `TypeError` em 8 páginas, interrompendo ano do rodapé, cabeçalho fixo, rolagem suave e animações. |
| Release v1.0.0 | **Correção:** botão "Ver detalhes" dos cards de `index.html` passa a usar o seletor `.card-button[data-id]`. | O seletor antigo (`.card .btn`) não encontrava nenhum botão; o clique não tinha efeito. |
| Release v1.0.0 | **Remoção de código conflitante:** handler duplicado do `#searchForm` (alert "Buscando por…" + redirecionamento para `propriedades.html`). | Coexistia com o filtro de `init()`: a busca filtrava e, em seguida, saía da página, anulando o RF02. |
| Release v1.0.0 | **RF03 (favoritos) retirado do escopo** e removido do README. | Não havia implementação no código; o As-Built deve refletir apenas o entregue. Mantido como item de backlog. |
| Release v1.0.0 | **RF09 e RF10 documentados**; regra 9 (validação da interface) explicitada. | Funcionalidades existiam no código, mas não constavam no SDD. |
| Release v1.0.0 | **Testes de integração** (`prever.dom.test.js`, `app.test.js`), **limites de cobertura** (RNF07) e **CI** (RNF08). | Cobertura anterior: 53% do `prever.js` e 0% do `app.js`; manipuladores de DOM eram validados só manualmente. |
| Release v1.0.0 | Higienização: removidos `TESTE_PREVER.html` (página de rascunho com `console.log`) e `IMPLEMENTACAO_PREVER.md` (resumo desatualizado); `.dockerignore` passa a enviar à imagem apenas os arquivos do site; `.env.example` com `PORT`. | Critérios de limpeza da Entrega 3. |
