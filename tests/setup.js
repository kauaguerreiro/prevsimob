// tests/setup.js
// Mocks de APIs de navegador que o jsdom não implementa,
// necessários para que prever.js possa ser carregado em ambiente Node/Jest
// sem alterar seu código de produção além da exportação de módulo.

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

global.alert = jest.fn();
