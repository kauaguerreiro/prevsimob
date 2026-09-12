/** Configuração do Jest para o harness de validação do PrevsImob */
module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['./tests/setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  collectCoverageFrom: ['prever.js'],
  coverageDirectory: 'coverage'
};
