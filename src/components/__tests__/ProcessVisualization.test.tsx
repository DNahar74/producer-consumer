import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProcessVisualization } from '../ProcessVisualization';
import type { Process } from '../../types/simulation';

describe('ProcessVisualization', () => {
  const mockProducers: Process[] = [
    {
      id: 'P1',
      type: 'producer',
      state: 'running',
      currentOperation: 'producing',
      itemsProcessed: 5,
      totalWaitTime: 100
    },
    {
      id: 'P2',
      type: 'producer',
      state: 'waiting',
      currentOperation: 'waiting_semaphore',
      waitingOn: 'empty',
      itemsProcessed: 3,
      totalWaitTime: 250
    }
  ];

  const mockConsumers: Process[] = [
    {
      id: 'C1',
      type: 'consumer',
      state: 'ready',
      itemsProcessed: 2,
      totalWaitTime: 50
    },
    {
      id: 'C2',
      type: 'consumer',
      state: 'blocked',
      currentOperation: 'waiting_semaphore',
      waitingOn: 'full',
      itemsProcessed: 4,
      totalWaitTime: 300
    }
  ];

  const allProcesses = [...mockProducers, ...mockConsumers];

  it('renders the component title', () => {
    render(<ProcessVisualization processes={allProcesses} />);
    expect(screen.getByText('Processes')).toBeInTheDocument();
  });

  it('renders producers section with correct count', () => {
    render(<ProcessVisualization processes={allProcesses} />);
    expect(screen.getByText('Producers (2)')).toBeInTheDocument();
  });

  it('renders consumers section with correct count', () => {
    render(<ProcessVisualization processes={allProcesses} />);
    expect(screen.getByText('Consumers (2)')).toBeInTheDocument();
  });

  it('displays all process IDs', () => {
    render(<ProcessVisualization processes={allProcesses} />);
    expect(screen.getByText('P1')).toBeInTheDocument();
    expect(screen.getByText('P2')).toBeInTheDocument();
    expect(screen.getByText('C1')).toBeInTheDocument();
    expect(screen.getByText('C2')).toBeInTheDocument();
  });

  it('displays process states correctly', () => {
    render(<ProcessVisualization processes={allProcesses} />);
    expect(screen.getByText('State: Running')).toBeInTheDocument();
    expect(screen.getByText('State: Waiting')).toBeInTheDocument();
    expect(screen.getByText('State: Ready')).toBeInTheDocument();
    expect(screen.getByText('State: Blocked')).toBeInTheDocument();
  });

  it('displays current operations correctly', () => {
    render(<ProcessVisualization processes={allProcesses} />);
    expect(screen.getByText('Producing item')).toBeInTheDocument();
    expect(screen.getByText('Waiting on empty')).toBeInTheDocument();
    expect(screen.getByText('Ready to work')).toBeInTheDocument();
    expect(screen.getByText('Waiting on full')).toBeInTheDocument();
  });

  it('displays process statistics', () => {
    render(<ProcessVisualization processes={allProcesses} />);
    
    // Check items processed
    expect(screen.getByText('5')).toBeInTheDocument(); // P1 items produced
    expect(screen.getByText('3')).toBeInTheDocument(); // P2 items produced
    expect(screen.getByText('2')).toBeInTheDocument(); // C1 items consumed
    expect(screen.getByText('4')).toBeInTheDocument(); // C2 items consumed
    
    // Check wait times
    expect(screen.getByText('100ms')).toBeInTheDocument(); // P1 wait time
    expect(screen.getByText('250ms')).toBeInTheDocument(); // P2 wait time
    expect(screen.getByText('50ms')).toBeInTheDocument(); // C1 wait time
    expect(screen.getByText('300ms')).toBeInTheDocument(); // C2 wait time
  });

  it('displays waiting information for blocked processes', () => {
    render(<ProcessVisualization processes={allProcesses} />);
    expect(screen.getByText('Waiting on: empty')).toBeInTheDocument();
    expect(screen.getByText('Waiting on: full')).toBeInTheDocument();
  });

  it('renders legend with all process states', () => {
    render(<ProcessVisualization processes={allProcesses} />);
    expect(screen.getByText('Process States:')).toBeInTheDocument();
    expect(screen.getByText('Running Producer')).toBeInTheDocument();
    expect(screen.getByText('Running Consumer')).toBeInTheDocument();
    expect(screen.getByText('Ready Producer')).toBeInTheDocument();
    expect(screen.getByText('Ready Consumer')).toBeInTheDocument();
    expect(screen.getByText('Waiting/Blocked')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('handles empty processes array', () => {
    render(<ProcessVisualization processes={[]} />);
    expect(screen.getByText('Processes')).toBeInTheDocument();
    expect(screen.getByText('Producers (0)')).toBeInTheDocument();
    expect(screen.getByText('Consumers (0)')).toBeInTheDocument();
  });

  it('handles only producers', () => {
    render(<ProcessVisualization processes={mockProducers} />);
    expect(screen.getByText('Producers (2)')).toBeInTheDocument();
    expect(screen.getByText('Consumers (0)')).toBeInTheDocument();
    expect(screen.getByText('P1')).toBeInTheDocument();
    expect(screen.getByText('P2')).toBeInTheDocument();
  });

  it('handles only consumers', () => {
    render(<ProcessVisualization processes={mockConsumers} />);
    expect(screen.getByText('Producers (0)')).toBeInTheDocument();
    expect(screen.getByText('Consumers (2)')).toBeInTheDocument();
    expect(screen.getByText('C1')).toBeInTheDocument();
    expect(screen.getByText('C2')).toBeInTheDocument();
  });

  it('displays correct operation text for process without current operation', () => {
    const processWithoutOperation: Process = {
      id: 'P3',
      type: 'producer',
      state: 'ready',
      itemsProcessed: 0,
      totalWaitTime: 0
    };
    
    render(<ProcessVisualization processes={[processWithoutOperation]} />);
    expect(screen.getByText('Ready to work')).toBeInTheDocument();
  });

  it('displays correct operation text for idle process', () => {
    const idleProcess: Process = {
      id: 'C3',
      type: 'consumer',
      state: 'blocked',
      itemsProcessed: 0,
      totalWaitTime: 0
    };
    
    render(<ProcessVisualization processes={[idleProcess]} />);
    expect(screen.getByText('Idle')).toBeInTheDocument();
  });

  it('applies correct CSS classes for running producer', () => {
    const runningProducer: Process = {
      id: 'P1',
      type: 'producer',
      state: 'running',
      currentOperation: 'producing',
      itemsProcessed: 1,
      totalWaitTime: 0
    };
    
    const { container } = render(<ProcessVisualization processes={[runningProducer]} />);
    const processCard = container.querySelector('[class*="bg-blue-50"][class*="border-blue-300"][class*="shadow-lg"]');
    expect(processCard).toBeInTheDocument();
  });

  it('applies correct CSS classes for waiting consumer', () => {
    const waitingConsumer: Process = {
      id: 'C1',
      type: 'consumer',
      state: 'waiting',
      currentOperation: 'waiting_semaphore',
      waitingOn: 'full',
      itemsProcessed: 0,
      totalWaitTime: 100
    };
    
    const { container } = render(<ProcessVisualization processes={[waitingConsumer]} />);
    const processCard = container.querySelector('[class*="opacity-60"]');
    expect(processCard).toBeInTheDocument();
  });

  it('displays items produced label for producers', () => {
    render(<ProcessVisualization processes={mockProducers} />);
    expect(screen.getAllByText('Items Produced:')).toHaveLength(2);
  });

  it('displays items consumed label for consumers', () => {
    render(<ProcessVisualization processes={mockConsumers} />);
    expect(screen.getAllByText('Items Consumed:')).toHaveLength(2);
  });

  it('handles unknown operation gracefully', () => {
    const processWithUnknownOperation: Process = {
      id: 'P1',
      type: 'producer',
      state: 'running',
      currentOperation: 'unknown_operation' as any,
      itemsProcessed: 0,
      totalWaitTime: 0
    };
    
    render(<ProcessVisualization processes={[processWithUnknownOperation]} />);
    expect(screen.getByText('Unknown operation')).toBeInTheDocument();
  });

  it('handles unknown state gracefully', () => {
    const processWithUnknownState: Process = {
      id: 'P1',
      type: 'producer',
      state: 'unknown_state' as any,
      itemsProcessed: 0,
      totalWaitTime: 0
    };
    
    render(<ProcessVisualization processes={[processWithUnknownState]} />);
    expect(screen.getByText('State: unknown_state')).toBeInTheDocument();
  });
});