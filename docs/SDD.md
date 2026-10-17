# Especificação Técnica do Problema (SDD) — PrevsImob

## 1. Problema selecionado

Construir um site imobiliário de demonstração que, além de listar imóveis
(busca, filtros, favoritos), ofereça um **simulador de previsão de preços**
("Prever Imóvel"): dado um conjunto de características de um imóvel, o
sistema estima um valor de mercado (venda ou aluguel), uma faixa de variação
e o preço por m², sem depender de um backend ou base de dados externa.

## 2. Requisitos Funcionais (RF)

| ID    | Descrição |
|-------|-----------|
| RF01  | O usuário deve poder navegar entre as páginas do site (Início, Serviços, Propriedades, Prever Imóvel, Sobre, Contato) a partir de um menu comum. |
| RF02  | O usuário deve poder buscar, filtrar e ordenar imóveis listados em `index.html`/`propriedades.html`. |
| RF03  | O usuário deve poder favoritar um imóvel, persistindo a escolha em `localStorage`. |
| RF04  | O usuário deve poder preencher um formulário de simulação em `prever.html` com: cidade, tipo de imóvel, finalidade (venda/aluguel), área (m²), quartos, banheiros, vagas de garagem, idade do imóvel, estado de conservação e amenidades. |
| RF05  | Ao submeter o formulário, o sistema deve calcular e exibir: valor estimado, preço por m², faixa mínima e máxima (±15%) e um indicador visual de posicionamento dentro da faixa. |
| RF06  | Se a cidade ou o tipo de imóvel informados não existirem na tabela de preços, o sistema deve informar o erro ao usuário e não exibir um resultado. |
| RF07  | O usuário deve poder reiniciar a simulação ("Nova simulação") ou ser encaminhado à página de contato ("Consultar especialista"). |
| RF08  | O motor de cálculo deve validar todos os campos de entrada (cidade, tipo, finalidade, área, quartos, banheiros, garagem, idade, conservação e amenidades). Qualquer valor fora do contrato da seção 5 deve resultar em `null` e em uma mensagem de erro específica ao usuário, nunca em `NaN`, preço negativo ou exceção. |

## 3. Requisitos Não Funcionais (RNF)

| ID     | Descrição |
|--------|-----------|
| RNF01  | O site deve funcionar inteiramente no navegador (client-side), sem exigir instalação de backend para a demonstração. |
| RNF02  | O ambiente de execução deve ser reprodutível via Docker (`Dockerfile` + `docker-compose.yml`), sem depender de configuração manual da máquina do avaliador. |
| RNF03  | A lógica de cálculo de preços deve ser testável de forma automatizada e isolada da manipulação de DOM (função pura, testável via Jest/Node). |
| RNF04  | O layout deve ser responsivo (desktop, tablet e mobile). |
| RNF05  | Textos, mensagens e formatação monetária devem seguir o padrão pt-BR (R$). |
| RNF06  | Qualquer alteração na tabela de preços/fatores de ajuste deve ser rastreável (ADR) e coberta por teste automatizado antes do merge. |

## 4. Regras de Negócio

1. Cada combinação de **cidade × tipo de imóvel** possui um preço-base por m²
   e um multiplicador de localidade (`tabelaPrecos`).
2. O preço por m² é ajustado multiplicativamente por:
   - idade do imóvel (`novo`, `recente`, `intermediario`, `velho`);
   - estado de conservação (`excelente`, `bom`, `regular`, `ruim`);
   - número de quartos (1 a 5+);
   - número de banheiros (1 a 4+);
   - vagas de garagem (0 a 4+).
3. Cada amenidade selecionada (piscina, academia, churrasqueira, área de
   lazer, smart home, segurança 24h) soma um percentual de bônus sobre o
   preço por m² (bônus são somados antes de aplicar, não compostos entre si).
4. O preço total = preço por m² ajustado × área (m²).
5. Se a finalidade for **aluguel**, o preço total de venda é dividido por
   **120** para aproximar o valor mensal de locação.
6. A faixa de variação exibida ao usuário é sempre **±15%** sobre o valor
   estimado (`valorMinimo = total × 0.85`, `valorMaximo = total × 1.15`).
7. Se `cidade` ou `tipoImovel` não existirem na tabela de preços, a função de
   cálculo retorna `null` e o usuário é alertado — nenhum resultado numérico
   deve ser exibido nesse caso.
