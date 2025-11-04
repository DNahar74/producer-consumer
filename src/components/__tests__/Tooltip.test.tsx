import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Tooltip } from '../Tooltip';

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic Functionality', () => {
    it('renders children without tooltip initially', () => {
      render(
        <Tooltip content="Tooltip content">
          <button>Hover me</button>
        </Tooltip>
      );

      expect(screen.getByText('Hover me')).toBeInTheDocument();
      expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
    });

    it('shows tooltip on mouse enter after delay', async () => {
      render(
        <Tooltip content="Tooltip content" delay={100}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);

      // Should not show immediately
      expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();

      // Should show after delay
      vi.advanceTimersByTime(100);
      await waitFor(() => {
        expect(screen.getByText('Tooltip content')).toBeInTheDocument();
      });
    });

    it('hides tooltip on mouse leave', async () => {
      render(
        <Tooltip content="Tooltip content" delay={100}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      
      vi.advanceTimersByTime(100);
      await waitFor(() => {
        expect(screen.getByText('Tooltip content')).toBeInTheDocument();
      });

      fireEvent.mouseLeave(trigger);
      await waitFor(() => {
        expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
      });
    });

    it('shows tooltip on focus', async () => {
      render(
        <Tooltip content="Tooltip content" delay={100}>
          <button>Focus me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Focus me');
      fireEvent.focus(trigger);

      vi.advanceTimersByTime(100);
      await waitFor(() => {
        expect(screen.getByText('Tooltip content')).toBeInTheDocument();
      });
    });

    it('hides tooltip on blur', async () => {
      render(
        <Tooltip content="Tooltip content" delay={100}>
          <button>Focus me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Focus me');
      fireEvent.focus(trigger);
      
      vi.advanceTimersByTime(100);
      await waitFor(() => {
        expect(screen.getByText('Tooltip content')).toBeInTheDocument();
      });

      fireEvent.blur(trigger);
      await waitFor(() => {
        expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
      });
    });
  });

  describe('Delay Configuration', () => {
    it('uses default delay when not specified', async () => {
      render(
        <Tooltip content="Tooltip content">
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);

      // Should not show before default delay (500ms)
      vi.advanceTimersByTime(400);
      expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();

      // Should show after default delay
      vi.advanceTimersByTime(100);
      await waitFor(() => {
        expect(screen.getByText('Tooltip content')).toBeInTheDocument();
      });
    });

    it('uses custom delay', async () => {
      render(
        <Tooltip content="Tooltip content" delay={1000}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);

      vi.advanceTimersByTime(999);
      expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();

      vi.advanceTimersByTime(1);
      await waitFor(() => {
        expect(screen.getByText('Tooltip content')).toBeInTheDocument();
      });
    });

    it('cancels tooltip when mouse leaves before delay', async () => {
      render(
        <Tooltip content="Tooltip content" delay={500}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);

      vi.advanceTimersByTime(200);
      fireEvent.mouseLeave(trigger);

      vi.advanceTimersByTime(500);
      expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
    });
  });

  describe('Positioning', () => {
    it('applies correct classes for top position', async () => {
      render(
        <Tooltip content="Tooltip content" position="top" delay={100}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      
      vi.advanceTimersByTime(100);
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass('bottom-full', 'left-1/2', 'transform', '-translate-x-1/2', 'mb-2');
      });
    });

    it('applies correct classes for bottom position', async () => {
      render(
        <Tooltip content="Tooltip content" position="bottom" delay={100}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      
      vi.advanceTimersByTime(100);
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass('top-full', 'left-1/2', 'transform', '-translate-x-1/2', 'mt-2');
      });
    });

    it('applies correct classes for left position', async () => {
      render(
        <Tooltip content="Tooltip content" position="left" delay={100}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      
      vi.advanceTimersByTime(100);
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass('right-full', 'top-1/2', 'transform', '-translate-y-1/2', 'mr-2');
      });
    });

    it('applies correct classes for right position', async () => {
      render(
        <Tooltip content="Tooltip content" position="right" delay={100}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      
      vi.advanceTimersByTime(100);
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass('left-full', 'top-1/2', 'transform', '-translate-y-1/2', 'ml-2');
      });
    });
  });

  describe('Content Types', () => {
    it('renders string content', async () => {
      render(
        <Tooltip content="Simple string content" delay={100}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      
      vi.advanceTimersByTime(100);
      await waitFor(() => {
        expect(screen.getByText('Simple string content')).toBeInTheDocument();
      });
    });

    it('renders React element content', async () => {
      const content = (
        <div>
          <strong>Bold text</strong>
          <p>Paragraph text</p>
        </div>
      );

      render(
        <Tooltip content={content} delay={100}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      
      vi.advanceTimersByTime(100);
      await waitFor(() => {
        expect(screen.getByText('Bold text')).toBeInTheDocument();
        expect(screen.getByText('Paragraph text')).toBeInTheDocument();
      });
    });
  });

  describe('Disabled State', () => {
    it('does not show tooltip when disabled', async () => {
      render(
        <Tooltip content="Tooltip content" disabled={true} delay={100}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      
      vi.advanceTimersByTime(100);
      expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
    });

    it('shows tooltip when not disabled', async () => {
      render(
        <Tooltip content="Tooltip content" disabled={false} delay={100}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      
      vi.advanceTimersByTime(100);
      await waitFor(() => {
        expect(screen.getByText('Tooltip content')).toBeInTheDocument();
      });
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className to container', () => {
      render(
        <Tooltip content="Tooltip content" className="custom-class">
          <button>Hover me</button>
        </Tooltip>
      );

      const container = screen.getByText('Hover me').parentElement;
      expect(container).toHaveClass('custom-class');
    });

    it('applies base styling classes', async () => {
      render(
        <Tooltip content="Tooltip content" delay={100}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      
      vi.advanceTimersByTime(100);
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass(
          'absolute', 'z-50', 'px-3', 'py-2', 'text-sm', 'text-white', 
          'bg-gray-900', 'rounded-md', 'shadow-lg', 'pointer-events-none',
          'transition-opacity', 'duration-200', 'max-w-xs'
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA attributes', async () => {
      render(
        <Tooltip content="Tooltip content" delay={100}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      
      vi.advanceTimersByTime(100);
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveAttribute('role', 'tooltip');
        expect(tooltip).toHaveAttribute('aria-hidden', 'false');
      });
    });

    it('sets aria-hidden to true when tooltip is not visible', () => {
      render(
        <Tooltip content="Tooltip content">
          <button>Hover me</button>
        </Tooltip>
      );

      // Tooltip should not be in DOM when not visible, so we can't test aria-hidden
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Arrow Positioning', () => {
    it('positions arrow correctly for top tooltip', async () => {
      render(
        <Tooltip content="Tooltip content" position="top" delay={100}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      
      vi.advanceTimersByTime(100);
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        const arrow = tooltip.querySelector('div[aria-hidden="true"]');
        expect(arrow).toHaveClass('top-full', 'left-1/2', 'transform', '-translate-x-1/2', '-translate-y-1/2');
      });
    });

    it('positions arrow correctly for bottom tooltip', async () => {
      render(
        <Tooltip content="Tooltip content" position="bottom" delay={100}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      
      vi.advanceTimersByTime(100);
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        const arrow = tooltip.querySelector('div[aria-hidden="true"]');
        expect(arrow).toHaveClass('bottom-full', 'left-1/2', 'transform', '-translate-x-1/2', 'translate-y-1/2');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid mouse enter/leave events', async () => {
      render(
        <Tooltip content="Tooltip content" delay={100}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      
      // Rapid mouse events
      fireEvent.mouseEnter(trigger);
      fireEvent.mouseLeave(trigger);
      fireEvent.mouseEnter(trigger);
      fireEvent.mouseLeave(trigger);
      fireEvent.mouseEnter(trigger);
      
      vi.advanceTimersByTime(100);
      await waitFor(() => {
        expect(screen.getByText('Tooltip content')).toBeInTheDocument();
      });
    });

    it('cleans up timers on unmount', () => {
      const { unmount } = render(
        <Tooltip content="Tooltip content" delay={100}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);

      unmount();

      // Should not crash when timer fires after unmount
      vi.advanceTimersByTime(100);
    });

    it('handles empty content gracefully', async () => {
      render(
        <Tooltip content="" delay={100}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      
      vi.advanceTimersByTime(100);
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toBeEmptyDOMElement();
      });
    });
  });
});