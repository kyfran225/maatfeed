import { test, expect } from '@playwright/test';

test.describe('Simple Diagnosis', () => {
  test('should check current DOM structure', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Screenshot
    await page.screenshot({ 
      path: 'test-results/simple-diagnosis.png',
      fullPage: true 
    });
    
    // Analyser la structure DOM
    const domAnalysis = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const hScreenElements = Array.from(allElements).filter(el => 
        el.className && el.className.includes('h-screen')
      );
      
      const feedElements = Array.from(allElements).filter(el => 
        el.className && (el.className.includes('feed') || el.getAttribute('role') === 'feed')
      );
      
      const relativeElements = Array.from(allElements).filter(el => 
        el.className && el.className.includes('relative')
      );
      
      return {
        totalElements: allElements.length,
        hScreenElements: hScreenElements.map(el => ({
          tag: el.tagName,
          className: el.className,
          rect: el.getBoundingClientRect()
        })),
        feedElements: feedElements.map(el => ({
          tag: el.tagName,
          className: el.className,
          role: el.getAttribute('role'),
          rect: el.getBoundingClientRect()
        })),
        relativeElements: relativeElements.slice(0, 5).map(el => ({
          tag: el.tagName,
          className: el.className,
          rect: el.getBoundingClientRect()
        })),
        bodyClasses: document.body.className,
        html: document.documentElement.outerHTML.substring(0, 1000)
      };
    });
    
    console.log('=== DOM ANALYSIS ===');
    console.log('h-screen elements:', domAnalysis.hScreenElements.length);
    console.log('feed elements:', domAnalysis.feedElements.length);
    console.log('relative elements:', domAnalysis.relativeElements.length);
    
    // Sauvegarder l'analyse
    require('fs').writeFileSync('test-results/dom-analysis.json', JSON.stringify(domAnalysis, null, 2));
  });
});
