import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingSpinner, LoadingOverlay } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<LoadingSpinner />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders with custom label', () => {
      render(<LoadingSpinner label="Processing..." />);
      
      expect(screen.getByText('Processing...')).toBeInTheDocument();
      expect(screen.getByLabelText('Processing...')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<LoadingSpinner className="custom-class" />);
      
      const container = screen.getByRole('status').parentElement;
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('Size Variants', () => {
    it('applies small size classes', () => {
      render(<LoadingSpinner size="sm" />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('h-4', 'w-4');
    });

    it('applies medium size classes (default)', () => {
      render(<LoadingSpinner size="md" />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('h-6', 'w-6');
    });

    it('applies large size classes', () => {
      render(<LoadingSpinner size="lg" />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('h-8', 'w-8');
    });

    it('applies extra large size classes', () => {
      render(<LoadingSpinner size="xl" />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('h-12', 'w-12');
    });

    it('uses medium size by default', () => {
      render(<LoadingSpinner />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('h-6', 'w-6');
    });
  });

  describe('Color Variants', () => {
    it('applies blue color classes (default)', () => {
      render(<LoadingSpinner color="blue" />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('text-blue-500');
    });

    it('applies gray color classes', () => {
      render(<LoadingSpinner color="gray" />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('text-gray-500');
    });

    it('applies white color classes', () => {
      render(<LoadingSpinner color="white" />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('text-white');
    });

    it('applies green color classes', () => {
      render(<LoadingSpinner color="green" />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('text-green-500');
    });

    it('applies red color classes', () => {
      render(<LoadingSpinner color="red" />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('text-red-500');
    });

    it('uses blue color by default', () => {
      render(<LoadingSpinner />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('text-blue-500');
    });
  });

  describe('Animation', () => {
    it('applies spin animation class', () => {
      render(<LoadingSpinner />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('animate-spin');
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA attributes', () => {
      render(<LoadingSpinner label="Loading data" />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', 'Loading data');
      expect(spinner).toHaveAttribute('role', 'status');
    });

    it('includes screen reader text', () => {
      render(<LoadingSpinner label="Processing request" />);
      
      const srText = screen.getByText('Processing request');
      expect(srText).toHaveClass('sr-only');
    });

    it('uses default label for screen readers', () => {
      render(<LoadingSpinner />);
      
      const srText = screen.getByText('Loading...');
      expect(srText).toHaveClass('sr-only');
    });
  });

  describe('SVG Structure', () => {
    it('renders SVG with correct viewBox', () => {
      render(<LoadingSpinner />);
      
      const svg = screen.getByRole('status');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      expect(svg).toHaveAttribute('fill', 'none');
    });

    it('contains circle and path elements', () => {
      render(<LoadingSpinner />);
      
      const svg = screen.getByRole('status');
      const circle = svg.querySelector('circle');
      const path = svg.querySelector('path');
      
      expect(circle).toBeInTheDocument();
      expect(path).toBeInTheDocument();
      
      expect(circle).toHaveAttribute('cx', '12');
      expect(circle).toHaveAttribute('cy', '12');
      expect(circle).toHaveAttribute('r', '10');
      expect(circle).toHaveClass('opacity-25');
      
      expect(path).toHaveClass('opacity-75');
    });
  });
});

describe('LoadingOverlay', () => {
  describe('Basic Functionality', () => {
    it('renders children without overlay when not loading', () => {
      render(
        <LoadingOverlay isLoading={false}>
          <div>Content</div>
        </LoadingOverlay>
      );
      
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('renders children with overlay when loading', () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div>Content</div>
        </LoadingOverlay>
      );
      
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getAllByText('Loading...')).toHaveLength(2); // One in spinner, one in message
    });

    it('displays custom loading message', () => {
      render(
        <LoadingOverlay isLoading={true} message="Processing data...">
          <div>Content</div>
        </LoadingOverlay>
      );
      
      expect(screen.getByText('Processing data...')).toBeInTheDocument();
    });

    it('applies custom className to container', () => {
      render(
        <LoadingOverlay isLoading={false} className="custom-class">
          <div>Content</div>
        </LoadingOverlay>
      );
      
      const container = screen.getByText('Content').parentElement;
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('Overlay Styling', () => {
    it('applies correct overlay classes when loading', () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div>Content</div>
        </LoadingOverlay>
      );
      
      // Find the overlay div by looking for the element with the overlay classes
      const overlayDiv = document.querySelector('.absolute.inset-0.bg-white.bg-opacity-75');
      expect(overlayDiv).toBeInTheDocument();
      expect(overlayDiv).toHaveClass(
        'absolute', 'inset-0', 'bg-white', 'bg-opacity-75', 
        'flex', 'items-center', 'justify-center', 'z-10'
      );
    });

    it('positions container relatively', () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div>Content</div>
        </LoadingOverlay>
      );
      
      const container = screen.getByText('Content').parentElement;
      expect(container).toHaveClass('relative');
    });
  });

  describe('Loading State', () => {
    it('shows large spinner in overlay', () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div>Content</div>
        </LoadingOverlay>
      );
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('h-8', 'w-8'); // Large size
    });

    it('centers loading content', () => {
      render(
        <LoadingOverlay isLoading={true} message="Processing...">
          <div>Content</div>
        </LoadingOverlay>
      );
      
      const loadingMessage = screen.getByText('Processing...');
      const loadingContent = loadingMessage.parentElement;
      expect(loadingContent).toHaveClass('text-center');
    });

    it('styles loading message', () => {
      render(
        <LoadingOverlay isLoading={true} message="Loading data...">
          <div>Content</div>
        </LoadingOverlay>
      );
      
      const message = screen.getByText('Loading data...');
      expect(message).toHaveClass('mt-2', 'text-sm', 'text-gray-600');
    });
  });

  describe('Accessibility', () => {
    it('maintains accessibility of children when not loading', () => {
      render(
        <LoadingOverlay isLoading={false}>
          <button>Click me</button>
        </LoadingOverlay>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).not.toHaveAttribute('aria-hidden');
    });

    it('provides loading status when loading', () => {
      render(
        <LoadingOverlay isLoading={true} message="Processing...">
          <div>Content</div>
        </LoadingOverlay>
      );
      
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });
  });

  describe('Z-Index Management', () => {
    it('applies correct z-index to overlay', () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div>Content</div>
        </LoadingOverlay>
      );
      
      const overlayDiv = document.querySelector('.absolute.inset-0.bg-white.bg-opacity-75');
      expect(overlayDiv).toHaveClass('z-10');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      render(
        <LoadingOverlay isLoading={false}>
          {null}
        </LoadingOverlay>
      );
      
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('handles multiple children', () => {
      render(
        <LoadingOverlay isLoading={false}>
          <div>First child</div>
          <div>Second child</div>
        </LoadingOverlay>
      );
      
      expect(screen.getByText('First child')).toBeInTheDocument();
      expect(screen.getByText('Second child')).toBeInTheDocument();
    });

    it('handles loading state changes', () => {
      const { rerender } = render(
        <LoadingOverlay isLoading={false}>
          <div>Content</div>
        </LoadingOverlay>
      );
      
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      
      rerender(
        <LoadingOverlay isLoading={true}>
          <div>Content</div>
        </LoadingOverlay>
      );
      
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});