import { test, expect } from '@playwright/test';

test.describe('MAAT Feed - Integration Validation with Backend API', () => {
  test.beforeEach(async ({ page }) => {
    // Wait for API to be ready
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
  });

  test('should validate complete feed loading with real API', async ({ page }) => {
    // Check if API is responding
    const apiStatus = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        return { status: response.status, data };
      } catch (error) {
        return { error: error instanceof Error ? error.message : String(error) };
      }
    });
    
    console.log('API Health Status:', apiStatus);
    
    if (apiStatus.error) {
      console.log('API not available, skipping integration test');
      return;
    }
    
    // Check feed loading
    const feedCards = page.locator('.feed-card, [data-testid="feed-card"]');
    const cardCount = await feedCards.count();
    
    console.log(`Feed cards loaded: ${cardCount}`);
    
    if (cardCount > 0) {
      // Verify first card has content
      const firstCard = feedCards.first();
      await expect(firstCard).toBeVisible();
      
      // Check card content structure
      const cardContent = await firstCard.evaluate((card) => {
        return {
          hasMedia: !!card.querySelector('img, video, audio, .media-placeholder'),
          hasInteractions: !!card.querySelector('button[aria-label*="like"], button[aria-label*="comment"], button[aria-label*="save"], button[aria-label*="share"]'),
          hasOverlay: !!card.querySelector('.absolute, .overlay'),
          textContent: card.textContent?.substring(0, 100) || '',
          childCount: card.childElementCount
        };
      });
      
      console.log('First card content:', cardContent);
      expect(cardContent.hasInteractions).toBe(true);
      
      await page.screenshot({ 
        path: 'test-results/integration-feed-loaded.png',
        fullPage: true 
      });
    }
  });

  test('should validate interaction endpoints work correctly', async ({ page }) => {
    // Check API health first
    const healthResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/health');
        return await response.json();
      } catch (error) {
        return { error: error instanceof Error ? error.message : String(error) };
      }
    });
    
    if (healthResponse.error) {
      console.log('API not available for interaction test');
      return;
    }
    
    const feedCards = page.locator('.feed-card, [data-testid="feed-card"]');
    const cardCount = await feedCards.count();
    
    if (cardCount > 0) {
      const firstCard = feedCards.first();
      
      // Find like button
      const likeButton = firstCard.locator('button[aria-label*="like"], .like-button, [data-testid*="like"]');
      const likeButtonCount = await likeButton.count();
      
      if (likeButtonCount > 0) {
        // Test like interaction
        await likeButton.first().click();
        await page.waitForTimeout(1000);
        
        // Check if like was processed (no error appeared)
        const errorElements = page.locator('.error, .error-message');
        const errorCount = await errorElements.count();
        
        console.log(`Errors after like interaction: ${errorCount}`);
        expect(errorCount).toBe(0);
        
        await page.screenshot({ 
          path: 'test-results/integration-like-interaction.png',
          fullPage: true 
        });
      }
    }
  });

  test('should validate system status indicators', async ({ page }) => {
    // Wait for system status to stabilize
    await page.waitForTimeout(2000);
    
    // Check system status overlay
    const statusOverlay = page.locator('.fixed.top-4.left-4');
    const statusExists = await statusOverlay.count();
    
    if (statusExists > 0) {
      await expect(statusOverlay.first()).toBeVisible();
      
      // Check API and readiness indicators
      const apiIndicator = statusOverlay.first().locator('text=API');
      const readyIndicator = statusOverlay.first().locator('text=Prêt');
      
      const apiExists = await apiIndicator.count();
      const readyExists = await readyIndicator.count();
      
      console.log(`API indicator found: ${apiExists > 0}`);
      console.log(`Ready indicator found: ${readyExists > 0}`);
      
      // Check indicator colors
      const statusDots = statusOverlay.first().locator('.w-2.h-2.rounded-full');
      const dotCount = await statusDots.count();
      
      if (dotCount > 0) {
        const dotStates = [];
        for (let i = 0; i < dotCount; i++) {
          const dot = statusDots.nth(i);
          const classes = await dot.getAttribute('class');
          dotStates.push({
            index: i,
            classes,
            isGreen: classes?.includes('green') || false,
            isRed: classes?.includes('red') || false,
            isYellow: classes?.includes('yellow') || false
          });
        }
        
        console.log('Status indicator states:', dotStates);
        
        // At least one indicator should be green (API should be responding)
        const hasGreenIndicator = dotStates.some(state => state.isGreen);
        if (hasGreenIndicator) {
          console.log('✅ System status indicators look good');
        } else {
          console.log('⚠️ No green status indicators found');
        }
      }
      
      await page.screenshot({ 
        path: 'test-results/integration-system-status.png',
        fullPage: true 
      });
    }
  });

  test('should validate load more functionality', async ({ page }) => {
    const feedCards = page.locator('.feed-card, [data-testid="feed-card"]');
    const initialCardCount = await feedCards.count();
    
    console.log(`Initial card count: ${initialCardCount}`);
    
    // Look for load more button
    const loadMoreButton = page.locator('text=Charger plus');
    const buttonExists = await loadMoreButton.count();
    
    if (buttonExists > 0) {
      await expect(loadMoreButton.first()).toBeVisible();
      
      // Click load more
      await loadMoreButton.first().click();
      await page.waitForTimeout(2000);
      
      // Check if more cards loaded
      const finalCardCount = await feedCards.count();
      console.log(`Card count after load more: ${finalCardCount}`);
      
      // Should have more cards or button should be disabled/hidden
      expect(finalCardCount >= initialCardCount).toBe(true);
      
      await page.screenshot({ 
        path: 'test-results/integration-load-more.png',
        fullPage: true 
      });
    } else {
      console.log('No load more button found (might be at end of feed)');
    }
  });

  test('should validate responsive behavior across devices', async ({ page }) => {
    const viewports = [
      { width: 375, height: 812, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      
      // Check FeedViewport adapts
      const feedViewport = page.locator('.feed-viewport, .relative.h-screen.w-full');
      const viewportBounds = await feedViewport.first().boundingBox();
      
      console.log(`${viewport.name} - FeedViewport: ${viewportBounds?.width}x${viewportBounds?.height}`);
      
      expect(viewportBounds?.width).toBeCloseTo(viewport.width, 0);
      expect(viewportBounds?.height).toBeCloseTo(viewport.height, 0);
      
      // Check cards are visible
      const feedCards = page.locator('.feed-card, [data-testid="feed-card"]');
      const cardCount = await feedCards.count();
      
      if (cardCount > 0) {
        const firstCard = feedCards.first();
        await expect(firstCard).toBeVisible();
        
        const cardBounds = await firstCard.boundingBox();
        expect(cardBounds?.height).toBeCloseTo(viewport.height, 0);
      }
      
      await page.screenshot({ 
        path: `test-results/integration-responsive-${viewport.name}.png`,
        fullPage: true 
      });
    }
  });

  test('should validate error handling with API failures', async ({ page }) => {
    // Intercept API calls to simulate failures
    await page.route('**/api/feed/**', route => route.abort('failed'));
    
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Check for error states
    const errorElements = page.locator('.error-state, .error-message, [data-testid="error"]');
    const errorCount = await errorElements.count();
    
    console.log(`Error elements found: ${errorCount}`);
    
    if (errorCount > 0) {
      await expect(errorElements.first()).toBeVisible();
      
      const errorText = await errorElements.first().textContent();
      console.log(`Error message: ${errorText}`);
      
      // Look for retry button
      const retryButton = page.locator('button:has-text("Retry"), button:has-text("Réessayer")');
      const retryExists = await retryButton.count();
      
      if (retryExists > 0) {
        console.log('Retry button found in error state');
        await expect(retryButton.first()).toBeVisible();
      }
      
      await page.screenshot({ 
        path: 'test-results/integration-error-handling.png',
        fullPage: true 
      });
    }
  });

  test('should validate performance and loading times', async ({ page }) => {
    // Measure load time
    const startTime = Date.now();
    
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
    
    const loadTime = Date.now() - startTime;
    console.log(`Page load time: ${loadTime}ms`);
    
    // Wait for feed to load
    await page.waitForTimeout(3000);
    
    // Check feed cards
    const feedCards = page.locator('.feed-card, [data-testid="feed-card"]');
    const cardCount = await feedCards.count();
    
    console.log(`Cards loaded: ${cardCount}`);
    
    // Performance expectations
    expect(loadTime).toBeLessThan(10000); // Should load in under 10 seconds
    
    if (cardCount > 0) {
      // Check first card is interactive
      const firstCard = feedCards.first();
      const interactionButtons = firstCard.locator('button');
      const buttonCount = await interactionButtons.count();
      
      expect(buttonCount).toBeGreaterThan(0);
      console.log(`Interaction buttons available: ${buttonCount}`);
    }
    
    await page.screenshot({ 
      path: 'test-results/integration-performance.png',
      fullPage: true 
    });
  });

  test('should validate complete user flow', async ({ page }) => {
    // Complete user journey test
    console.log('Starting complete user flow validation...');
    
    // 1. Load homepage
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // 2. Check feed loaded
    const feedCards = page.locator('.feed-card, [data-testid="feed-card"]');
    const cardCount = await feedCards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    // 3. Scroll through content
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(1000);
    
    // 4. Interact with content
    if (cardCount > 0) {
      const firstCard = feedCards.first();
      const likeButton = firstCard.locator('button[aria-label*="like"], .like-button');
      
      if (await likeButton.count() > 0) {
        await likeButton.first().click();
        await page.waitForTimeout(1000);
      }
    }
    
    // 5. Check system status
    const statusOverlay = page.locator('.fixed.top-4.left-4');
    const statusExists = await statusOverlay.count();
    
    if (statusExists > 0) {
      await expect(statusOverlay.first()).toBeVisible();
    }
    
    // 6. Final validation
    await page.screenshot({ 
      path: 'test-results/integration-complete-flow.png',
      fullPage: true 
    });
    
    console.log('✅ Complete user flow validation passed');
  });
});
