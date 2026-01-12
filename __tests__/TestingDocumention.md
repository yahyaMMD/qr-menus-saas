# Test Suite Documentation

This directory contains unit and integration tests for the QResto platform.

## Test Structure

```
__tests__/
├── lib/                    # Unit tests for utility libraries
│   ├── utils.test.ts       # General utilities (cn function)
│   ├── auth/
│   │   ├── jwt.test.ts     # JWT token generation and verification
│   │   └── password.test.ts # Password hashing and verification
│   ├── seo/
│   │   └── utils.test.ts   # SEO metadata generation
│   └── languages.test.ts    # Language utilities
├── api/                     # API route tests (currently skipped due to Next.js dependencies)
│   ├── auth.test.ts
│   └── menus.test.ts
├── components/              # Component tests
│   └── ui/
│       ├── button.test.tsx
│       └── input.test.tsx
└── integration/            # Integration tests
    └── auth-flow.test.ts   # Complete authentication flow
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Coverage

### Unit Tests (67 tests passing)

1. **Utility Functions** (`lib/utils.test.ts`)
   - Class name merging with `cn()` function
   - Tailwind class conflict resolution
   - Conditional class handling

2. **JWT Authentication** (`lib/auth/jwt.test.ts`)
   - Token generation (access & refresh)
   - Token verification
   - Token extraction from headers
   - Edge cases (invalid tokens, wrong token types)

3. **Password Security** (`lib/auth/password.test.ts`)
   - Password hashing with Argon2
   - Password verification
   - Security checks (different salts, invalid hashes)

4. **SEO Utilities** (`lib/seo/utils.test.ts`)
   - Metadata generation
   - Structured data (JSON-LD)
   - OpenGraph and Twitter cards
   - Organization, Restaurant, Menu schemas

5. **Language Support** (`lib/languages.test.ts`)
   - Language lookup by code
   - RTL/LTR detection
   - Language flags and names

### Component Tests

1. **Button Component** (`components/ui/button.test.tsx`)
   - Rendering with text
   - Variant and size classes
   - Click event handling
   - Disabled state
   - asChild prop for composition

2. **Input Component** (`components/ui/input.test.tsx`)
   - Basic rendering
   - Placeholder and value handling
   - User input events
   - Disabled state
   - Type variations

### Integration Tests

1. **Authentication Flow** (`integration/auth-flow.test.ts`)
   - Complete registration flow
   - Password hashing and verification
   - Token generation and refresh
   - Error handling for invalid credentials

## Skipped Tests

Some API route tests are currently skipped due to circular dependency issues with Next.js server components (`NextRequest`, `NextResponse`). These would require a more complex test setup with proper mocking of Next.js internals.

The core logic is still tested through:
- Unit tests for individual functions
- Integration tests for complete flows
- Component tests for UI elements

## Test Configuration

- **Jest**: Test runner
- **React Testing Library**: Component testing
- **@testing-library/jest-dom**: DOM matchers
- **@testing-library/user-event**: User interaction simulation

Configuration files:
- `jest.config.js`: Jest configuration
- `jest.setup.js`: Test environment setup and mocks

## Notes

- All tests use mocked dependencies to avoid database/API calls
- Environment variables are set in `jest.setup.js`
- Tests are designed to be fast and isolated
- Integration tests verify complete flows without external dependencies

