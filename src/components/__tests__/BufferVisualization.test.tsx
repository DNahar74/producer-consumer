
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BufferVisualization } from '../BufferVisualization';
import type { BufferSlot } from '../../types/simulation';

describe('BufferVisualization', () => {
  const createMockBuffer = (size: number, occupiedSlots: number[] = []): BufferSlot[] => {
    return Array.from({ length: size }, (_, index) => ({
      id: index,
      occupied: occupiedSlots.includes(index),
      item: occupiedSlots.includes(index) ? {
        id: `item-${index}-P1`,
        producedBy: `P${(index % 2) + 1}`,
        timestamp: Date.now()
      } : undefined
    }));
  };

  it('renders buffer title', () => {
    const buffer = createMockBuffer(3);
    render(<BufferVisualization buffer={buffer} />);
    
    expect(screen.getByText('Shared Buffer')).toBeInTheDocument();
  });

  it('displays all buffer slots', () => {
    const buffer = createMockBuffer(5);
    render(<BufferVisualization buffer={buffer} />);
    
    // Check that all slots are rendered
    for (let i = 0; i < 5; i++) {
      expect(screen.getByText(`Slot ${i}`)).toBeInTheDocument();
    }
  });

  it('shows empty slots correctly', () => {
    const buffer = createMockBuffer(3);
    render(<BufferVisualization buffer={buffer} />);
    
    // All slots should be empty
    const emptyLabels = screen.getAllByText('Empty');
    expect(emptyLabels).toHaveLength(3);
    
    // Check for empty slot visual indicators by finding the main slot containers
    const slotContainers = screen.getAllByText(/Slot \d/).map(el => 
      el.closest('div')?.parentElement
    );
    slotContainers.forEach(slot => {
      expect(slot).toHaveClass('bg-gray-50', 'border-gray-300');
    });
  });

  it('shows occupied slots with item information', () => {
    const buffer = createMockBuffer(3, [0, 2]);
    render(<BufferVisualization buffer={buffer} />);
    
    // Check occupied slots
    const producerLabels = screen.getAllByText(/by P\d/);
    expect(producerLabels).toHaveLength(2);
    
    // Check empty slot
    expect(screen.getByText('Empty')).toBeInTheDocument();
    
    // Check visual styling for occupied slots by finding the main slot containers
    // We need to go up to the outermost div with the styling classes
    const occupiedSlotContainers = screen.getAllByText(/by P\d/).map(el => {
      // Go up through the DOM hierarchy to find the main slot container
      let current = el.parentElement;
      while (current && !current.className.includes('bg-orange-100')) {
        current = current.parentElement;
      }
      return current;
    });
    occupiedSlotContainers.forEach(slot => {
      expect(slot).toHaveClass('bg-orange-100', 'border-orange-400');
    });
  });

  it('displays producer information for each item', () => {
    const buffer: BufferSlot[] = [
      {
        id: 0,
        occupied: true,
        item: {
          id: 'item-1-P1',
          producedBy: 'P1',
          timestamp: Date.now()
        }
      },
      {
        id: 1,
        occupied: true,
        item: {
          id: 'item-2-P2',
          producedBy: 'P2',
          timestamp: Date.now()
        }
      },
      {
        id: 2,
        occupied: false
      }
    ];

    render(<BufferVisualization buffer={buffer} />);
    
    expect(screen.getByText('by P1')).toBeInTheDocument();
    expect(screen.getByText('by P2')).toBeInTheDocument();
  });

  it('shows buffer statistics correctly', () => {
    const buffer = createMockBuffer(5, [1, 3, 4]);
    render(<BufferVisualization buffer={buffer} />);
    
    expect(screen.getByText('Occupied: 3')).toBeInTheDocument();
    expect(screen.getByText('Empty: 2')).toBeInTheDocument();
    expect(screen.getByText('Capacity: 5')).toBeInTheDocument();
  });

  it('handles empty buffer correctly', () => {
    const buffer: BufferSlot[] = [];
    render(<BufferVisualization buffer={buffer} />);
    
    expect(screen.getByText('Shared Buffer')).toBeInTheDocument();
    expect(screen.getByText('Occupied: 0')).toBeInTheDocument();
    expect(screen.getByText('Empty: 0')).toBeInTheDocument();
    expect(screen.getByText('Capacity: 0')).toBeInTheDocument();
  });

  it('handles fully occupied buffer', () => {
    const buffer = createMockBuffer(3, [0, 1, 2]);
    render(<BufferVisualization buffer={buffer} />);
    
    expect(screen.getByText('Occupied: 3')).toBeInTheDocument();
    expect(screen.getByText('Empty: 0')).toBeInTheDocument();
    expect(screen.getByText('Capacity: 3')).toBeInTheDocument();
    
    // Should not have any "Empty" labels
    expect(screen.queryByText('Empty')).not.toBeInTheDocument();
  });

  it('displays item IDs with truncation', () => {
    const buffer: BufferSlot[] = [
      {
        id: 0,
        occupied: true,
        item: {
          id: 'item-very-long-id-P1',
          producedBy: 'P1',
          timestamp: Date.now()
        }
      }
    ];

    render(<BufferVisualization buffer={buffer} />);
    
    // Should show the last part of the item ID
    expect(screen.getByText('P1')).toBeInTheDocument(); // This is the last part after split
  });

  it('applies correct CSS classes for visual feedback', () => {
    const buffer = createMockBuffer(2, [0]);
    render(<BufferVisualization buffer={buffer} />);
    
    // Get the main container divs for each slot (the outermost div with styling)
    const slotContainers = screen.getAllByText(/Slot \d/).map(el => 
      el.closest('div')?.parentElement
    );
    
    // First slot should be occupied (orange styling)
    expect(slotContainers[0]).toHaveClass('bg-orange-100', 'border-orange-400', 'transform', 'scale-105');
    
    // Second slot should be empty (gray styling)
    expect(slotContainers[1]).toHaveClass('bg-gray-50', 'border-gray-300');
  });

  it('shows transition classes for animations', () => {
    const buffer = createMockBuffer(1, [0]);
    render(<BufferVisualization buffer={buffer} />);
    
    const slotContainer = screen.getByText('Slot 0').closest('div')?.parentElement;
    expect(slotContainer).toHaveClass('transition-all', 'duration-300');
  });

  it('displays legend with visual indicators', () => {
    const buffer = createMockBuffer(3, [0]);
    render(<BufferVisualization buffer={buffer} />);
    
    // Check for legend items
    expect(screen.getByText('Occupied: 1')).toBeInTheDocument();
    expect(screen.getByText('Empty: 2')).toBeInTheDocument();
    
    // The visual indicators should be present (orange circle and dashed circle)
    const container = screen.getByText('Occupied: 1').closest('div');
    expect(container).toBeInTheDocument();
  });

  it('handles different buffer sizes responsively', () => {
    // Test with small buffer
    const { rerender } = render(<BufferVisualization buffer={createMockBuffer(2)} />);
    expect(screen.getAllByText(/Slot \d/)).toHaveLength(2);
    
    // Test with larger buffer
    rerender(<BufferVisualization buffer={createMockBuffer(10)} />);
    expect(screen.getAllByText(/Slot \d/)).toHaveLength(10);
  });
});