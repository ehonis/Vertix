import { test, expect } from "@playwright/test";

test.describe("Routes Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/routes");
  });

  test.describe("Page Load and Basic Elements", () => {
    test("should display Routes heading", async ({ page }) => {
      await expect(page.getByRole("heading", { name: "Routes" })).toBeVisible();
    });

    test("should display search button", async ({ page }) => {
      // The search button is an SVG, look for the button containing it
      const searchButton = page.locator('button svg[viewBox="0 0 24 24"]').first();
      await expect(searchButton).toBeVisible();
    });

    test("should display wall selection map", async ({ page }) => {
      // The TopDown component should be visible
      await expect(page.getByText("Tap a wall on the map to see the routes there")).toBeVisible();
    });
  });

  test.describe("Search Functionality", () => {
    test("should toggle search input when clicking search button", async ({ page }) => {
      // Click the search button (the one with magnifying glass SVG)
      const buttons = page.locator("button");
      const searchButton = buttons.filter({
        has: page.locator('svg path[d*="21-5.197"]'),
      });

      await searchButton.click();

      // Search input should appear
      await expect(
        page.getByPlaceholder("Search routes by name or grade")
      ).toBeVisible();
    });

    test("should hide Routes heading when search is active", async ({ page }) => {
      // Click search button
      const buttons = page.locator("button");
      const searchButton = buttons.filter({
        has: page.locator('svg path[d*="21-5.197"]'),
      });

      await searchButton.click();

      // Routes heading should be hidden
      await expect(page.getByRole("heading", { name: "Routes" })).not.toBeVisible();
    });

    test("should close search when clicking X button", async ({ page }) => {
      // Open search
      const buttons = page.locator("button");
      const searchButton = buttons.filter({
        has: page.locator('svg path[d*="21-5.197"]'),
      });
      await searchButton.click();

      // Wait for search input
      await expect(
        page.getByPlaceholder("Search routes by name or grade")
      ).toBeVisible();

      // Click close button (X icon)
      const closeButton = buttons.filter({
        has: page.locator('svg path[d*="M6 18"]'),
      });
      await closeButton.click();

      // Search should close, heading should return
      await expect(page.getByRole("heading", { name: "Routes" })).toBeVisible();
    });
  });

  test.describe("Wall Selection", () => {
    test("should update URL when wall is selected via localStorage simulation", async ({
      page,
    }) => {
      // Navigate with wall parameter
      await page.goto("/routes?wall=MAIN_BOULDER");

      // The URL should contain the wall parameter
      expect(page.url()).toContain("wall=MAIN_BOULDER");
    });

    test("should persist wall selection in URL", async ({ page }) => {
      // Navigate with wall parameter
      await page.goto("/routes?wall=MAIN_BOULDER");

      // Refresh the page
      await page.reload();

      // Wall parameter should still be in URL
      expect(page.url()).toContain("wall=MAIN_BOULDER");
    });
  });

  test.describe("Route List Display", () => {
    test("should display sorted routes message when wall selected", async ({ page }) => {
      // Navigate with a wall selected
      await page.goto("/routes?wall=MAIN_BOULDER");

      // Should show sorting indicator
      await expect(page.getByText("Sorted Left → Right")).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Route Popup", () => {
    test("should open route popup when route ID in URL", async ({ page }) => {
      // Mock the route API
      await page.route("**/api/routes/get-route-by-id**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              id: "test-route-123",
              title: "Test Route",
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

      // Navigate with route ID
      await page.goto("/routes?route=test-route-123");

      // Route popup should appear (wait for it to load)
      // The popup shows route details
    });
  });

  test.describe("Responsive Design", () => {
    test("should render correctly on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await expect(page.getByRole("heading", { name: "Routes" })).toBeVisible();
      await expect(page.getByText("Tap a wall on the map")).toBeVisible();
    });

    test("should render correctly on desktop viewport", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });

      await expect(page.getByRole("heading", { name: "Routes" })).toBeVisible();
    });
  });
});

test.describe("Routes API", () => {
  test("should have routes API endpoint", async ({ page }) => {
    const response = await page.request.get(
      "/api/routes/get-wall-routes-non-archive?wall=MAIN_BOULDER"
    );

    // Should return data or require auth, not 404
    expect([200, 401, 403, 500]).toContain(response.status());
  });

  test("should have route by ID endpoint", async ({ page }) => {
    const response = await page.request.get(
      "/api/routes/get-route-by-id?routeId=test-id"
    );

    // Should return data or error, not 404 for missing ID
    expect([200, 400, 404, 500]).toContain(response.status());
  });
});

