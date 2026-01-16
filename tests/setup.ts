/**
 * Vitest setup file
 * Runs before all tests to configure the test environment
 */

// Set test environment variables
process.env.NODE_ENV = "test";

// Mock environment variables for tests
process.env.AUTH_SECRET = "test-auth-secret-for-testing-only";
process.env.TWILIO_ACCOUNT_SID = "test-twilio-sid";
process.env.TWILIO_AUTH_TOKEN = "test-twilio-token";
process.env.TWILIO_PHONE_NUMBER = "+15555555555";

// Global test utilities
beforeAll(() => {
  // Setup before all tests
});

afterAll(() => {
  // Cleanup after all tests
});

