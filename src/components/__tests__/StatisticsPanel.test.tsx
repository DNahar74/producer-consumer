import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StatisticsPanel } from '../StatisticsPanel';

describe('StatisticsPanel', () => {
  const mockStatistics = {
    totalItemsProduced: 5,
    totalItemsConsumed: 3,
    bufferUtilization: 60.5,
    averageWaitTime: 150.75
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render all required statistics', () => {
    render(
      <StatisticsPanel
        statistics={mockStatistics}
        currentStep={10}
        startTime={null}
      />
    );

    // Check that all statistics are displayed
    expect(screen.getByText('Statistics')).toBeInTheDocument();
    expect(screen.getByText('Current Step')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Execution Time')).toBeInTheDocument();
    expect(screen.getByText('Items Produced')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Items Consumed')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Buffer Utilization')).toBeInTheDocument();
    expect(screen.getByText('60.5%')).toBeInTheDocument();
    expect(screen.getByText('Average Wait Time')).toBeInTheDocument();
    expect(screen.getByText('150.75ms')).toBeInTheDocument();
    expect(screen.getByText('Throughput')).toBeInTheDocument();
  });

  it('should display execution time as 0.0s when startTime is null', () => {
    render(
      <StatisticsPanel
        statistics={mockStatistics}
        currentStep={5}
        startTime={null}
      />
    );

    expect(screen.getByText('0.0s')).toBeInTheDocument();
    expect(screen.getByText('0.00 items/sec')).toBeInTheDocument();
  });

  it('should calculate and display execution time correctly', () => {
    const startTime = Date.now() - 5000; // 5 seconds ago
    vi.setSystemTime(Date.now());

    render(
      <StatisticsPanel
        statistics={mockStatistics}
        currentStep={8}
        startTime={startTime}
      />
    );

    expect(screen.getByText('5.0s')).toBeInTheDocument();
  });

  it('should calculate and display throughput correctly', () => {
    const startTime = Date.now() - 4000; // 4 seconds ago
    vi.setSystemTime(Date.now());

    render(
      <StatisticsPanel
        statistics={mockStatistics}
        currentStep={12}
        startTime={startTime}
      />
    );

    // Total items processed = 5 produced + 3 consumed = 8
    // Throughput = 8 items / 4 seconds = 2.00 items/sec
    expect(screen.getByText('2.00 items/sec')).toBeInTheDocument();
  });

  it('should handle zero throughput when execution time is zero', () => {
    render(
      <StatisticsPanel
        statistics={mockStatistics}
        currentStep={0}
        startTime={Date.now()} // Same as current time
      />
    );

    expect(screen.getByText('0.00 items/sec')).toBeInTheDocument();
  });

  it('should format decimal values correctly', () => {
    const preciseStatistics = {
      totalItemsProduced: 7,
      totalItemsConsumed: 4,
      bufferUtilization: 33.333333,
      averageWaitTime: 1234.5678
    };

    render(
      <StatisticsPanel
        statistics={preciseStatistics}
        currentStep={15}
        startTime={null}
      />
    );

    // Check decimal formatting
    expect(screen.getByText('33.3%')).toBeInTheDocument(); // 1 decimal place
    expect(screen.getByText('1234.57ms')).toBeInTheDocument(); // 2 decimal places
  });

  it('should use appropriate color coding for different metrics', () => {
    render(
      <StatisticsPanel
        statistics={mockStatistics}
        currentStep={7}
        startTime={Date.now() - 2000}
      />
    );

    // Check that different colored backgrounds are applied by finding the container with the background class
    const stepElement = screen.getByText('Current Step').parentElement;
    expect(stepElement).toHaveClass('bg-gray-50');

    const producedElement = screen.getByText('Items Produced').parentElement;
    expect(producedElement).toHaveClass('bg-blue-50');

    const consumedElement = screen.getByText('Items Consumed').parentElement;
    expect(consumedElement).toHaveClass('bg-green-50');

    const utilizationElement = screen.getByText('Buffer Utilization').parentElement;
    expect(utilizationElement).toHaveClass('bg-orange-50');

    const waitTimeElement = screen.getByText('Average Wait Time').parentElement;
    expect(waitTimeElement).toHaveClass('bg-purple-50');

    const throughputElement = screen.getByText('Throughput').parentElement;
    expect(throughputElement).toHaveClass('bg-teal-50');
  });

  it('should display real-time updates when props change', () => {
    const { rerender } = render(
      <StatisticsPanel
        statistics={mockStatistics}
        currentStep={5}
        startTime={Date.now() - 1000}
      />
    );

    // Check initial values by looking at specific sections
    expect(screen.getByText('Current Step').nextElementSibling).toHaveTextContent('5');
    expect(screen.getByText('Items Produced').nextElementSibling).toHaveTextContent('5');
    expect(screen.getByText('Items Consumed').nextElementSibling).toHaveTextContent('3');

    // Update with new statistics
    const updatedStatistics = {
      ...mockStatistics,
      totalItemsProduced: 8,
      totalItemsConsumed: 6
    };

    rerender(
      <StatisticsPanel
        statistics={updatedStatistics}
        currentStep={12}
        startTime={Date.now() - 2000}
      />
    );

    expect(screen.getByText('Current Step').nextElementSibling).toHaveTextContent('12');
    expect(screen.getByText('Items Produced').nextElementSibling).toHaveTextContent('8');
    expect(screen.getByText('Items Consumed').nextElementSibling).toHaveTextContent('6');
  });

  it('should handle edge case with zero items processed', () => {
    const zeroStatistics = {
      totalItemsProduced: 0,
      totalItemsConsumed: 0,
      bufferUtilization: 0,
      averageWaitTime: 0
    };

    render(
      <StatisticsPanel
        statistics={zeroStatistics}
        currentStep={0}
        startTime={Date.now() - 5000}
      />
    );

    expect(screen.getByText('Current Step').nextElementSibling).toHaveTextContent('0');
    expect(screen.getByText('Items Produced').nextElementSibling).toHaveTextContent('0');
    expect(screen.getByText('Items Consumed').nextElementSibling).toHaveTextContent('0');
    expect(screen.getByText('0.0%')).toBeInTheDocument();
    expect(screen.getByText('0.00ms')).toBeInTheDocument();
    expect(screen.getByText('0.00 items/sec')).toBeInTheDocument();
  });

  it('should maintain responsive grid layout', () => {
    render(
      <StatisticsPanel
        statistics={mockStatistics}
        currentStep={3}
        startTime={null}
      />
    );

    const container = screen.getByText('Statistics').closest('div');
    expect(container).toHaveClass('bg-white', 'p-6', 'rounded-lg', 'shadow-md');

    const gridContainer = container?.querySelector('.grid');
    expect(gridContainer).toHaveClass('grid', 'grid-cols-2', 'gap-4');
  });
});