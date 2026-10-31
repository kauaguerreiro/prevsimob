# ADR 0002 — Algoritmo de precificação baseado em tabelas e fatores multiplicativos

**Status:** Aceita

## Contexto
O simulador precisa estimar um preço plausível para um imóvel sem acesso a
uma base de dados de transações reais, mantendo o cálculo 100% client-side.

## Decisão
Usar um modelo determinístico baseado em:
1. preço-base por m² por cidade × tipo de imóvel (`tabelaPrecos`);
2. fatores multiplicativos de ajuste (idade, conservação, quartos,
   banheiros, garagem);
3. bônus aditivo por amenidades, aplicado como um único multiplicador
   `(1 + soma dos bônus)`;
4. divisão por 120 para estimar aluguel a partir do valor de venda;
5. faixa de exibição fixa de ±15% sobre o valor calculado.

Essas regras estão detalhadas e versionadas em `docs/SDD.md` (seção "Regras
de Negócio") e cobertas por testes automatizados em `tests/prever.test.js`.

## Consequências
- Positivo: cálculo simples, determinístico e 100% testável (dado o mesmo
  input, sempre o mesmo output — a variação de exibição vem apenas da faixa
  min/max, não de aleatoriedade real no núcleo do cálculo).
- Positivo: fácil de auditar e de estender (nova cidade/tipo = nova entrada
  na tabela, sem alterar a função de cálculo).
- Negativo: os valores são ilustrativos/paramétricos, não derivados de dados
  reais de mercado — isso é comunicado ao usuário como uma limitação
  conhecida (ver "Próximos passos sugeridos" no README).
- Regra: qualquer alteração nos valores de `tabelaPrecos`, `fatoresAjuste` ou
  `bonusAmenidades` exige atualização deste ADR ou de um novo ADR, além da
  atualização dos testes correspondentes antes do merge.
