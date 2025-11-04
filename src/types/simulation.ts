export type ProcessId = string;

export interface SimulationConfig {
  bufferSize: number;        // 1-10
  producerCount: number;     // 1-5
  consumerCount: number;     // 1-5
  animationSpeed: number;    // 0.5-3.0x
}

export interface Semaphore {
  name: 'empty' | 'full' | 'mutex';
  value: number;
  waitingQueue: ProcessId[];
}

export interface Process {
  id: ProcessId;
  type: 'producer' | 'consumer';
  state: 'ready' | 'running' | 'waiting' | 'blocked';
  currentOperation?: 'producing' | 'consuming' | 'waiting_semaphore';
  waitingOn?: 'empty' | 'full' | 'mutex';
  itemsProcessed: number;
  totalWaitTime: number;
}

export interface BufferSlot {
  id: number;
  occupied: boolean;
  item?: {
    id: string;
    producedBy: ProcessId;
    timestamp: number;
  };
}

export interface SimulationSnapshot {
  stepNumber: number;
  action: string; // Description of what happened (e.g., "P1 produced an item")
  processId: ProcessId;
  // Complete state snapshot at this moment
  semaphores: Semaphore[];
  processes: Process[];
  buffer: BufferSlot[];
  startTime: number | null;
  statistics: {
    totalItemsProduced: number;
    totalItemsConsumed: number;
    bufferUtilization: number;
    averageWaitTime: number;
  };
}

export interface SimulationState {
  config: SimulationConfig;
  semaphores: Semaphore[];
  processes: Process[];
  buffer: BufferSlot[];
  currentStep: number;
  isPlaying: boolean;
  animationSpeed: number;
  history: SimulationSnapshot[];
  startTime: number | null;
  statistics: {
    totalItemsProduced: number;
    totalItemsConsumed: number;
    bufferUtilization: number;
    averageWaitTime: number;
  };
}

export type SimulationAction = 
  | { type: 'SET_CONFIG'; payload: SimulationConfig }
  | { type: 'START_SIMULATION' }
  | { type: 'PAUSE_SIMULATION' }
  | { type: 'STEP_FORWARD' }
  | { type: 'STEP_BACKWARD' }
  | { type: 'RESET_SIMULATION' }
  | { type: 'SET_SPEED'; payload: number }
  | { type: 'JUMP_TO_STEP'; payload: number };

// Validation functions
export function isValidConfig(config: Partial<SimulationConfig>): config is SimulationConfig {
  return (
    typeof config.bufferSize === 'number' &&
    config.bufferSize >= 1 &&
    config.bufferSize <= 10 &&
    typeof config.producerCount === 'number' &&
    config.producerCount >= 1 &&
    config.producerCount <= 5 &&
    typeof config.consumerCount === 'number' &&
    config.consumerCount >= 1 &&
    config.consumerCount <= 5 &&
    typeof config.animationSpeed === 'number' &&
    config.animationSpeed >= 0.5 &&
    config.animationSpeed <= 3.0
  );
}

// Default configuration
export const DEFAULT_CONFIG: SimulationConfig = {
  bufferSize: 5,
  producerCount: 2,
  consumerCount: 2,
  animationSpeed: 1.0
};

// Factory function to create initial simulation state
export function createInitialState(config: SimulationConfig = DEFAULT_CONFIG): SimulationState {
  // Create semaphores
  const semaphores: Semaphore[] = [
    {
      name: 'empty',
      value: config.bufferSize,
      waitingQueue: []
    },
    {
      name: 'full',
      value: 0,
      waitingQueue: []
    },
    {
      name: 'mutex',
      value: 1,
      waitingQueue: []
    }
  ];

  // Create processes
  const processes: Process[] = [];
  
  // Create producers
  for (let i = 1; i <= config.producerCount; i++) {
    processes.push({
      id: `P${i}`,
      type: 'producer',
      state: 'ready',
      itemsProcessed: 0,
      totalWaitTime: 0
    });
  }
  
  // Create consumers
  for (let i = 1; i <= config.consumerCount; i++) {
    processes.push({
      id: `C${i}`,
      type: 'consumer',
      state: 'ready',
      itemsProcessed: 0,
      totalWaitTime: 0
    });
  }

  // Create buffer slots
  const buffer: BufferSlot[] = [];
  for (let i = 0; i < config.bufferSize; i++) {
    buffer.push({
      id: i,
      occupied: false
    });
  }

  // Initial statistics
  const statistics = {
    totalItemsProduced: 0,
    totalItemsConsumed: 0,
    bufferUtilization: 0,
    averageWaitTime: 0
  };

  return {
    config,
    semaphores,
    processes,
    buffer,
    currentStep: 0,
    isPlaying: false,
    animationSpeed: config.animationSpeed,
    history: [],
    startTime: null,
    statistics
  };
}

// Helper function to create a deep copy of simulation state for snapshots
export function createStateSnapshot(
  state: SimulationState,
  stepNumber: number,
  action: string,
  processId: ProcessId
): SimulationSnapshot {
  return {
    stepNumber,
    action,
    processId,
    semaphores: JSON.parse(JSON.stringify(state.semaphores)),
    processes: JSON.parse(JSON.stringify(state.processes)),
    buffer: JSON.parse(JSON.stringify(state.buffer)),
    startTime: state.startTime,
    statistics: { ...state.statistics }
  };
}

// Additional validation and utility functions
export function isValidProcessId(id: string): id is ProcessId {
  return /^[PC]\d+$/.test(id);
}

export function isProducerId(id: ProcessId): boolean {
  return id.startsWith('P');
}

export function isConsumerId(id: ProcessId): boolean {
  return id.startsWith('C');
}

export function calculateBufferUtilization(buffer: BufferSlot[]): number {
  const occupiedSlots = buffer.filter(slot => slot.occupied).length;
  return buffer.length > 0 ? (occupiedSlots / buffer.length) * 100 : 0;
}

export function getSemaphoreByName(semaphores: Semaphore[], name: 'empty' | 'full' | 'mutex'): Semaphore | undefined {
  return semaphores.find(s => s.name === name);
}

export function getProcessById(processes: Process[], id: ProcessId): Process | undefined {
  return processes.find(p => p.id === id);
}