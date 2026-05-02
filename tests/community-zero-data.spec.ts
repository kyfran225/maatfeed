import { test, expect } from '@playwright/test';

const WEB_BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5173';
const API_BASE_URL = process.env.API_BASE_URL ?? 'http://127.0.0.1:4000';

/**
 * Community Page - Zero Data State Tests
 *
 * These tests validate that the Community page displays correctly
 * when there is NO community data (0 debates, 0 comments, etc.)
 *
 * Run this after executing: npm run cleanup:community
 */

test.describe('Community Page - Zero Data State', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the feed page first (main entry point)
    // Use domcontentloaded to avoid timeout with ongoing network activity (WebSockets, etc.)
    await page.goto(WEB_BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Navigate to Community page via bottom navigation
    const communityNav = page.locator('[data-testid="nav-community"], nav a[href*="community"]').first();

    if (await communityNav.isVisible().catch(() => false)) {
      await communityNav.click();
    } else {
      // Direct navigation as fallback
      await page.goto(`${WEB_BASE_URL}/community`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    }

    // Wait for community page DOM to load
    await page.waitForLoadState('domcontentloaded');

    // Wait for Community page content to render (lazy-loaded component)
    // Firefox is slower, so use longer timeout
    await page.waitForSelector('h1, [data-testid="empty-debates"], .empty-state', { timeout: 20000 });
  });

  test('displays empty state when no debates exist', async ({ page }) => {
    // Verify we're on the community page
    await expect(page).toHaveURL(/.*community.*/);

    // Check for empty state indicators
    const emptyState = page.locator('[data-testid="empty-debates"], .empty-state, .no-debates').first();
    const debatesList = page.locator('[data-testid="debates-list"], .debates-list, .debate-card').first();

    // Either empty state should be visible OR no debate cards should exist
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    const hasDebates = await debatesList.isVisible().catch(() => false);

    // In zero data state, we should either see an empty state message OR no debate cards
    expect(hasEmptyState || !hasDebates).toBeTruthy();
  });

  test('page structure renders correctly without data', async ({ page }) => {
    // Verify page header/title exists
    const header = page.locator('h1, [data-testid="page-header"], .page-title').first();
    await expect(header).toBeVisible();

    // Verify top navigation/banner is present (bottom nav is mobile-only)
    const topNav = page.locator('header, [role="banner"], .top-bar').first();
    await expect(topNav).toBeVisible();
  });

  test('create debate button hidden when not authenticated', async ({ page }) => {
    // The "Nouveau Débat" button only shows when user is authenticated
    // In zero-data tests without auth, the button should NOT be present
    const createButton = page.locator('button').filter({ hasText: /Nouveau Débat|Créer|Create/ });

    // Verify we're not logged in ("Accès" link visible instead of profile)
    const loginLink = page.locator('a[href="/auth"]');
    const hasLoginLink = await loginLink.count() > 0;

    if (hasLoginLink) {
      // Not authenticated - create button should be hidden
      const buttonCount = await createButton.count();
      expect(buttonCount).toBe(0);
    }
  });

  test('no errors displayed on page', async ({ page }) => {
    // Check for error messages
    const errorMessages = page.locator('.error, [data-testid="error"], .error-message, .alert-error');
    const errorCount = await errorMessages.count();

    // Should have no error messages
    expect(errorCount).toBe(0);

    // Check console for errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Give time for any console errors to appear
    await page.waitForTimeout(1000);

    // Filter out non-critical errors (e.g., favicon, analytics, YouTube cookies)
    const criticalErrors = consoleErrors.filter(err =>
      !err.includes('favicon') &&
      !err.includes('analytics') &&
      !err.includes('gtag') &&
      !err.includes('google') &&
      !err.includes('youtube') &&
      !err.includes('__Secure-') &&
      !err.includes('Cookie') &&
      !err.includes('SameSite')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('comments section shows empty state', async ({ page }) => {
    // Try to open a content detail view if available
    const contentCard = page.locator('[data-testid="content-card"], .content-item').first();

    if (await contentCard.isVisible().catch(() => false)) {
      await contentCard.click();

      // Wait for detail view
      await page.waitForTimeout(500);

      // Look for comments section
      const commentsSection = page.locator('[data-testid="comments-section"], .comments, .comment-list').first();

      if (await commentsSection.isVisible().catch(() => false)) {
        // Check for empty comments state
        const emptyComments = page.locator(
          '[data-testid="no-comments"], .no-comments, .empty-comments, ' +
          'text=Aucun commentaire, text=No comments'
        ).first();

        // Should either show empty state or have 0 comments
        const hasEmptyState = await emptyComments.isVisible().catch(() => false);
        const commentCount = await page.locator('.comment-item, [data-testid="comment"]').count();

        expect(hasEmptyState || commentCount === 0).toBeTruthy();
      }
    }
  });
});

test.describe('Community API - Zero Data Validation', () => {
  test('GET /api/community/debates returns empty array', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/community/debates`);

    expect(response.ok()).toBeTruthy();

    const data = await response.json();

    // Should return empty array or object with empty debates array
    if (Array.isArray(data)) {
      expect(data).toHaveLength(0);
    } else if (data.debates) {
      expect(data.debates).toHaveLength(0);
    } else if (data.data) {
      expect(data.data).toHaveLength(0);
    }
  });

  test('GET /api/comments/:contentId returns empty for any content', async ({ request }) => {
    // Use a dummy content ID
    const dummyContentId = '000000000000000000000000';
    const response = await request.get(`${API_BASE_URL}/api/comments/${dummyContentId}`);

    // Should return 200 or 404, not 500
    expect(response.status()).toBeLessThan(500);

    if (response.ok()) {
      const data = await response.json();

      // Should return empty array or object with empty comments
      if (Array.isArray(data)) {
        expect(data).toHaveLength(0);
      } else if (data.comments) {
        expect(data.comments).toHaveLength(0);
      }
    }
  });
});
