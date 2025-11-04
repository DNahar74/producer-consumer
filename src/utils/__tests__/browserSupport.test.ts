import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkBrowserSupport, getBrowserInfo, checkDeviceCapabilities } from '../browserSupport';

describe('browserSupport', () => {
  describe('checkBrowserSupport', () => {
    let originalPromise: any;
    let originalMap: any;
    let originalSet: any;
    let originalArrayIncludes: any;
    let originalObjectAssign: any;
    let originalDocument: any;
    let originalWindow: any;
    let originalHTMLCanvasElement: any;
    let originalCSS: any;
    let originalLocalStorage: any;
    let originalRequestAnimationFrame: any;
    let originalPerformance: any;
    let originalIntersectionObserver: any;

    beforeEach(() => {
      // Store original values
      originalPromise = global.Promise;
      originalMap = global.Map;
      originalSet = global.Set;
      originalArrayIncludes = Array.prototype.includes;
      originalObjectAssign = Object.assign;
      originalDocument = global.document;
      originalWindow = global.window;
      originalHTMLCanvasElement = global.HTMLCanvasElement;
      originalCSS = global.CSS;
      originalLocalStorage = global.localStorage;
      originalRequestAnimationFrame = global.requestAnimationFrame;
      originalPerformance = global.performance;
      originalIntersectionObserver = global.IntersectionObserver;
    });

    afterEach(() => {
      // Restore original values
      global.Promise = originalPromise;
      global.Map = originalMap;
      global.Set = originalSet;
      Array.prototype.includes = originalArrayIncludes;
      Object.assign = originalObjectAssign;
      global.document = originalDocument;
      global.window = originalWindow;
      global.HTMLCanvasElement = originalHTMLCanvasElement;
      global.CSS = originalCSS;
      global.localStorage = originalLocalStorage;
      global.requestAnimationFrame = originalRequestAnimationFrame;
      global.performance = originalPerformance;
      global.IntersectionObserver = originalIntersectionObserver;
    });

    it('returns supported when all features are available', () => {
      const result = checkBrowserSupport();
      
      expect(result.isSupported).toBe(true);
      expect(result.missingFeatures).toHaveLength(0);
    });

    it('detects missing ES6 features', () => {
      // @ts-ignore
      global.Promise = undefined;
      // @ts-ignore
      global.Map = undefined;
      // @ts-ignore
      global.Set = undefined;

      const result = checkBrowserSupport();
      
      expect(result.isSupported).toBe(false);
      expect(result.missingFeatures).toContain('Promises (ES6)');
      expect(result.missingFeatures).toContain('Map (ES6)');
      expect(result.missingFeatures).toContain('Set (ES6)');
    });

    it('detects missing modern JavaScript features', () => {
      // @ts-ignore
      delete Array.prototype.includes;
      // @ts-ignore
      delete Object.assign;

      const result = checkBrowserSupport();
      
      expect(result.isSupported).toBe(false);
      expect(result.missingFeatures).toContain('Array.includes()');
      expect(result.missingFeatures).toContain('Object.assign()');
    });

    it('detects missing DOM features', () => {
      // @ts-ignore
      global.document = undefined;
      // @ts-ignore
      global.window = undefined;

      const result = checkBrowserSupport();
      
      expect(result.isSupported).toBe(false);
      expect(result.missingFeatures).toContain('DOM API');
      expect(result.missingFeatures).toContain('Window API');
    });

    it('warns about missing Canvas API', () => {
      // @ts-ignore
      global.HTMLCanvasElement = undefined;

      const result = checkBrowserSupport();
      
      expect(result.warnings).toContain('Canvas API not available - screenshot export may not work');
    });

    it('warns about missing CSS features', () => {
      // @ts-ignore
      global.CSS = undefined;

      const result = checkBrowserSupport();
      
      expect(result.warnings).toContain('CSS.supports() not available - some styling may not work optimally');
    });

    it('detects CSS feature support', () => {
      global.CSS = {
        supports: vi.fn()
          .mockReturnValueOnce(false) // CSS Grid
          .mockReturnValueOnce(false) // CSS Flexbox
          .mockReturnValueOnce(false) // CSS Custom Properties
      };

      const result = checkBrowserSupport();
      
      expect(result.isSupported).toBe(false);
      expect(result.missingFeatures).toContain('CSS Flexbox');
      expect(result.warnings).toContain('CSS Grid not supported - layout may not be optimal');
      expect(result.warnings).toContain('CSS Custom Properties not supported - theming may not work');
    });

    it('handles localStorage unavailability', () => {
      // @ts-ignore
      global.localStorage = undefined;

      const result = checkBrowserSupport();
      
      expect(result.warnings).toContain('localStorage not available - settings cannot be saved');
    });

    it('handles localStorage write errors', () => {
      global.localStorage = {
        setItem: vi.fn().mockImplementation(() => {
          throw new Error('localStorage disabled');
        }),
        removeItem: vi.fn()
      };

      const result = checkBrowserSupport();
      
      expect(result.warnings).toContain('localStorage not writable - settings cannot be saved');
    });

    it('warns about missing performance features', () => {
      // @ts-ignore
      global.requestAnimationFrame = undefined;
      // @ts-ignore
      global.performance = undefined;
      // @ts-ignore
      global.IntersectionObserver = undefined;

      const result = checkBrowserSupport();
      
      expect(result.warnings).toContain('requestAnimationFrame not available - animations may be choppy');
      expect(result.warnings).toContain('Performance API not available - timing measurements may be inaccurate');
      expect(result.warnings).toContain('IntersectionObserver not available - some performance optimizations disabled');
    });
  });

  describe('getBrowserInfo', () => {
    let originalUserAgent: string;

    beforeEach(() => {
      originalUserAgent = navigator.userAgent;
    });

    afterEach(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        writable: true
      });
    });

    it('detects Chrome browser', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
        writable: true
      });

      const result = getBrowserInfo();
      
      expect(result.name).toBe('Chrome');
      expect(result.version).toBe('95');
      expect(result.isSupported).toBe(true);
    });

    it('detects Firefox browser', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:94.0) Gecko/20100101 Firefox/94.0',
        writable: true
      });

      const result = getBrowserInfo();
      
      expect(result.name).toBe('Firefox');
      expect(result.version).toBe('94');
      expect(result.isSupported).toBe(true);
    });

    it('detects Safari browser', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
        writable: true
      });

      const result = getBrowserInfo();
      
      expect(result.name).toBe('Safari');
      expect(result.version).toBe('15');
      expect(result.isSupported).toBe(true);
    });

    it('detects Edge browser', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36 Edg/95.0.1020.44',
        writable: true
      });

      const result = getBrowserInfo();
      
      expect(result.name).toBe('Edge');
      expect(result.version).toBe('95');
      expect(result.isSupported).toBe(true);
    });

    it('detects Internet Explorer as unsupported', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko',
        writable: true
      });

      const result = getBrowserInfo();
      
      expect(result.name).toBe('Internet Explorer');
      expect(result.isSupported).toBe(false);
    });

    it('marks old browser versions as unsupported', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
        writable: true
      });

      const result = getBrowserInfo();
      
      expect(result.name).toBe('Chrome');
      expect(result.version).toBe('80');
      expect(result.isSupported).toBe(false);
    });

    it('handles unknown browsers', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Unknown Browser/1.0',
        writable: true
      });

      const result = getBrowserInfo();
      
      expect(result.name).toBe('Unknown');
      expect(result.version).toBe('Unknown');
      expect(result.isSupported).toBe(true); // Default to supported for unknown browsers
    });
  });

  describe('checkDeviceCapabilities', () => {
    let originalPerformance: any;
    let originalNavigator: any;
    let originalWindow: any;
    let originalScreen: any;

    beforeEach(() => {
      originalPerformance = global.performance;
      originalNavigator = global.navigator;
      originalWindow = global.window;
      originalScreen = global.screen;
    });

    afterEach(() => {
      global.performance = originalPerformance;
      global.navigator = originalNavigator;
      global.window = originalWindow;
      global.screen = originalScreen;
    });

    it('returns good capabilities for modern devices', () => {
      global.navigator = {
        ...originalNavigator,
        hardwareConcurrency: 4,
        maxTouchPoints: 0
      };

      global.performance = {
        ...originalPerformance,
        memory: {
          jsHeapSizeLimit: 200 * 1024 * 1024 // 200MB
        }
      };

      global.screen = {
        width: 1920,
        height: 1080
      };

      const result = checkDeviceCapabilities();
      
      expect(result.hasEnoughMemory).toBe(true);
      expect(result.hasGoodPerformance).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('warns about low memory', () => {
      global.performance = {
        ...originalPerformance,
        memory: {
          jsHeapSizeLimit: 50 * 1024 * 1024 // 50MB
        }
      };

      const result = checkDeviceCapabilities();
      
      expect(result.hasEnoughMemory).toBe(false);
      expect(result.warnings).toContain('Low memory detected - application may run slowly');
    });

    it('warns about limited CPU cores', () => {
      global.navigator = {
        ...originalNavigator,
        hardwareConcurrency: 1
      };

      const result = checkDeviceCapabilities();
      
      expect(result.hasGoodPerformance).toBe(false);
      expect(result.warnings).toContain('Limited CPU cores detected - animations may be slower');
    });

    it('detects touch devices', () => {
      global.window = {
        ...originalWindow,
        ontouchstart: {}
      };

      const result = checkDeviceCapabilities();
      
      expect(result.warnings).toContain('Touch device detected - some interactions may work differently');
    });

    it('detects touch devices via maxTouchPoints', () => {
      global.navigator = {
        ...originalNavigator,
        maxTouchPoints: 5
      };

      const result = checkDeviceCapabilities();
      
      expect(result.warnings).toContain('Touch device detected - some interactions may work differently');
    });

    it('warns about small screens', () => {
      global.screen = {
        width: 600,
        height: 800
      };

      const result = checkDeviceCapabilities();
      
      expect(result.warnings).toContain('Small screen detected - some features may be hidden or reorganized');
    });

    it('handles missing performance.memory', () => {
      global.performance = {
        ...originalPerformance,
        memory: undefined
      };

      const result = checkDeviceCapabilities();
      
      // Should not crash and should default to good memory
      expect(result.hasEnoughMemory).toBe(true);
    });

    it('handles missing hardwareConcurrency', () => {
      global.navigator = {
        ...originalNavigator,
        hardwareConcurrency: undefined
      };

      const result = checkDeviceCapabilities();
      
      // Should not crash and should default to good performance
      expect(result.hasGoodPerformance).toBe(true);
    });
  });
});