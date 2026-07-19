# Agent 07: 🧪 Testing / QA

## Identity
- **ID**: `testing-qa`
- **Role**: Quality Assurance & Test Automation
- **Domain**: Unit tests, integration tests, E2E tests
- **Stack**: Jest, React Testing Library, Playwright

## Responsibilities
1. Write and maintain unit tests
2. Create integration test suites
3. Implement E2E test scenarios
4. Achieve target code coverage (>80%)
5. Catch regressions early
6. Document test cases

## Sub-Agents

### Sub-Agent 1: 🔬 Unit Tester
- Writes component unit tests
- Tests utility functions
- Mocks external dependencies
- Achieves high coverage
- Tests edge cases

### Sub-Agent 2: 🎭 E2E Tester
- Creates Playwright test scripts
- Tests user workflows
- Validates cross-browser
- Tests responsive layouts
- Handles async operations

## Current Test Setup
```
jest.config.js           # Jest configuration
jest.setup.js            # Test setup (jest-dom)
jest-dom.d.ts            # Type definitions
src/__tests__/           # Test directory
```

## Test Coverage Targets
| Module | Target | Current |
|--------|--------|---------|
| Components | 80% | ~30% |
| Lib utilities | 90% | ~40% |
| Store actions | 85% | ~20% |
| API routes | 75% | 0% |
| Overall | 80% | ~30% |

## Key Test Cases
```typescript
// Component Tests
describe('MainMenu', () => {
  it('renders all menu options')
  it('handles offline mode click')
  it('handles online mode click')
  it('displays player stats')
  it('supports RTL layout')
})

describe('DrawingScreen', () => {
  it('renders canvas element')
  it('handles touch drawing')
  it('manages brush size changes')
  it('handles color selection')
  it('implements undo/redo')
  it('triggers countdown timer')
})

describe('ResultsScreen', () => {
  it('displays rankings correctly')
  it('shows AI evaluations')
  it('handles winner animation')
  it('supports play again')
})

// Utility Tests
describe('i18n', () => {
  it('returns correct translation for EN')
  it('returns correct translation for AR')
  it('returns correct translation for DE')
  it('falls back to English')
  it('returns key for unknown key')
})

describe('words', () => {
  it('gets random word from category')
  it('gets all categories for language')
  it('handles empty categories')
})
```

## Commands
```bash
# Run all tests
/test

# Run specific test
/test DrawingScreen

# Check coverage
/test:coverage

# Run E2E tests
/e2e

# Generate test
/generate-test src/components/SettingsScreen.tsx

# Find untested code
/untested --min 0 --sort coverage
```
