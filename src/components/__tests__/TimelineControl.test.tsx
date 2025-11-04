import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TimelineControl } from '../TimelineControl';

describe('TimelineControl', () => {
  const defaultProps = {
    currentStep: 5,
    totalSteps: 20,
    onJumpToStep: vi.fn()
  };

  const mockHistory = [
    { stepNumber: 1, action: 'P1 acquired empty semaphore', processId: 'P1' },
    { stepNumber: 2, action: 'P1 produced an item', processId: 'P1' },
    { stepNumber: 3, action: 'C1 acquired full semaphore', processId: 'C1' },
    { stepNumber: 4, action: 'C1 consumed an item', processId: 'C1' },
    { stepNumber: 5, action: 'P2 waiting for mutex', processId: 'P2' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders timeline control with correct title', () => {
    render(<TimelineControl {...defaultProps} />);
    
    expect(screen.getByText('Timeline Control')).toBeInTheDocument();
  });

  it('displays current step information', () => {
    render(<TimelineControl {...defaultProps} />);
    
    expect(screen.getByText('Step 5 of 20')).toBeInTheDocument();
  });

  it('displays current action when history is provided', () => {
    render(<TimelineControl {...defaultProps} history={mockHistory} />);
    
    expect(screen.getByText('P2 waiting for mutex')).toBeInTheDocument();
  });

  it('renders range slider with correct attributes', () => {
    render(<TimelineControl {...defaultProps} />);
    
    const slider = screen.getByRole('slider', { name: 'Timeline slider' });
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '20');
    expect(slider).toHaveAttribute('value', '5');
  });

  it('calls onJumpToStep when slider value changes', () => {
    render(<TimelineControl {...defaultProps} />);
    
    const slider = screen.getByRole('slider', { name: 'Timeline slider' });
    fireEvent.change(slider, { target: { value: '10' } });
    
    expect(defaultProps.onJumpToStep).toHaveBeenCalledWith(10);
  });

  it('renders quick navigation buttons', () => {
    render(<TimelineControl {...defaultProps} />);
    
    expect(screen.getByText('⏮ Start')).toBeInTheDocument();
    expect(screen.getByText('-10')).toBeInTheDocument();
    expect(screen.getByText('+10')).toBeInTheDocument();
    expect(screen.getByText('End ⏭')).toBeInTheDocument();
  });

  it('calls onJumpToStep when Start button is clicked', () => {
    render(<TimelineControl {...defaultProps} />);
    
    fireEvent.click(screen.getByText('⏮ Start'));
    expect(defaultProps.onJumpToStep).toHaveBeenCalledWith(0);
  });

  it('calls onJumpToStep when End button is clicked', () => {
    render(<TimelineControl {...defaultProps} />);
    
    fireEvent.click(screen.getByText('End ⏭'));
    expect(defaultProps.onJumpToStep).toHaveBeenCalledWith(20);
  });

  it('calls onJumpToStep with correct value when -10 button is clicked', () => {
    render(<TimelineControl {...defaultProps} currentStep={15} />);
    
    fireEvent.click(screen.getByText('-10'));
    expect(defaultProps.onJumpToStep).toHaveBeenCalledWith(5);
  });

  it('calls onJumpToStep with correct value when +10 button is clicked', () => {
    render(<TimelineControl {...defaultProps} currentStep={5} />);
    
    fireEvent.click(screen.getByText('+10'));
    expect(defaultProps.onJumpToStep).toHaveBeenCalledWith(15);
  });

  it('disables Start button when at beginning', () => {
    render(<TimelineControl {...defaultProps} currentStep={0} />);
    
    const startButton = screen.getByText('⏮ Start');
    expect(startButton).toBeDisabled();
    expect(startButton).toHaveClass('disabled:bg-gray-300', 'disabled:cursor-not-allowed');
  });

  it('disables End button when at end', () => {
    render(<TimelineControl {...defaultProps} currentStep={20} />);
    
    const endButton = screen.getByText('End ⏭');
    expect(endButton).toBeDisabled();
    expect(endButton).toHaveClass('disabled:bg-gray-300', 'disabled:cursor-not-allowed');
  });

  it('disables -10 button when currentStep is 0', () => {
    render(<TimelineControl {...defaultProps} currentStep={0} />);
    
    const backButton = screen.getByText('-10');
    expect(backButton).toBeDisabled();
  });

  it('disables +10 button when currentStep equals totalSteps', () => {
    render(<TimelineControl {...defaultProps} currentStep={20} totalSteps={20} />);
    
    const forwardButton = screen.getByText('+10');
    expect(forwardButton).toBeDisabled();
  });

  it('handles timeline click navigation', () => {
    render(<TimelineControl {...defaultProps} />);
    
    const timeline = screen.getByRole('button', { name: 'Timeline navigation' });
    
    // Mock getBoundingClientRect
    const mockRect = { left: 0, width: 200 };
    vi.spyOn(timeline, 'getBoundingClientRect').mockReturnValue(mockRect as DOMRect);
    
    // Click at 50% position (should jump to step 10)
    fireEvent.click(timeline, { clientX: 100 });
    
    expect(defaultProps.onJumpToStep).toHaveBeenCalledWith(10);
  });

  it('handles keyboard navigation on timeline', () => {
    render(<TimelineControl {...defaultProps} />);
    
    const timeline = screen.getByRole('button', { name: 'Timeline navigation' });
    
    // Mock getBoundingClientRect for Enter key
    const mockRect = { left: 0, width: 200 };
    vi.spyOn(timeline, 'getBoundingClientRect').mockReturnValue(mockRect as DOMRect);
    
    fireEvent.keyDown(timeline, { key: 'Enter', clientX: 100 });
    expect(defaultProps.onJumpToStep).toHaveBeenCalled();
  });

  it('renders significant event markers when history is provided', () => {
    render(<TimelineControl {...defaultProps} history={mockHistory} />);
    
    // Check for markers (they have title attributes with step information)
    const markers = screen.getAllByTitle(/Step \d+:/);
    expect(markers.length).toBeGreaterThan(0);
  });

  it('shows event legend when history is provided', () => {
    render(<TimelineControl {...defaultProps} history={mockHistory} />);
    
    expect(screen.getByText('Significant Events')).toBeInTheDocument();
    expect(screen.getByText('Current Position')).toBeInTheDocument();
  });

  it('does not show event legend when no history is provided', () => {
    render(<TimelineControl {...defaultProps} />);
    
    expect(screen.queryByText('Significant Events')).not.toBeInTheDocument();
    expect(screen.queryByText('Current Position')).not.toBeInTheDocument();
  });

  it('disables slider when totalSteps is 0', () => {
    render(<TimelineControl {...defaultProps} totalSteps={0} />);
    
    const slider = screen.getByRole('slider', { name: 'Timeline slider' });
    expect(slider).toBeDisabled();
  });

  it('handles edge case with totalSteps 0', () => {
    render(<TimelineControl {...defaultProps} currentStep={0} totalSteps={0} />);
    
    expect(screen.getByText('Step 0 of 0')).toBeInTheDocument();
    
    const startButton = screen.getByText('⏮ Start');
    const endButton = screen.getByText('End ⏭');
    
    expect(startButton).toBeDisabled();
    expect(endButton).toBeDisabled();
  });

  it('clamps timeline click values to valid range', () => {
    render(<TimelineControl {...defaultProps} />);
    
    const timeline = screen.getByRole('button', { name: 'Timeline navigation' });
    
    // Mock getBoundingClientRect
    const mockRect = { left: 0, width: 200 };
    vi.spyOn(timeline, 'getBoundingClientRect').mockReturnValue(mockRect as DOMRect);
    
    // Click beyond the right edge (should clamp to totalSteps)
    fireEvent.click(timeline, { clientX: 300 });
    
    expect(defaultProps.onJumpToStep).toHaveBeenCalledWith(20);
  });

  it('prevents -10 button from going below 0', () => {
    render(<TimelineControl {...defaultProps} currentStep={5} />);
    
    fireEvent.click(screen.getByText('-10'));
    expect(defaultProps.onJumpToStep).toHaveBeenCalledWith(0); // Max(0, 5-10) = 0
  });

  it('prevents +10 button from exceeding totalSteps', () => {
    render(<TimelineControl {...defaultProps} currentStep={15} />);
    
    fireEvent.click(screen.getByText('+10'));
    expect(defaultProps.onJumpToStep).toHaveBeenCalledWith(20); // Min(20, 15+10) = 20
  });

  it('applies correct CSS classes for styling', () => {
    render(<TimelineControl {...defaultProps} />);
    
    const container = screen.getByText('Timeline Control').parentElement;
    expect(container).toHaveClass('bg-white', 'p-6', 'rounded-lg', 'shadow-md');
    
    const timeline = screen.getByRole('button', { name: 'Timeline navigation' });
    expect(timeline).toHaveClass('relative', 'h-8', 'bg-gray-200', 'rounded-lg', 'cursor-pointer');
  });

  it('identifies significant events correctly', () => {
    const significantHistory = [
      { stepNumber: 1, action: 'P1 acquired empty semaphore', processId: 'P1' },
      { stepNumber: 2, action: 'P1 produced an item', processId: 'P1' },
      { stepNumber: 3, action: 'C1 consumed an item', processId: 'C1' },
      { stepNumber: 4, action: 'P2 waiting for mutex', processId: 'P2' },
      { stepNumber: 5, action: 'Some other action', processId: 'P1' }
    ];
    
    render(<TimelineControl {...defaultProps} history={significantHistory} />);
    
    // Should have markers for steps 1-4 (significant events) but not step 5
    const step1Marker = screen.queryByTitle('Step 1: P1 acquired empty semaphore');
    const step2Marker = screen.queryByTitle('Step 2: P1 produced an item');
    const step3Marker = screen.queryByTitle('Step 3: C1 consumed an item');
    const step4Marker = screen.queryByTitle('Step 4: P2 waiting for mutex');
    const step5Marker = screen.queryByTitle('Step 5: Some other action');
    
    expect(step1Marker).toBeInTheDocument();
    expect(step2Marker).toBeInTheDocument();
    expect(step3Marker).toBeInTheDocument();
    expect(step4Marker).toBeInTheDocument();
    expect(step5Marker).not.toBeInTheDocument();
  });
});