import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
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

describe('App Basic Integration', () => {
  it('renders without crashing and shows main components', async () => {
    render(<App />);

    // Wait for loading to complete
    await screen.findByText('Producer-Consumer Problem Visualization');

    // Check that the main title is present
    expect(screen.getByText('Producer-Consumer Problem Visualization')).toBeInTheDocument();

    // Check that main sections are present
    expect(screen.getByText('Configuration')).toBeInTheDocument();
    expect(screen.getByText('Producer-Consumer Visualization')).toBeInTheDocument();
    expect(screen.getByText('Animation Controls')).toBeInTheDocument();
    expect(screen.getByText('Statistics')).toBeInTheDocument();
    expect(screen.getByText('Timeline Control')).toBeInTheDocument();
    expect(screen.getByText('Export Data')).toBeInTheDocument();

    // Check accessibility features
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();

    // Check keyboard shortcuts help
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
  });

  it('has proper responsive layout structure', async () => {
    render(<App />);

    // Wait for loading to complete
    await screen.findByRole('main');

    // Check that the main content area exists
    const mainContent = screen.getByRole('main');
    expect(mainContent).toHaveAttribute('id', 'main-content');

    // Check that skip link exists
    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
  });

  it('shows configuration inputs', async () => {
    render(<App />);

    // Wait for loading to complete
    await screen.findByLabelText(/Buffer Size/i);

    // Check that configuration inputs are present
    expect(screen.getByLabelText(/Buffer Size/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Producer Count/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Consumer Count/i)).toBeInTheDocument();
  });
});