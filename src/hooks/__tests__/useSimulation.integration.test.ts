import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSimulation } from '../useSimulation';

describe('useSimulation hook integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  it('should provide complete history navigation functionality', () => {
    const { result } = renderHook(() => useSimulation());
    
    // Initial state
    expect(result.current.state.currentStep).toBe(0);
    expect(result.current.state.history).toHaveLength(0);
    
    // Execute several steps forward
    act(() => {
      result.current.dispatch({ type: 'STEP_FORWARD' });
    });
    act(() => {
      result.current.dispatch({ type: 'STEP_FORWARD' });
    });
    act(() => {
      result.current.dispatch({ type: 'STEP_FORWARD' });
    });
    
    // Verify forward navigation
    expect(result.current.state.currentStep).toBe(3);
    expect(result.current.state.history).toHaveLength(3);
    
    // Test backward navigation
    act(() => {
      result.current.dispatch({ type: 'STEP_BACKWARD' });
    });
    
    expect(result.current.state.currentStep).toBe(2);
    expect(result.current.state.history).toHaveLength(2);
    
    // Test jump to step
    act(() => {
      result.current.dispatch({ type: 'JUMP_TO_STEP', payload: 1 });
    });
    
    expect(result.current.state.currentStep).toBe(1);
    expect(result.current.state.history).toHaveLength(1);
    
    // Test jump to initial state
    act(() => {
      result.current.dispatch({ type: 'JUMP_TO_STEP', payload: 0 });
    });
    
    expect(result.current.state.currentStep).toBe(0);
    expect(result.current.state.history).toHaveLength(0);
  });

  it('should maintain state consistency during complex navigation', () => {
    const { result } = renderHook(() => useSimulation());
    
    // Execute steps to create complex state
    for (let i = 0; i < 8; i++) {
      act(() => {
        result.current.dispatch({ type: 'STEP_FORWARD' });
      });
    }
    
    const stateAtStep8 = JSON.parse(JSON.stringify(result.current.state));
    
    // Navigate backward and forward
    act(() => {
      result.current.dispatch({ type: 'JUMP_TO_STEP', payload: 3 });
    });
    
    act(() => {
      result.current.dispatch({ type: 'STEP_BACKWARD' });
    });
    
    act(() => {
      result.current.dispatch({ type: 'STEP_FORWARD' });
    });
    
    // Should be back at step 3
    expect(result.current.state.currentStep).toBe(3);
    
    // Jump back to step 8 should not be possible since history was truncated
    act(() => {
      result.current.dispatch({ type: 'JUMP_TO_STEP', payload: 8 });
    });
    
    // Should remain at step 3
    expect(result.current.state.currentStep).toBe(3);
  });

  it('should preserve configuration and animation settings during navigation', () => {
    const { result } = renderHook(() => useSimulation());
    
    // Set custom configuration and animation settings
    act(() => {
      result.current.dispatch({
        type: 'SET_CONFIG',
        payload: {
          bufferSize: 3,
          producerCount: 1,
          consumerCount: 2,
          animationSpeed: 2.0
        }
      });
    });
    
    act(() => {
      result.current.dispatch({ type: 'START_SIMULATION' });
    });
    
    // Execute steps
    for (let i = 0; i < 5; i++) {
      act(() => {
        result.current.dispatch({ type: 'STEP_FORWARD' });
      });
    }
    
    // Navigate backward
    act(() => {
      result.current.dispatch({ type: 'STEP_BACKWARD' });
    });
    
    // Configuration and animation settings should be preserved
    expect(result.current.state.config.bufferSize).toBe(3);
    expect(result.current.state.config.producerCount).toBe(1);
    expect(result.current.state.config.consumerCount).toBe(2);
    expect(result.current.state.animationSpeed).toBe(2.0);
    expect(result.current.state.isPlaying).toBe(true);
    
    // Jump to different step
    act(() => {
      result.current.dispatch({ type: 'JUMP_TO_STEP', payload: 1 });
    });
    
    // Settings should still be preserved
    expect(result.current.state.config.bufferSize).toBe(3);
    expect(result.current.state.animationSpeed).toBe(2.0);
    expect(result.current.state.isPlaying).toBe(true);
  });

  it('should implement auto-play functionality with setInterval', () => {
    const { result } = renderHook(() => useSimulation());
    
    // Initial state - not playing
    expect(result.current.state.isPlaying).toBe(false);
    expect(result.current.state.currentStep).toBe(0);
    
    // Start simulation (auto-play)
    act(() => {
      result.current.dispatch({ type: 'START_SIMULATION' });
    });
    
    expect(result.current.state.isPlaying).toBe(true);
    
    // Fast-forward time to trigger auto-play steps
    act(() => {
      vi.advanceTimersByTime(1000); // 1 second at 1x speed
    });
    
    // Should have advanced one step
    expect(result.current.state.currentStep).toBe(1);
    
    // Fast-forward more time
    act(() => {
      vi.advanceTimersByTime(2000); // 2 more seconds
    });
    
    // Should have advanced more steps
    expect(result.current.state.currentStep).toBe(3);
    
    // Pause simulation
    act(() => {
      result.current.dispatch({ type: 'PAUSE_SIMULATION' });
    });
    
    expect(result.current.state.isPlaying).toBe(false);
    const stepsWhenPaused = result.current.state.currentStep;
    
    // Fast-forward time - should not advance when paused
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    expect(result.current.state.currentStep).toBe(stepsWhenPaused);
  });

  it('should respect animation speed in auto-play', () => {
    const { result } = renderHook(() => useSimulation());
    
    // Set faster animation speed
    act(() => {
      result.current.dispatch({ type: 'SET_SPEED', payload: 2.0 });
    });
    
    // Start simulation
    act(() => {
      result.current.dispatch({ type: 'START_SIMULATION' });
    });
    
    expect(result.current.state.animationSpeed).toBe(2.0);
    
    // At 2x speed, should advance 2 steps per second
    act(() => {
      vi.advanceTimersByTime(1000); // 1 second
    });
    
    // Should have advanced 2 steps (2x speed)
    expect(result.current.state.currentStep).toBe(2);
    
    // Change speed while playing
    act(() => {
      result.current.dispatch({ type: 'SET_SPEED', payload: 0.5 });
    });
    
    const currentStep = result.current.state.currentStep;
    
    // At 0.5x speed, should advance 1 step every 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000); // 2 seconds
    });
    
    // Should have advanced 1 step (0.5x speed)
    expect(result.current.state.currentStep).toBe(currentStep + 1);
  });

  it('should clean up interval when component unmounts', () => {
    const { result, unmount } = renderHook(() => useSimulation());
    
    // Start simulation
    act(() => {
      result.current.dispatch({ type: 'START_SIMULATION' });
    });
    
    expect(result.current.state.isPlaying).toBe(true);
    
    // Unmount the hook
    unmount();
    
    // Fast-forward time - should not cause any errors
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    
    // No assertions needed - test passes if no errors are thrown
  });
});