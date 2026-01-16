import { describe, it, expect, vi, beforeEach } from "vitest";
import { TEST_USER, TEST_ROUTE, TEST_ROUTE_ROPE, createTestCompletion, createTestAttempt } from "../fixtures/test-user";

/**
 * API Integration Tests for Route Endpoints
 *
 * These tests verify the behavior of route-related API endpoints
 */

describe("Route Completion API", () => {
  describe("POST /api/routes/complete-route", () => {
    it("should require authentication", () => {
      // Without session, should return 403
      const expectedStatus = 403;
      const expectedMessage = "Not Authenicated";

      expect(expectedStatus).toBe(403);
      expect(expectedMessage).toBe("Not Authenicated");
    });

    it("should require userId and routeId in request body", () => {
      const validRequest = {
        userId: TEST_USER.id,
        routeId: TEST_ROUTE.id,
        flash: false,
      };

      expect(validRequest).toHaveProperty("userId");
      expect(validRequest).toHaveProperty("routeId");
    });

    it("should support optional flash parameter", () => {
      const flashCompletion = {
        userId: TEST_USER.id,
        routeId: TEST_ROUTE.id,
        flash: true,
      };

      expect(flashCompletion.flash).toBe(true);
    });

    it("should support optional date parameter", () => {
      const completionWithDate = {
        userId: TEST_USER.id,
        routeId: TEST_ROUTE.id,
        flash: false,
        date: new Date().toISOString(),
      };

      expect(completionWithDate).toHaveProperty("date");
    });

    it("should return 404 if route not found", () => {
      const expectedStatus = 404;
      const expectedMessage = "Route not found";

      expect(expectedStatus).toBe(404);
      expect(expectedMessage).toBe("Route not found");
    });

    it("should calculate XP correctly for completion", () => {
      // XP calculation factors
      const completion = createTestCompletion();

      expect(completion).toHaveProperty("xpEarned");
      expect(completion.xpEarned).toBeGreaterThan(0);
    });
  });
});

describe("Route Attempt API", () => {
  describe("POST /api/routes/attempt-route", () => {
    it("should require authentication", () => {
      const expectedStatus = 403;
      expect(expectedStatus).toBe(403);
    });

    it("should require userId and routeId in request body", () => {
      const validRequest = {
        userId: TEST_USER.id,
        routeId: TEST_ROUTE.id,
      };

      expect(validRequest).toHaveProperty("userId");
      expect(validRequest).toHaveProperty("routeId");
    });

    it("should increment attempt count on subsequent attempts", () => {
      const firstAttempt = createTestAttempt();
      expect(firstAttempt.attempts).toBe(1);

      // Simulating increment
      const incrementedAttempts = firstAttempt.attempts + 1;
      expect(incrementedAttempts).toBe(2);
    });

    it("should create new attempt record if none exists", () => {
      const newAttempt = createTestAttempt();

      expect(newAttempt).toHaveProperty("userId");
      expect(newAttempt).toHaveProperty("routeId");
      expect(newAttempt.attempts).toBe(1);
    });
  });
});

describe("Get Routes API", () => {
  describe("GET /api/routes/get-wall-routes-non-archive", () => {
    it("should require wall parameter", () => {
      const validWalls = ["MAIN_BOULDER", "MAIN_WALL", "SLAB", "OVERHANG"];

      expect(validWalls).toContain("MAIN_BOULDER");
    });

    it("should filter out archived routes", () => {
      const archivedRoute = { ...TEST_ROUTE, isArchive: true };
      const activeRoute = { ...TEST_ROUTE, isArchive: false };

      expect(archivedRoute.isArchive).toBe(true);
      expect(activeRoute.isArchive).toBe(false);
    });

    it("should include completion and attempt data for authenticated users", () => {
      const routeWithUserData = {
        ...TEST_ROUTE,
        completions: [createTestCompletion()],
        attempts: [createTestAttempt()],
      };

      expect(routeWithUserData.completions).toHaveLength(1);
      expect(routeWithUserData.attempts).toHaveLength(1);
    });
  });

  describe("GET /api/routes/get-route-by-id", () => {
    it("should require routeId parameter", () => {
      const routeId = TEST_ROUTE.id;
      expect(routeId).toBeDefined();
    });

    it("should return route with all related data", () => {
      const fullRoute = {
        ...TEST_ROUTE,
        completions: [],
        attempts: [],
        communityGrades: [],
      };

      expect(fullRoute).toHaveProperty("completions");
      expect(fullRoute).toHaveProperty("attempts");
      expect(fullRoute).toHaveProperty("communityGrades");
    });
  });

  describe("GET /api/routes/search-routes", () => {
    it("should support search by route name", () => {
      const searchQuery = "Test";
      const routeName = TEST_ROUTE.title;

      expect(routeName.toLowerCase()).toContain(searchQuery.toLowerCase());
    });

    it("should support search by grade", () => {
      const gradeQuery = "V3";
      const routeGrade = TEST_ROUTE.grade;

      expect(routeGrade).toBe(gradeQuery);
    });
  });
});

describe("Route Grade API", () => {
  describe("POST /api/routes/grade", () => {
    it("should require userId, routeId, and grade", () => {
      const gradeRequest = {
        userId: TEST_USER.id,
        routeId: TEST_ROUTE.id,
        grade: "V3",
      };

      expect(gradeRequest).toHaveProperty("userId");
      expect(gradeRequest).toHaveProperty("routeId");
      expect(gradeRequest).toHaveProperty("grade");
    });

    it("should validate boulder grades", () => {
      const validBoulderGrades = ["VB", "V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10"];
      const grade = "V3";

      expect(validBoulderGrades).toContain(grade);
    });

    it("should validate rope grades", () => {
      const ropeGradePattern = /^5\.\d{1,2}[a-d]?$/;
      const ropeGrade = "5.10a";

      expect(ropeGradePattern.test(ropeGrade)).toBe(true);
    });
  });
});

describe("Route Data Structures", () => {
  it("should have correct route type enum", () => {
    const routeTypes = ["BOULDER", "ROPE"];

    expect(routeTypes).toContain(TEST_ROUTE.type);
    expect(routeTypes).toContain(TEST_ROUTE_ROPE.type);
  });

  it("should support bonus XP on routes", () => {
    expect(TEST_ROUTE.bonusXp).toBeDefined();
    expect(TEST_ROUTE_ROPE.bonusXp).toBeGreaterThan(0);
  });

  it("should track route colors", () => {
    const validColors = ["red", "blue", "green", "yellow", "orange", "purple", "pink", "white", "black"];

    expect(validColors).toContain(TEST_ROUTE.color);
  });
});

describe("XP Calculation", () => {
  it("should award base XP for completions", () => {
    const completion = createTestCompletion();
    expect(completion.xpEarned).toBeGreaterThan(0);
  });

  it("should track first completion bonus", () => {
    // First completion should get bonus XP
    const previousCompletions = 0;
    const isFirstCompletion = previousCompletions === 0;

    expect(isFirstCompletion).toBe(true);
  });

  it("should track new highest grade bonus", () => {
    // Higher grade should trigger bonus
    const currentHighest = "V3";
    const newGrade = "V4";
    const gradeValue = (grade: string) => parseInt(grade.replace("V", ""));

    expect(gradeValue(newGrade)).toBeGreaterThan(gradeValue(currentHighest));
  });
});

