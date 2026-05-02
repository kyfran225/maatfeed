import { test, expect } from '@playwright/test';

test.describe('MAAT Feed Homepage - Debug Specific Issues', () => {
  test('should diagnose CSS and visibility issues', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for any animations to complete
    await page.waitForTimeout(2000);
    
    // Check main element visibility and computed styles
    const mainElement = page.locator('main').first();
    const mainExists = await mainElement.count();
    console.log(`Main element exists: ${mainExists}`);
    
    if (mainExists > 0) {
      const mainVisible = await mainElement.isVisible();
      console.log(`Main element visible: ${mainVisible}`);
      
      // Get computed styles for main element
      const mainStyles = await mainElement.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity,
          height: styles.height,
          width: styles.width,
          position: styles.position,
          transform: styles.transform,
          zIndex: styles.zIndex
        };
      });
      console.log('Main element styles:', mainStyles);
      
      // Get bounding rect
      const mainRect = await mainElement.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left
        };
      });
      console.log('Main element rect:', mainRect);
    }

    // Check feed container
    const feedContainer = page.locator('.feed, .feed-viewport, [data-testid="feed"]').first();
    const feedExists = await feedContainer.count();
    console.log(`Feed container exists: ${feedExists}`);
    
    if (feedExists > 0) {
      const feedVisible = await feedContainer.isVisible();
      console.log(`Feed container visible: ${feedVisible}`);
      
      const feedStyles = await feedContainer.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity,
          height: styles.height,
          width: styles.width,
          position: styles.position,
          transform: styles.transform,
          overflow: styles.overflow
        };
      });
      console.log('Feed container styles:', feedStyles);
    }

    // Check for framer-motion elements
    const motionElements = page.locator('[data-framer-appear-id], [style*="transform"], [style*="opacity"]');
    const motionCount = await motionElements.count();
    console.log(`Motion elements found: ${motionCount}`);
    
    // Check page transition wrapper
    const pageTransition = page.locator('div[class*="motion"], div[style*="opacity"]');
    const transitionCount = await pageTransition.count();
    console.log(`Page transition elements: ${transitionCount}`);

    // Force visibility by removing problematic CSS
    await page.addStyleTag({
      content: `
        main {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          height: auto !important;
          width: 100% !important;
          transform: none !important;
        }
        
        .feed, .feed-viewport {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          height: 100vh !important;
          width: 100% !important;
        }
        
        [data-framer-appear-id] {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          transform: none !important;
        }
      `
    });
    
    // Wait for styles to apply
    await page.waitForTimeout(1000);
    
    // Check if main is now visible
    if (mainExists > 0) {
      const mainVisibleAfter = await mainElement.isVisible();
      console.log(`Main element visible after fix: ${mainVisibleAfter}`);
    }
    
    // Take screenshot after fixes
    await page.screenshot({ 
      path: 'test-results/homepage-after-css-fix.png',
      fullPage: true 
    });

    // Check body overflow
    const bodyStyles = await page.evaluate(() => {
      const body = document.body;
      const styles = window.getComputedStyle(body);
      return {
        overflow: styles.overflow,
        height: styles.height,
        width: styles.width
      };
    });
    console.log('Body styles:', bodyStyles);

    // Check for any hidden elements that should be visible
    const hiddenElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const hidden: any[] = [];
      
      elements.forEach((el, index) => {
        const styles = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        
        if (
          (styles.display === 'none' || styles.visibility === 'hidden' || styles.opacity === '0') &&
          rect.width > 0 && rect.height > 0 &&
          el.children.length > 0
        ) {
          hidden.push({
            index,
            tag: el.tagName,
            className: el.className,
            display: styles.display,
            visibility: styles.visibility,
            opacity: styles.opacity,
            hasChildren: el.children.length > 0
          });
        }
      });
      
      return hidden.slice(0, 10); // Return first 10
    });
    
    console.log('Hidden elements that should be visible:', hiddenElements);
    
    // Save debug info
    const debugInfo = {
      mainElement: {
        exists: mainExists,
        visible: mainExists > 0 ? await mainElement.isVisible() : false,
        styles: mainExists > 0 ? await mainElement.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            display: styles.display,
            visibility: styles.visibility,
            opacity: styles.opacity,
            height: styles.height,
            width: styles.width,
            position: styles.position,
            transform: styles.transform
          };
        }) : null
      },
      feedContainer: {
        exists: feedExists,
        visible: feedExists > 0 ? await feedContainer.isVisible() : false
      },
      motionElements: motionCount,
      hiddenElements
    };
    
    require('fs').writeFileSync('test-results/debug-info.json', JSON.stringify(debugInfo, null, 2));
  });

  test('should test without page transitions', async ({ page }) => {
    // Navigate and disable animations
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Disable all animations and transitions
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
        
        [data-framer-appear-id] {
          opacity: 1 !important;
          transform: none !important;
        }
        
        .motion-div {
          opacity: 1 !important;
          transform: none !important;
        }
      `
    });
    
    await page.waitForTimeout(1000);
    
    // Check visibility now
    const mainElement = page.locator('main').first();
    const mainVisible = await mainElement.isVisible();
    console.log(`Main visible without animations: ${mainVisible}`);
    
    await page.screenshot({ 
      path: 'test-results/homepage-no-animations.png',
      fullPage: true 
    });
  });
});
