/**
 * tests/prever.dom.test.js
 * Testes de integração da interface do simulador (prever.html + prever.js).
 * Carrega o HTML real da página no jsdom, dispara o DOMContentLoaded e
 * exercita o fluxo completo: preencher formulário → calcular → exibir resultado
 * → fechar / nova simulação / consultar especialista. (SDD RF04, RF05, RF06, RF07)
 */
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'prever.html'), 'utf8');
const bodyHtml = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1]
  .replace(/<script[\s\S]*?<\/script>/gi, ''); // scripts são carregados via require

let motor;

function carregarPagina() {
  document.body.innerHTML = bodyHtml;
  Element.prototype.scrollIntoView = jest.fn();
  global.alert.mockClear();
  jest.isolateModules(() => {
    motor = require('../prever.js');
  });
  document.dispatchEvent(new Event('DOMContentLoaded'));
}

function preencher(valores) {
  Object.entries(valores).forEach(([id, valor]) => {
    document.getElementById(id).value = valor;
  });
}

function marcar(...ids) {
  ids.forEach(id => { document.getElementById(id).checked = true; });
}

function submeter() {
  document.getElementById('preverForm')
    .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

const $ = id => document.getElementById(id);
const normalizar = texto => texto.replace(/\s/g, ' '); // Intl usa espaço não separável

const formularioValido = {
  cidade: 'sao-paulo',
  tipoImovel: 'apartamento',
  finalidade: 'venda',
  area: '80',
  quartos: '3',
  banheiros: '2',
  garagem: '1',
  idade: 'intermediario',
  conservacao: 'regular'
};

beforeEach(carregarPagina);

describe('prever.html — inicialização da página', () => {
  test('resultado começa oculto e o ano do rodapé é atualizado', () => {
    expect($('resultado').style.display).toBe('none');
    expect($('year').textContent).toBe(String(new Date().getFullYear()));
  });

  test('opções de finalidade do formulário respeitam o contrato do SDD (venda | aluguel)', () => {
    const valores = [...$('finalidade').options].map(o => o.value).filter(Boolean);
    expect(valores).toEqual(['venda', 'aluguel']);
  });

  test('todas as cidades e tipos do formulário existem na tabela de preços', () => {
    const cidades = [...$('cidade').options].map(o => o.value).filter(Boolean);
    const tipos = [...$('tipoImovel').options].map(o => o.value).filter(Boolean);
    cidades.forEach(c => {
      expect(motor.tabelaPrecos).toHaveProperty(c);
      tipos.forEach(t => expect(motor.tabelaPrecos[c]).toHaveProperty(t));
    });
  });

  test('todas as amenidades do formulário possuem bônus definido', () => {
    const ids = [...document.querySelectorAll('.checkbox-group input[type="checkbox"]')].map(c => c.id);
    expect(ids.length).toBe(6);
    ids.forEach(id => expect(motor.bonusAmenidades).toHaveProperty(id));
  });
});

describe('prever.html — fluxo principal de simulação (RF04/RF05)', () => {
  test('submissão válida exibe valor estimado, faixa ±15%, detalhes e indicador', () => {
    preencher(formularioValido);
    submeter();

    expect(global.alert).not.toHaveBeenCalled();
    expect($('resultado').style.display).toBe('block');
    // 8000 × 1.2 = 9.600/m² × 80 m² = 768.000
    expect(normalizar($('valorEstimado').textContent)).toBe('R$ 768.000,00');
    expect(normalizar($('valorMinimo').textContent)).toBe('R$ 652.800,00');
    expect(normalizar($('valorMaximo').textContent)).toBe('R$ 883.200,00');
    expect($('detalheCidade').textContent).toBe('São Paulo, SP');
    expect($('detalheTipo').textContent).toBe('Apartamento');
    expect($('detalheArea').textContent).toBe('80.00 m²');
    expect(normalizar($('detalhePrecoPorM2').textContent)).toBe('R$ 9.600,00');
    expect(parseFloat($('indicadorPreco').style.left)).toBeCloseTo(50, 6);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  test('amenidades marcadas no formulário são enviadas ao motor de cálculo', () => {
    preencher(formularioValido);
    marcar('piscina', 'smart_home'); // +8% +10% = ×1.18
    submeter();
    expect(normalizar($('valorEstimado').textContent)).toBe('R$ 906.240,00');
  });

  test('finalidade aluguel exibe valor mensal (÷120)', () => {
    preencher({ ...formularioValido, finalidade: 'aluguel' });
    submeter();
    expect(normalizar($('valorEstimado').textContent)).toBe('R$ 6.400,00');
  });
});

describe('prever.html — validações e erros (RF06/RF08)', () => {
  test('campo obrigatório vazio alerta o usuário e não exibe resultado', () => {
    preencher({ ...formularioValido, cidade: '' });
    submeter();
    expect(global.alert).toHaveBeenCalledWith('Por favor, preencha todos os campos obrigatórios.');
    expect($('resultado').style.display).toBe('none');
  });

  test('finalidade não selecionada é barrada pelo motor com mensagem específica', () => {
    preencher({ ...formularioValido, finalidade: '' });
    submeter();
    expect(global.alert).toHaveBeenCalledWith('Finalidade inválida (use venda ou aluguel).');
    expect($('resultado').style.display).toBe('none');
  });
});

describe('prever.html — ações pós-resultado (RF07)', () => {
  beforeEach(() => {
    preencher(formularioValido);
    submeter();
  });

  test('botão fechar oculta o resultado', () => {
    $('btnFecharResultado').click();
    expect($('resultado').style.display).toBe('none');
  });

  test('"Nova simulação" limpa o formulário e oculta o resultado', () => {
    $('btnNovaSimulacao').click();
    expect($('resultado').style.display).toBe('none');
    expect($('cidade').value).toBe('');
    expect($('area').value).toBe('');
  });

  test('"Consultar especialista" redireciona para contato.html', () => {
    const erros = [];
    const original = console.error;
    console.error = (...args) => erros.push(String(args[0] && args[0].message || args[0]));
    $('btnConsultar').click();
    console.error = original;
    // jsdom não implementa navegação; a tentativa de navegar para contato.html
    // é registrada como "Not implemented: navigation", o que comprova o redirecionamento.
    expect(erros.some(e => /navigation/i.test(e))).toBe(true);
  });
});

describe('prever.js — animação de revelação ao rolar', () => {
  test('elementos .reveal recebem a classe "revealed" ao entrar na tela', () => {
    let callback;
    const observados = [];
    global.IntersectionObserver = class {
      constructor(cb) { callback = cb; }
      observe(el) { observados.push(el); }
      unobserve() {}
    };
    carregarPagina();
    expect(observados.length).toBeGreaterThan(0);
    callback([{ isIntersecting: true, target: observados[0] }, { isIntersecting: false, target: observados[1] || observados[0] }]);
    expect(observados[0].classList.contains('revealed')).toBe(true);
  });
});
