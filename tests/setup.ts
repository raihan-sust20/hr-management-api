import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.test') });

// Set test environment
process.env.NODE_ENV = 'test';

// Mock logger to suppress logs during tests
jest.mock('../src/config/logger.config', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Global test timeout
jest.setTimeout(10000);

// Setup before all tests
beforeAll(async () => {
  // Setup code here (e.g., initialize test database)
});

// Cleanup after all tests
afterAll(async () => {
  // Cleanup code here (e.g., close database connections)
});

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
