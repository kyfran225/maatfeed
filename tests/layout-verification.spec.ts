import { test, expect } from '@playwright/test';

test.describe('MAAT Feed - Layout Verification Ultra-Détaillée', () => {
  test('should verify TikTok-style vertical feed layout', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Screenshot initial
    await page.screenshot({ 
      path: 'test-results/layout-verification-initial.png',
      fullPage: true 
    });

    // === VÉRIFICATION DU CONTENEUR PRINCIPAL ===
    const feedViewport = page.locator('.relative.h-screen.w-full');
    await expect(feedViewport).toBeVisible();
    
    const viewportStyles = await feedViewport.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        classes: el.className,
        styles: {
          display: styles.display,
          position: styles.position,
          height: styles.height,
          width: styles.width,
          overflow: styles.overflow,
          overflowY: styles.overflowY,
          scrollSnapType: styles.scrollSnapType,
          scrollBehavior: styles.scrollBehavior
        },
        rect: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left
        }
      };
    });
    
    console.log('=== FEED VIEWPORT ANALYSIS ===');
    console.log('Classes:', viewportStyles.classes);
    console.log('Styles:', viewportStyles.styles);
    console.log('Rect:', viewportStyles.rect);

    // === VÉRIFICATION DES CARTES DE CONTENU ===
    const feedCards = page.locator('[class*="snap-start"], [class*="h-screen"]');
    const cardCount = await feedCards.count();
    console.log(`=== CARDS FOUND: ${cardCount} ===`);
    
    const cardsAnalysis = [];
    for (let i = 0; i < Math.min(cardCount, 5); i++) {
      const card = feedCards.nth(i);
      const cardInfo = await card.evaluate((el, index) => {
        const styles = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          index,
          classes: el.className,
          styles: {
            display: styles.display,
            position: styles.position,
            height: styles.height,
            width: styles.width,
            scrollSnapAlign: styles.scrollSnapAlign,
            flexShrink: styles.flexShrink
          },
          rect: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left
          },
          isVisible: rect.width > 0 && rect.height > 0,
          textContent: el.textContent?.substring(0, 100) || ''
        };
      }, i);
      
      cardsAnalysis.push(cardInfo);
      console.log(`--- CARD ${i} ---`);
      console.log('Classes:', cardInfo.classes);
      console.log('Dimensions:', `${cardInfo.rect.width}x${cardInfo.rect.height}`);
      console.log('Position:', `(${cardInfo.rect.x}, ${cardInfo.rect.y})`);
      console.log('Visible:', cardInfo.isVisible);
    }

    // === VÉRIFICATION DU LAYOUT VERTICAL (TikTok-style) ===
    const isVerticalFeed = cardsAnalysis.every(card => 
      card.rect.height >= (viewportStyles.rect.height * 0.8) && // Carte prend ~80%+ de la hauteur
      card.rect.width >= (viewportStyles.rect.width * 0.8)     // Carte prend ~80%+ de la largeur
    );
    
    console.log('=== LAYOUT ANALYSIS ===');
    console.log('Expected TikTok-style vertical feed:', isVerticalFeed);
    console.log('Viewport dimensions:', `${viewportStyles.rect.width}x${viewportStyles.rect.height}`);
    
    // Vérifier si les cartes sont empilées verticalement
    const verticalStacking = cardsAnalysis.length > 1 && 
      cardsAnalysis.every((card, i) => {
        if (i === 0) return true;
        const prevCard = cardsAnalysis[i - 1];
        return card.rect.y > prevCard.rect.y; // Chaque carte est plus bas que la précédente
      });
    
    console.log('Vertical stacking detected:', verticalStacking);

    // === VÉRIFICATION DES BOUTONS D'INTERACTION ===
    const interactionButtons = page.locator('button[data-action]');
    const buttonCount = await interactionButtons.count();
    console.log(`=== INTERACTION BUTTONS: ${buttonCount} ===`);
    
    const buttonsAnalysis = [];
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = interactionButtons.nth(i);
      const buttonInfo = await button.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          action: el.getAttribute('data-action'),
          classes: el.className,
          rect: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          },
          isVisible: rect.width > 0 && rect.height > 0,
          textContent: el.textContent?.trim() || ''
        };
      });
      
      buttonsAnalysis.push(buttonInfo);
      if (i < 5) {
        console.log(`--- BUTTON ${i} ---`);
        console.log('Action:', buttonInfo.action);
        console.log('Position:', `(${buttonInfo.rect.x}, ${buttonInfo.rect.y})`);
        console.log('Size:', `${buttonInfo.rect.width}x${buttonInfo.rect.height}`);
      }
    }

    // === VÉRIFICATION DU CSS APPLIQUÉ ===
    const cssAnalysis = await page.evaluate(() => {
      const feedViewport = document.querySelector('.relative.h-screen.w-full');
      if (!feedViewport) return null;
      
      const computedStyles = window.getComputedStyle(feedViewport);
      return {
        scrollSnapType: computedStyles.scrollSnapType,
        overflowY: computedStyles.overflowY,
        scrollBehavior: computedStyles.scrollBehavior,
        display: computedStyles.display,
        position: computedStyles.position
      };
    });
    
    console.log('=== CSS ANALYSIS ===');
    console.log('Applied CSS:', cssAnalysis);

    // === RAPPORT FINAL ===
    const layoutReport = {
      timestamp: new Date().toISOString(),
      viewport: viewportStyles,
      cards: cardsAnalysis,
      buttons: buttonsAnalysis,
      css: cssAnalysis,
      assessments: {
        isVerticalFeed,
        verticalStacking,
        expectedTikTokLayout: isVerticalFeed && verticalStacking,
        issues: []
      }
    };

    // Ajouter les problèmes détectés
    if (!isVerticalFeed) {
      layoutReport.assessments.issues.push('Cards are not full-screen height (not TikTok-style)');
    }
    if (!verticalStacking) {
      layoutReport.assessments.issues.push('Cards are not vertically stacked');
    }
    if (!cssAnalysis?.scrollSnapType.includes('y')) {
      layoutReport.assessments.issues.push('Missing vertical scroll snap');
    }

    // Sauvegarder le rapport détaillé
    require('fs').writeFileSync('test-results/layout-detailed-report.json', JSON.stringify(layoutReport, null, 2));
    
    console.log('=== FINAL ASSESSMENT ===');
    console.log('TikTok-style layout:', layoutReport.assessments.expectedTikTokLayout ? 'YES' : 'NO');
    if (layoutReport.assessments.issues.length > 0) {
      console.log('ISSUES FOUND:');
      layoutReport.assessments.issues.forEach(issue => console.log(`- ${issue}`));
    }

    // Screenshot final avec annotations
    await page.screenshot({ 
      path: 'test-results/layout-verification-final.png',
      fullPage: true 
    });

    // Assertion pour le test
    expect(layoutReport.assessments.expectedTikTokLayout).toBe(true);
  });

  test('should verify scroll behavior and snap functionality', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const feedViewport = page.locator('.relative.h-screen.w-full');
    
    // Position initiale
    const initialScroll = await feedViewport.evaluate((el) => el.scrollTop);
    console.log('Initial scroll position:', initialScroll);
    
    // Simuler un swipe vers le bas
    await feedViewport.evaluate((el) => {
      el.scrollTop = el.clientHeight + 10; // Scrolling to next item
    });
    
    await page.waitForTimeout(500);
    
    const afterScroll = await feedViewport.evaluate((el) => el.scrollTop);
    console.log('After scroll position:', afterScroll);
    
    // Vérifier si le scroll a fonctionné
    const scrollWorking = afterScroll > initialScroll;
    console.log('Scroll working:', scrollWorking);
    
    // Screenshot après scroll
    await page.screenshot({ 
      path: 'test-results/layout-after-scroll.png',
      fullPage: true 
    });
    
    expect(scrollWorking).toBe(true);
  });
});
