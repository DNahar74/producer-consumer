import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AnimationControls } from '../AnimationControls';

describe('AnimationControls', () => {
  const defaultProps = {
    isPlaying: false,
    canStepForward: true,
    canStepBackward: true,
    animationSpeed: 1.0,
    onPlay: vi.fn(),
    onPause: vi.fn(),
    onStepForward: vi.fn(),
    onStepBackward: vi.fn(),
    onSpeedChange: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all control buttons', () => {
    render(<AnimationControls {...defaultProps} />);
    
    expect(screen.getByText('⏮ Step Back')).toBeInTheDocument();
    expect(screen.getByText('▶ Play')).toBeInTheDocument();
    expect(screen.getByText('Step Forward ⏭')).toBeInTheDocument();
    expect(screen.getByText('Speed:')).toBeInTheDocument();
  });

  it('shows pause button when playing', () => {
    render(<AnimationControls {...defaultProps} isPlaying={true} />);
    
    expect(screen.getByText('⏸ Pause')).toBeInTheDocument();
    expect(screen.queryByText('▶ Play')).not.toBeInTheDocument();
  });

  it('shows play button when not playing', () => {
    render(<AnimationControls {...defaultProps} isPlaying={false} />);
    
    expect(screen.getByText('▶ Play')).toBeInTheDocument();
    expect(screen.queryByText('⏸ Pause')).not.toBeInTheDocument();
  });

  it('calls onPlay when play button is clicked', () => {
    render(<AnimationControls {...defaultProps} isPlaying={false} />);
    
    fireEvent.click(screen.getByText('▶ Play'));
    expect(defaultProps.onPlay).toHaveBeenCalledTimes(1);
  });

  it('calls onPause when pause button is clicked', () => {
    render(<AnimationControls {...defaultProps} isPlaying={true} />);
    
    fireEvent.click(screen.getByText('⏸ Pause'));
    expect(defaultProps.onPause).toHaveBeenCalledTimes(1);
  });

  it('calls onStepForward when step forward button is clicked', () => {
    render(<AnimationControls {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Step Forward ⏭'));
    expect(defaultProps.onStepForward).toHaveBeenCalledTimes(1);
  });

  it('calls onStepBackward when step backward button is clicked', () => {
    render(<AnimationControls {...defaultProps} />);
    
    fireEvent.click(screen.getByText('⏮ Step Back'));
    expect(defaultProps.onStepBackward).toHaveBeenCalledTimes(1);
  });

  it('disables step backward button when canStepBackward is false', () => {
    render(<AnimationControls {...defaultProps} canStepBackward={false} />);
    
    const stepBackButton = screen.getByText('⏮ Step Back');
    expect(stepBackButton).toBeDisabled();
    expect(stepBackButton).toHaveClass('disabled:bg-gray-300', 'disabled:cursor-not-allowed');
  });

  it('disables step forward button when canStepForward is false', () => {
    render(<AnimationControls {...defaultProps} canStepForward={false} />);
    
    const stepForwardButton = screen.getByText('Step Forward ⏭');
    expect(stepForwardButton).toBeDisabled();
    expect(stepForwardButton).toHaveClass('disabled:bg-gray-300', 'disabled:cursor-not-allowed');
  });

  it('displays current animation speed', () => {
    render(<AnimationControls {...defaultProps} animationSpeed={2.5} />);
    
    expect(screen.getByText('2.5x')).toBeInTheDocument();
  });

  it('calls onSpeedChange when speed slider is changed', () => {
    render(<AnimationControls {...defaultProps} />);
    
    const speedSlider = screen.getByRole('slider');
    fireEvent.change(speedSlider, { target: { value: '2.0' } });
    
    expect(defaultProps.onSpeedChange).toHaveBeenCalledWith(2.0);
  });

  it('has correct speed slider attributes', () => {
    render(<AnimationControls {...defaultProps} />);
    
    const speedSlider = screen.getByRole('slider');
    expect(speedSlider).toHaveAttribute('min', '0.5');
    expect(speedSlider).toHaveAttribute('max', '3');
    expect(speedSlider).toHaveAttribute('step', '0.1');
  });

  it('applies correct CSS classes for styling', () => {
    render(<AnimationControls {...defaultProps} />);
    
    const container = screen.getByText('Animation Controls').parentElement;
    expect(container).toHaveClass('bg-white', 'p-6', 'rounded-lg', 'shadow-md');
    
    const playButton = screen.getByText('▶ Play');
    expect(playButton).toHaveClass('px-6', 'py-2', 'bg-blue-500', 'text-white', 'rounded-md', 'hover:bg-blue-600');
  });

  it('prevents disabled button interactions', () => {
    render(<AnimationControls {...defaultProps} canStepBackward={false} />);
    
    const stepBackButton = screen.getByText('⏮ Step Back');
    fireEvent.click(stepBackButton);
    
    // Should not call the handler when disabled
    expect(defaultProps.onStepBackward).not.toHaveBeenCalled();
  });

  it('handles edge case speed values correctly', () => {
    const { rerender } = render(<AnimationControls {...defaultProps} animationSpeed={0.5} />);
    expect(screen.getByText('0.5x')).toBeInTheDocument();
    
    rerender(<AnimationControls {...defaultProps} animationSpeed={3.0} />);
    expect(screen.getByText('3x')).toBeInTheDocument();
  });
});