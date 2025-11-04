import type { SimulationState } from '../types/simulation';

export interface ExportTrace {
  metadata: {
    exportTimestamp: string;
    simulationConfig: {
      bufferSize: number;
      producerCount: number;
      consumerCount: number;
      animationSpeed: number;
    };
    totalSteps: number;
    totalDuration: number;
  };
  steps: Array<{
    stepNumber: number;
    timestamp: string;
    action: string;
    processId: string;
    semaphores: Array<{
      name: string;
      value: number;
      waitingQueue: string[];
    }>;
    processes: Array<{
      id: string;
      type: string;
      state: string;
      currentOperation?: string;
      waitingOn?: string;
      itemsProcessed: number;
      totalWaitTime: number;
    }>;
    buffer: Array<{
      id: number;
      occupied: boolean;
      item?: {
        id: string;
        producedBy: string;
        timestamp: number;
      };
    }>;
    statistics: {
      totalItemsProduced: number;
      totalItemsConsumed: number;
      bufferUtilization: number;
      averageWaitTime: number;
    };
  }>;
}

/**
 * Generates a detailed execution trace from simulation state
 */
export function generateExecutionTrace(state: SimulationState): ExportTrace {
  const now = new Date();
  const startTime = state.startTime || now.getTime();
  const totalDuration = now.getTime() - startTime;

  return {
    metadata: {
      exportTimestamp: now.toISOString(),
      simulationConfig: {
        bufferSize: state.config.bufferSize,
        producerCount: state.config.producerCount,
        consumerCount: state.config.consumerCount,
        animationSpeed: state.config.animationSpeed,
      },
      totalSteps: state.history.length,
      totalDuration,
    },
    steps: state.history.map((snapshot) => ({
      stepNumber: snapshot.stepNumber,
      timestamp: new Date(startTime + (snapshot.stepNumber * (1000 / state.config.animationSpeed))).toISOString(),
      action: snapshot.action,
      processId: snapshot.processId,
      semaphores: snapshot.semaphores.map((sem) => ({
        name: sem.name,
        value: sem.value,
        waitingQueue: [...sem.waitingQueue],
      })),
      processes: snapshot.processes.map((proc) => ({
        id: proc.id,
        type: proc.type,
        state: proc.state,
        currentOperation: proc.currentOperation,
        waitingOn: proc.waitingOn,
        itemsProcessed: proc.itemsProcessed,
        totalWaitTime: proc.totalWaitTime,
      })),
      buffer: snapshot.buffer.map((slot) => ({
        id: slot.id,
        occupied: slot.occupied,
        item: slot.item ? {
          id: slot.item.id,
          producedBy: slot.item.producedBy,
          timestamp: slot.item.timestamp,
        } : undefined,
      })),
      statistics: { ...snapshot.statistics },
    })),
  };
}

/**
 * Converts execution trace to JSON string
 */
export function traceToJSON(trace: ExportTrace): string {
  return JSON.stringify(trace, null, 2);
}

/**
 * Converts execution trace to human-readable text format
 */
export function traceToText(trace: ExportTrace): string {
  const lines: string[] = [];
  
  // Header
  lines.push('Producer-Consumer Simulation Execution Trace');
  lines.push('=' .repeat(50));
  lines.push('');
  
  // Metadata
  lines.push('Simulation Configuration:');
  lines.push(`  Buffer Size: ${trace.metadata.simulationConfig.bufferSize}`);
  lines.push(`  Producers: ${trace.metadata.simulationConfig.producerCount}`);
  lines.push(`  Consumers: ${trace.metadata.simulationConfig.consumerCount}`);
  lines.push(`  Animation Speed: ${trace.metadata.simulationConfig.animationSpeed}x`);
  lines.push(`  Total Steps: ${trace.metadata.totalSteps}`);
  lines.push(`  Total Duration: ${Math.round(trace.metadata.totalDuration / 1000)}s`);
  lines.push(`  Export Time: ${trace.metadata.exportTimestamp}`);
  lines.push('');
  
  // Steps
  lines.push('Execution Steps:');
  lines.push('-'.repeat(30));
  
  trace.steps.forEach((step) => {
    lines.push('');
    lines.push(`Step ${step.stepNumber}: ${step.action}`);
    lines.push(`  Time: ${step.timestamp}`);
    lines.push(`  Process: ${step.processId}`);
    
    // Semaphores
    lines.push('  Semaphores:');
    step.semaphores.forEach((sem) => {
      const waitingInfo = sem.waitingQueue.length > 0 
        ? ` (waiting: ${sem.waitingQueue.join(', ')})` 
        : '';
      lines.push(`    ${sem.name}: ${sem.value}${waitingInfo}`);
    });
    
    // Buffer state
    const occupiedSlots = step.buffer.filter(slot => slot.occupied).length;
    lines.push(`  Buffer: ${occupiedSlots}/${step.buffer.length} slots occupied`);
    step.buffer.forEach((slot) => {
      if (slot.occupied && slot.item) {
        lines.push(`    Slot ${slot.id}: ${slot.item.id} (by ${slot.item.producedBy})`);
      }
    });
    
    // Process states
    lines.push('  Process States:');
    step.processes.forEach((proc) => {
      const operation = proc.currentOperation ? ` (${proc.currentOperation})` : '';
      const waiting = proc.waitingOn ? ` waiting on ${proc.waitingOn}` : '';
      lines.push(`    ${proc.id} (${proc.type}): ${proc.state}${operation}${waiting} - processed: ${proc.itemsProcessed}`);
    });
    
    // Statistics
    lines.push('  Statistics:');
    lines.push(`    Items Produced: ${step.statistics.totalItemsProduced}`);
    lines.push(`    Items Consumed: ${step.statistics.totalItemsConsumed}`);
    lines.push(`    Buffer Utilization: ${step.statistics.bufferUtilization.toFixed(1)}%`);
    lines.push(`    Average Wait Time: ${step.statistics.averageWaitTime.toFixed(2)}ms`);
  });
  
  return lines.join('\n');
}

/**
 * Captures a screenshot of the visualization canvas
 */
export async function captureScreenshot(elementId: string = 'visualization-canvas'): Promise<string> {
  return new Promise((resolve, reject) => {
    const element = document.getElementById(elementId);
    
    if (!element) {
      reject(new Error(`Element with id "${elementId}" not found`));
      return;
    }
    
    // Use html2canvas library for screenshot capture
    // For now, we'll use a simple canvas-based approach
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Get element dimensions
      const rect = element.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Fill with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add text indicating this is a placeholder implementation
      ctx.fillStyle = '#333333';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Screenshot Placeholder', canvas.width / 2, canvas.height / 2);
      ctx.fillText('(Real implementation would capture actual visualization)', canvas.width / 2, canvas.height / 2 + 25);
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Downloads data as a file
 */
export function downloadFile(data: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Downloads a data URL as a file (for images)
 */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates a filename with timestamp
 */
export function generateFilename(prefix: string, extension: string): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5); // Remove milliseconds and 'Z'
  return `${prefix}_${timestamp}.${extension}`;
}