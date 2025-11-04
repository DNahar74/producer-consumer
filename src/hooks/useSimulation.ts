import { useReducer, useEffect } from 'react';
import type {
  SimulationState,
  SimulationAction,
  ProcessId,
  Semaphore,
  Process
} from '../types/simulation';
import {
  createInitialState,
  DEFAULT_CONFIG,
  isValidConfig,
  createStateSnapshot,
  getSemaphoreByName,
  getProcessById,
  calculateBufferUtilization
} from '../types/simulation';

// Helper function to perform semaphore wait operation
function waitSemaphore(
  semaphores: Semaphore[],
  processes: Process[],
  processId: ProcessId,
  semaphoreName: 'empty' | 'full' | 'mutex'
): { semaphores: Semaphore[]; processes: Process[]; success: boolean } {
  const newSemaphores = [...semaphores];
  const newProcesses = [...processes];
  
  const semaphore = getSemaphoreByName(newSemaphores, semaphoreName);
  const process = getProcessById(newProcesses, processId);
  
  if (!semaphore || !process) {
    return { semaphores: newSemaphores, processes: newProcesses, success: false };
  }
  
  if (semaphore.value > 0) {
    // Semaphore available, acquire it
    semaphore.value--;
    process.state = 'running';
    process.waitingOn = undefined;
    return { semaphores: newSemaphores, processes: newProcesses, success: true };
  } else {
    // Semaphore not available, add to waiting queue
    if (!semaphore.waitingQueue.includes(processId)) {
      semaphore.waitingQueue.push(processId);
    }
    process.state = 'blocked';
    process.waitingOn = semaphoreName;
    return { semaphores: newSemaphores, processes: newProcesses, success: false };
  }
}

// Helper function to perform semaphore signal operation
function signalSemaphore(
  semaphores: Semaphore[],
  processes: Process[],
  semaphoreName: 'empty' | 'full' | 'mutex'
): { semaphores: Semaphore[]; processes: Process[] } {
  const newSemaphores = [...semaphores];
  const newProcesses = [...processes];
  
  const semaphore = getSemaphoreByName(newSemaphores, semaphoreName);
  
  if (!semaphore) {
    return { semaphores: newSemaphores, processes: newProcesses };
  }
  
  semaphore.value++;
  
  // Wake up a waiting process if any
  if (semaphore.waitingQueue.length > 0) {
    const waitingProcessId = semaphore.waitingQueue.shift()!;
    const waitingProcess = getProcessById(newProcesses, waitingProcessId);
    
    if (waitingProcess) {
      // Immediately acquire the semaphore for the waiting process
      semaphore.value--;
      waitingProcess.state = 'ready';
      waitingProcess.waitingOn = undefined;
    }
  }
  
  return { semaphores: newSemaphores, processes: newProcesses };
}

// Helper function to execute producer step
function executeProducerStep(
  state: SimulationState,
  processId: ProcessId
): { newState: SimulationState; action: string; success: boolean } {
  const process = getProcessById(state.processes, processId);
  
  if (!process || process.type !== 'producer') {
    return { newState: state, action: '', success: false };
  }
  
  // Producer algorithm: wait(empty) -> wait(mutex) -> produce -> signal(mutex) -> signal(full)
  
  // Step 1: Wait for empty slot
  if (!process.currentOperation) {
    const { semaphores, processes, success } = waitSemaphore(
      state.semaphores,
      state.processes,
      processId,
      'empty'
    );
    
    if (success) {
      const updatedProcess = getProcessById(processes, processId)!;
      updatedProcess.currentOperation = 'producing';
      
      return {
        newState: { ...state, semaphores, processes },
        action: `${processId} acquired empty semaphore`,
        success: true
      };
    } else {
      return {
        newState: { ...state, semaphores, processes },
        action: `${processId} waiting for empty slot`,
        success: false
      };
    }
  }
  
  // Step 2: Wait for mutex
  if (process.currentOperation === 'producing' && !process.waitingOn) {
    const { semaphores, processes, success } = waitSemaphore(
      state.semaphores,
      state.processes,
      processId,
      'mutex'
    );
    
    if (success) {
      // Step 3: Produce item
      const newBuffer = [...state.buffer];
      const emptySlot = newBuffer.find(slot => !slot.occupied);
      
      if (emptySlot) {
        emptySlot.occupied = true;
        emptySlot.item = {
          id: `item-${state.currentStep}-${processId}`,
          producedBy: processId,
          timestamp: Date.now()
        };
        
        const updatedProcess = getProcessById(processes, processId)!;
        updatedProcess.itemsProcessed++;
        updatedProcess.currentOperation = undefined;
        updatedProcess.state = 'ready';
        
        // Step 4: Signal mutex
        const { semaphores: semaphoresAfterMutex, processes: processesAfterMutex } = signalSemaphore(
          semaphores,
          processes,
          'mutex'
        );
        
        // Step 5: Signal full
        const { semaphores: finalSemaphores, processes: finalProcesses } = signalSemaphore(
          semaphoresAfterMutex,
          processesAfterMutex,
          'full'
        );
        
        const newStatistics = {
          ...state.statistics,
          totalItemsProduced: state.statistics.totalItemsProduced + 1,
          bufferUtilization: calculateBufferUtilization(newBuffer)
        };
        
        return {
          newState: {
            ...state,
            semaphores: finalSemaphores,
            processes: finalProcesses,
            buffer: newBuffer,
            statistics: newStatistics
          },
          action: `${processId} produced an item`,
          success: true
        };
      }
    } else {
      return {
        newState: { ...state, semaphores, processes },
        action: `${processId} waiting for mutex`,
        success: false
      };
    }
  }
  
  return { newState: state, action: '', success: false };
}

