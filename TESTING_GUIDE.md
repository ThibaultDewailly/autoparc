# AutoParc Testing Quick Start Guide

This guide provides quick commands and tips for running tests in the AutoParc project.

## Frontend Tests

### Unit Tests

#### Run All Tests
```bash
cd frontend
npm test
```

#### Run Tests in Watch Mode
```bash
npm test -- --watch
```

#### Run Tests with Coverage Report
```bash
npm run test:coverage
```

#### Run Specific Test File
```bash
npm test validators.test.ts
npm test formatters.test.ts
npm test LoginForm.test.tsx
```

#### Run Tests Matching Pattern
```bash
npm test -- --grep="validation"
npm test -- --grep="Pagination"
```

### E2E Tests

#### Prerequisites
- Backend server must be running on `http://localhost:8080`
- Or let Playwright start the Vite dev server automatically

#### Run All E2E Tests
```bash
cd frontend
npm run test:e2e
```

#### Run E2E Tests in UI Mode (Interactive)
```bash
npm run test:e2e -- --ui
```

#### Run Specific E2E Test File
```bash
npx playwright test e2e/auth.spec.ts
npx playwright test e2e/cars.spec.ts
```

#### Run Single E2E Test
```bash
npx playwright test --grep="should display login page"
```

#### Debug E2E Test
```bash
npx playwright test --debug
```

#### View Last Test Report
```bash
npx playwright show-report
```

## Test Results Summary

### Current Status (January 2025)

#### Unit Tests ✅
- **Total**: 56 tests
- **Status**: All passing
- **Execution Time**: ~2.4 seconds
- **Coverage**: 95%+ for tested modules

**Breakdown**:
- Validators: 22 tests (100% coverage)
- Formatters: 11 tests (100% coverage)
- LoginForm: 7 tests (96.7% coverage)
- Pagination: 9 tests (100% coverage)
- SearchBar: 4 tests (100% coverage)
- FilterPanel: 3 tests (83% coverage)

#### E2E Tests 🔵
- **Total**: 16 tests
- **Status**: Ready to run
- **Files**: auth.spec.ts (7 tests), cars.spec.ts (9 tests)

**Coverage**:
- Authentication flow (login, logout, protected routes)
- Car CRUD operations
- Search and filtering
- Form validation

## Troubleshooting

### Unit Tests

#### Issue: Tests Fail with Module Import Errors
**Solution**: Ensure path aliases are configured in vitest.config.ts
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src')
  }
}
```

#### Issue: Tests Timeout
**Solution**: Increase timeout in test file
```typescript
import { test } from 'vitest'
test('my test', async () => { /* ... */ }, { timeout: 10000 })
```

#### Issue: NextUI Components Not Rendering
**Solution**: Wrap components in NextUIProvider in tests
```typescript
import { NextUIProvider } from '@nextui-org/react'

render(
  <NextUIProvider>
    <YourComponent />
  </NextUIProvider>
)
```

### E2E Tests

#### Issue: Playwright Browser Not Found
**Solution**: Install Chromium browser
```bash
npx playwright install chromium
```

#### Issue: E2E Tests Can't Connect to Server
**Solution**: Check backend is running
```bash
# In backend directory
make run
# Or
go run cmd/api/main.go
```

#### Issue: Tests Fail with "element not found"
**Solution**: Add proper waits
```typescript
await page.waitForSelector('[data-testid="car-list"]')
// Or
await page.getByRole('button', { name: /save/i }).waitFor()
```

#### Issue: Random Test Failures
**Solution**: Playwright retries are configured (max 2). Check:
```bash
# Run with more verbose output
npx playwright test --reporter=list

# Generate trace for debugging
npx playwright test --trace on
```

## Coverage Reports

### View HTML Coverage Report
```bash
npm run test:coverage
# Then open coverage/index.html in browser
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

### Coverage Thresholds
Configured in `vitest.config.ts`:
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

Currently achieved **95%+ coverage** for tested modules!

## CI/CD Integration

Tests are designed to run in GitHub Actions:

### Unit Tests Workflow
```yaml
- name: Run unit tests
  run: |
    cd frontend
    npm test -- --run
    
- name: Generate coverage
  run: npm run test:coverage
```

### E2E Tests Workflow
```yaml
- name: Start backend
  run: |
    cd backend
    make run &
    
- name: Run E2E tests
  run: |
    cd frontend
    npm run test:e2e
```

## Best Practices

### Writing Unit Tests
1. Test behavior, not implementation
2. Use accessible queries (getByRole, getByLabelText)
3. Test user interactions, not component internals
4. Keep tests isolated and independent
5. Use descriptive test names

### Writing E2E Tests
1. Test complete user workflows
2. Use Playwright's auto-waiting features
3. Avoid hardcoded waits (setTimeout)
4. Use data-testid sparingly, prefer accessible queries
5. Clean up test data after tests

### Performance Tips
1. Run unit tests frequently (they're fast!)
2. Run E2E tests before commits
3. Use `--watch` mode during development
4. Run coverage periodically, not on every test run
5. Parallelize E2E tests when possible

## Quick Commands Cheat Sheet

```bash
# Development
npm test -- --watch          # Unit tests in watch mode
npm run test:coverage        # Coverage report

# CI/CD
npm test -- --run            # Run once and exit
npm run test:e2e             # E2E tests headless

# Debugging
npm test -- --reporter=verbose    # Verbose unit tests
npx playwright test --debug      # Debug E2E with Inspector
npx playwright test --ui         # Interactive UI mode

# Coverage
npm run test:coverage        # Generate coverage
open coverage/index.html     # View coverage report

# Specific tests
npm test LoginForm           # Run LoginForm tests only
npx playwright test auth     # Run auth E2E tests only
```

## Need Help?

- **Vitest Docs**: https://vitest.dev
- **Testing Library**: https://testing-library.com
- **Playwright Docs**: https://playwright.dev
- **Project Docs**: See [TESTING_SUMMARY.md](TESTING_SUMMARY.md)

---

**Happy Testing! 🧪✨**
