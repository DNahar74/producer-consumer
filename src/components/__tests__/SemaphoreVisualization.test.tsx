import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SemaphoreVisualization } from '../SemaphoreVisualization';
import type { Semaphore } from '../../types/simulation';

describe('SemaphoreVisualization', () => {
  const mockSemaphores: Semaphore[] = [
    {
      name: 'empty',
      value: 3,
      waitingQueue: []
    },
    {
      name: 'full',
      value: 0,
      waitingQueue: ['P1', 'C1']
    },
    {
      name: 'mutex',
      value: 1,
      waitingQueue: []
    }
  ];

  it('renders all semaphores with correct names', () => {
    render(<SemaphoreVisualization semaphores={mockSemaphores} />);
    
    expect(screen.getByText('empty')).toBeInTheDocument();
    expect(screen.getByText('full')).toBeInTheDocument();
    expect(screen.getByText('mutex')).toBeInTheDocument();
  });

  it('displays semaphore values correctly', () => {
    render(<SemaphoreVisualization semaphores={mockSemaphores} />);
    
    // Check that all values are displayed
    expect(screen.getByText('3')).toBeInTheDocument(); // empty semaphore
    expect(screen.getByText('0')).toBeInTheDocument(); // full semaphore
    expect(screen.getByText('1')).toBeInTheDocument(); // mutex semaphore
  });

  it('shows waiting queue when processes are waiting', () => {
    render(<SemaphoreVisualization semaphores={mockSemaphores} />);
    
    // Check waiting queue for full semaphore
    expect(screen.getByText('Waiting Queue (2):')).toBeInTheDocument();
    expect(screen.getByText('P1')).toBeInTheDocument();
    expect(screen.getByText('C1')).toBeInTheDocument();
  });

  it('shows "No processes waiting" when queue is empty', () => {
    render(<SemaphoreVisualization semaphores={mockSemaphores} />);
    
    // Should show "No processes waiting" for empty and mutex semaphores
    const noWaitingMessages = screen.getAllByText('No processes waiting');
    expect(noWaitingMessages).toHaveLength(2);
  });

  it('applies correct color coding for available semaphores', () => {
    render(<SemaphoreVisualization semaphores={mockSemaphores} />);
    
    // Available semaphores (value > 0) should have green styling
    const emptyContainer = screen.getByText('empty').closest('.bg-green-50');
    const mutexContainer = screen.getByText('mutex').closest('.bg-green-50');
    
    expect(emptyContainer).toHaveClass('bg-green-50', 'border-green-200');
    expect(mutexContainer).toHaveClass('bg-green-50', 'border-green-200');
  });

  it('applies correct color coding for blocked semaphores', () => {
    render(<SemaphoreVisualization semaphores={mockSemaphores} />);
    
    // Blocked semaphores (value = 0) should have red styling
    const fullContainer = screen.getByText('full').closest('.bg-red-50');
    expect(fullContainer).toHaveClass('bg-red-50', 'border-red-200');
  });

  it('displays semaphore descriptions', () => {
    render(<SemaphoreVisualization semaphores={mockSemaphores} />);
    
    expect(screen.getByText('Tracks available buffer slots')).toBeInTheDocument();
    expect(screen.getByText('Tracks occupied buffer slots')).toBeInTheDocument();
    expect(screen.getByText('Controls exclusive buffer access')).toBeInTheDocument();
  });

  it('renders legend with correct information', () => {
    render(<SemaphoreVisualization semaphores={mockSemaphores} />);
    
    expect(screen.getByText('Legend:')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Blocked')).toBeInTheDocument();
    expect(screen.getByText('Producer')).toBeInTheDocument();
    expect(screen.getByText('Consumer')).toBeInTheDocument();
  });

  it('applies correct styling to producer and consumer processes in waiting queue', () => {
    render(<SemaphoreVisualization semaphores={mockSemaphores} />);
    
    const producerProcess = screen.getByText('P1');
    const consumerProcess = screen.getByText('C1');
    
    expect(producerProcess).toHaveClass('bg-blue-200', 'text-blue-800');
    expect(consumerProcess).toHaveClass('bg-green-200', 'text-green-800');
  });

  it('handles empty semaphores array', () => {
    render(<SemaphoreVisualization semaphores={[]} />);
    
    expect(screen.getByText('Semaphores')).toBeInTheDocument();
    expect(screen.getByText('Legend:')).toBeInTheDocument();
  });

  it('handles semaphores with large waiting queues', () => {
    const semaphoreWithLargeQueue: Semaphore[] = [
      {
        name: 'mutex',
        value: 0,
        waitingQueue: ['P1', 'P2', 'C1', 'C2', 'P3']
      }
    ];

    render(<SemaphoreVisualization semaphores={semaphoreWithLargeQueue} />);
    
    expect(screen.getByText('Waiting Queue (5):')).toBeInTheDocument();
    expect(screen.getByText('P1')).toBeInTheDocument();
    expect(screen.getByText('P2')).toBeInTheDocument();
    expect(screen.getByText('C1')).toBeInTheDocument();
    expect(screen.getByText('C2')).toBeInTheDocument();
    expect(screen.getByText('P3')).toBeInTheDocument();
  });
});