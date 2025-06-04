import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { mockApiCall } from '../utils/mockDataService';

// Mock console to avoid polluting test output
const originalConsole = { ...console };

beforeAll(() => {
  // Suppress console output during tests
  global.console = {
    ...console,
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
});

afterAll(() => {
  // Restore original console
  global.console = originalConsole;
});

describe('Mock Data Service', () => {
  afterEach(() => {
    // Clear all mocks after each test
    vi.clearAllMocks();
  });

  it('should generate upcoming events', async () => {
    const response = await mockApiCall('getUpcomingEvents');
    expect(response).toHaveProperty('status', 200);
    expect(response).toHaveProperty('data');
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
    
    // Verify event structure
    const event = response.data[0];
    expect(event).toHaveProperty('id');
    expect(event).toHaveProperty('title');
    expect(event).toHaveProperty('description');
    expect(event).toHaveProperty('startDate');
    expect(event).toHaveProperty('endDate');
  });

  it('should generate past events', async () => {
    const response = await mockApiCall('getPastEvents');
    expect(response).toHaveProperty('status', 200);
    expect(response).toHaveProperty('data');
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
    
    // Verify event structure
    const event = response.data[0];
    expect(event).toHaveProperty('id');
    expect(event).toHaveProperty('title');
    expect(event).toHaveProperty('description');
    expect(event).toHaveProperty('startDate');
    expect(event).toHaveProperty('endDate');
  });

  it('should generate saved events', async () => {
    const response = await mockApiCall('getSavedEvents');
    expect(response).toHaveProperty('status', 200);
    expect(response).toHaveProperty('data');
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
    
    // Verify event structure
    const event = response.data[0];
    expect(event).toHaveProperty('id');
    expect(event).toHaveProperty('title');
    expect(event).toHaveProperty('description');
    expect(event).toHaveProperty('startDate');
    expect(event).toHaveProperty('endDate');
  });

  it('should handle unknown endpoints', async () => {
    const response = await mockApiCall('unknownEndpoint');
    expect(response).toHaveProperty('status', 200);
    expect(response).toHaveProperty('data');
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.data[0]).toHaveProperty('id');
    expect(response.data[0]).toHaveProperty('title');
  });
});
