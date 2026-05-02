// Accessibility and Responsive Testing Utilities

export interface AccessibilityTestResult {
  passed: boolean;
  issues: AccessibilityIssue[];
  score: number;
  recommendations: string[];
}

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  category: 'contrast' | 'focus' | 'touch' | 'keyboard' | 'aria' | 'semantic';
  element: string;
  message: string;
  selector: string;
}

export class AccessibilityTester {
  private issues: AccessibilityIssue[] = [];

  // Test color contrast
  testColorContrast(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const elements = document.querySelectorAll('*');

    elements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      // Skip transparent or empty backgrounds
      if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
        return;
      }

      // Simple contrast ratio calculation (basic implementation)
      const rgbColor = this.hexToRgb(color);
      const rgbBg = this.hexToRgb(backgroundColor);
      
      if (rgbColor && rgbBg) {
        const contrast = this.calculateContrast(rgbColor, rgbBg);
        
        if (contrast < 4.5) {
          issues.push({
            type: 'error',
            category: 'contrast',
            element: element.tagName,
            message: `Low contrast ratio: ${contrast.toFixed(2)} (minimum 4.5)`,
            selector: this.generateSelector(element)
          });
        } else if (contrast < 7) {
          issues.push({
            type: 'warning',
            category: 'contrast',
            element: element.tagName,
            message: `Contrast ratio could be improved: ${contrast.toFixed(2)} (recommended 7+)`,
            selector: this.generateSelector(element)
          });
        }
      }
    });

    return issues;
  }

  // Test focus management
  testFocusManagement(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    focusableElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const outline = styles.outline;
      const outlineWidth = styles.outlineWidth;

      if (outline === 'none' || outlineWidth === '0px') {
        issues.push({
          type: 'warning',
          category: 'focus',
          element: element.tagName,
          message: 'Element may not have visible focus indicator',
          selector: this.generateSelector(element as Element)
        });
      }
    });

    return issues;
  }

  // Test touch target sizes
  testTouchTargetSizes(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const touchTargets = document.querySelectorAll('button, a, input, [role="button"]');
    const minSize = 44; // WCAG minimum

    touchTargets.forEach(element => {
      const rect = element.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (width < minSize || height < minSize) {
        issues.push({
          type: 'error',
          category: 'touch',
          element: element.tagName,
          message: `Touch target too small: ${width}x${height}px (minimum ${minSize}px)`,
          selector: this.generateSelector(element)
        });
      }
    });

    return issues;
  }

  // Test keyboard navigation
  testKeyboardNavigation(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const interactiveElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [role="button"]'
    );

    interactiveElements.forEach(element => {
      const tabindex = element.getAttribute('tabindex');
      
      if (tabindex === '-1') {
        issues.push({
          type: 'info',
          category: 'keyboard',
          element: element.tagName,
          message: 'Element is explicitly removed from tab order',
          selector: this.generateSelector(element)
        });
      }
    });

    return issues;
  }

  // Test ARIA labels
  testAriaLabels(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    
    // Test images without alt text
    const images = document.querySelectorAll('img');
    images.forEach(element => {
      const alt = element.getAttribute('alt');
      if (alt === null) {
        issues.push({
          type: 'error',
          category: 'aria',
          element: 'img',
          message: 'Image missing alt attribute',
          selector: this.generateSelector(element)
        });
      }
    });

    // Test buttons without accessible names
    const buttons = document.querySelectorAll('button');
    buttons.forEach(element => {
      const hasText = element.textContent?.trim().length > 0;
      const hasAriaLabel = element.getAttribute('aria-label');
      const hasAriaLabelledBy = element.getAttribute('aria-labelledby');
      
      if (!hasText && !hasAriaLabel && !hasAriaLabelledBy) {
        issues.push({
          type: 'error',
          category: 'aria',
          element: 'button',
          message: 'Button missing accessible name',
          selector: this.generateSelector(element)
        });
      }
    });

    return issues;
  }

  // Test semantic HTML
  testSemanticHTML(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    
    // Check for proper heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    
    headings.forEach(element => {
      const level = parseInt(element.tagName.charAt(1));
      
      if (level > previousLevel + 1) {
        issues.push({
          type: 'warning',
          category: 'semantic',
          element: element.tagName,
          message: `Heading level skipped: from h${previousLevel} to h${level}`,
          selector: this.generateSelector(element)
        });
      }
      
      previousLevel = level;
    });

    return issues;
  }

  // Run all tests
  runAllTests(): AccessibilityTestResult {
    this.issues = [
      ...this.testColorContrast(),
      ...this.testFocusManagement(),
      ...this.testTouchTargetSizes(),
      ...this.testKeyboardNavigation(),
      ...this.testAriaLabels(),
      ...this.testSemanticHTML()
    ];

    const errorCount = this.issues.filter(i => i.type === 'error').length;
    const warningCount = this.issues.filter(i => i.type === 'warning').length;
    const infoCount = this.issues.filter(i => i.type === 'info').length;

    const score = Math.max(0, 100 - (errorCount * 10) - (warningCount * 3) - (infoCount * 1));
    
    const recommendations = this.generateRecommendations();

    return {
      passed: errorCount === 0,
      issues: this.issues,
      score,
      recommendations
    };
  }

  // Generate recommendations based on issues
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const categories = new Set(this.issues.map(i => i.category));

    if (categories.has('contrast')) {
      recommendations.push('Improve color contrast ratios to meet WCAG AA standards (4.5:1 minimum)');
    }

    if (categories.has('touch')) {
      recommendations.push('Ensure all touch targets are at least 44x44px for mobile usability');
    }

    if (categories.has('focus')) {
      recommendations.push('Add visible focus indicators for keyboard navigation');
    }

    if (categories.has('aria')) {
      recommendations.push('Add appropriate ARIA labels and descriptions for screen readers');
    }

    if (categories.has('semantic')) {
      recommendations.push('Use proper semantic HTML and maintain heading hierarchy');
    }

    if (categories.has('keyboard')) {
      recommendations.push('Ensure all interactive elements are keyboard accessible');
    }

    return recommendations;
  }

  // Helper methods
  private hexToRgb(color: string): { r: number; g: number; b: number } | null {
    const result = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(color);
    return result ? {
      r: parseInt(result[1]),
      g: parseInt(result[2]),
      b: parseInt(result[3])
    } : null;
  }

  private calculateContrast(rgb1: { r: number; g: number; b: number }, rgb2: { r: number; g: number; b: number }): number {
    const luminance1 = (0.299 * rgb1.r + 0.587 * rgb1.g + 0.114 * rgb1.b) / 255;
    const luminance2 = (0.299 * rgb2.r + 0.587 * rgb2.g + 0.114 * rgb2.b) / 255;
    
    const brightest = Math.max(luminance1, luminance2);
    const darkest = Math.min(luminance1, luminance2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }

  private generateSelector(element: Element): string {
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      const classes = element.className.split(' ').filter((c: string) => c.trim());
      if (classes.length > 0) {
        return `${element.tagName.toLowerCase()}.${classes.join('.')}`;
      }
    }
    
    return element.tagName.toLowerCase();
  }
}

