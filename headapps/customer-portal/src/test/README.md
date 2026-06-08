# Test Suite Documentation

## Overview

This test suite provides comprehensive unit tests for the login and register pages and their components using Vitest and React Testing Library.

## Test Coverage

Target coverage: **>80%** for all auth-related components.

### Test Files Structure

```
src/
├── __tests__/
│   ├── components/
│   │   ├── login/
│   │   │   ├── LoginPage.test.tsx
│   │   │   ├── LoginForm.test.tsx
│   │   │   └── OktaSignInWidget.test.tsx
│   │   ├── register/
│   │   │   ├── RegisterPage.test.tsx
│   │   │   ├── RegisterForm.test.tsx
│   │   │   └── OktaRegistrationWidget.test.tsx
│   └── app/
│       ├── login/
│       │   └── page.test.tsx
│       └── register/
│           └── page.test.tsx
└── test/
    ├── mocks/
    │   ├── okta-signin-widget.ts
    │   ├── next-navigation.ts
    │   └── okta-config.ts
    └── setup.ts
```

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Test Categories

### 1. Page Components Tests
- **LoginPage.test.tsx**: Tests page composition and layout
- **RegisterPage.test.tsx**: Tests page composition and layout

### 2. Form Components Tests
- **LoginForm.test.tsx**: Tests form rendering, error handling, callbacks, and navigation links
- **RegisterForm.test.tsx**: Tests form rendering, error handling, callbacks, and navigation links

### 3. Widget Components Tests
- **OktaSignInWidget.test.tsx**: Tests widget initialization, configuration, callbacks, and cleanup
- **OktaRegistrationWidget.test.tsx**: Tests widget initialization with registration enabled

### 4. Route Tests
- **page.test.tsx** (for each route): Tests route component rendering

## Mock Utilities

### Okta Sign-In Widget Mock
Located in `src/test/mocks/okta-signin-widget.ts`
- Mocks the Okta Sign-In Widget class
- Provides test helpers for triggering success/error callbacks

### Next.js Navigation Mock
Located in `src/test/mocks/next-navigation.ts`
- Mocks `useRouter` and `useSearchParams` hooks
- Provides mock implementations for navigation functions

### Okta Config Mock
Located in `src/test/mocks/okta-config.ts`
- Mocks Okta configuration functions
- Provides default test configuration values

## Test Scenarios Covered

### Login Components
- ✅ Page composition and layout
- ✅ Form rendering with header and footer
- ✅ Okta widget integration
- ✅ Error handling from URL parameters
- ✅ Success/error callbacks
- ✅ Navigation links (reset password, register)
- ✅ Widget initialization and configuration
- ✅ Widget cleanup on unmount

### Register Components
- ✅ Page composition and layout
- ✅ Form rendering with header and footer
- ✅ Okta registration widget integration
- ✅ Error handling from URL parameters
- ✅ Success/error callbacks
- ✅ Navigation links (login)
- ✅ Widget initialization with registration enabled
- ✅ showSignUp method call

## Best Practices

1. **Isolation**: Each test is isolated and doesn't depend on other tests
2. **Mocking**: External dependencies are properly mocked
3. **Coverage**: All major code paths are tested
4. **Accessibility**: Tests verify proper ARIA attributes and semantic HTML
5. **User Interactions**: Tests use `@testing-library/user-event` for realistic interactions

## Coverage Goals

- **Lines**: >80%
- **Functions**: >80%
- **Branches**: >80%
- **Statements**: >80%

## Notes

- Tests use Vitest's `vi.fn()` for mocking
- React Testing Library is used for component testing
- `@testing-library/user-event` is used for user interaction simulation
- Fake timers are used for testing setTimeout/setInterval

