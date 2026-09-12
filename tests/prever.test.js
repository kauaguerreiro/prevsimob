const { calcularPrecoImovel, formatarMoeda, tabelaPrecos, bonusAmenidades } = require('../prever.js');

describe('calcularPrecoImovel — cenários principais', () => {
  test('calcula corretamente uma venda de apartamento em São Paulo, sem amenidades', () => {
    const resultado = calcularPrecoImovel({
      cidade: 'sao-paulo',
      tipoImovel: 'apartamento',
      finalidade: 'venda',
      area: 80,
      quartos: 3,
      banheiros: 2,
      garagem: 1,
      idade: 'intermediario',
      conservacao: 'regular',
      amenidades: []
    });

    // preco/m2 = 8000 * 1.2 * 1.0(idade) * 1.0(conservação) * 1.0(quartos=3) * 1.0(banheiros=2) * 1.0(garagem=1)
    expect(resultado).not.toBeNull();
    expect(resultado.precoPorM2).toBeCloseTo(9600, 2);
    expect(resultado.precoTotal).toBeCloseTo(9600 * 80, 2);
    expect(resultado.area).toBe(80);
  });

  test('aplica divisor de aluguel (÷120) sobre o valor de venda equivalente', () => {
    const base = {
      cidade: 'campinas',
      tipoImovel: 'casa',
      area: 100,
      quartos: 4,
      banheiros: 2,
      garagem: 1,
      idade: 'novo',
      conservacao: 'bom',
      amenidades: []
    };

    const venda = calcularPrecoImovel({ ...base, finalidade: 'venda' });
    const aluguel = calcularPrecoImovel({ ...base, finalidade: 'aluguel' });

    expect(aluguel.precoTotal).toBeCloseTo(venda.precoTotal / 120, 6);
  });

  test('faixa de preço tem variação de ±15% em torno do valor estimado', () => {
    const resultado = calcularPrecoImovel({
      cidade: 'itatiba',
      tipoImovel: 'loft',
      finalidade: 'venda',
      area: 60,
      quartos: 2,
      banheiros: 1,
      garagem: 0,
      idade: 'recente',
      conservacao: 'excelente',
      amenidades: []
    });

    expect(resultado.valorMinimo).toBeCloseTo(resultado.precoTotal * 0.85, 6);
    expect(resultado.valorMaximo).toBeCloseTo(resultado.precoTotal * 1.15, 6);
    expect(resultado.valorMinimo).toBeLessThan(resultado.precoTotal);
    expect(resultado.valorMaximo).toBeGreaterThan(resultado.precoTotal);
  });

  test('soma corretamente o bônus de múltiplas amenidades', () => {
    const semAmenidades = calcularPrecoImovel({
      cidade: 'sao-paulo',
      tipoImovel: 'casa',
      finalidade: 'venda',
      area: 120,
      quartos: 3,
      banheiros: 2,
      garagem: 2,
      idade: 'intermediario',
      conservacao: 'regular',
      amenidades: []
    });

    const comAmenidades = calcularPrecoImovel({
      cidade: 'sao-paulo',
      tipoImovel: 'casa',
      finalidade: 'venda',
      area: 120,
      quartos: 3,
      banheiros: 2,
      garagem: 2,
      idade: 'intermediario',
      conservacao: 'regular',
      amenidades: ['piscina', 'academia'] // 0.08 + 0.05 = 0.13
    });

    const bonusEsperado = bonusAmenidades.piscina + bonusAmenidades.academia;
    expect(comAmenidades.precoTotal).toBeCloseTo(semAmenidades.precoTotal * (1 + bonusEsperado), 6);
  });

  test('valida todas as combinações de cidade x tipo presentes na tabela de preços', () => {
    Object.keys(tabelaPrecos).forEach(cidade => {
      Object.keys(tabelaPrecos[cidade]).forEach(tipo => {
        const resultado = calcularPrecoImovel({
          cidade,
          tipoImovel: tipo,
          finalidade: 'venda',
          area: 50,
          quartos: 2,
          banheiros: 1,
          garagem: 0,
          idade: 'intermediario',
          conservacao: 'regular',
          amenidades: []
        });
        expect(resultado).not.toBeNull();
        expect(resultado.precoTotal).toBeGreaterThan(0);
      });
    });
  });
});