8. Validação de entrada (RF08): a função retorna `null` e alerta o usuário com
   mensagem específica quando: `finalidade` não for `"venda"` ou `"aluguel"`;
   `area` não for um número finito maior ou igual a 0; `idade`, `conservacao`,
   `quartos`, `banheiros` ou `garagem` não existirem em `fatoresAjuste`;
   ou `amenidades` não for uma lista. Se `amenidades` for omitida, é tratada
   como lista vazia. Chaves herdadas do protótipo de objetos (ex.:
   `"constructor"`) não são valores válidos.

## 5. Contratos de Entrada/Saída

### Entrada — `calcularPrecoImovel(dados)`

```txt
dados = {
  cidade: string,        // chave existente em tabelaPrecos (ex.: "sao-paulo")
  tipoImovel: string,    // chave existente na cidade (ex.: "apartamento")
  finalidade: "venda" | "aluguel",   // o formulário (prever.html) envia exatamente estes valores
  area: number,          // m², número finito >= 0 (0 é aceito e retorna 0; negativo é inválido)
  quartos: number|string,    // 1..5 (ou "5" para 5+)
  banheiros: number|string,  // 1..4
  garagem: number|string,    // 0..4
  idade: "novo" | "recente" | "intermediario" | "velho",
  conservacao: "excelente" | "bom" | "regular" | "ruim",
  amenidades: string[]   // opcional (padrão: []); subconjunto de: piscina, academia, churrasqueira,
                          // area_lazer, smart_home, seguranca_24h
}
```

### Saída (sucesso)

```txt
{
  precoPorM2: number,
  precoTotal: number,
  valorMinimo: number,  // precoTotal * 0.85
  valorMaximo: number,  // precoTotal * 1.15
  area: number
}
```

### Saída (erro)

`null`, acompanhado de um alerta ao usuário via `alert(...)` com mensagem
específica do campo inválido (ex.: "Idade do imóvel inválida."), quando algum
campo viola o contrato acima (regras de negócio 7 e 8).

## 6. Decomposição em Unidades (componentes testáveis)

| Componente | Responsabilidade | Testabilidade |
|------------|-------------------|---------------|
| `tabelaPrecos` / `fatoresAjuste` / `bonusAmenidades` | Dados de negócio (preço-base, multiplicadores, bônus) | Dados puros, usados diretamente nos testes |
| `validarDadosImovel(dados)` | Validação do contrato de entrada (regra de negócio 8); retorna mensagem de erro ou `null` | Função pura, 100% testável via Jest/Node |
| `calcularPrecoImovel(dados)` | Motor de cálculo (regras de negócio 1–8) | Função pura, sem acesso a DOM → 100% testável via Jest/Node |
| `formatarMoeda(valor)` | Formatação de moeda pt-BR | Função pura, testável isoladamente |
| Manipuladores de evento (`DOMContentLoaded`, submit do formulário, `exibirResultado`) | Integração com a interface (HTML) | Fora do escopo do harness unitário atual; validado manualmente / candidato a testes E2E futuros (ver "Refinamento por Feedback") |

## 7. Refinamento por Feedback (registro de ajustes)

| Data | Ajuste na especificação | Motivo |
|------|--------------------------|--------|
| Entrega inicial | Definição das regras de negócio 1–7 a partir do código existente em `prever.js` | O simulador já existia em produção sem uma especificação formal; este SDD documenta o comportamento real observado e testado, servindo de base para futuras mudanças. |
| Entrega inicial | Separação explícita entre lógica pura (`calcularPrecoImovel`, `formatarMoeda`) e manipulação de DOM | Necessário para viabilizar testes automatizados (RNF03) sem exigir um navegador real. |
| Próxima iteração sugerida | Cobrir manipuladores de evento com testes E2E (ex.: Playwright) | A cobertura atual do harness é de funções puras; o fluxo de submissão do formulário no DOM ainda depende de validação manual (ver `docs/test-execution-report.md`). |
| 17/10/2026 | Inclusão do RF08 e da regra de negócio 8 (validação de entradas); `finalidade` passa a aceitar somente `venda` ou `aluguel`; `area` deve ser >= 0; `amenidades` é opcional | Auditoria final com sondagens manuais mostrou que entradas inválidas produziam `NaN` (idade, conservação, quartos), preço negativo (área negativa) e exceção (amenidades ausente), e que o formulário enviava `compra`, valor fora do contrato. Os 12 testes originais cobriam apenas o caminho feliz e casos de borda de cidade/tipo/área 0. Ver ADR 0004. |
