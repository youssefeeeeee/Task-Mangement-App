const nextjest = require('next/jest');

const createJestconfig = nextjest({
    dir: './',
});
const custonjestconfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/_app.{js,jsx,ts,tsx}',
    '!src/**/_document.{js,jsx,ts,tsx}',
  ],
   testMatch: [
    '**/*.test.js',
  ],
}

module.exports = createJestconfig(custonjestconfig);