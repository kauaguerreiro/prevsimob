/**
 * tests/app.test.js
 * Testes de integração das páginas de listagem e navegação (app.js).
 * Cobrem RF01 (navegação/elementos comuns), RF02 (busca, filtros e ordenação),
 * RF09 (detalhes do imóvel) e os formulários de contato e login (demonstrativos).
 */
const fs = require('fs');
const path = require('path');

function corpo(pagina) {
  const html = fs.readFileSync(path.join(__dirname, '..', pagina), 'utf8');
  return html.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1].replace(/<script[\s\S]*?<\/script>/gi, '');
}

let app;
function abrir(pagina) {
  document.body.innerHTML = corpo(pagina);
  localStorage.clear();
  global.alert.mockClear();
  Element.prototype.scrollIntoView = jest.fn();
  jest.isolateModules(() => { app = require('../app.js'); });
  document.dispatchEvent(new Event('DOMContentLoaded'));
}

const titulos = () => [...document.querySelectorAll('#properties .card-title')].map(e => e.textContent);
const $ = s => document.querySelector(s);

function capturarNavegacao(fn) {
  const erros = [];
  const original = console.error;
  console.error = (...a) => erros.push(String((a[0] && a[0].message) || a[0]));
  fn();
  console.error = original;
  return erros.some(e => /navigation/i.test(e));
}

