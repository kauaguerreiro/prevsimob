# ADR 0004 — Validação explícita do contrato de entrada no motor de cálculo

**Status:** Aceita

## Contexto
O harness inicial (12 testes) cobria o caminho feliz e casos de borda de
cidade, tipo e área zero. Uma auditoria final do motor de cálculo
(`calcularPrecoImovel`) com entradas fora do contrato mostrou:

1. `idade` ou `conservacao` inválidas → resultado `NaN`;
2. `quartos`, `banheiros` ou `garagem` fora da tabela (ex.: 6 quartos) → `NaN`;
3. `area` negativa → preço total negativo;
4. `amenidades` ausente → `TypeError` (`forEach` de `undefined`);
5. o formulário (`prever.html`) enviava `finalidade = "compra"`, valor fora do
   contrato do SDD (`"venda" | "aluguel"`); o cálculo só funcionava porque
   qualquer valor diferente de `"aluguel"` caía em venda;
6. a mensagem de erro era genérica ("Erro ao processar dados").

Em uso normal pela interface os itens 1–4 raramente ocorrem (os campos são
`select`), mas a função é pública e testável isoladamente (RNF03), portanto
deve se proteger pelo próprio contrato.

## Decisão
- Criar a função pura `validarDadosImovel(dados)`, que retorna uma mensagem de
  erro específica ou `null`, e chamá-la no início de `calcularPrecoImovel`.
- Verificar chaves com `Object.prototype.hasOwnProperty` (e não com acesso
  direto), para que valores como `"constructor"` não passem.
- `finalidade` aceita somente `"venda"` ou `"aluguel"`; o `option` do
  formulário passa a enviar `"venda"`.
- `area` deve ser número finito >= 0 (zero continua aceito, conforme regra do SDD).
- `amenidades` é opcional e, se ausente, equivale a lista vazia.
- Registrar a regra no SDD (RF08 e regra de negócio 8) **antes** de alterar o
  código, conforme o fluxo SDD, e cobrir cada achado com teste automatizado
  (`tests/prever.validacao.test.js`).

## Alternativas consideradas
- **Manter a validação só no formulário:** descartada; a função continuaria
  insegura para outros chamadores e para os testes.
- **Aceitar `"compra"` como sinônimo de `"venda"`:** descartada; mantém um valor
  fora do contrato e esconde a inconsistência entre SDD e interface.
- **Corrigir silenciosamente com valores padrão (ex.: idade = intermediário):**
  descartada; produz estimativas enganosas sem o usuário saber.

## Consequências
- Positivo: nenhuma combinação de entrada produz `NaN`, preço negativo ou
  exceção; mensagens de erro indicam o campo com problema.
- Positivo: contrato SDD, formulário e código ficam alinhados e testados.
- Negativo: entradas antes toleradas (ex.: `finalidade = "compra"`) agora
  retornam `null`; qualquer chamador externo deve usar os valores do contrato.
- Origem: achados identificados na auditoria final; proposta de correção
  elaborada com apoio de agente de IA (Claude) e validada por revisão humana e
  pelos testes automatizados antes do merge (ver ADR 0003).
