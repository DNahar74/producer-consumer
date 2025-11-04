import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserCompatibilityWarning } from '../BrowserCompatibilityWarning';
import * as browserSupport from '../../utils/browserSupport';

// Mock the browser support utilities
vi.mock('../../utils/browserSupport');

describe('BrowserCompatibilityWarning', () => {
  let mockCheckBrowserSupport: any;
  let mockGetBrowserInfo: any;
  let mockCheckDeviceCapabilities: any;
  let mockLocalStorage: any;

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });

    // Mock browser support functions
    mockCheckBrowserSupport = vi.mocked(browserSupport.checkBrowserSupport);
    mockGetBrowserInfo = vi.mocked(browserSupport.getBrowserInfo);
    mockCheckDeviceCapabilities = vi.mocked(browserSupport.checkDeviceCapabilities);

    // Default mock implementations
    mockCheckBrowserSupport.mockReturnValue({
      isSupported: true,
      missingFeatures: [],
      warnings: []
    });

    mockGetBrowserInfo.mockReturnValue({
      name: 'Chrome',
      version: '95',
      isSupported: true
    });

    mockCheckDeviceCapabilities.mockReturnValue({
      hasEnoughMemory: true,
      hasGoodPerformance: true,
      warnings: []
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Normal Operation', () => {
    it('does not show warning when browser is fully supported', () => {
      render(<BrowserCompatibilityWarning />);
      
      expect(screen.queryByText('Browser Compatibility Issues Detected')).not.toBeInTheDocument();
      expect(screen.queryByText('Browser Compatibility Warnings')).not.toBeInTheDocument();
    });

    it('does not show warning when previously dismissed', () => {
      mockLocalStorage.getItem.mockReturnValue('true');
      
      // Set up unsupported browser
      mockGetBrowserInfo.mockReturnValue({
        name: 'Internet Explorer',
        version: '11',
        isSupported: false
      });

      render(<BrowserCompatibilityWarning />);
      
      expect(screen.queryByText('Browser Compatibility Issues Detected')).not.toBeInTheDocument();
    });
  });

  describe('Unsupported Browser', () => {
    it('shows error message for unsupported browser', async () => {
      mockGetBrowserInfo.mockReturnValue({
        name: 'Internet Explorer',
        version: '11',
        isSupported: false
      });

      render(<BrowserCompatibilityWarning />);
      
      await waitFor(() => {
        expect(screen.getByText('Browser Compatibility Issues Detected')).toBeInTheDocument();
        expect(screen.getByText('Browser: Internet Explorer 11 (Not Supported)')).toBeInTheDocument();
      });
    });

    it('shows recommended browsers list', async () => {
      mockGetBrowserInfo.mockReturnValue({
        name: 'Internet Explorer',
        version: '11',
        isSupported: false
      });

      render(<BrowserCompatibilityWarning />);
      
      await waitFor(() => {
        expect(screen.getByText('Recommended Browsers:')).toBeInTheDocument();
        expect(screen.getByText('Chrome 90+ (Recommended)')).toBeInTheDocument();
        expect(screen.getByText('Firefox 88+')).toBeInTheDocument();
        expect(screen.getByText('Safari 14+')).toBeInTheDocument();
        expect(screen.getByText('Edge 90+')).toBeInTheDocument();
      });
    });

    it('shows important notice for unsupported browsers', async () => {
      mockGetBrowserInfo.mockReturnValue({
        name: 'Internet Explorer',
        version: '11',
        isSupported: false
      });

      render(<BrowserCompatibilityWarning />);
      
      await waitFor(() => {
        expect(screen.getByText(/Your browser may not support all features/)).toBeInTheDocument();
        expect(screen.getByText(/please update your browser or switch to a supported browser/)).toBeInTheDocument();
      });
    });
  });

  describe('Missing Features', () => {
    it('shows missing features list', async () => {
      mockCheckBrowserSupport.mockReturnValue({
        isSupported: false,
        missingFeatures: ['Promises (ES6)', 'CSS Flexbox'],
        warnings: []
      });

      render(<BrowserCompatibilityWarning />);
      
      await waitFor(() => {
        expect(screen.getByText('Missing Features:')).toBeInTheDocument();
        expect(screen.getByText('Promises (ES6)')).toBeInTheDocument();
        expect(screen.getByText('CSS Flexbox')).toBeInTheDocument();
      });
    });

    it('shows error state when critical features are missing', async () => {
      mockCheckBrowserSupport.mockReturnValue({
        isSupported: false,
        missingFeatures: ['CSS Flexbox'],
        warnings: []
      });

      render(<BrowserCompatibilityWarning />);
      
      await waitFor(() => {
        expect(screen.getByText('Browser Compatibility Issues Detected')).toBeInTheDocument();
      });
    });
  });

  describe('Warnings', () => {
    it('shows warning state for non-critical issues', async () => {
      mockCheckBrowserSupport.mockReturnValue({
        isSupported: true,
        missingFeatures: [],
        warnings: ['Canvas API not available - screenshot export may not work']
      });

      render(<BrowserCompatibilityWarning />);
      
      await waitFor(() => {
        expect(screen.getByText('Browser Compatibility Warnings')).toBeInTheDocument();
        expect(screen.getByText('Canvas API not available - screenshot export may not work')).toBeInTheDocument();
      });
    });

    it('combines warnings from different sources', async () => {
      mockCheckBrowserSupport.mockReturnValue({
        isSupported: true,
        missingFeatures: [],
        warnings: ['localStorage not available']
      });

      mockCheckDeviceCapabilities.mockReturnValue({
        hasEnoughMemory: true,
        hasGoodPerformance: true,
        warnings: ['Touch device detected']
      });

      render(<BrowserCompatibilityWarning />);
      
      await waitFor(() => {
        expect(screen.getByText('localStorage not available')).toBeInTheDocument();
        expect(screen.getByText('Touch device detected')).toBeInTheDocument();
      });
    });
  });

  describe('Low Memory Warning', () => {
    it('shows warning for low memory devices', async () => {
      mockCheckDeviceCapabilities.mockReturnValue({
        hasEnoughMemory: false,
        hasGoodPerformance: true,
        warnings: ['Low memory detected - application may run slowly']
      });

      render(<BrowserCompatibilityWarning />);
      
      await waitFor(() => {
        expect(screen.getByText('Browser Compatibility Warnings')).toBeInTheDocument();
        expect(screen.getByText('Low memory detected - application may run slowly')).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('dismisses warning when dismiss button is clicked', async () => {
      mockGetBrowserInfo.mockReturnValue({
        name: 'Internet Explorer',
        version: '11',
        isSupported: false
      });

      render(<BrowserCompatibilityWarning />);
      
      await waitFor(() => {
        expect(screen.getByText('Browser Compatibility Issues Detected')).toBeInTheDocument();
      });

      const dismissButton = screen.getByText('Dismiss');
      fireEvent.click(dismissButton);

      await waitFor(() => {
        expect(screen.queryByText('Browser Compatibility Issues Detected')).not.toBeInTheDocument();
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('dismissedCompatibilityWarnings', 'true');
    });

    it('refreshes checks when refresh button is clicked', async () => {
      mockCheckBrowserSupport.mockReturnValue({
        isSupported: true,
        missingFeatures: [],
        warnings: ['Initial warning']
      });

      render(<BrowserCompatibilityWarning />);
      
      await waitFor(() => {
        expect(screen.getByText('Initial warning')).toBeInTheDocument();
      });

      // Change mock return value
      mockCheckBrowserSupport.mockReturnValue({
        isSupported: true,
        missingFeatures: [],
        warnings: ['Updated warning']
      });

      const refreshButton = screen.getByText('Refresh Check');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByText('Updated warning')).toBeInTheDocument();
        expect(screen.queryByText('Initial warning')).not.toBeInTheDocument();
      });

      // Should call all check functions again
      expect(mockCheckBrowserSupport).toHaveBeenCalledTimes(2);
      expect(mockGetBrowserInfo).toHaveBeenCalledTimes(2);
      expect(mockCheckDeviceCapabilities).toHaveBeenCalledTimes(2);
    });
  });

  describe('Browser Information Display', () => {
    it('displays browser name and version', async () => {
      mockGetBrowserInfo.mockReturnValue({
        name: 'Firefox',
        version: '94',
        isSupported: true
      });

      mockCheckBrowserSupport.mockReturnValue({
        isSupported: true,
        missingFeatures: [],
        warnings: ['Some warning']
      });

      render(<BrowserCompatibilityWarning />);
      
      await waitFor(() => {
        expect(screen.getByText('Browser: Firefox 94')).toBeInTheDocument();
      });
    });

    it('shows not supported indicator for old browsers', async () => {
      mockGetBrowserInfo.mockReturnValue({
        name: 'Chrome',
        version: '80',
        isSupported: false
      });

      render(<BrowserCompatibilityWarning />);
      
      await waitFor(() => {
        expect(screen.getByText('Browser: Chrome 80 (Not Supported)')).toBeInTheDocument();
      });
    });
  });

  describe('Styling and Visual Indicators', () => {
    it('uses error styling for critical issues', async () => {
      mockGetBrowserInfo.mockReturnValue({
        name: 'Internet Explorer',
        version: '11',
        isSupported: false
      });

      render(<BrowserCompatibilityWarning />);
      
      await waitFor(() => {
        const icon = screen.getByRole('img', { hidden: true });
        expect(icon).toHaveClass('text-red-500');
        
        const heading = screen.getByText('Browser Compatibility Issues Detected');
        expect(heading).toHaveClass('text-red-800');
      });
    });

    it('uses warning styling for non-critical issues', async () => {
      mockCheckBrowserSupport.mockReturnValue({
        isSupported: true,
        missingFeatures: [],
        warnings: ['Some warning']
      });

      render(<BrowserCompatibilityWarning />);
      
      await waitFor(() => {
        const icon = screen.getByRole('img', { hidden: true });
        expect(icon).toHaveClass('text-yellow-500');
        
        const heading = screen.getByText('Browser Compatibility Warnings');
        expect(heading).toHaveClass('text-yellow-800');
      });
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA attributes', async () => {
      mockGetBrowserInfo.mockReturnValue({
        name: 'Internet Explorer',
        version: '11',
        isSupported: false
      });

      render(<BrowserCompatibilityWarning />);
      
      await waitFor(() => {
        const icon = screen.getByRole('img', { hidden: true });
        expect(icon).toHaveAttribute('aria-hidden', 'true');
        
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
          expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles localStorage errors gracefully', async () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      mockGetBrowserInfo.mockReturnValue({
        name: 'Internet Explorer',
        version: '11',
        isSupported: false
      });

      render(<BrowserCompatibilityWarning />);
      
      // Should still show warning despite localStorage error
      await waitFor(() => {
        expect(screen.getByText('Browser Compatibility Issues Detected')).toBeInTheDocument();
      });
    });

    it('handles missing browser support data', async () => {
      mockCheckBrowserSupport.mockReturnValue({
        isSupported: true,
        missingFeatures: [],
        warnings: []
      });

      mockGetBrowserInfo.mockReturnValue({
        name: 'Unknown',
        version: 'Unknown',
        isSupported: true
      });

      render(<BrowserCompatibilityWarning />);
      
      // Should not show warning for unknown but supported browser
      expect(screen.queryByText('Browser Compatibility')).not.toBeInTheDocument();
    });

    it('handles empty warnings arrays', async () => {
      mockCheckBrowserSupport.mockReturnValue({
        isSupported: false,
        missingFeatures: ['CSS Flexbox'],
        warnings: []
      });

      mockCheckDeviceCapabilities.mockReturnValue({
        hasEnoughMemory: true,
        hasGoodPerformance: true,
        warnings: []
      });

      render(<BrowserCompatibilityWarning />);
      
      await waitFor(() => {
        expect(screen.getByText('Missing Features:')).toBeInTheDocument();
        expect(screen.queryByText('Warnings:')).not.toBeInTheDocument();
      });
    });
  });
});