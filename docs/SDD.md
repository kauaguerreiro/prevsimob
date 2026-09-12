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

## 5. Contratos de Entrada/Saída

### Entrada — `calcularPrecoImovel(dados)`

```txt
dados = {
  cidade: string,        // chave existente em tabelaPrecos (ex.: "sao-paulo")
  tipoImovel: string,    // chave existente na cidade (ex.: "apartamento")
  finalidade: "venda" | "aluguel",
  area: number,          // m², > 0 em uso normal (0 é aceito e retorna 0)
  quartos: number|string,    // 1..5 (ou "5" para 5+)
  banheiros: number|string,  // 1..4
  garagem: number|string,    // 0..4
  idade: "novo" | "recente" | "intermediario" | "velho",
  conservacao: "excelente" | "bom" | "regular" | "ruim",
  amenidades: string[]   // subconjunto de: piscina, academia, churrasqueira,
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

`null`, acompanhado de um alerta ao usuário via `alert(...)`, quando `cidade`
ou `tipoImovel` não existem na tabela de preços.

## 6. Decomposição em Unidades (componentes testáveis)

| Componente | Responsabilidade | Testabilidade |
|------------|-------------------|---------------|
| `tabelaPrecos` / `fatoresAjuste` / `bonusAmenidades` | Dados de negócio (preço-base, multiplicadores, bônus) | Dados puros, usados diretamente nos testes |
| `calcularPrecoImovel(dados)` | Motor de cálculo (regras de negócio 1–7) | Função pura, sem acesso a DOM → 100% testável via Jest/Node |
| `formatarMoeda(valor)` | Formatação de moeda pt-BR | Função pura, testável isoladamente |
| Manipuladores de evento (`DOMContentLoaded`, submit do formulário, `exibirResultado`) | Integração com a interface (HTML) | Fora do escopo do harness unitário atual; validado manualmente / candidato a testes E2E futuros (ver "Refinamento por Feedback") |

## 7. Refinamento por Feedback (registro de ajustes)

| Data | Ajuste na especificação | Motivo |
|------|--------------------------|--------|
| Entrega inicial | Definição das regras de negócio 1–7 a partir do código existente em `prever.js` | O simulador já existia em produção sem uma especificação formal; este SDD documenta o comportamento real observado e testado, servindo de base para futuras mudanças. |
| Entrega inicial | Separação explícita entre lógica pura (`calcularPrecoImovel`, `formatarMoeda`) e manipulação de DOM | Necessário para viabilizar testes automatizados (RNF03) sem exigir um navegador real. |
| Próxima iteração sugerida | Cobrir manipuladores de evento com testes E2E (ex.: Playwright) | A cobertura atual do harness é de funções puras; o fluxo de submissão do formulário no DOM ainda depende de validação manual (ver `docs/test-execution-report.md`). |
