import { test, expect } from '@playwright/test';

test.describe('MAAT Feed - Feed Rendering Analysis', () => {
  test('should check if FeedPage content is actually rendered', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Check if we're on the feed page
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    // Look for FeedPage specific content
    const feedPageElements = page.locator('.relative.h-screen.w-full, .feed-viewport, .feed-card, [data-testid="feed-card"]');
    const feedPageCount = await feedPageElements.count();
    console.log(`Feed page elements found: ${feedPageCount}`);
    
    // Check for any div with h-screen (FeedPage wrapper)
    const hScreenElements = page.locator('[class*="h-screen"]');
    const hScreenCount = await hScreenElements.count();
    console.log(`Elements with h-screen: ${hScreenCount}`);
    
    // Get all elements with their dimensions
    const allElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const elementsWithDimensions: any[] = [];
      
      elements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const styles = window.getComputedStyle(el);
        
        if (rect.width > 0 || rect.height > 0) {
          elementsWithDimensions.push({
            index,
            tag: el.tagName,
            className: el.className,
            rect: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height
            },
            styles: {
              display: styles.display,
              visibility: styles.visibility,
              opacity: styles.opacity,
              position: styles.position
            },
            textContent: el.textContent?.substring(0, 50) || '',
            childCount: el.children.length
          });
        }
      });
      
      return elementsWithDimensions.sort((a, b) => b.rect.width * b.rect.height - a.rect.width * a.rect.height);
    });
    
    console.log('Top 10 elements by area:', allElements.slice(0, 10));
    
    // Check specifically for feed cards content
    const feedContent = await page.evaluate(() => {
      const feedCards = document.querySelectorAll('[class*="feed"], [class*="card"], article');
      return Array.from(feedCards).map(card => ({
        className: card.className,
        textContent: card.textContent?.substring(0, 100) || '',
        rect: card.getBoundingClientRect(),
        visible: card.offsetWidth > 0 && card.offsetHeight > 0
      }));
    });
    
    console.log('Feed cards found:', feedContent);
    
    // Check if Outlet is rendering anything
    const outletContent = await page.evaluate(() => {
      const outletElements = document.querySelectorAll('*');
      return Array.from(outletElements).filter(el => 
        el.textContent && 
        el.textContent.includes('MAAT FEED') || 
        el.textContent.includes('Rechercher') ||
        el.textContent.includes('API') ||
        el.textContent.includes('éléments')
      ).map(el => ({
        tag: el.tagName,
        className: el.className,
        textContent: el.textContent?.substring(0, 100) || '',
        rect: el.getBoundingClientRect()
      }));
    });
    
    console.log('Elements with expected content:', outletContent);
    
    // Save detailed analysis
    const analysis = {
      url: currentUrl,
      feedPageElements: feedPageCount,
      hScreenElements: hScreenCount,
      topElements: allElements.slice(0, 10),
      feedContent,
      outletContent
    };
    
    require('fs').writeFileSync('test-results/feed-rendering-analysis.json', JSON.stringify(analysis, null, 2));
    
    await page.screenshot({ 
      path: 'test-results/feed-rendering-debug.png',
      fullPage: true 
    });
  });

  test('should bypass PageTransition to test FeedPage directly', async ({ page }) => {
    // Navigate and disable PageTransition
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Override PageTransition to render children directly
    await page.addScriptTag({
      content: `
        window.originalPageTransition = null;
        
        // Find and replace PageTransition component
        const observer = new MutationObserver(() => {
          const motionDivs = document.querySelectorAll('[data-framer-appear-id]');
          motionDivs.forEach(div => {
            if (div.parentElement && div.parentElement.querySelector('main')) {
              // Make the motion div visible
              div.style.opacity = '1';
              div.style.transform = 'none';
              div.style.display = 'block';
              div.style.width = '100%';
              div.style.height = '100%';
              div.style.position = 'relative';
            }
          });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
      `
    });
    
    await page.waitForTimeout(2000);
    
    // Force all motion elements to be visible
    await page.addStyleTag({
      content: `
        [data-framer-appear-id] {
          opacity: 1 !important;
          transform: none !important;
          display: block !important;
          width: 100% !important;
          height: 100% !important;
          position: relative !important;
        }
        
        .motion-div, [style*="transform"] {
          opacity: 1 !important;
          transform: none !important;
        }
        
        main {
          width: 100% !important;
          height: 100vh !important;
          display: block !important;
        }
        
        .relative.h-screen.w-full {
          position: relative !important;
          height: 100vh !important;
          width: 100% !important;
          display: block !important;
        }
      `
    });
    
    await page.waitForTimeout(1000);
    
    // Check if feed appears
    const feedElements = page.locator('.feed-viewport, .relative.h-screen.w-full');
    const feedCount = await feedElements.count();
    console.log(`Feed elements after bypass: ${feedCount}`);
    
    await page.screenshot({ 
      path: 'test-results/feed-bypass-transition.png',
      fullPage: true 
    });
  });
});
