const { calcularPrecoImovel, validarDadosImovel } = require('../prever.js');

// Dados válidos de referência (SDD, seção 5)
const base = {
  cidade: 'sao-paulo',
  tipoImovel: 'casa',
  finalidade: 'venda',
  area: 100,
  quartos: 3,
  banheiros: 2,
  garagem: 1,
  idade: 'novo',
  conservacao: 'bom',
  amenidades: []
};

beforeEach(() => {
  global.alert.mockClear();
});

describe('validação de entradas — achados da auditoria (SDD RF08 / regra 8)', () => {
  test('dados válidos de referência continuam retornando resultado numérico', () => {
    const r = calcularPrecoImovel(base);
    expect(r).not.toBeNull();
    expect(Number.isFinite(r.precoTotal)).toBe(true);
    expect(global.alert).not.toHaveBeenCalled();
  });

  test('achado 1: idade inválida retorna null com mensagem específica (antes: NaN)', () => {
    expect(calcularPrecoImovel({ ...base, idade: 'xyz' })).toBeNull();
    expect(global.alert).toHaveBeenCalledWith('Idade do imóvel inválida.');
  });

  test('achado 1: conservação inválida retorna null (antes: NaN)', () => {
    expect(calcularPrecoImovel({ ...base, conservacao: 'pessimo' })).toBeNull();
    expect(global.alert).toHaveBeenCalledWith('Estado de conservação inválido.');
  });

  test('achado 1: chaves herdadas do protótipo ("constructor") não passam na validação', () => {
    expect(calcularPrecoImovel({ ...base, idade: 'constructor' })).toBeNull();
    expect(calcularPrecoImovel({ ...base, cidade: 'constructor' })).toBeNull();
  });

  test('achado 2: quartos fora da faixa (6) retorna null (antes: NaN)', () => {
    expect(calcularPrecoImovel({ ...base, quartos: 6 })).toBeNull();
    expect(global.alert).toHaveBeenCalledWith('Número de quartos inválido (use de 1 a 5).');
  });

  test('achado 2: banheiros e garagem fora da faixa retornam null', () => {
    expect(calcularPrecoImovel({ ...base, banheiros: 9 })).toBeNull();
    expect(calcularPrecoImovel({ ...base, garagem: 7 })).toBeNull();
  });

  test('achado 3: área negativa retorna null (antes: preço negativo)', () => {
    expect(calcularPrecoImovel({ ...base, area: -50 })).toBeNull();
    expect(global.alert).toHaveBeenCalled();
  });

  test('achado 3: área NaN, texto ou infinita retorna null', () => {
    expect(calcularPrecoImovel({ ...base, area: NaN })).toBeNull();
    expect(calcularPrecoImovel({ ...base, area: '80' })).toBeNull();
    expect(calcularPrecoImovel({ ...base, area: Infinity })).toBeNull();
  });

  test('achado 3: área 0 continua aceita e resulta em preço 0 (regra do SDD preservada)', () => {
    const r = calcularPrecoImovel({ ...base, area: 0 });
    expect(r).not.toBeNull();
    expect(r.precoTotal).toBe(0);
  });

  test('achado 4: amenidades ausentes são tratadas como lista vazia (antes: TypeError)', () => {
    const semCampo = { ...base };
    delete semCampo.amenidades;
    const r = calcularPrecoImovel(semCampo);
    expect(r).not.toBeNull();
    expect(r.precoTotal).toBeCloseTo(calcularPrecoImovel(base).precoTotal, 6);
  });

  test('achado 4: amenidades que não é lista retorna null', () => {
    expect(calcularPrecoImovel({ ...base, amenidades: 'piscina' })).toBeNull();
    expect(global.alert).toHaveBeenCalledWith('Lista de amenidades inválida.');
  });

  test('achado 5: finalidade "compra" (valor antigo do formulário) não é mais aceita; "venda" e "aluguel" sim', () => {
    expect(calcularPrecoImovel({ ...base, finalidade: 'compra' })).toBeNull();
    expect(calcularPrecoImovel({ ...base, finalidade: 'venda' })).not.toBeNull();
    expect(calcularPrecoImovel({ ...base, finalidade: 'aluguel' })).not.toBeNull();
    expect(calcularPrecoImovel({ ...base, finalidade: undefined })).toBeNull();
  });

  test('achado 6: cada campo inválido gera mensagem específica, não a genérica', () => {
    expect(validarDadosImovel({ ...base, cidade: 'x' })).toBe('Cidade inválida.');
    expect(validarDadosImovel({ ...base, tipoImovel: 'castelo' })).toMatch(/Tipo de imóvel inválido/);
    expect(validarDadosImovel({ ...base, finalidade: 'x' })).toMatch(/Finalidade inválida/);
    expect(validarDadosImovel(null)).toBe('Dados do imóvel não informados.');
    expect(validarDadosImovel(base)).toBeNull();
  });
});
