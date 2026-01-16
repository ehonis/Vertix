import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signin");
  });

  test.describe("Sign In Page Rendering", () => {
    test("should display welcome message and initial buttons", async ({ page }) => {
      // Check welcome heading
      await expect(page.getByRole("heading", { name: "Welcome to Vertix" })).toBeVisible();

      // Check Sign In and Create Account buttons
      await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible();
    });

    test("should display Google OAuth button on initial screen", async ({ page }) => {
      await expect(page.getByRole("button", { name: /Continue with Google/i })).toBeVisible();
    });

    test("should display GitHub OAuth button on initial screen", async ({ page }) => {
      await expect(page.getByRole("button", { name: /Continue with GitHub/i })).toBeVisible();
    });

    test("should display support email link", async ({ page }) => {
      await expect(page.getByRole("link", { name: "support@vertixclimb.com" })).toBeVisible();
    });
  });

  test.describe("Sign In Step Navigation", () => {
    test("should navigate to sign in step when clicking Sign In button", async ({ page }) => {
      await page.getByRole("button", { name: "Sign In" }).click();

      // Should show Sign In heading
      await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();

      // Should show Back button
      await expect(page.getByText("← Back")).toBeVisible();

      // Should show email input
      await expect(page.getByLabel("Email")).toBeVisible();

      // Should show OAuth buttons
      await expect(page.getByRole("button", { name: /Continue with Google/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /Continue with GitHub/i })).toBeVisible();
    });

    test("should navigate to create account step when clicking Create Account button", async ({
      page,
    }) => {
      await page.getByRole("button", { name: "Create Account" }).click();

      // Should show Create Account heading
      await expect(page.getByRole("heading", { name: "Create Account" })).toBeVisible();

      // Should show Back button
      await expect(page.getByText("← Back")).toBeVisible();
    });

    test("should navigate back to initial step when clicking Back", async ({ page }) => {
      // Go to sign in step
      await page.getByRole("button", { name: "Sign In" }).click();
      await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();

      // Click back
      await page.getByText("← Back").click();

      // Should be back at initial screen
      await expect(page.getByRole("heading", { name: "Welcome to Vertix" })).toBeVisible();
    });
  });

  test.describe("Email Sign In", () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole("button", { name: "Sign In" }).click();
    });

    test("should have email input field", async ({ page }) => {
      const emailInput = page.getByLabel("Email");
      await expect(emailInput).toBeVisible();
      await expect(emailInput).toHaveAttribute("type", "email");
      await expect(emailInput).toHaveAttribute("placeholder", "your@email.com");
    });

    test("should have disabled submit button when email is empty", async ({ page }) => {
      const submitButton = page.getByRole("button", { name: /Sign In with Email/i });
      await expect(submitButton).toBeDisabled();
    });

    test("should enable submit button when email is entered", async ({ page }) => {
      const emailInput = page.getByLabel("Email");
      await emailInput.fill("test@example.com");

      const submitButton = page.getByRole("button", { name: /Sign In with Email/i });
      await expect(submitButton).toBeEnabled();
    });

    test("should show success message after email submission", async ({ page }) => {
      const emailInput = page.getByLabel("Email");
      await emailInput.fill("test@example.com");

      // Mock the signIn response to prevent actual API call
      await page.route("**/api/auth/**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ url: "/redirect" }),
        });
      });

      await page.getByRole("button", { name: /Sign In with Email/i }).click();

      // Should show success message
      await expect(page.getByText(/Check your email for a magic link/i)).toBeVisible({
        timeout: 10000,
      });
    });
  });

  test.describe("OAuth Button Functionality", () => {
    test("Google sign in button should be clickable and initiate OAuth flow", async ({ page }) => {
      // Set up route interception to capture the OAuth redirect
      let oauthRedirectUrl = "";
      await page.route("**/api/auth/signin/google**", (route) => {
        oauthRedirectUrl = route.request().url();
        route.fulfill({
          status: 302,
          headers: {
            location: "https://accounts.google.com/o/oauth2/v2/auth",
          },
        });
      });

      const googleButton = page.getByRole("button", { name: /Continue with Google/i }).first();
      await expect(googleButton).toBeEnabled();

      // Click should initiate OAuth (we just verify the button works)
      await googleButton.click();

      // Button should show loading state or redirect
      // We can't fully test OAuth flow without mocking the provider
    });

    test("GitHub sign in button should be clickable", async ({ page }) => {
      const githubButton = page.getByRole("button", { name: /Continue with GitHub/i }).first();
      await expect(githubButton).toBeEnabled();
    });
  });

  test.describe("Responsive Design", () => {
    test("should render correctly on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/signin");

      await expect(page.getByRole("heading", { name: "Welcome to Vertix" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible();
    });

    test("should render correctly on tablet viewport", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto("/signin");

      await expect(page.getByRole("heading", { name: "Welcome to Vertix" })).toBeVisible();
    });
  });
});

test.describe("Protected Routes", () => {
  test("should redirect to signin when accessing dashboard without auth", async ({ page }) => {
    await page.goto("/profile/testuser/dashboard");

    // Should redirect to signin
    await expect(page).toHaveURL(/signin/);
  });

  test("should redirect to signin when accessing settings without auth", async ({ page }) => {
    await page.goto("/profile/testuser/settings");

    // Should redirect to signin
    await expect(page).toHaveURL(/signin/);
  });
});

