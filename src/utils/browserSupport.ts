// Browser feature detection utilities
export interface BrowserSupport {
  isSupported: boolean;
  missingFeatures: string[];
  warnings: string[];
}

// Check if the browser supports required features
export function checkBrowserSupport(): BrowserSupport {
  const missingFeatures: string[] = [];
  const warnings: string[] = [];

  // Check for ES6 features
  if (typeof Promise === 'undefined') {
    missingFeatures.push('Promises (ES6)');
  }

  if (typeof Map === 'undefined') {
    missingFeatures.push('Map (ES6)');
  }

  if (typeof Set === 'undefined') {
    missingFeatures.push('Set (ES6)');
  }

  // Check for modern JavaScript features
  if (!Array.prototype.includes) {
    missingFeatures.push('Array.includes()');
  }

  if (!Object.assign) {
    missingFeatures.push('Object.assign()');
  }

  // Check for DOM features
  if (typeof document === 'undefined') {
    missingFeatures.push('DOM API');
  }

  if (typeof window === 'undefined') {
    missingFeatures.push('Window API');
  }

  // Check for Canvas API (for export functionality)
  if (typeof HTMLCanvasElement === 'undefined') {
    warnings.push('Canvas API not available - screenshot export may not work');
  }

  // Check for modern CSS features
  if (typeof CSS === 'undefined' || !CSS.supports) {
    warnings.push('CSS.supports() not available - some styling may not work optimally');
  } else {
    // Check for CSS Grid support
    if (!CSS.supports('display', 'grid')) {
      warnings.push('CSS Grid not supported - layout may not be optimal');
    }

    // Check for CSS Flexbox support
    if (!CSS.supports('display', 'flex')) {
      missingFeatures.push('CSS Flexbox');
    }

    // Check for CSS Custom Properties (CSS Variables)
    if (!CSS.supports('color', 'var(--test)')) {
      warnings.push('CSS Custom Properties not supported - theming may not work');
    }
  }

  // Check for localStorage
  try {
    if (typeof localStorage === 'undefined') {
      warnings.push('localStorage not available - settings cannot be saved');
    } else {
      // Test if localStorage is actually writable (some browsers block it in private mode)
      localStorage.setItem('__test__', 'test');
      localStorage.removeItem('__test__');
    }
  } catch (e) {
    warnings.push('localStorage not writable - settings cannot be saved');
  }

  // Check for requestAnimationFrame
  if (typeof requestAnimationFrame === 'undefined') {
    warnings.push('requestAnimationFrame not available - animations may be choppy');
  }

  // Check for performance API
  if (typeof performance === 'undefined' || !performance.now) {
    warnings.push('Performance API not available - timing measurements may be inaccurate');
  }

  // Check for Intersection Observer (for performance optimizations)
  if (typeof IntersectionObserver === 'undefined') {
    warnings.push('IntersectionObserver not available - some performance optimizations disabled');
  }

  return {
    isSupported: missingFeatures.length === 0,
    missingFeatures,
    warnings
  };
}

// Get browser information
export function getBrowserInfo(): {
  name: string;
  version: string;
  isSupported: boolean;
} {
  const userAgent = navigator.userAgent;
  let name = 'Unknown';
  let version = 'Unknown';
  let isSupported = true;

  // Chrome
  if (userAgent.includes('Chrome/')) {
    name = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+)/);
    version = match ? match[1] : 'Unknown';
    isSupported = parseInt(version) >= 90;
  }
  // Firefox
  else if (userAgent.includes('Firefox/')) {
    name = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+)/);
    version = match ? match[1] : 'Unknown';
    isSupported = parseInt(version) >= 88;
  }
  // Safari
  else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) {
    name = 'Safari';
    const match = userAgent.match(/Version\/(\d+)/);
    version = match ? match[1] : 'Unknown';
    isSupported = parseInt(version) >= 14;
  }
  // Edge
  else if (userAgent.includes('Edg/')) {
    name = 'Edge';
    const match = userAgent.match(/Edg\/(\d+)/);
    version = match ? match[1] : 'Unknown';
    isSupported = parseInt(version) >= 90;
  }
  // Internet Explorer
  else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
    name = 'Internet Explorer';
    isSupported = false; // IE is not supported
  }

  return { name, version, isSupported };
}

// Check if the device has sufficient resources
export function checkDeviceCapabilities(): {
  hasEnoughMemory: boolean;
  hasGoodPerformance: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  let hasEnoughMemory = true;
  let hasGoodPerformance = true;

  // Check available memory (if supported)
  if ('memory' in performance && (performance as any).memory) {
    const memory = (performance as any).memory;
    const availableMemory = memory.jsHeapSizeLimit;
    
    // If less than 100MB available, show warning
    if (availableMemory < 100 * 1024 * 1024) {
      hasEnoughMemory = false;
      warnings.push('Low memory detected - application may run slowly');
    }
  }

  // Check for hardware concurrency (number of CPU cores)
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 2) {
    hasGoodPerformance = false;
    warnings.push('Limited CPU cores detected - animations may be slower');
  }

  // Check for touch device (mobile/tablet)
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    warnings.push('Touch device detected - some interactions may work differently');
  }

  // Check screen size
  if (window.screen && window.screen.width < 768) {
    warnings.push('Small screen detected - some features may be hidden or reorganized');
  }

  return {
    hasEnoughMemory,
    hasGoodPerformance,
    warnings
  };
}