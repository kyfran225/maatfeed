import { test, expect } from '@playwright/test';

test.describe('MAAT Feed - Vertical Scroll Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000); // Wait for animations
  });

  test('should test basic vertical scrolling between cards', async ({ page }) => {
    // Set mobile viewport for optimal testing
    await page.setViewportSize({ width: 375, height: 812 });
    
    const feedCards = page.locator('.feed-card, [data-testid="feed-card"]');
    const initialCardCount = await feedCards.count();
    
    console.log(`Initial card count: ${initialCardCount}`);
    expect(initialCardCount).toBeGreaterThan(0);
    
    // Get initial scroll position
    const initialScrollY = await page.evaluate(() => window.scrollY);
    console.log(`Initial scroll position: ${initialScrollY}`);
    
    // Screenshot initial state
    await page.screenshot({ 
      path: 'test-results/scroll-initial-state.png',
      fullPage: true 
    });
    
    // Scroll down to next card (approximately one card height)
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(1000);
    
    // Check scroll position changed
    const scrollAfterDown = await page.evaluate(() => window.scrollY);
    console.log(`Scroll position after down: ${scrollAfterDown}`);
    expect(scrollAfterDown).toBeGreaterThan(initialScrollY);
    
    await page.screenshot({ 
      path: 'test-results/scroll-after-down.png',
      fullPage: true 
    });
    
    // Scroll back up
    await page.mouse.wheel(0, -500);
    await page.waitForTimeout(1000);
    
    const scrollAfterUp = await page.evaluate(() => window.scrollY);
    console.log(`Scroll position after up: ${scrollAfterUp}`);
    
    await page.screenshot({ 
      path: 'test-results/scroll-after-up.png',
      fullPage: true 
    });
  });

  test('should test smooth continuous scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    
    const feedCards = page.locator('.feed-card, [data-testid="feed-card"]');
    const cardCount = await feedCards.count();
    
    if (cardCount > 1) {
      // Test smooth scrolling through multiple cards
      for (let i = 0; i < Math.min(cardCount, 5); i++) {
        // Scroll down gradually
        await page.mouse.wheel(0, 200);
        await page.waitForTimeout(300);
        
        await page.screenshot({ 
          path: `test-results/scroll-continuous-${i + 1}.png`,
          fullPage: true 
        });
        
        // Check current scroll position
        const currentScroll = await page.evaluate(() => window.scrollY);
        console.log(`Scroll after segment ${i + 1}: ${currentScroll}`);
      }
      
      // Scroll back to top
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'test-results/scroll-back-to-top.png',
        fullPage: true 
      });
    }
  });

  test('should test rapid scrolling behavior', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    
    const feedCards = page.locator('.feed-card, [data-testid="feed-card"]');
    const cardCount = await feedCards.count();
    
    if (cardCount > 2) {
      // Test rapid scrolls
      const scrollActions = [
        { delta: 800, delay: 200, name: 'rapid-down-1' },
        { delta: -400, delay: 200, name: 'rapid-up-1' },
        { delta: 600, delay: 200, name: 'rapid-down-2' },
        { delta: -200, delay: 200, name: 'rapid-up-2' },
        { delta: 1000, delay: 200, name: 'rapid-down-3' }
      ];
      
      for (const action of scrollActions) {
        await page.mouse.wheel(0, action.delta);
        await page.waitForTimeout(action.delay);
        
        await page.screenshot({ 
          path: `test-results/scroll-${action.name}.png`,
          fullPage: true 
        });
        
        const scrollPos = await page.evaluate(() => window.scrollY);
        console.log(`Scroll after ${action.name}: ${scrollPos}`);
      }
    }
  });

  test('should test scroll snap behavior', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    
    const feedCards = page.locator('.feed-card, [data-testid="feed-card"]');
    const cardCount = await feedCards.count();
    
    if (cardCount > 0) {
      // Test small scrolls (should snap to nearest card if snap scrolling is enabled)
      const smallScrolls = [100, 150, 200, 250];
      
      for (let i = 0; i < smallScrolls.length; i++) {
        const scrollAmount = smallScrolls[i];
        
        await page.mouse.wheel(0, scrollAmount);
        await page.waitForTimeout(800); // Wait for potential snap animation
        
        await page.screenshot({ 
          path: `test-results/scroll-snap-${i + 1}-${scrollAmount}.png`,
          fullPage: true 
        });
        
        const scrollPos = await page.evaluate(() => window.scrollY);
        console.log(`Scroll after ${scrollAmount}px: ${scrollPos}`);
      }
    }
  });

  test('should test scroll on different viewports', async ({ page }) => {
    const viewports = [
      { width: 375, height: 812, name: 'mobile-portrait' },
      { width: 812, height: 375, name: 'mobile-landscape' },
      { width: 768, height: 1024, name: 'tablet-portrait' },
      { width: 1024, height: 768, name: 'tablet-landscape' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      
      const feedCards = page.locator('.feed-card, [data-testid="feed-card"]');
      const cardCount = await feedCards.count();
      
      if (cardCount > 0) {
        // Test scroll on this viewport
        const initialScroll = await page.evaluate(() => window.scrollY);
        
        // Scroll down by approximately viewport height
        await page.mouse.wheel(0, viewport.height * 0.8);
        await page.waitForTimeout(1000);
        
        const afterScroll = await page.evaluate(() => window.scrollY);
        
        await page.screenshot({ 
          path: `test-results/scroll-${viewport.name}.png`,
          fullPage: true 
        });
        
        console.log(`${viewport.name} - Initial: ${initialScroll}, After: ${afterScroll}, Delta: ${afterScroll - initialScroll}`);
        
        // Reset for next viewport
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);
      }
    }
  });

  test('should test touch gestures simulation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    
    const feedCards = page.locator('.feed-card, [data-testid="feed-card"]');
    const cardCount = await feedCards.count();
    
    if (cardCount > 0) {
      // Get viewport dimensions
      const viewportSize = page.viewportSize();
      const centerX = viewportSize!.width / 2;
      
      // Simulate swipe up gesture using mouse wheel
      // Start from center and scroll up rapidly
      await page.mouse.move(centerX, viewportSize!.height * 0.8);
      await page.waitForTimeout(200);
      
      // Simulate rapid swipe up with multiple small wheel events
      for (let i = 0; i < 5; i++) {
        await page.mouse.wheel(0, -150);
        await page.waitForTimeout(50);
      }
      
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'test-results/touch-swipe-up.png',
        fullPage: true 
      });
      
      const scrollAfterSwipe = await page.evaluate(() => window.scrollY);
      console.log(`Scroll after swipe up: ${scrollAfterSwipe}`);
      
      // Simulate swipe down gesture
      await page.mouse.move(centerX, viewportSize!.height * 0.2);
      await page.waitForTimeout(200);
      
      // Simulate rapid swipe down with multiple small wheel events
      for (let i = 0; i < 5; i++) {
        await page.mouse.wheel(0, 150);
        await page.waitForTimeout(50);
      }
      
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'test-results/touch-swipe-down.png',
        fullPage: true 
      });
      
      const scrollAfterSwipeDown = await page.evaluate(() => window.scrollY);
      console.log(`Scroll after swipe down: ${scrollAfterSwipeDown}`);
    }
  });

  test('should test scroll boundaries and limits', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    
    const feedCards = page.locator('.feed-card, [data-testid="feed-card"]');
    const cardCount = await feedCards.count();
    
    if (cardCount > 0) {
      // Scroll to bottom
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(1000);
      
      const maxScroll = await page.evaluate(() => window.scrollY);
      const documentHeight = await page.evaluate(() => document.body.scrollHeight);
      const viewportHeight = await page.evaluate(() => window.innerHeight);
      
      console.log(`Max scroll: ${maxScroll}, Document height: ${documentHeight}, Viewport height: ${viewportHeight}`);
      
      await page.screenshot({ 
        path: 'test-results/scroll-at-bottom.png',
        fullPage: true 
      });
      
      // Try to scroll beyond bottom (should not go beyond)
      await page.mouse.wheel(0, 1000);
      await page.waitForTimeout(500);
      
      const scrollAfterBeyond = await page.evaluate(() => window.scrollY);
      console.log(`Scroll after trying to go beyond: ${scrollAfterBeyond}`);
      expect(scrollAfterBeyond).toBeLessThanOrEqual(maxScroll + 10); // Allow small overshoot
      
      // Scroll back to top
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'test-results/scroll-back-to-top-final.png',
        fullPage: true 
      });
    }
  });

  test('should test scroll performance and smoothness', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    
    // Monitor scroll performance
    const scrollMetrics = await page.evaluate(() => {
      const metrics: any[] = [];
      let scrollCount = 0;
      
      const handleScroll = () => {
        scrollCount++;
        const startTime = performance.now();
        
        requestAnimationFrame(() => {
          const endTime = performance.now();
          metrics.push({
            scrollNumber: scrollCount,
            scrollY: window.scrollY,
            frameTime: endTime - startTime,
            timestamp: endTime
          });
        });
      };
      
      window.addEventListener('scroll', handleScroll, { passive: true });
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        return metrics;
      };
    });
    
    // Perform various scroll actions
    const scrollActions = [
      { type: 'small', amount: 100, count: 5 },
      { type: 'medium', amount: 300, count: 3 },
      { type: 'large', amount: 600, count: 2 }
    ];
    
    for (const action of scrollActions) {
      for (let i = 0; i < action.count; i++) {
        await page.mouse.wheel(0, action.amount);
        await page.waitForTimeout(300);
      }
      await page.waitForTimeout(1000);
    }
    
    // Get performance metrics
    const metrics = await page.evaluate(() => {
      // This would need to be implemented properly in a real scenario
      return [];
    });
    
    console.log('Scroll performance metrics:', metrics);
    
    await page.screenshot({ 
      path: 'test-results/scroll-performance-test.png',
      fullPage: true 
    });
  });
});