// Helper function to execute consumer step
function executeConsumerStep(
  state: SimulationState,
  processId: ProcessId
): { newState: SimulationState; action: string; success: boolean } {
  const process = getProcessById(state.processes, processId);
  
  if (!process || process.type !== 'consumer') {
    return { newState: state, action: '', success: false };
  }
  
  // Consumer algorithm: wait(full) -> wait(mutex) -> consume -> signal(mutex) -> signal(empty)
  
  // Step 1: Wait for full slot
  if (!process.currentOperation) {
    const { semaphores, processes, success } = waitSemaphore(
      state.semaphores,
      state.processes,
      processId,
      'full'
    );
    
    if (success) {
      const updatedProcess = getProcessById(processes, processId)!;
      updatedProcess.currentOperation = 'consuming';
      
      return {
        newState: { ...state, semaphores, processes },
        action: `${processId} acquired full semaphore`,
        success: true
      };
    } else {
      return {
        newState: { ...state, semaphores, processes },
        action: `${processId} waiting for full slot`,
        success: false
      };
    }
  }
  
  // Step 2: Wait for mutex
  if (process.currentOperation === 'consuming' && !process.waitingOn) {
    const { semaphores, processes, success } = waitSemaphore(
      state.semaphores,
      state.processes,
      processId,
      'mutex'
    );
    
    if (success) {
      // Step 3: Consume item
      const newBuffer = [...state.buffer];
      const occupiedSlot = newBuffer.find(slot => slot.occupied);
      
      if (occupiedSlot) {
        occupiedSlot.occupied = false;
        occupiedSlot.item = undefined;
        
        const updatedProcess = getProcessById(processes, processId)!;
        updatedProcess.itemsProcessed++;
        updatedProcess.currentOperation = undefined;
        updatedProcess.state = 'ready';
        
        // Step 4: Signal mutex
        const { semaphores: semaphoresAfterMutex, processes: processesAfterMutex } = signalSemaphore(
          semaphores,
          processes,
          'mutex'
        );
        
        // Step 5: Signal empty
        const { semaphores: finalSemaphores, processes: finalProcesses } = signalSemaphore(
          semaphoresAfterMutex,
          processesAfterMutex,
          'empty'
        );
        
        const newStatistics = {
          ...state.statistics,
          totalItemsConsumed: state.statistics.totalItemsConsumed + 1,
          bufferUtilization: calculateBufferUtilization(newBuffer)
        };
        
        return {
          newState: {
            ...state,
            semaphores: finalSemaphores,
            processes: finalProcesses,
            buffer: newBuffer,
            statistics: newStatistics
          },
          action: `${processId} consumed an item`,
          success: true
        };
      }
    } else {
      return {
        newState: { ...state, semaphores, processes },
        action: `${processId} waiting for mutex`,
        success: false
      };
    }
  }
  
  return { newState: state, action: '', success: false };
}

