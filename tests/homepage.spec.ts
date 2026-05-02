import { test, expect } from '@playwright/test';

test.describe('MAAT Feed Homepage - Ultra Detailed Analysis', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage with extended timeout for slow loading
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  });

  test('should load homepage and capture detailed screenshots', async ({ page }) => {
    // Wait for page DOM to be loaded
    await page.waitForLoadState('domcontentloaded');
    
    // Capture initial viewport screenshot
    await page.screenshot({ 
      path: 'test-results/homepage-initial-load.png',
      fullPage: true 
    });

    // Check if main app container exists
    const appContainer = page.locator('#app, [data-testid="app"], .app, main');
    await expect(appContainer.first()).toBeVisible({ timeout: 10000 });

    // Check for navigation elements
    const topNav = page.locator('nav, .top-bar, .navbar, header');
    const bottomNav = page.locator('.bottom-nav, .tab-bar, [role="navigation"]:last-of-type');
    
    if (await topNav.count() > 0) {
      await page.screenshot({ 
        path: 'test-results/homepage-with-top-nav.png',
        fullPage: true 
      });
    }

    if (await bottomNav.count() > 0) {
      await page.screenshot({ 
        path: 'test-results/homepage-with-bottom-nav.png',
        fullPage: true 
      });
    }

    // Look for feed container
    const feedContainer = page.locator('.feed, .feed-viewport, [data-testid="feed"], .content-feed');
    
    if (await feedContainer.count() > 0) {
      await expect(feedContainer.first()).toBeVisible();
      await page.screenshot({ 
        path: 'test-results/homepage-feed-container.png',
        fullPage: true 
      });

      // Check for feed cards
      const feedCards = page.locator('.feed-card, .content-card, [data-testid="feed-card"], .card');
      const cardCount = await feedCards.count();
      
      console.log(`Found ${cardCount} feed cards`);
      
      if (cardCount > 0) {
        // Screenshot first few cards
        await feedCards.first().screenshot({ 
          path: 'test-results/homepage-first-card.png' 
        });
        
        if (cardCount > 1) {
          await feedCards.nth(1).screenshot({ 
            path: 'test-results/homepage-second-card.png' 
          });
        }

        // Check for media elements
        const mediaElements = page.locator('img, video, audio, .media-placeholder');
        const mediaCount = await mediaElements.count();
        console.log(`Found ${mediaCount} media elements`);
        
        if (mediaCount > 0) {
          await page.screenshot({ 
            path: 'test-results/homepage-with-media.png',
            fullPage: true 
          });
        }

        // Check for interaction buttons
        const interactionButtons = page.locator('button[aria-label*="like"], button[aria-label*="comment"], button[aria-label*="save"], button[aria-label*="share"], .like-button, .comment-button, .save-button, .share-button');
        const buttonCount = await interactionButtons.count();
        console.log(`Found ${buttonCount} interaction buttons`);
        
        if (buttonCount > 0) {
          await page.screenshot({ 
            path: 'test-results/homepage-interaction-buttons.png',
            fullPage: true 
          });
        }
      }
    }

    // Check for loading states
    const loadingElements = page.locator('.loading, .spinner, .skeleton, [data-testid="loading"]');
    const loadingCount = await loadingElements.count();
    
    if (loadingCount > 0) {
      await page.screenshot({ 
        path: 'test-results/homepage-loading-state.png',
        fullPage: true 
      });
      console.log(`Found ${loadingCount} loading elements`);
    }

    // Check for error states
    const errorElements = page.locator('.error, .error-message, [data-testid="error"]');
    const errorCount = await errorElements.count();
    
    if (errorCount > 0) {
      await page.screenshot({ 
        path: 'test-results/homepage-error-state.png',
        fullPage: true 
      });
      console.log(`Found ${errorCount} error elements`);
      
      // Capture error text
      for (let i = 0; i < errorCount; i++) {
        const errorText = await errorElements.nth(i).textContent();
        console.log(`Error ${i + 1}: ${errorText}`);
      }
    }

    // Check for empty states
    const emptyElements = page.locator('.empty, .empty-state, [data-testid="empty"]');
    const emptyCount = await emptyElements.count();
    
    if (emptyCount > 0) {
      await page.screenshot({ 
        path: 'test-results/homepage-empty-state.png',
        fullPage: true 
      });
      console.log(`Found ${emptyCount} empty state elements`);
    }

    // Capture viewport information
    const viewportSize = page.viewportSize();
    console.log(`Viewport size: ${viewportSize?.width}x${viewportSize?.height}`);

    // Check page title
    const title = await page.title();
    console.log(`Page title: ${title}`);

    // Check for any console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Console error: ${msg.text()}`);
      }
    });

    // Wait a bit more for any dynamic content
    await page.waitForTimeout(3000);
    
    // Final screenshot
    await page.screenshot({ 
      path: 'test-results/homepage-final-state.png',
      fullPage: true 
    });

    // Capture page HTML for analysis
    const htmlContent = await page.content();
    console.log(`Page HTML length: ${htmlContent.length} characters`);
    
    // Save HTML to file for analysis
    require('fs').writeFileSync('test-results/homepage-html.html', htmlContent);
  });

  test('should test mobile viewport specifically', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    await page.screenshot({ 
      path: 'test-results/homepage-mobile-viewport.png',
      fullPage: true 
    });

    // Test touch interactions if feed exists
    const feedContainer = page.locator('.feed, .feed-viewport, [data-testid="feed"]');
    
    if (await feedContainer.count() > 0) {
      // Try to scroll/swipe
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'test-results/homepage-mobile-after-scroll.png',
        fullPage: true 
      });
    }
  });

  test('should analyze layout and styling issues', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    
    // Check for CSS issues
    const computedStyles = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const issues: string[] = [];
      
      elements.forEach((el, index) => {
        const styles = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        
        // Check for elements with zero dimensions
        if (rect.width === 0 && rect.height === 0 && el.children.length === 0) {
          issues.push(`Element ${index} (${el.tagName}) has zero dimensions`);
        }
        
        // Check for hidden elements that shouldn't be
        if (styles.display === 'none' && el.hasAttribute('data-testid')) {
          issues.push(`Test element ${index} (${el.tagName}) is hidden`);
        }
        
        // Check for overflow issues
        if (styles.overflow === 'hidden' && rect.height > window.innerHeight) {
          issues.push(`Element ${index} (${el.tagName}) has overflow hidden but exceeds viewport`);
        }
      });
      
      return issues;
    });

    if (computedStyles.length > 0) {
      console.log('Layout issues found:', computedStyles);
      require('fs').writeFileSync('test-results/layout-issues.json', JSON.stringify(computedStyles, null, 2));
    }

    await page.screenshot({ 
      path: 'test-results/homepage-layout-analysis.png',
      fullPage: true 
    });
  });
});
