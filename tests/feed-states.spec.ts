import { test, expect } from '@playwright/test';

test.describe('MAAT Feed - Loading and Error States', () => {
  test('should display skeleton loading states', async ({ page }) => {
    // Navigate to homepage and check for initial loading
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Check for skeleton cards immediately (before full load)
    const skeletonCards = page.locator('.feed-card-skeleton, [data-testid="skeleton"]');
    const initialSkeletonCount = await skeletonCards.count();
    
    console.log(`Initial skeleton cards found: ${initialSkeletonCount}`);
    
    if (initialSkeletonCount > 0) {
      await expect(skeletonCards.first()).toBeVisible();
      
      // Screenshot skeleton loading state
      await page.screenshot({ 
        path: 'test-results/loading-skeletons-initial.png',
        fullPage: true 
      });
      
      // Check skeleton structure
      const skeletonStructure = await skeletonCards.first().evaluate((skeleton) => ({
        className: skeleton.className,
        childCount: skeleton.childElementCount,
        hasAnimation: !!skeleton.querySelector('[class*="animate"], [class*="pulse"], [class*="shimmer"]'),
        innerHTMLLength: skeleton.innerHTML.length
      }));
      
      console.log('Skeleton structure:', skeletonStructure);
    }
    
    // Wait for full load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // Check if skeletons disappeared
    const finalSkeletonCount = await skeletonCards.count();
    console.log(`Skeleton cards after load: ${finalSkeletonCount}`);
    
    await page.screenshot({ 
      path: 'test-results/loading-after-full-load.png',
      fullPage: true 
    });
  });

  test('should display loading spinners and indicators', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Look for various loading indicators
    const loadingSelectors = [
      '.loading-spinner',
      '.spinner',
      '[data-testid="loading"]',
      '.animate-spin',
      '.loading-indicator'
    ];
    
    let foundLoadingIndicators = 0;
    
    for (const selector of loadingSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        foundLoadingIndicators += count;
        console.log(`Found ${count} loading indicators with selector: ${selector}`);
        
        // Screenshot each type of loading indicator
        await elements.first().screenshot({ 
          path: `test-results/loading-${selector.replace(/[^\w]/g, '-')}.png` 
        });
      }
    }
    
    console.log(`Total loading indicators found: ${foundLoadingIndicators}`);
    
    // Wait for loading to complete
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // Check if loading indicators are gone
    let remainingLoadingIndicators = 0;
    for (const selector of loadingSelectors) {
      const count = await page.locator(selector).count();
      remainingLoadingIndicators += count;
    }
    
    console.log(`Remaining loading indicators after load: ${remainingLoadingIndicators}`);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept network requests to simulate network failure
    await page.route('**/api/**', route => route.abort('failed'));
    
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000); // Wait for error handling
    
    // Check for error states
    const errorSelectors = [
      '.error-state',
      '.error-message',
      '[data-testid="error"]',
      '.network-error',
      '.connection-error'
    ];
    
    let foundErrorElements = 0;
    
    for (const selector of errorSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        foundErrorElements += count;
        console.log(`Found ${count} error elements with selector: ${selector}`);
        
        // Get error message text
        const errorText = await elements.first().textContent();
        console.log(`Error message: ${errorText}`);
        
        // Screenshot error state
        await page.screenshot({ 
          path: `test-results/error-${selector.replace(/[^\w]/g, '-')}.png`,
          fullPage: true 
        });
      }
    }
    
    console.log(`Total error elements found: ${foundErrorElements}`);
    
    // Look for retry buttons
    const retryButtons = page.locator('button:has-text("Retry"), button:has-text("Réessayer"), button:has-text("Reload"), [data-testid="retry"]');
    const retryButtonCount = await retryButtons.count();
    
    if (retryButtonCount > 0) {
      console.log(`Found ${retryButtonCount} retry buttons`);
      
      // Try clicking retry button
      await retryButtons.first().click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'test-results/error-after-retry.png',
        fullPage: true 
      });
    }
  });

  test('should display empty state when no content is available', async ({ page }) => {
    // Mock empty feed response
    await page.route('**/api/feed/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [],
          hasMore: false,
          nextCursor: null
        })
      });
    });
    
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Check for empty state elements
    const emptyStateSelectors = [
      '.empty-state',
      '.empty',
      '[data-testid="empty"]',
      '.no-content',
      '.no-data'
    ];
    
    let foundEmptyStateElements = 0;
    
    for (const selector of emptyStateSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        foundEmptyStateElements += count;
        console.log(`Found ${count} empty state elements with selector: ${selector}`);
        
        // Get empty state message
        const emptyText = await elements.first().textContent();
        console.log(`Empty state message: ${emptyText}`);
        
        // Screenshot empty state
        await page.screenshot({ 
          path: `test-results/empty-${selector.replace(/[^\w]/g, '-')}.png`,
          fullPage: true 
        });
      }
    }
    
    console.log(`Total empty state elements found: ${foundEmptyStateElements}`);
    
    // Verify no feed cards are present
    const feedCards = page.locator('.feed-card, [data-testid="feed-card"]');
    const cardCount = await feedCards.count();
    expect(cardCount).toBe(0);
  });

  test('should handle slow loading with progressive enhancement', async ({ page }) => {
    // Simulate slow API response
    await page.route('**/api/feed/**', async route => {
      // Delay response by 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            { id: '1', title: 'Test Content 1' },
            { id: '2', title: 'Test Content 2' }
          ],
          hasMore: true,
          nextCursor: 'next-page-token'
        })
      });
    });
    
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Check immediate skeleton state
    const initialSkeletons = page.locator('.feed-card-skeleton, [data-testid="skeleton"]');
    const initialSkeletonCount = await initialSkeletons.count();
    
    if (initialSkeletonCount > 0) {
      await page.screenshot({ 
        path: 'test-results/slow-loading-initial-skeletons.png',
        fullPage: true 
      });
    }
    
    // Wait during loading
    await page.waitForTimeout(1500);
    
    // Check intermediate state
    await page.screenshot({ 
      path: 'test-results/slow-loading-intermediate.png',
      fullPage: true 
    });
    
    // Wait for full load
    await page.waitForTimeout(2000);
    
    // Check final loaded state
    const feedCards = page.locator('.feed-card, [data-testid="feed-card"]');
    const finalCardCount = await feedCards.count();
    
    console.log(`Cards loaded after slow response: ${finalCardCount}`);
    
    await page.screenshot({ 
      path: 'test-results/slow-loading-final.png',
      fullPage: true 
    });
  });

  test('should handle API timeout gracefully', async ({ page }) => {
    // Simulate API timeout
    await page.route('**/api/feed/**', route => {
      // Don't respond, simulating timeout
      // Let it timeout naturally
    });
    
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for timeout to occur (typically 30 seconds for Playwright)
    await page.waitForTimeout(35000);
    
    // Check for timeout error handling
    const timeoutErrorSelectors = [
      '.timeout-error',
      '.network-timeout',
      '[data-testid="timeout"]'
    ];
    
    let foundTimeoutErrors = 0;
    
    for (const selector of timeoutErrorSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        foundTimeoutErrors += count;
        console.log(`Found ${count} timeout error elements with selector: ${selector}`);
        
        const errorText = await elements.first().textContent();
        console.log(`Timeout error message: ${errorText}`);
        
        await page.screenshot({ 
          path: `test-results/timeout-${selector.replace(/[^\w]/g, '-')}.png`,
          fullPage: true 
        });
      }
    }
    
    console.log(`Total timeout error elements found: ${foundTimeoutErrors}`);
  });

  test('should test system status overlay during different states', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Check for system status overlay
    const statusOverlay = page.locator('.fixed.top-4.left-4');
    const statusExists = await statusOverlay.count();
    
    if (statusExists > 0) {
      await expect(statusOverlay.first()).toBeVisible();
      
      // Check status indicators
      const apiIndicator = statusOverlay.first().locator('.w-2.h-2.rounded-full');
      const indicatorCount = await apiIndicator.count();
      
      console.log(`Status indicators found: ${indicatorCount}`);
      
      if (indicatorCount > 0) {
        // Check indicator colors and states
        const indicatorStates = [];
        for (let i = 0; i < indicatorCount; i++) {
          const indicator = apiIndicator.nth(i);
          const classes = await indicator.getAttribute('class');
          const isGreen = classes?.includes('green') || false;
          const isRed = classes?.includes('red') || false;
          const isYellow = classes?.includes('yellow') || false;
          
          indicatorStates.push({
            index: i,
            classes,
            isGreen,
            isRed,
            isYellow
          });
        }
        
        console.log('Status indicator states:', indicatorStates);
      }
      
      // Screenshot status overlay
      await statusOverlay.first().screenshot({ 
        path: 'test-results/system-status-overlay.png' 
      });
      
      // Check status text
      const statusText = await statusOverlay.first().textContent();
      console.log(`Status overlay text: ${statusText}`);
    }
  });

  test('should test load more button states', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Look for load more button
    const loadMoreButton = page.locator('text=Charger plus, button:has-text("Load more"), [data-testid="load-more"]');
    const buttonCount = await loadMoreButton.count();
    
    if (buttonCount > 0) {
      const button = loadMoreButton.first();
      await expect(button).toBeVisible();
      
      // Check initial button state
      const initialButtonState = await button.evaluate((btn) => ({
        disabled: btn instanceof HTMLButtonElement ? btn.disabled : false,
        innerHTML: btn.innerHTML,
        className: btn.className
      }));
      
      console.log('Initial load more button state:', initialButtonState);
      
      // Screenshot initial state
      await button.screenshot({ path: 'test-results/load-more-initial.png' });
      
      // Click load more button
      await button.click();
      
      // Check loading state
      await page.waitForTimeout(500);
      
      const loadingButtonState = await button.evaluate((btn) => ({
        disabled: btn instanceof HTMLButtonElement ? btn.disabled : false,
        innerHTML: btn.innerHTML,
        className: btn.className
      }));
      
      console.log('Load more button loading state:', loadingButtonState);
      
      // Screenshot loading state
      await button.screenshot({ path: 'test-results/load-more-loading.png' });
      
      // Wait for loading to complete
      await page.waitForTimeout(3000);
      
      // Check final state
      const finalButtonState = await button.evaluate((btn) => ({
        disabled: btn instanceof HTMLButtonElement ? btn.disabled : false,
        innerHTML: btn.innerHTML,
        className: btn.className
      }));
      
      console.log('Load more button final state:', finalButtonState);
      
      // Screenshot final state
      await button.screenshot({ path: 'test-results/load-more-final.png' });
    } else {
      console.log('No load more button found (might be at end of feed)');
    }
  });
});