// Simulation reducer function
export function simulationReducer(
  state: SimulationState,
  action: SimulationAction
): SimulationState {
  switch (action.type) {
    case 'SET_CONFIG': {
      const { payload: config } = action;
      
      // Validate the configuration
      if (!isValidConfig(config)) {
        console.warn('Invalid configuration provided, ignoring SET_CONFIG action');
        return state;
      }

      // Create new initial state with the new configuration
      const newState = createInitialState(config);
      
      return {
        ...newState,
        // Preserve animation speed from the action payload
        animationSpeed: config.animationSpeed
      };
    }

    case 'START_SIMULATION': {
      // Only start if not already playing
      if (state.isPlaying) {
        return state;
      }

      return {
        ...state,
        isPlaying: true,
        startTime: state.startTime || Date.now()
      };
    }

    case 'PAUSE_SIMULATION': {
      // Only pause if currently playing
      if (!state.isPlaying) {
        return state;
      }

      return {
        ...state,
        isPlaying: false
      };
    }

    case 'STEP_FORWARD': {
      // Find a ready process to execute
      const readyProcesses = state.processes.filter(p => p.state === 'ready' || p.state === 'running');
      
      if (readyProcesses.length === 0) {
        // No ready processes, check if any are blocked and can be unblocked
        const blockedProcesses = state.processes.filter(p => p.state === 'blocked');
        if (blockedProcesses.length === 0) {
          // No processes to execute, simulation might be complete
          return state;
        }
        
        // Try to unblock a process by checking semaphore availability
        for (const process of blockedProcesses) {
          if (process.waitingOn) {
            const semaphore = getSemaphoreByName(state.semaphores, process.waitingOn);
            if (semaphore && semaphore.value > 0) {
              // This process can be unblocked, but we'll let the next step handle it
              break;
            }
          }
        }
        return state;
      }
      
      // Select the first ready process (round-robin scheduling)
      const processToExecute = readyProcesses[0];
      let stepResult;
      
      if (processToExecute.type === 'producer') {
        stepResult = executeProducerStep(state, processToExecute.id);
      } else {
        stepResult = executeConsumerStep(state, processToExecute.id);
      }
      
      if (stepResult.success || stepResult.action) {
        // Create a snapshot of the current state before the step
        const snapshot = createStateSnapshot(
          stepResult.newState,
          state.currentStep + 1,
          stepResult.action,
          processToExecute.id
        );
        
        // Calculate average wait time
        const totalWaitTime = stepResult.newState.processes.reduce((sum, p) => sum + p.totalWaitTime, 0);
        const averageWaitTime = stepResult.newState.processes.length > 0 
          ? totalWaitTime / stepResult.newState.processes.length 
          : 0;
        
        const updatedStatistics = {
          ...stepResult.newState.statistics,
          averageWaitTime
        };
        
        return {
          ...stepResult.newState,
          currentStep: state.currentStep + 1,
          history: [...state.history, snapshot],
          statistics: updatedStatistics,
          // Ensure arrays are new references for immutability
          semaphores: [...stepResult.newState.semaphores],
          processes: [...stepResult.newState.processes],
          buffer: [...stepResult.newState.buffer]
        };
      }
      
      return state;
    }

    case 'STEP_BACKWARD': {
      if (state.history.length === 0 || state.currentStep === 0) {
        return state;
      }
      
      // Get the previous snapshot
      const previousSnapshot = state.history[state.currentStep - 2] || null;
      
      if (!previousSnapshot) {
        // Go back to initial state
        const initialState = createInitialState(state.config);
        return {
          ...initialState,
          animationSpeed: state.animationSpeed,
          isPlaying: state.isPlaying
        };
      }
      
      // Restore state from snapshot
      return {
        ...state,
        semaphores: JSON.parse(JSON.stringify(previousSnapshot.semaphores)),
        processes: JSON.parse(JSON.stringify(previousSnapshot.processes)),
        buffer: JSON.parse(JSON.stringify(previousSnapshot.buffer)),
        statistics: { ...previousSnapshot.statistics },
        currentStep: previousSnapshot.stepNumber,
        history: state.history.slice(0, previousSnapshot.stepNumber)
      };
    }

    case 'JUMP_TO_STEP': {
      const { payload: targetStep } = action;
      
      if (targetStep < 0 || targetStep > state.history.length) {
        return state;
      }
      
      if (targetStep === 0) {
        // Jump to initial state
        const initialState = createInitialState(state.config);
        return {
          ...initialState,
          animationSpeed: state.animationSpeed,
          isPlaying: state.isPlaying
        };
      }
      
      // Get the target snapshot
      const targetSnapshot = state.history[targetStep - 1];
      
      if (!targetSnapshot) {
        return state;
      }
      
      // Restore state from snapshot
      return {
        ...state,
        semaphores: JSON.parse(JSON.stringify(targetSnapshot.semaphores)),
        processes: JSON.parse(JSON.stringify(targetSnapshot.processes)),
        buffer: JSON.parse(JSON.stringify(targetSnapshot.buffer)),
        statistics: { ...targetSnapshot.statistics },
        currentStep: targetSnapshot.stepNumber,
        history: state.history.slice(0, targetStep)
      };
    }

    case 'SET_SPEED': {
      const { payload: speed } = action;
      
      if (speed < 0.5 || speed > 3.0) {
        return state;
      }
      
      return {
        ...state,
        animationSpeed: speed
      };
    }

    case 'RESET_SIMULATION': {
      // Reset to initial state with current configuration
      const resetState = createInitialState(state.config);
      
      return {
        ...resetState,
        // Preserve animation speed
        animationSpeed: state.animationSpeed
      };
    }

    default:
      return state;
  }
}

// Custom hook for simulation management
export function useSimulation() {
  const [state, dispatch] = useReducer(
    simulationReducer,
    DEFAULT_CONFIG,
    createInitialState
  );

  // Auto-play functionality using useEffect and setInterval
  useEffect(() => {
    if (state.isPlaying) {
      const interval = setInterval(() => {
        dispatch({ type: 'STEP_FORWARD' });
      }, 1000 / state.animationSpeed);
      
      return () => clearInterval(interval);
    }
  }, [state.isPlaying, state.animationSpeed]);

  return {
    state,
    dispatch
  };
}