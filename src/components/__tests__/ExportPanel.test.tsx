import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportPanel } from '../ExportPanel';
import { createInitialState, DEFAULT_CONFIG } from '../../types/simulation';
import type { SimulationState } from '../../types/simulation';

// Mock the export utilities
vi.mock('../../utils/exportUtils', () => ({
  generateExecutionTrace: vi.fn(),
  traceToJSON: vi.fn(),
  traceToText: vi.fn(),
  captureScreenshot: vi.fn(),
  downloadFile: vi.fn(),
  downloadDataUrl: vi.fn(),
  generateFilename: vi.fn()
}));

describe('ExportPanel', () => {
  let mockState: SimulationState;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    mockState = createInitialState(DEFAULT_CONFIG);
    
    // Import and setup mocks
    const exportUtils = await import('../../utils/exportUtils');
    
    vi.mocked(exportUtils.generateExecutionTrace).mockReturnValue({
      metadata: {
        exportTimestamp: '2023-01-01T00:00:00.000Z',
        simulationConfig: DEFAULT_CONFIG,
        totalSteps: 2,
        totalDuration: 2000
      },
      steps: [
        {
          stepNumber: 1,
          timestamp: '2023-01-01T00:00:01.000Z',
          action: 'P1 acquired empty semaphore',
          processId: 'P1',
          semaphores: [],
          processes: [],
          buffer: [],
          statistics: {
            totalItemsProduced: 0,
            totalItemsConsumed: 0,
            bufferUtilization: 0,
            averageWaitTime: 0
          }
        }
      ]
    });
    
    vi.mocked(exportUtils.traceToJSON).mockReturnValue('{"mock": "json"}');
    vi.mocked(exportUtils.traceToText).mockReturnValue('Mock text trace');
    vi.mocked(exportUtils.generateFilename).mockImplementation((prefix: string, ext: string) => `${prefix}_2023-01-01T00-00-00.${ext}`);
    vi.mocked(exportUtils.captureScreenshot).mockResolvedValue('data:image/png;base64,mockdata');
    vi.mocked(exportUtils.downloadFile).mockImplementation(() => {});
    vi.mocked(exportUtils.downloadDataUrl).mockImplementation(() => {});
  });

  it('should render export panel with all sections', () => {
    render(<ExportPanel simulationState={mockState} />);

    expect(screen.getByText('Export Data')).toBeInTheDocument();
    expect(screen.getByText('Screenshot')).toBeInTheDocument();
    expect(screen.getByText('Execution Trace')).toBeInTheDocument();
    expect(screen.getByText('Export Screenshot')).toBeInTheDocument();
    expect(screen.getByText('Export JSON')).toBeInTheDocument();
    expect(screen.getByText('Export Text')).toBeInTheDocument();
  });

  it('should show warning when no execution data is available', () => {
    render(<ExportPanel simulationState={mockState} />);

    expect(screen.getByText('No execution data available. Run the simulation to generate trace data.')).toBeInTheDocument();
    
    const jsonButton = screen.getByText('Export JSON');
    const textButton = screen.getByText('Export Text');
    
    expect(jsonButton).toBeDisabled();
    expect(textButton).toBeDisabled();
  });

  it('should enable trace export buttons when execution data is available', () => {
    const stateWithHistory: SimulationState = {
      ...mockState,
      history: [{
        stepNumber: 1,
        action: 'Test action',
        processId: 'P1',
        semaphores: mockState.semaphores,
        processes: mockState.processes,
        buffer: mockState.buffer,
        startTime: Date.now(),
        statistics: mockState.statistics
      }]
    };

    render(<ExportPanel simulationState={stateWithHistory} />);

    const jsonButton = screen.getByText('Export JSON');
    const textButton = screen.getByText('Export Text');
    
    expect(jsonButton).not.toBeDisabled();
    expect(textButton).not.toBeDisabled();
    expect(screen.getByText(/Current simulation has 1 recorded steps/)).toBeInTheDocument();
  });

  it('should handle screenshot export', async () => {
    const exportUtils = await import('../../utils/exportUtils');
    
    render(<ExportPanel simulationState={mockState} />);

    const screenshotButton = screen.getByText('Export Screenshot');
    fireEvent.click(screenshotButton);

    expect(screenshotButton).toHaveTextContent('Capturing...');
    
    await waitFor(() => {
      expect(exportUtils.captureScreenshot).toHaveBeenCalledWith('visualization-canvas');
      expect(exportUtils.generateFilename).toHaveBeenCalledWith('producer_consumer_screenshot', 'png');
      expect(exportUtils.downloadDataUrl).toHaveBeenCalledWith('data:image/png;base64,mockdata', 'producer_consumer_screenshot_2023-01-01T00-00-00.png');
    });

    await waitFor(() => {
      expect(screen.getByText('Screenshot saved as producer_consumer_screenshot_2023-01-01T00-00-00.png')).toBeInTheDocument();
    });
  });

  it('should handle screenshot export failure', async () => {
    const exportUtils = await import('../../utils/exportUtils');
    vi.mocked(exportUtils.captureScreenshot).mockRejectedValue(new Error('Screenshot failed'));
    
    render(<ExportPanel simulationState={mockState} />);

    const screenshotButton = screen.getByText('Export Screenshot');
    fireEvent.click(screenshotButton);

    await waitFor(() => {
      expect(screen.getByText('Screenshot export failed')).toBeInTheDocument();
    });
  });

  it('should handle JSON trace export', async () => {
    const exportUtils = await import('../../utils/exportUtils');
    
    const stateWithHistory: SimulationState = {
      ...mockState,
      history: [{
        stepNumber: 1,
        action: 'Test action',
        processId: 'P1',
        semaphores: mockState.semaphores,
        processes: mockState.processes,
        buffer: mockState.buffer,
        startTime: Date.now(),
        statistics: mockState.statistics
      }]
    };

    render(<ExportPanel simulationState={stateWithHistory} />);

    const jsonButton = screen.getByText('Export JSON');
    fireEvent.click(jsonButton);

    await waitFor(() => {
      expect(exportUtils.generateExecutionTrace).toHaveBeenCalledWith(stateWithHistory);
      expect(exportUtils.traceToJSON).toHaveBeenCalled();
      expect(exportUtils.generateFilename).toHaveBeenCalledWith('producer_consumer_trace', 'json');
      expect(exportUtils.downloadFile).toHaveBeenCalledWith('{"mock": "json"}', 'producer_consumer_trace_2023-01-01T00-00-00.json', 'application/json');
    });

    await waitFor(() => {
      expect(screen.getByText('JSON trace saved as producer_consumer_trace_2023-01-01T00-00-00.json')).toBeInTheDocument();
    });
  });

  it('should handle text trace export', async () => {
    const exportUtils = await import('../../utils/exportUtils');
    
    const stateWithHistory: SimulationState = {
      ...mockState,
      history: [{
        stepNumber: 1,
        action: 'Test action',
        processId: 'P1',
        semaphores: mockState.semaphores,
        processes: mockState.processes,
        buffer: mockState.buffer,
        startTime: Date.now(),
        statistics: mockState.statistics
      }]
    };

    render(<ExportPanel simulationState={stateWithHistory} />);

    const textButton = screen.getByText('Export Text');
    fireEvent.click(textButton);

    await waitFor(() => {
      expect(exportUtils.generateExecutionTrace).toHaveBeenCalledWith(stateWithHistory);
      expect(exportUtils.traceToText).toHaveBeenCalled();
      expect(exportUtils.generateFilename).toHaveBeenCalledWith('producer_consumer_trace', 'txt');
      expect(exportUtils.downloadFile).toHaveBeenCalledWith('Mock text trace', 'producer_consumer_trace_2023-01-01T00-00-00.txt', 'text/plain');
    });

    await waitFor(() => {
      expect(screen.getByText('Text trace saved as producer_consumer_trace_2023-01-01T00-00-00.txt')).toBeInTheDocument();
    });
  });

  it('should handle trace export failure', async () => {
    const exportUtils = await import('../../utils/exportUtils');
    vi.mocked(exportUtils.generateExecutionTrace).mockImplementation(() => {
      throw new Error('Export failed');
    });

    const stateWithHistory: SimulationState = {
      ...mockState,
      history: [{
        stepNumber: 1,
        action: 'Test action',
        processId: 'P1',
        semaphores: mockState.semaphores,
        processes: mockState.processes,
        buffer: mockState.buffer,
        startTime: Date.now(),
        statistics: mockState.statistics
      }]
    };

    render(<ExportPanel simulationState={stateWithHistory} />);

    const jsonButton = screen.getByText('Export JSON');
    fireEvent.click(jsonButton);

    await waitFor(() => {
      expect(screen.getByText('JSON trace export failed')).toBeInTheDocument();
    });
  });

  it('should show status messages after export operations', async () => {
    const exportUtils = await import('../../utils/exportUtils');
    
    render(<ExportPanel simulationState={mockState} />);

    const screenshotButton = screen.getByText('Export Screenshot');
    fireEvent.click(screenshotButton);

    await waitFor(() => {
      expect(screen.getByText(/Screenshot saved as/)).toBeInTheDocument();
    });
  });

  it('should handle export button states correctly', async () => {
    const exportUtils = await import('../../utils/exportUtils');
    
    render(<ExportPanel simulationState={mockState} />);

    const screenshotButton = screen.getByText('Export Screenshot');
    
    // Button should be enabled initially
    expect(screenshotButton).not.toBeDisabled();
    
    fireEvent.click(screenshotButton);

    // After successful export, button should be enabled again
    await waitFor(() => {
      expect(screenshotButton).not.toBeDisabled();
    });
  });

  it('should display export information', () => {
    render(<ExportPanel simulationState={mockState} />);

    expect(screen.getByText('Export Information:')).toBeInTheDocument();
    expect(screen.getByText('• Screenshots capture the current visualization state')).toBeInTheDocument();
    expect(screen.getByText('• JSON traces include complete step-by-step execution data')).toBeInTheDocument();
    expect(screen.getByText('• Text traces provide human-readable execution logs')).toBeInTheDocument();
    expect(screen.getByText('• All exports include timestamps and process information')).toBeInTheDocument();
  });
});