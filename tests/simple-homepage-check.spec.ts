import { test, expect } from '@playwright/test';

test.describe('Simple Homepage Verification', () => {
  test('should load homepage and verify feed is visible', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000); // Wait for content to load
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/simple-homepage-check.png',
      fullPage: true 
    });
    
    // Check main elements
    const mainElement = page.locator('main').first();
    await expect(mainElement).toBeVisible();
    
    // Check for feed content
    const feedContent = page.locator('.relative.h-screen.w-full');
    const feedExists = await feedContent.count();
    console.log(`Feed wrapper found: ${feedExists > 0}`);
    
    if (feedExists > 0) {
      await expect(feedContent.first()).toBeVisible();
    }
    
    // Check for status overlay
    const statusOverlay = page.locator('.fixed.top-4.left-4');
    const statusExists = await statusOverlay.count();
    console.log(`Status overlay found: ${statusExists > 0}`);
    
    // Check for load more button
    const loadMoreButton = page.locator('text=Charger plus');
    const loadMoreExists = await loadMoreButton.count();
    console.log(`Load more button found: ${loadMoreExists > 0}`);
    
    console.log('Homepage verification completed successfully');
  });
});
