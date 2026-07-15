const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  // Add more setup options after each file is set up
  setupFilesAfterSetup: ['<rootDir>/jest.setup.js'],
  
  // if using TypeScript with a Path alias, ensure you include the alias in the jest configuration
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  testEnvironment: 'jest-environment-jsdom',
  
  // Automatically clean mock calls, instances, contexts and results before every test
  clearMocks: true,
  
  // Collect coverage from these files
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/layout.tsx',
    '!src/**/page.tsx',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can turn the Config into a function
module.exports = createJestConfig(customJestConfig)