// Responsive Design Tester
export class ResponsiveTester {
  private breakpoints = {
    mobile: 320,
    tablet: 768,
    desktop: 1024,
    large: 1440
  };

  testResponsiveLayouts(): { [key: string]: ResponsiveTestResult } {
    const results: { [key: string]: ResponsiveTestResult } = {};
    
    Object.entries(this.breakpoints).forEach(([name, width]) => {
      results[name] = this.testBreakpoint(width, name);
    });

    return results;
  }

  private testBreakpoint(width: number, name: string): ResponsiveTestResult {
    const originalWidth = window.innerWidth;
    
    // Simulate viewport width (in real implementation, you'd use a testing framework)
    const issues: string[] = [];
    
    // Test horizontal scrolling
    if (document.body.scrollWidth > width) {
      issues.push('Horizontal scrolling detected');
    }

    // Test text readability
    if (width < 768) {
      const fontSize = parseFloat(window.getComputedStyle(document.body).fontSize);
      if (fontSize < 16) {
        issues.push('Font size too small for mobile (minimum 16px recommended)');
      }
    }

    // Test touch spacing
    if (width < 768) {
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        const nextButton = buttons[Array.from(buttons).indexOf(button) + 1];
        
        if (nextButton) {
          const nextRect = nextButton.getBoundingClientRect();
          const verticalDistance = Math.abs(rect.bottom - nextRect.top);
          
          if (verticalDistance < 8) {
            issues.push('Insufficient spacing between touch targets');
          }
        }
      });
    }

    return {
      breakpoint: name,
      width,
      issues,
      passed: issues.length === 0
    };
  }
}

interface ResponsiveTestResult {
  breakpoint: string;
  width: number;
  issues: string[];
  passed: boolean;
}

// Export for use in components
export const runAccessibilityAudit = (): AccessibilityTestResult => {
  const tester = new AccessibilityTester();
  return tester.runAllTests();
};

export const runResponsiveAudit = (): { [key: string]: ResponsiveTestResult } => {
  const tester = new ResponsiveTester();
  return tester.testResponsiveLayouts();
};
