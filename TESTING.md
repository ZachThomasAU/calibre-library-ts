# Testing calibredb-ts

The integration tests for `calibredb-ts` focus on verifying that the wrapper correctly interfaces with the actual `calibredb` command-line tool. The tests are designed to be:

1. **Isolated**: Each test runs in its own temporary Calibre library
2. **Self-contained**: Tests generate their own test data (EPUB files)
3. **Comprehensive**: All main functionality is tested
4. **Clean**: Tests clean up after themselves

We do not currently have any unit tests. If we add more interesting internal logic, we'll add unit tests for that logic when it makes sense to do so.

## Test Structure

The tests are organized to match the project's structure:

```
src/
├── commands/
│   ├── __tests__/               # File specific tests
│   │   ├── list.test.ts
│   │   ├── add.test.ts
│   │   └── remove.test.ts
└── __tests__/
    └── utils/                   # Shared tests and utilities
        └── index.ts
```

## Key Testing Patterns

1. **Test Library Management**
   - Each test creates a fresh, isolated Calibre library in a temporary directory
   - Library is automatically cleaned up after tests complete
   - Uses the `withTestLibrary` helper for consistent setup/teardown

2. **Test Data Generation**
   - Generates minimal but valid EPUB files on demand
   - Creates EPUBs with controlled metadata for predictable testing
   - Uses the `createMinimalEpub` and `createMultipleEpubs` helpers

3. **Verification Helpers**
   - `verifyBookExists` and `verifyBookNotExists` for checking library state
   - Direct Calibre CLI calls to verify results independently of the wrapper

## Test Coverage

The integration tests must have coverage of:

- All functions in the `commands` directory.

## Running the Tests

To run the tests:

```bash
pnpm test             # Run all tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage reporting
```

## CI Integration

The project includes a GitHub Actions workflow that:
1. Sets up Node.js with pnpm
2. Installs Calibre CLI tool
3. Runs tests on multiple Node.js versions
4. Generates and uploads coverage reports
