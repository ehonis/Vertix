/**
 * Prisma mock for API testing
 * Allows testing API routes without hitting the actual database
 */

import { vi } from "vitest";
import { TEST_USER, TEST_ROUTE, TEST_ROUTE_ROPE, createTestCompletion, createTestAttempt } from "./test-user";

// Type definitions for mock functions
type MockFunction = ReturnType<typeof vi.fn>;

interface MockPrismaModel {
  findUnique: MockFunction;
  findMany: MockFunction;
  create: MockFunction;
  update: MockFunction;
  upsert: MockFunction;
  delete: MockFunction;
}

interface MockPrisma {
  user: MockPrismaModel;
  route: MockPrismaModel;
  routeCompletion: MockPrismaModel;
  routeAttempt: MockPrismaModel;
  verificationCode: MockPrismaModel;
  communityGrade: MockPrismaModel;
}

/**
 * Create a mock Prisma client with default implementations
 */
export function createMockPrisma(): MockPrisma {
  return {
    user: {
      findUnique: vi.fn().mockResolvedValue(TEST_USER),
      findMany: vi.fn().mockResolvedValue([TEST_USER]),
      create: vi.fn().mockImplementation((data) => Promise.resolve({ ...TEST_USER, ...data.data })),
      update: vi.fn().mockImplementation((args) => Promise.resolve({ ...TEST_USER, ...args.data })),
      upsert: vi.fn().mockResolvedValue(TEST_USER),
      delete: vi.fn().mockResolvedValue(TEST_USER),
    },
    route: {
      findUnique: vi.fn().mockResolvedValue(TEST_ROUTE),
      findMany: vi.fn().mockResolvedValue([TEST_ROUTE, TEST_ROUTE_ROPE]),
      create: vi.fn().mockImplementation((data) => Promise.resolve({ ...TEST_ROUTE, ...data.data })),
      update: vi.fn().mockImplementation((args) => Promise.resolve({ ...TEST_ROUTE, ...args.data })),
      upsert: vi.fn().mockResolvedValue(TEST_ROUTE),
      delete: vi.fn().mockResolvedValue(TEST_ROUTE),
    },
    routeCompletion: {
      findUnique: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockImplementation(() => Promise.resolve(createTestCompletion())),
      update: vi.fn().mockResolvedValue(createTestCompletion()),
      upsert: vi.fn().mockResolvedValue(createTestCompletion()),
      delete: vi.fn().mockResolvedValue(createTestCompletion()),
    },
    routeAttempt: {
      findUnique: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockImplementation(() => Promise.resolve(createTestAttempt())),
      update: vi.fn().mockResolvedValue(createTestAttempt()),
      upsert: vi.fn().mockImplementation(() => Promise.resolve(createTestAttempt())),
      delete: vi.fn().mockResolvedValue(createTestAttempt()),
    },
    verificationCode: {
      findUnique: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockImplementation((data) =>
        Promise.resolve({
          phoneNumber: data.data.phoneNumber,
          code: data.data.code,
          expiresAt: data.data.expiresAt,
          attempts: 0,
          createdAt: new Date(),
        })
      ),
      update: vi.fn(),
      upsert: vi.fn().mockImplementation((args) =>
        Promise.resolve({
          phoneNumber: args.where.phoneNumber,
          code: args.create?.code || args.update?.code || "123456",
          expiresAt: args.create?.expiresAt || args.update?.expiresAt || new Date(Date.now() + 600000),
          attempts: 0,
          createdAt: new Date(),
        })
      ),
      delete: vi.fn(),
    },
    communityGrade: {
      findUnique: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
  };
}

/**
 * Reset all mock functions to their default state
 */
export function resetMockPrisma(mockPrisma: MockPrisma): void {
  Object.values(mockPrisma).forEach((model) => {
    Object.values(model).forEach((fn) => {
      if (typeof fn === "function" && "mockReset" in fn) {
        (fn as MockFunction).mockReset();
      }
    });
  });
}

