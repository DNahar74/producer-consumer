import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateExecutionTrace,
  traceToJSON,
  traceToText,
  captureScreenshot,
  downloadFile,
  downloadDataUrl,
  generateFilename
} from '../exportUtils';
import type { SimulationState, SimulationSnapshot } from '../../types/simulation';
import { createInitialState, DEFAULT_CONFIG } from '../../types/simulation';

// Mock DOM methods
const mockCreateElement = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockClick = vi.fn();
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();

beforeEach(() => {
  // Mock document methods
  vi.stubGlobal('document', {
    createElement: mockCreateElement,
    body: {
      appendChild: mockAppendChild,
      removeChild: mockRemoveChild
    },
    getElementById: vi.fn()
  });

  // Mock URL methods
  vi.stubGlobal('URL', {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL
  });

  // Mock Blob
  vi.stubGlobal('Blob', vi.fn());

  // Reset mocks
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('exportUtils', () => {
  describe('generateExecutionTrace', () => {
    it('should generate a complete execution trace from simulation state', () => {
      const state = createInitialState(DEFAULT_CONFIG);
      
      // Add some history snapshots
      const snapshot1: SimulationSnapshot = {
        stepNumber: 1,
        action: 'P1 acquired empty semaphore',
        processId: 'P1',
        semaphores: state.semaphores,
        processes: state.processes,
        buffer: state.buffer,
        startTime: Date.now(),
        statistics: state.statistics
      };
      
      const snapshot2: SimulationSnapshot = {
        stepNumber: 2,
        action: 'P1 produced an item',
        processId: 'P1',
        semaphores: state.semaphores,
        processes: state.processes,
        buffer: state.buffer,
        startTime: Date.now(),
        statistics: { ...state.statistics, totalItemsProduced: 1 }
      };
      
      const stateWithHistory: SimulationState = {
        ...state,
        history: [snapshot1, snapshot2],
        startTime: Date.now()
      };

      const trace = generateExecutionTrace(stateWithHistory);

      expect(trace.metadata).toBeDefined();
      expect(trace.metadata.simulationConfig).toEqual({
        bufferSize: DEFAULT_CONFIG.bufferSize,
        producerCount: DEFAULT_CONFIG.producerCount,
        consumerCount: DEFAULT_CONFIG.consumerCount,
        animationSpeed: DEFAULT_CONFIG.animationSpeed
      });
      expect(trace.metadata.totalSteps).toBe(2);
      expect(trace.metadata.exportTimestamp).toBeDefined();
      expect(trace.metadata.totalDuration).toBeGreaterThanOrEqual(0);

      expect(trace.steps).toHaveLength(2);
      expect(trace.steps[0].stepNumber).toBe(1);
      expect(trace.steps[0].action).toBe('P1 acquired empty semaphore');
      expect(trace.steps[0].processId).toBe('P1');
      expect(trace.steps[0].semaphores).toBeDefined();
      expect(trace.steps[0].processes).toBeDefined();
      expect(trace.steps[0].buffer).toBeDefined();
      expect(trace.steps[0].statistics).toBeDefined();
    });

    it('should handle empty history', () => {
      const state = createInitialState(DEFAULT_CONFIG);
      const trace = generateExecutionTrace(state);

      expect(trace.metadata.totalSteps).toBe(0);
      expect(trace.steps).toHaveLength(0);
    });

    it('should include timestamps for each step', () => {
      const state = createInitialState(DEFAULT_CONFIG);
      const startTime = Date.now();
      
      const snapshot: SimulationSnapshot = {
        stepNumber: 1,
        action: 'Test action',
        processId: 'P1',
        semaphores: state.semaphores,
        processes: state.processes,
        buffer: state.buffer,
        startTime,
        statistics: state.statistics
      };
      
      const stateWithHistory: SimulationState = {
        ...state,
        history: [snapshot],
        startTime
      };

      const trace = generateExecutionTrace(stateWithHistory);

      expect(trace.steps[0].timestamp).toBeDefined();
      expect(new Date(trace.steps[0].timestamp).getTime()).toBeGreaterThan(0);
    });
  });

  describe('traceToJSON', () => {
    it('should convert trace to formatted JSON string', () => {
      const trace = {
        metadata: {
          exportTimestamp: '2023-01-01T00:00:00.000Z',
          simulationConfig: {
            bufferSize: 5,
            producerCount: 2,
            consumerCount: 2,
            animationSpeed: 1.0
          },
          totalSteps: 1,
          totalDuration: 1000
        },
        steps: [{
          stepNumber: 1,
          timestamp: '2023-01-01T00:00:01.000Z',
          action: 'Test action',
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
        }]
      };

      const json = traceToJSON(trace);
      
      expect(json).toContain('"exportTimestamp": "2023-01-01T00:00:00.000Z"');
      expect(json).toContain('"bufferSize": 5');
      expect(json).toContain('"stepNumber": 1');
      expect(json).toContain('"action": "Test action"');
      
      // Should be valid JSON
      expect(() => JSON.parse(json)).not.toThrow();
    });
  });

  describe('traceToText', () => {
    it('should convert trace to human-readable text format', () => {
      const trace = {
        metadata: {
          exportTimestamp: '2023-01-01T00:00:00.000Z',
          simulationConfig: {
            bufferSize: 5,
            producerCount: 2,
            consumerCount: 2,
            animationSpeed: 1.0
          },
          totalSteps: 1,
          totalDuration: 5000
        },
        steps: [{
          stepNumber: 1,
          timestamp: '2023-01-01T00:00:01.000Z',
          action: 'P1 produced an item',
          processId: 'P1',
          semaphores: [
            { name: 'empty', value: 4, waitingQueue: [] },
            { name: 'full', value: 1, waitingQueue: [] },
            { name: 'mutex', value: 1, waitingQueue: [] }
          ],
          processes: [
            {
              id: 'P1',
              type: 'producer',
              state: 'ready',
              itemsProcessed: 1,
              totalWaitTime: 0
            }
          ],
          buffer: [
            { id: 0, occupied: true, item: { id: 'item-1', producedBy: 'P1', timestamp: 123456 } },
            { id: 1, occupied: false }
          ],
          statistics: {
            totalItemsProduced: 1,
            totalItemsConsumed: 0,
            bufferUtilization: 50.0,
            averageWaitTime: 0
          }
        }]
      };

      const text = traceToText(trace);
      
      expect(text).toContain('Producer-Consumer Simulation Execution Trace');
      expect(text).toContain('Buffer Size: 5');
      expect(text).toContain('Producers: 2');
      expect(text).toContain('Total Duration: 5s');
      expect(text).toContain('Step 1: P1 produced an item');
      expect(text).toContain('Process: P1');
      expect(text).toContain('empty: 4');
      expect(text).toContain('full: 1');
      expect(text).toContain('mutex: 1');
      expect(text).toContain('Buffer: 1/2 slots occupied');
      expect(text).toContain('P1 (producer): ready');
      expect(text).toContain('Items Produced: 1');
      expect(text).toContain('Buffer Utilization: 50.0%');
    });

    it('should handle waiting queues in semaphores', () => {
      const trace = {
        metadata: {
          exportTimestamp: '2023-01-01T00:00:00.000Z',
          simulationConfig: {
            bufferSize: 1,
            producerCount: 2,
            consumerCount: 1,
            animationSpeed: 1.0
          },
          totalSteps: 1,
          totalDuration: 1000
        },
        steps: [{
          stepNumber: 1,
          timestamp: '2023-01-01T00:00:01.000Z',
          action: 'P2 waiting for empty slot',
          processId: 'P2',
          semaphores: [
            { name: 'empty', value: 0, waitingQueue: ['P2'] },
            { name: 'full', value: 1, waitingQueue: [] },
            { name: 'mutex', value: 1, waitingQueue: [] }
          ],
          processes: [],
          buffer: [],
          statistics: {
            totalItemsProduced: 0,
            totalItemsConsumed: 0,
            bufferUtilization: 0,
            averageWaitTime: 0
          }
        }]
      };

      const text = traceToText(trace);
      
      expect(text).toContain('empty: 0 (waiting: P2)');
      expect(text).toContain('full: 1');
    });
  });

  describe('captureScreenshot', () => {
    it('should capture screenshot of specified element', async () => {
      const mockElement = {
        getBoundingClientRect: vi.fn().mockReturnValue({
          width: 800,
          height: 600
        })
      };
      
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn().mockReturnValue({
          fillStyle: '',
          fillRect: vi.fn(),
          font: '',
          textAlign: '',
          fillText: vi.fn()
        }),
        toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mockdata')
      };

      document.getElementById = vi.fn().mockReturnValue(mockElement);
      document.createElement = vi.fn().mockReturnValue(mockCanvas);

      const result = await captureScreenshot('test-element');

      expect(document.getElementById).toHaveBeenCalledWith('test-element');
      expect(document.createElement).toHaveBeenCalledWith('canvas');
      expect(mockCanvas.width).toBe(800);
      expect(mockCanvas.height).toBe(600);
      expect(result).toBe('data:image/png;base64,mockdata');
    });

    it('should reject if element not found', async () => {
      document.getElementById = vi.fn().mockReturnValue(null);

      await expect(captureScreenshot('nonexistent')).rejects.toThrow('Element with id "nonexistent" not found');
    });

    it('should reject if canvas context unavailable', async () => {
      const mockElement = {
        getBoundingClientRect: vi.fn().mockReturnValue({ width: 800, height: 600 })
      };
      
      const mockCanvas = {
        getContext: vi.fn().mockReturnValue(null)
      };

      document.getElementById = vi.fn().mockReturnValue(mockElement);
      document.createElement = vi.fn().mockReturnValue(mockCanvas);

      await expect(captureScreenshot('test-element')).rejects.toThrow('Could not get canvas context');
    });
  });

  describe('downloadFile', () => {
    it('should create and trigger download link', () => {
      const mockLink = {
        href: '',
        download: '',
        style: { display: '' },
        click: mockClick
      };

      mockCreateElement.mockReturnValue(mockLink);
      mockCreateObjectURL.mockReturnValue('blob:mock-url');

      downloadFile('test data', 'test.txt', 'text/plain');

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockLink.href).toBe('blob:mock-url');
      expect(mockLink.download).toBe('test.txt');
      expect(mockLink.style.display).toBe('none');
      expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });

  describe('downloadDataUrl', () => {
    it('should create and trigger download link for data URL', () => {
      const mockLink = {
        href: '',
        download: '',
        style: { display: '' },
        click: mockClick
      };

      mockCreateElement.mockReturnValue(mockLink);

      downloadDataUrl('data:image/png;base64,mockdata', 'image.png');

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockLink.href).toBe('data:image/png;base64,mockdata');
      expect(mockLink.download).toBe('image.png');
      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('generateFilename', () => {
    it('should generate filename with timestamp', () => {
      const filename = generateFilename('test', 'txt');
      
      expect(filename).toMatch(/^test_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.txt$/);
    });

    it('should handle different prefixes and extensions', () => {
      const filename = generateFilename('simulation_trace', 'json');
      
      expect(filename).toMatch(/^simulation_trace_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.json$/);
    });
  });
});