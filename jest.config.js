/** Configuração do Jest para o test harness do PrevsImob (v1.0.0) */
module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['./tests/setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  collectCoverageFrom: ['prever.js', 'app.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'html', 'lcov', 'json-summary'],
  // A build falha se a cobertura cair abaixo destes limites (SDD, RNF07).
  coverageThreshold: {
    global: { statements: 95, branches: 85, functions: 95, lines: 95 },
    './prever.js': { statements: 100, branches: 100, functions: 100, lines: 100 }
  }
};
