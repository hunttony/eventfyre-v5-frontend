// Import the jest-dom library for custom matchers
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock console methods
const originalConsole = { ...console };
const consoleSpy = (method) => {
  return jest.spyOn(console, method).mockImplementation((...args) => {
    // Only log if not in CI environment
    if (!process.env.CI) {
      originalConsole[method](...args);
    }
  });
};

// Set up console mocks before each test
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Spy on console methods
  consoleSpy('log');
  consoleSpy('warn');
  consoleSpy('error');
  consoleSpy('debug');
  
  // Reset localStorage mock
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear();
});
