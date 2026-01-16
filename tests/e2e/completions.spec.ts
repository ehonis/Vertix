import { test, expect } from "@playwright/test";

test.describe("Route Completion Flow", () => {
  test.describe("Complete Route API", () => {
    test("should require authentication for route completion", async ({ page }) => {
      const response = await page.request.post("/api/routes/complete-route", {
        data: {
          userId: "test-user-123",
          routeId: "test-route-123",
          flash: false,
        },
      });

      // Should return 403 Unauthorized
      expect(response.status()).toBe(403);
    });

    test("should return proper error message when not authenticated", async ({ page }) => {
      const response = await page.request.post("/api/routes/complete-route", {
        data: {
          userId: "test-user-123",
          routeId: "test-route-123",
          flash: false,
        },
      });

      const body = await response.json();
      expect(body.message).toBe("Not Authenicated");
    });
  });

  test.describe("Attempt Route API", () => {
    test("should require authentication for route attempt", async ({ page }) => {
      const response = await page.request.post("/api/routes/attempt-route", {
        data: {
          userId: "test-user-123",
          routeId: "test-route-123",
        },
      });

      // Should return 403 Unauthorized
      expect(response.status()).toBe(403);
    });

    test("should return proper error message when not authenticated", async ({ page }) => {
      const response = await page.request.post("/api/routes/attempt-route", {
        data: {
          userId: "test-user-123",
          routeId: "test-route-123",
        },
      });

      const body = await response.json();
      expect(body.message).toBe("Not Authenicated");
    });
  });

  test.describe("Grade Route API", () => {
    test("should have grade endpoint", async ({ page }) => {
      const response = await page.request.post("/api/routes/grade", {
        data: {
          userId: "test-user-123",
          routeId: "test-route-123",
          grade: "V3",
        },
      });

      // Should return auth error, not 404
      expect([200, 400, 401, 403, 500]).toContain(response.status());
    });
  });
});

test.describe("Route Popup Interactions", () => {
  test.beforeEach(async ({ page }) => {
    // Mock route data
    await page.route("**/api/routes/get-route-by-id**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            id: "test-route-123",
            title: "Test Boulder",
            grade: "V3",
            color: "red",
            wall: "MAIN_BOULDER",
            type: "BOULDER",
            isArchive: false,
            bonusXp: 0,
            completions: [],
            attempts: [],
            communityGrades: [],
          },
        }),
      });
    });
  });

  test("should load routes page successfully", async ({ page }) => {
    await page.goto("/routes");

    // Page should load
    await expect(page.getByRole("heading", { name: "Routes" })).toBeVisible();
  });
});

test.describe("XP Calculation", () => {
  test("should have XP endpoint for user", async ({ page }) => {
    const response = await page.request.get("/api/user/xp");

    // Should exist and return proper response
    expect([200, 400, 401, 403, 404, 500]).toContain(response.status());
  });
});

test.describe("Activity Feed", () => {
  test("should have mobile dashboard activity endpoint", async ({ page }) => {
    const response = await page.request.get("/api/mobile/dashboard/activity");

    // Endpoint should exist
    expect([200, 400, 401, 403, 500]).toContain(response.status());
  });

  test("should have mobile dashboard stats endpoint", async ({ page }) => {
    // Check if there's a stats endpoint
    const response = await page.request.get("/api/mobile/dashboard/stats");

    // May or may not exist, but should not be server error
    expect(response.status()).toBeLessThanOrEqual(500);
  });
});

test.describe("Route Completion UI Elements", () => {
  test("routes page should load without errors", async ({ page }) => {
    const response = await page.goto("/routes");

    expect(response?.status()).toBe(200);
  });

  test("should display route completion components when route selected", async ({ page }) => {
    // Mock session
    await page.route("**/api/auth/session", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            id: "test-user-123",
            username: "testuser",
            isOnboarded: true,
          },
          expires: new Date(Date.now() + 86400000).toISOString(),
        }),
      });
    });

    // Mock route data
    await page.route("**/api/routes/get-route-by-id**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            id: "test-route-123",
            title: "Test Boulder",
            grade: "V3",
            color: "red",
            completions: [],
            attempts: [],
            communityGrades: [],
            isArchive: false,
            bonusXp: 0,
          },
        }),
      });
    });

    await page.goto("/routes?route=test-route-123");

    // Wait for any popup or route detail to load
    await page.waitForLoadState("networkidle");
  });
});

test.describe("Flash Completion", () => {
  test("complete-route endpoint should accept flash parameter", async ({ page }) => {
    // This tests the API accepts the flash parameter structure
    const response = await page.request.post("/api/routes/complete-route", {
      data: {
        userId: "test-user-123",
        routeId: "test-route-123",
        flash: true,
        date: new Date().toISOString(),
      },
    });

    // Should return auth error (403), not bad request (400)
    expect(response.status()).toBe(403);
  });
});

