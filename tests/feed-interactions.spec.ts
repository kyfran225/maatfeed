import { test, expect } from '@playwright/test';

test.describe('MAAT Feed - Interaction Buttons Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000); // Wait for animations
  });

  test('should display and test like button functionality', async ({ page }) => {
    const feedCards = page.locator('.feed-card, [data-testid="feed-card"]');
    const cardCount = await feedCards.count();
    
    expect(cardCount).toBeGreaterThan(0);
    
    const firstCard = feedCards.first();
    
    // Find like button
    const likeButton = firstCard.locator('button[aria-label*="like"], .like-button, [data-testid*="like"]');
    const likeButtonCount = await likeButton.count();
    
    if (likeButtonCount > 0) {
      const button = likeButton.first();
      await expect(button).toBeVisible();
      
      // Screenshot before interaction
      await button.screenshot({ path: 'test-results/like-button-before.png' });
      
      // Test hover state
      await button.hover();
      await page.waitForTimeout(200);
      await button.screenshot({ path: 'test-results/like-button-hover.png' });
      
      // Click like button
      await button.click();
      await page.waitForTimeout(500);
      
      // Screenshot after click
      await button.screenshot({ path: 'test-results/like-button-after.png' });
      
      // Check if button state changed (class or aria-pressed)
      const buttonState = await button.evaluate((btn) => ({
        className: btn.className,
        ariaPressed: btn.getAttribute('aria-pressed'),
        innerHTML: btn.innerHTML
      }));
      
      console.log('Like button state after click:', buttonState);
      
      // Click again to unlike
      await button.click();
      await page.waitForTimeout(500);
      
      const buttonStateAfterUnlike = await button.evaluate((btn) => ({
        className: btn.className,
        ariaPressed: btn.getAttribute('aria-pressed'),
        innerHTML: btn.innerHTML
      }));
      
      console.log('Like button state after unlike:', buttonStateAfterUnlike);
    } else {
      console.log('No like button found in first card');
    }
  });

  test('should display and test comment button functionality', async ({ page }) => {
    const feedCards = page.locator('.feed-card, [data-testid="feed-card"]');
    const firstCard = feedCards.first();
    
    // Find comment button
    const commentButton = firstCard.locator('button[aria-label*="comment"], .comment-button, [data-testid*="comment"]');
    const commentButtonCount = await commentButton.count();
    
    if (commentButtonCount > 0) {
      const button = commentButton.first();
      await expect(button).toBeVisible();
      
      // Screenshot before interaction
      await button.screenshot({ path: 'test-results/comment-button-before.png' });
      
      // Test hover state
      await button.hover();
      await page.waitForTimeout(200);
      await button.screenshot({ path: 'test-results/comment-button-hover.png' });
      
      // Click comment button
      await button.click();
      await page.waitForTimeout(1000); // Wait longer for potential modal/overlay
      
      // Check if comment modal/overlay appeared
      const commentModal = page.locator('.comment-modal, .comment-overlay, [data-testid="comment-modal"]');
      const modalExists = await commentModal.count();
      
      if (modalExists > 0) {
        console.log('Comment modal appeared');
        await page.screenshot({ path: 'test-results/comment-modal-open.png' });
        
        // Try to close modal (ESC or close button)
        const closeButton = commentModal.locator('button[aria-label*="close"], .close-button, [data-testid*="close"]');
        if (await closeButton.count() > 0) {
          await closeButton.first().click();
        } else {
          await page.keyboard.press('Escape');
        }
        await page.waitForTimeout(500);
      } else {
        console.log('No comment modal detected, button might navigate or have different behavior');
      }
      
      // Screenshot after interaction
      await page.screenshot({ path: 'test-results/comment-button-after.png' });
    }
  });

  test('should display and test save button functionality', async ({ page }) => {
    const feedCards = page.locator('.feed-card, [data-testid="feed-card"]');
    const firstCard = feedCards.first();
    
    // Find save button
    const saveButton = firstCard.locator('button[aria-label*="save"], .save-button, [data-testid*="save"]');
    const saveButtonCount = await saveButton.count();
    
    if (saveButtonCount > 0) {
      const button = saveButton.first();
      await expect(button).toBeVisible();
      
      // Screenshot before interaction
      await button.screenshot({ path: 'test-results/save-button-before.png' });
      
      // Test hover state
      await button.hover();
      await page.waitForTimeout(200);
      await button.screenshot({ path: 'test-results/save-button-hover.png' });
      
      // Click save button
      await button.click();
      await page.waitForTimeout(500);
      
      // Screenshot after click
      await button.screenshot({ path: 'test-results/save-button-after.png' });
      
      // Check if button state changed
      const buttonState = await button.evaluate((btn) => ({
        className: btn.className,
        ariaPressed: btn.getAttribute('aria-pressed'),
        innerHTML: btn.innerHTML
      }));
      
      console.log('Save button state after click:', buttonState);
      
      // Click again to unsave
      await button.click();
      await page.waitForTimeout(500);
      
      const buttonStateAfterUnsave = await button.evaluate((btn) => ({
        className: btn.className,
        ariaPressed: btn.getAttribute('aria-pressed'),
        innerHTML: btn.innerHTML
      }));
      
      console.log('Save button state after unsave:', buttonStateAfterUnsave);
    }
  });

  test('should display and test share button functionality', async ({ page }) => {
    const feedCards = page.locator('.feed-card, [data-testid="feed-card"]');
    const firstCard = feedCards.first();
    
    // Find share button
    const shareButton = firstCard.locator('button[aria-label*="share"], .share-button, [data-testid*="share"]');
    const shareButtonCount = await shareButton.count();
    
    if (shareButtonCount > 0) {
      const button = shareButton.first();
      await expect(button).toBeVisible();
      
      // Screenshot before interaction
      await button.screenshot({ path: 'test-results/share-button-before.png' });
      
      // Test hover state
      await button.hover();
      await page.waitForTimeout(200);
      await button.screenshot({ path: 'test-results/share-button-hover.png' });
      
      // Click share button
      await button.click();
      await page.waitForTimeout(1000); // Wait for share dialog
      
      // Check if share dialog appeared
      const shareDialog = page.locator('.share-dialog, .share-overlay, [data-testid="share-dialog"]');
      const dialogExists = await shareDialog.count();
      
      if (dialogExists > 0) {
        console.log('Share dialog appeared');
        await page.screenshot({ path: 'test-results/share-dialog-open.png' });
        
        // Look for share options
        const shareOptions = shareDialog.locator('button, a');
        const optionsCount = await shareOptions.count();
        console.log(`Found ${optionsCount} share options`);
        
        // Close dialog
        const closeButton = shareDialog.locator('button[aria-label*="close"], .close-button, [data-testid*="close"]');
        if (await closeButton.count() > 0) {
          await closeButton.first().click();
        } else {
          await page.keyboard.press('Escape');
        }
        await page.waitForTimeout(500);
      } else {
        console.log('No share dialog detected, might use native share or different behavior');
      }
      
      // Screenshot after interaction
      await page.screenshot({ path: 'test-results/share-button-after.png' });
    }
  });

  test('should test all interaction buttons in sequence', async ({ page }) => {
    const feedCards = page.locator('.feed-card, [data-testid="feed-card"]');
    const firstCard = feedCards.first();
    
    // Find all interaction buttons
    const interactionButtons = firstCard.locator('button[aria-label*="like"], button[aria-label*="comment"], button[aria-label*="save"], button[aria-label*="share"], .like-button, .comment-button, .save-button, .share-button, [data-testid*="interaction"]');
    const buttonCount = await interactionButtons.count();
    
    console.log(`Found ${buttonCount} interaction buttons in first card`);
    
    if (buttonCount > 0) {
      // Screenshot all buttons before any interaction
      await firstCard.screenshot({ path: 'test-results/all-buttons-before.png' });
      
      // Test each button
      for (let i = 0; i < Math.min(buttonCount, 4); i++) {
        const button = interactionButtons.nth(i);
        
        // Get button type from aria-label or class
        const buttonType = await button.evaluate((btn) => {
          const ariaLabel = btn.getAttribute('aria-label') || '';
          const className = btn.className || '';
          
          if (ariaLabel.includes('like') || className.includes('like')) return 'like';
          if (ariaLabel.includes('comment') || className.includes('comment')) return 'comment';
          if (ariaLabel.includes('save') || className.includes('save')) return 'save';
          if (ariaLabel.includes('share') || className.includes('share')) return 'share';
          return 'unknown';
        });
        
        console.log(`Testing ${buttonType} button (${i + 1}/${buttonCount})`);
        
        // Hover
        await button.hover();
        await page.waitForTimeout(200);
        
        // Screenshot hover state
        await page.screenshot({ 
          path: `test-results/${buttonType}-button-hover-${i}.png`,
          fullPage: true 
        });
        
        // Click
        await button.click();
        await page.waitForTimeout(500);
        
        // Screenshot after click
        await page.screenshot({ 
          path: `test-results/${buttonType}-button-clicked-${i}.png`,
          fullPage: true 
        });
        
        // Handle potential modals for comment/share
        if (buttonType === 'comment' || buttonType === 'share') {
          const modal = page.locator('.comment-modal, .share-dialog, .modal, [data-testid*="modal"]');
          if (await modal.count() > 0) {
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
          }
        }
      }
      
      // Final screenshot after all interactions
      await firstCard.screenshot({ path: 'test-results/all-buttons-after.png' });
    }
  });

  test('should test interaction button accessibility', async ({ page }) => {
    const feedCards = page.locator('.feed-card, [data-testid="feed-card"]');
    const firstCard = feedCards.first();
    
    // Find all interaction buttons
    const interactionButtons = firstCard.locator('button[aria-label*="like"], button[aria-label*="comment"], button[aria-label*="save"], button[aria-label*="share"], .like-button, .comment-button, .save-button, .share-button, [data-testid*="interaction"]');
    const buttonCount = await interactionButtons.count();
    
    if (buttonCount > 0) {
      for (let i = 0; i < buttonCount; i++) {
        const button = interactionButtons.nth(i);
        
        // Check accessibility attributes
        const accessibilityInfo = await button.evaluate((btn) => ({
          tagName: btn.tagName,
          hasAriaLabel: !!btn.getAttribute('aria-label'),
          ariaLabel: btn.getAttribute('aria-label'),
          hasRole: !!btn.getAttribute('role'),
          role: btn.getAttribute('role'),
          tabIndex: btn.getAttribute('tabindex'),
          disabled: btn instanceof HTMLButtonElement ? btn.disabled : false,
          innerHTML: btn.innerHTML.substring(0, 50)
        }));
        
        console.log(`Button ${i + 1} accessibility:`, accessibilityInfo);
        
        // Test keyboard navigation
        await button.focus();
        await page.waitForTimeout(200);
        
        // Test Enter key
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);
        
        // Close any modals that might have opened
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
      }
    }
  });
});
