import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';

// Mock the browser support utility
vi.mock('../utils/browserSupport', () => ({
  checkBrowserSupport: () => ({ 
    isSupported: true, 
    missingFeatures: [],
    warnings: []
  }),
  getBrowserInfo: () => ({ 
    name: 'Chrome', 
    version: '90.0.0',
    isSupported: true
  }),
  checkDeviceCapabilities: () => ({ 
    hasWebGL: true, 
    hasCanvas: true, 
    hasLocalStorage: true,
    hasWebWorkers: true,
    isMobile: false,
    isTablet: false,
    hasEnoughMemory: true,
    warnings: []
  })
}));

// Mock the export utilities
vi.mock('../utils/exportUtils', () => ({
  captureScreenshot: vi.fn().mockResolvedValue('mock-screenshot-data'),
  exportExecutionTrace: vi.fn().mockReturnValue('mock-trace-data'),
  downloadFile: vi.fn()
}));

describe('App Integration Tests', () => {
  beforeEach(() => {
    // Clear any previous mocks
    vi.clearAllMocks();
  });

  it('renders all main components', async () => {
    render(<App />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/Initializing Producer-Consumer/)).not.toBeInTheDocument();
    });

    // Check that all main sections are present
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();

    // Check main heading
    expect(screen.getByText('Producer-Consumer Problem Visualization')).toBeInTheDocument();

    // Check that all main components are rendered
    expect(screen.getByText('Configuration')).toBeInTheDocument();
    expect(screen.getByText('Producer-Consumer Visualization')).toBeInTheDocument();
    expect(screen.getByText('Animation Controls')).toBeInTheDocument();
    expect(screen.getByText('Statistics')).toBeInTheDocument();
    expect(screen.getByText('Timeline')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('handles configuration changes and simulation start', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/Initializing Producer-Consumer/)).not.toBeInTheDocument();
    });

    // Find configuration inputs
    const bufferSizeInput = screen.getByLabelText(/Buffer Size/i);
    const producerCountInput = screen.getByLabelText(/Number of Producers/i);
    const consumerCountInput = screen.getByLabelText(/Number of Consumers/i);

    // Change configuration
    fireEvent.change(bufferSizeInput, { target: { value: '5' } });
    fireEvent.change(producerCountInput, { target: { value: '2' } });
    fireEvent.change(consumerCountInput, { target: { value: '3' } });

    // Start simulation
    const startButton = screen.getByText('Start Simulation');
    fireEvent.click(startButton);

    // Verify simulation started
    await waitFor(() => {
      expect(screen.getByText('Pause')).toBeInTheDocument();
    });
  });

  it('handles animation controls', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/Initializing Producer-Consumer/)).not.toBeInTheDocument();
    });

    // Start simulation first
    const startButton = screen.getByText('Start Simulation');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('Pause')).toBeInTheDocument();
    });

    // Test pause
    const pauseButton = screen.getByText('Pause');
    fireEvent.click(pauseButton);

    await waitFor(() => {
      expect(screen.getByText('Play')).toBeInTheDocument();
    });

    // Test step forward
    const stepForwardButton = screen.getByLabelText(/Step Forward/i);
    fireEvent.click(stepForwardButton);

    // Test step backward (should be enabled after stepping forward)
    await waitFor(() => {
      const stepBackwardButton = screen.getByLabelText(/Step Backward/i);
      expect(stepBackwardButton).not.toBeDisabled();
    });
  });

  it('handles keyboard shortcuts', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/Initializing Producer-Consumer/)).not.toBeInTheDocument();
    });

    // Test spacebar for play/pause
    fireEvent.keyDown(document, { key: ' ' });
    
    await waitFor(() => {
      expect(screen.getByText('Pause')).toBeInTheDocument();
    });

    // Test spacebar again for pause
    fireEvent.keyDown(document, { key: ' ' });
    
    await waitFor(() => {
      expect(screen.getByText('Play')).toBeInTheDocument();
    });

    // Test arrow keys for stepping
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    fireEvent.keyDown(document, { key: 'ArrowLeft' });

    // Test reset shortcut
    fireEvent.keyDown(document, { key: 'r', ctrlKey: true });
    
    // Should reset to initial state
    await waitFor(() => {
      expect(screen.getByText('Start Simulation')).toBeInTheDocument();
    });
  });

  it('displays statistics and timeline correctly', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/Initializing Producer-Consumer/)).not.toBeInTheDocument();
    });

    // Check initial statistics
    expect(screen.getByText('Current Step:')).toBeInTheDocument();
    expect(screen.getByText('Items Produced:')).toBeInTheDocument();
    expect(screen.getByText('Items Consumed:')).toBeInTheDocument();
    expect(screen.getByText('Buffer Utilization:')).toBeInTheDocument();

    // Check timeline
    expect(screen.getByText('Timeline')).toBeInTheDocument();
  });

  it('handles responsive layout', async () => {
    // Test with different viewport sizes
    const originalInnerWidth = window.innerWidth;
    
    // Mobile size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/Initializing Producer-Consumer/)).not.toBeInTheDocument();
    });

    // Should still render all components
    expect(screen.getByText('Configuration')).toBeInTheDocument();
    expect(screen.getByText('Producer-Consumer Visualization')).toBeInTheDocument();

    // Restore original width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  it('shows keyboard shortcuts help', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/Initializing Producer-Consumer/)).not.toBeInTheDocument();
    });

    // Check keyboard shortcuts section
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    expect(screen.getByText('Play/Pause')).toBeInTheDocument();
    expect(screen.getByText('Step Forward')).toBeInTheDocument();
    expect(screen.getByText('Step Backward')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('handles error boundaries gracefully', async () => {
    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/Initializing Producer-Consumer/)).not.toBeInTheDocument();
    });

    // The app should render without crashing even if individual components fail
    expect(screen.getByRole('main')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('provides accessibility features', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/Initializing Producer-Consumer/)).not.toBeInTheDocument();
    });

    // Check skip link
    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();

    // Check ARIA roles
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();

    // Check main content has proper ID for skip link
    const mainContent = screen.getByRole('main');
    expect(mainContent).toHaveAttribute('id', 'main-content');
  });

  it('validates configuration before starting simulation', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/Initializing Producer-Consumer/)).not.toBeInTheDocument();
    });

    // Try to set invalid configuration
    const bufferSizeInput = screen.getByLabelText(/Buffer Size/i);
    fireEvent.change(bufferSizeInput, { target: { value: '15' } }); // Invalid: > 10

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/Buffer size must be between 1 and 10/i)).toBeInTheDocument();
    });

    // Start button should be disabled or show error
    const startButton = screen.getByText('Start Simulation');
    fireEvent.click(startButton);

    // Should not start simulation with invalid config
    expect(screen.queryByText('Pause')).not.toBeInTheDocument();
  });
});