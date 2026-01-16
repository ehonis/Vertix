/**
 * Test fixtures and mock data for authentication and user testing
 */

export const TEST_USER = {
  id: "test-user-id-123",
  email: "testuser@vertixclimb.com",
  name: "Test User",
  username: "testuser",
  image: null,
  role: "USER" as const,
  isOnboarded: true,
  phoneNumber: "+15551234567",
  highestRopeGrade: "5.10a",
  highestBoulderGrade: "V4",
  totalXp: 1500,
};

export const TEST_USER_NOT_ONBOARDED = {
  ...TEST_USER,
  id: "test-user-not-onboarded-456",
  email: "newuser@vertixclimb.com",
  username: null,
  name: null,
  isOnboarded: false,
};

export const TEST_ADMIN_USER = {
  ...TEST_USER,
  id: "test-admin-id-789",
  email: "admin@vertixclimb.com",
  username: "testadmin",
  name: "Test Admin",
  role: "ADMIN" as const,
};

export const TEST_ROUTE = {
  id: "test-route-id-123",
  title: "Test Boulder Problem",
  grade: "V3",
  color: "red",
  wall: "MAIN_BOULDER",
  type: "BOULDER" as const,
  isArchive: false,
  bonusXp: 0,
  description: "A test boulder problem",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const TEST_ROUTE_ROPE = {
  id: "test-route-rope-456",
  title: "Test Rope Route",
  grade: "5.10b",
  color: "blue",
  wall: "MAIN_WALL",
  type: "ROPE" as const,
  isArchive: false,
  bonusXp: 10,
  description: "A test rope route",
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Mock session object for authenticated requests
 */
export const MOCK_SESSION = {
  user: TEST_USER,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
};

/**
 * Generate a mock JWT token for API testing
 */
export function generateMockJWT(userId: string = TEST_USER.id): string {
  // This is a simplified mock - in real tests you'd use the actual jwt library
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
    })
  ).toString("base64url");
  // Note: This is NOT a valid signature - just for structure testing
  const signature = "mock-signature";
  return `${header}.${payload}.${signature}`;
}

/**
 * Test phone numbers for verification testing
 */
export const TEST_PHONE_NUMBERS = {
  valid: "+15551234567",
  validFormatted: "(555) 123-4567",
  invalid: "5551234567", // Missing +1
  international: "+447911123456", // UK number
};

/**
 * Test verification codes
 */
export const TEST_VERIFICATION = {
  validCode: "123456",
  expiredCode: "000000",
  invalidCode: "999999",
};

/**
 * API response helpers for consistent test assertions
 */
export const API_RESPONSES = {
  unauthorized: { message: "Not Authenicated", status: 403 },
  notFound: { message: "Not found", status: 404 },
  success: { status: 200 },
};

/**
 * Helper to create test completion data
 */
export function createTestCompletion(
  userId: string = TEST_USER.id,
  routeId: string = TEST_ROUTE.id
) {
  return {
    id: `completion-${Date.now()}`,
    userId,
    routeId,
    xpEarned: 100,
    completionDate: new Date(),
    flash: false,
    createdAt: new Date(),
  };
}

/**
 * Helper to create test attempt data
 */
export function createTestAttempt(userId: string = TEST_USER.id, routeId: string = TEST_ROUTE.id) {
  return {
    userId,
    routeId,
    attempts: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