describe('calcularPrecoImovel — casos de borda', () => {
  test('retorna null e alerta o usuário para cidade inexistente', () => {
    const resultado = calcularPrecoImovel({
      cidade: 'cidade-inventada',
      tipoImovel: 'apartamento',
      finalidade: 'venda',
      area: 70,
      quartos: 2,
      banheiros: 1,
      garagem: 0,
      idade: 'novo',
      conservacao: 'bom',
      amenidades: []
    });

    expect(resultado).toBeNull();
    expect(global.alert).toHaveBeenCalled();
  });

  test('retorna null para tipo de imóvel inexistente em uma cidade válida', () => {
    const resultado = calcularPrecoImovel({
      cidade: 'sao-paulo',
      tipoImovel: 'castelo',
      finalidade: 'venda',
      area: 70,
      quartos: 2,
      banheiros: 1,
      garagem: 0,
      idade: 'novo',
      conservacao: 'bom',
      amenidades: []
    });

    expect(resultado).toBeNull();
  });

  test('área igual a 0 resulta em preço total igual a 0, sem lançar erro', () => {
    const resultado = calcularPrecoImovel({
      cidade: 'outras',
      tipoImovel: 'comercial',
      finalidade: 'venda',
      area: 0,
      quartos: 1,
      banheiros: 1,
      garagem: 0,
      idade: 'velho',
      conservacao: 'ruim',
      amenidades: []
    });

    expect(resultado.precoTotal).toBe(0);
    expect(resultado.valorMinimo).toBe(0);
    expect(resultado.valorMaximo).toBe(0);
  });

  test('amenidade desconhecida é ignorada no cálculo do bônus (não quebra e não altera preço)', () => {
    const semAmenidades = calcularPrecoImovel({
      cidade: 'campinas',
      tipoImovel: 'apartamento',
      finalidade: 'venda',
      area: 90,
      quartos: 2,
      banheiros: 1,
      garagem: 1,
      idade: 'intermediario',
      conservacao: 'regular',
      amenidades: []
    });

    const amenidadeInvalida = calcularPrecoImovel({
      cidade: 'campinas',
      tipoImovel: 'apartamento',
      finalidade: 'venda',
      area: 90,
      quartos: 2,
      banheiros: 1,
      garagem: 1,
      idade: 'intermediario',
      conservacao: 'regular',
      amenidades: ['spa-privativo-inexistente']
    });

    expect(amenidadeInvalida.precoTotal).toBeCloseTo(semAmenidades.precoTotal, 6);
  });

  test('quartos "5" (chave string na tabela) é interpretado corretamente', () => {
    const resultado = calcularPrecoImovel({
      cidade: 'sao-paulo',
      tipoImovel: 'penthouse',
      finalidade: 'venda',
      area: 200,
      quartos: 5,
      banheiros: 3,
      garagem: 2,
      idade: 'novo',
      conservacao: 'excelente',
      amenidades: []
    });

    expect(resultado).not.toBeNull();
    expect(resultado.precoTotal).toBeGreaterThan(0);
  });
});

describe('formatarMoeda', () => {
  test('formata valores numéricos como moeda brasileira (BRL)', () => {
    const formatado = formatarMoeda(1234.5);
    expect(formatado).toMatch(/R\$/);
    expect(formatado.replace(/\u00a0/g, ' ')).toContain('1.234,50');
  });

  test('formata zero corretamente', () => {
    const formatado = formatarMoeda(0);
    expect(formatado).toMatch(/R\$/);
  });
});