describe('index.html — listagem, busca, filtros e ordenação (RF02)', () => {
  beforeEach(() => abrir('index.html'));

  test('renderiza todos os imóveis de exemplo ao carregar', () => {
    expect(titulos().length).toBe(app.properties.length);
  });

  test('busca textual filtra por título, cidade ou descrição', () => {
    $('#q').value = 'campinas';
    app.applyFilters();
    const esperados = app.properties.filter(p => (p.title + ' ' + p.city + ' ' + p.meta).toLowerCase().includes('campinas'));
    expect(titulos()).toEqual(esperados.map(p => p.title));
  });

  test('submeter o formulário de busca filtra na própria página (sem redirecionar)', () => {
    $('#q').value = 'zzz-inexistente';
    $('#searchForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(global.alert).not.toHaveBeenCalled();
    expect($('#properties').textContent).toContain('Nenhum imóvel encontrado.');
  });

  test('filtro de tipo e de finalidade restringem a lista', () => {
    const tipo = app.properties[0].type;
    $('#typeFilter').value = tipo;
    $('#typeFilter').dispatchEvent(new Event('change'));
    expect(titulos()).toEqual(app.properties.filter(p => p.type === tipo).map(p => p.title));

    $('#typeFilter').value = 'all';
    const finalidade = app.properties[0].purpose;
    $('#purposeFilter').value = finalidade;
    $('#purposeFilter').dispatchEvent(new Event('change'));
    expect(titulos()).toEqual(app.properties.filter(p => p.purpose === finalidade).map(p => p.title));
  });

  test('ordenação por preço crescente e decrescente', () => {
    const ordenar = valor => {
      $('#sort').value = valor;
      $('#sort').dispatchEvent(new Event('change'));
      return titulos();
    };
    const asc = [...app.properties].sort((a, b) => a.price - b.price).map(p => p.title);
    expect(ordenar('price_asc')).toEqual(asc);
    expect(ordenar('price_desc')).toEqual([...asc].reverse());
  });

  test('busca rápida usa debounce de 300 ms', () => {
    jest.useFakeTimers();
    abrir('index.html');
    $('#q').value = 'zzz-inexistente';
    $('#q').dispatchEvent(new Event('input'));
    expect(titulos().length).toBe(app.properties.length);
    jest.advanceTimersByTime(300);
    expect(titulos().length).toBe(0);
    jest.useRealTimers();
  });

  test('botão "Ver detalhes" do card exibe as informações do imóvel', () => {
    const botao = $('#properties .card-button');
    botao.click();
    const prop = app.properties.find(p => p.id === Number(botao.dataset.id));
    expect(global.alert).toHaveBeenCalledWith(expect.stringContaining(prop.title));
  });

  test('openModal ignora imóvel inexistente; formatCurrency só formata valores ≥ 1000', () => {
    app.openModal(undefined);
    expect(global.alert).not.toHaveBeenCalled();
    expect(app.formatCurrency(500)).toBe(500);
    expect(app.formatCurrency(1500).replace(/\s/g, ' ')).toBe('R$ 1.500,00');
  });

  test('ano do rodapé, cabeçalho fixo e animação de revelação', () => {
    expect($('#year').textContent).toBe(String(new Date().getFullYear()));
    const header = $('.site-header');
    window.scrollY = 100; window.dispatchEvent(new Event('scroll'));
    expect(header.classList.contains('sticky')).toBe(true);
    window.scrollY = 0; window.dispatchEvent(new Event('scroll'));
    expect(header.classList.contains('sticky')).toBe(false);
  });

  test('links de navegação com âncora (#) rolam suavemente; links de página não', () => {
    const ancora = document.createElement('a');
    ancora.setAttribute('href', '#properties');
    const outro = document.createElement('a');
    outro.setAttribute('href', 'sobre.html');
    const nav = $('.nav-list');
    nav.append(ancora, outro);
    app.init();
    ancora.click();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    Element.prototype.scrollIntoView.mockClear();
    capturarNavegacao(() => outro.click());
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });
});

describe('animação de revelação (app.js)', () => {
  test('elementos .reveal visíveis recebem a classe "is-visible"', () => {
    let callback;
    const observados = [];
    const original = global.IntersectionObserver;
    global.IntersectionObserver = class {
      constructor(cb) { callback = cb; }
      observe(el) { observados.push(el); }
      unobserve() {}
    };
    abrir('index.html');
    expect(observados.length).toBeGreaterThan(0);
    callback([{ isIntersecting: true, target: observados[0] }, { isIntersecting: false, target: observados[0] }]);
    expect(observados[0].classList.contains('is-visible')).toBe(true);
    global.IntersectionObserver = original;
  });
});

describe('páginas sem listagem dinâmica (RF01)', () => {
  test.each(['propriedades.html', 'prever.html', 'contato.html', 'sobre.html', 'servicos.html', 'login.html', 'cadastro.html', 'detalhes.html'])(
    '%s inicializa sem erros e atualiza o ano do rodapé',
    pagina => {
      expect(() => abrir(pagina)).not.toThrow();
      const ano = $('#year');
      if (ano) expect(ano.textContent).toBe(String(new Date().getFullYear()));
    }
  );
});

describe('detalhes do imóvel — propriedades.html → detalhes.html (RF09)', () => {
  test('verDetalhes salva o imóvel e navega para detalhes.html', () => {
    abrir('propriedades.html');
    const navegou = capturarNavegacao(() => app.verDetalhes(2));
    expect(JSON.parse(localStorage.getItem('imovelSelecionado')).id).toBe(2);
    expect(navegou).toBe(true);
  });

  test('verDetalhes com id inexistente não faz nada', () => {
    abrir('propriedades.html');
    app.verDetalhes(999);
    expect(localStorage.getItem('imovelSelecionado')).toBeNull();
  });

  test('carregarDetalhes renderiza venda (R$ total) e aluguel (R$/mês)', () => {
    abrir('detalhes.html');
    const venda = app.imoveis.find(i => i.status === 'à venda');
    localStorage.setItem('imovelSelecionado', JSON.stringify(venda));
    app.carregarDetalhes();
    expect($('#detalhes-container').textContent).toContain(venda.titulo);
    expect($('#detalhes-container').textContent).toContain(venda.preco.toLocaleString('pt-BR'));

    const aluguel = { ...venda, status: 'para alugar', preco: 3500 };
    localStorage.setItem('imovelSelecionado', JSON.stringify(aluguel));
    app.carregarDetalhes();
    expect($('#detalhes-container').textContent).toContain('R$ 3500/mês');
  });

  test('carregarDetalhes sem imóvel selecionado redireciona para propriedades.html', () => {
    abrir('detalhes.html');
    expect(capturarNavegacao(() => app.carregarDetalhes())).toBe(true);
  });

  test('carregarDetalhes não quebra em página sem contêiner de detalhes', () => {
    abrir('sobre.html');
    localStorage.setItem('imovelSelecionado', JSON.stringify(app.imoveis[0]));
    expect(() => app.carregarDetalhes()).not.toThrow();
  });
});

describe('formulários demonstrativos (contato e login)', () => {
  test('contato.html confirma o envio e limpa o formulário', () => {
    abrir('contato.html');
    const form = $('.contact-form');
    form.querySelector('input[type="text"]').value = 'Maria';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Obrigado Maria!'));
    expect(form.querySelector('input[type="text"]').value).toBe('');
  });

  test('login.html registra o e-mail em localStorage e volta para a página inicial', () => {
    abrir('login.html');
    const form = $('.login-form');
    form.querySelector('input[type="email"]').value = 'ana@exemplo.com';
    const navegou = capturarNavegacao(() =>
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(localStorage.getItem('userLogado')).toBe('ana@exemplo.com');
    expect(navegou).toBe(true);
  });
});
