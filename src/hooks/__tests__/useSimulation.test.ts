import { describe, it, expect, beforeEach } from 'vitest';
import { simulationReducer } from '../useSimulation';
import type {
  SimulationState,
  SimulationConfig
} from '../../types/simulation';
import {
  createInitialState,
  DEFAULT_CONFIG,
  getSemaphoreByName,
  getProcessById
} from '../../types/simulation';

describe('simulationReducer', () => {
  let initialState: SimulationState;

  beforeEach(() => {
    initialState = createInitialState(DEFAULT_CONFIG);
  });

  describe('SET_CONFIG action', () => {
    it('should update state with valid configuration', () => {
      const newConfig: SimulationConfig = {
        bufferSize: 3,
        producerCount: 1,
        consumerCount: 3,
        animationSpeed: 2.0
      };

      const action = { type: 'SET_CONFIG' as const, payload: newConfig };
      const newState = simulationReducer(initialState, action);

      expect(newState.config).toEqual(newConfig);
      expect(newState.animationSpeed).toBe(2.0);
      expect(newState.buffer).toHaveLength(3);
      expect(newState.processes.filter(p => p.type === 'producer')).toHaveLength(1);
      expect(newState.processes.filter(p => p.type === 'consumer')).toHaveLength(3);
      expect(newState.semaphores.find(s => s.name === 'empty')?.value).toBe(3);
      expect(newState.currentStep).toBe(0);
      expect(newState.isPlaying).toBe(false);
      expect(newState.history).toHaveLength(0);
    });

    it('should ignore invalid configuration', () => {
      const invalidConfig = {
        bufferSize: 15, // Invalid: > 10
        producerCount: 2,
        consumerCount: 2,
        animationSpeed: 1.0
      } as SimulationConfig;

      const action = { type: 'SET_CONFIG' as const, payload: invalidConfig };
      const newState = simulationReducer(initialState, action);

      // State should remain unchanged
      expect(newState).toBe(initialState);
    });

    it('should handle edge case configurations', () => {
      const edgeConfig: SimulationConfig = {
        bufferSize: 1,
        producerCount: 5,
        consumerCount: 1,
        animationSpeed: 0.5
      };

      const action = { type: 'SET_CONFIG' as const, payload: edgeConfig };
      const newState = simulationReducer(initialState, action);

      expect(newState.config).toEqual(edgeConfig);
      expect(newState.buffer).toHaveLength(1);
      expect(newState.processes.filter(p => p.type === 'producer')).toHaveLength(5);
      expect(newState.processes.filter(p => p.type === 'consumer')).toHaveLength(1);
      expect(newState.semaphores.find(s => s.name === 'empty')?.value).toBe(1);
    });
  });

  describe('START_SIMULATION action', () => {
    it('should start simulation when not playing', () => {
      expect(initialState.isPlaying).toBe(false);

      const action = { type: 'START_SIMULATION' as const };
      const newState = simulationReducer(initialState, action);

      expect(newState.isPlaying).toBe(true);
      // Other state should remain unchanged
      expect(newState.config).toEqual(initialState.config);
      expect(newState.currentStep).toBe(initialState.currentStep);
    });

    it('should not change state when already playing', () => {
      const playingState = { ...initialState, isPlaying: true };

      const action = { type: 'START_SIMULATION' as const };
      const newState = simulationReducer(playingState, action);

      expect(newState).toBe(playingState);
    });
  });

  describe('PAUSE_SIMULATION action', () => {
    it('should pause simulation when playing', () => {
      const playingState = { ...initialState, isPlaying: true };

      const action = { type: 'PAUSE_SIMULATION' as const };
      const newState = simulationReducer(playingState, action);

      expect(newState.isPlaying).toBe(false);
      // Other state should remain unchanged
      expect(newState.config).toEqual(playingState.config);
      expect(newState.currentStep).toBe(playingState.currentStep);
    });

    it('should not change state when not playing', () => {
      expect(initialState.isPlaying).toBe(false);

      const action = { type: 'PAUSE_SIMULATION' as const };
      const newState = simulationReducer(initialState, action);

      expect(newState).toBe(initialState);
    });
  });

  describe('RESET_SIMULATION action', () => {
    it('should reset simulation to initial state', () => {
      // Create a modified state
      const modifiedState: SimulationState = {
        ...initialState,
        currentStep: 10,
        isPlaying: true,
        animationSpeed: 2.5,
        statistics: {
          totalItemsProduced: 5,
          totalItemsConsumed: 3,
          bufferUtilization: 60,
          averageWaitTime: 1.5
        }
      };

      const action = { type: 'RESET_SIMULATION' as const };
      const newState = simulationReducer(modifiedState, action);

      expect(newState.currentStep).toBe(0);
      expect(newState.isPlaying).toBe(false);
      expect(newState.animationSpeed).toBe(2.5); // Should preserve animation speed
      expect(newState.config).toEqual(modifiedState.config); // Should preserve config
      expect(newState.statistics.totalItemsProduced).toBe(0);
      expect(newState.statistics.totalItemsConsumed).toBe(0);
      expect(newState.statistics.bufferUtilization).toBe(0);
      expect(newState.statistics.averageWaitTime).toBe(0);
      expect(newState.history).toHaveLength(0);
    });

    it('should preserve configuration during reset', () => {
      const customConfig: SimulationConfig = {
        bufferSize: 8,
        producerCount: 3,
        consumerCount: 4,
        animationSpeed: 1.5
      };

      const customState = createInitialState(customConfig);
      const modifiedState = {
        ...customState,
        currentStep: 5,
        isPlaying: true
      };

      const action = { type: 'RESET_SIMULATION' as const };
      const newState = simulationReducer(modifiedState, action);

      expect(newState.config).toEqual(customConfig);
      expect(newState.buffer).toHaveLength(8);
      expect(newState.processes.filter(p => p.type === 'producer')).toHaveLength(3);
      expect(newState.processes.filter(p => p.type === 'consumer')).toHaveLength(4);
      expect(newState.currentStep).toBe(0);
      expect(newState.isPlaying).toBe(false);
    });
  });

  describe('unknown action', () => {
    it('should return current state for unknown action', () => {
      const unknownAction = { type: 'UNKNOWN_ACTION' as any };
      const newState = simulationReducer(initialState, unknownAction);

      expect(newState).toBe(initialState);
    });
  });

  describe('STEP_FORWARD action', () => {
    it('should execute producer step when producer is ready', () => {
      const action = { type: 'STEP_FORWARD' as const };
      const newState = simulationReducer(initialState, action);

      expect(newState.currentStep).toBe(1);
      expect(newState.history).toHaveLength(1);
      
      // Check that a producer acquired the empty semaphore
      const emptySemaphore = getSemaphoreByName(newState.semaphores, 'empty');
      expect(emptySemaphore?.value).toBe(4); // Should be decremented from 5 to 4
      
      // Check that the action was recorded
      const snapshot = newState.history[0];
      expect(snapshot.action).toContain('acquired empty semaphore');
      expect(snapshot.processId).toMatch(/^P\d+$/); // Should be a producer ID
    });

    it('should handle producer waiting on empty semaphore when buffer is full', () => {
      // Create state with full buffer
      const fullBufferState = createInitialState({
        ...DEFAULT_CONFIG,
        bufferSize: 1
      });
      
      // Fill the buffer by setting empty semaphore to 0 and full to 1
      const emptySemaphore = getSemaphoreByName(fullBufferState.semaphores, 'empty')!;
      const fullSemaphore = getSemaphoreByName(fullBufferState.semaphores, 'full')!;
      emptySemaphore.value = 0;
      fullSemaphore.value = 1;
      fullBufferState.buffer[0].occupied = true;
      fullBufferState.buffer[0].item = {
        id: 'test-item',
        producedBy: 'P1',
        timestamp: Date.now()
      };

      const action = { type: 'STEP_FORWARD' as const };
      const newState = simulationReducer(fullBufferState, action);

      // Producer should be blocked waiting for empty semaphore
      const producer = getProcessById(newState.processes, 'P1');
      expect(producer?.state).toBe('blocked');
      expect(producer?.waitingOn).toBe('empty');
      
      // Empty semaphore should have the producer in waiting queue
      const emptyAfter = getSemaphoreByName(newState.semaphores, 'empty');
      expect(emptyAfter?.waitingQueue).toContain('P1');
    });

    it('should execute consumer step when consumer is ready and buffer has items', () => {
      // Create state with items in buffer
      const stateWithItems = createInitialState(DEFAULT_CONFIG);
      
      // Add an item to buffer and update semaphores
      stateWithItems.buffer[0].occupied = true;
      stateWithItems.buffer[0].item = {
        id: 'test-item',
        producedBy: 'P1',
        timestamp: Date.now()
      };
      
      const emptySemaphore = getSemaphoreByName(stateWithItems.semaphores, 'empty')!;
      const fullSemaphore = getSemaphoreByName(stateWithItems.semaphores, 'full')!;
      emptySemaphore.value = 4;
      fullSemaphore.value = 1;
      
      // Reorder processes to put consumers first so they get selected
      const producers = stateWithItems.processes.filter(p => p.type === 'producer');
      const consumers = stateWithItems.processes.filter(p => p.type === 'consumer');
      stateWithItems.processes = [...consumers, ...producers];

      const action = { type: 'STEP_FORWARD' as const };
      const newState = simulationReducer(stateWithItems, action);

      expect(newState.currentStep).toBe(1);
      expect(newState.history).toHaveLength(1);
      
      // Check that consumer acquired the full semaphore
      const fullAfter = getSemaphoreByName(newState.semaphores, 'full');
      expect(fullAfter?.value).toBe(0); // Should be decremented from 1 to 0
      
      // Check that the action was recorded
      const snapshot = newState.history[0];
      expect(snapshot.action).toContain('acquired full semaphore');
      expect(snapshot.processId).toMatch(/^C\d+$/); // Should be a consumer ID
    });

    it('should handle consumer waiting on full semaphore when buffer is empty', () => {
      // Buffer is already empty in initial state
      const action = { type: 'STEP_FORWARD' as const };
      const newState = simulationReducer(initialState, action);

      // Since producers are first in the process list, a producer should execute first
      // Let's test with a state where consumers are first
      const consumerFirstState = createInitialState(DEFAULT_CONFIG);
      
      // Reorder processes to put consumers first
      const producers = consumerFirstState.processes.filter(p => p.type === 'producer');
      const consumers = consumerFirstState.processes.filter(p => p.type === 'consumer');
      consumerFirstState.processes = [...consumers, ...producers];

      const newState2 = simulationReducer(consumerFirstState, action);
      
      // Consumer should be blocked waiting for full semaphore
      const consumer = getProcessById(newState2.processes, 'C1');
      expect(consumer?.state).toBe('blocked');
      expect(consumer?.waitingOn).toBe('full');
      
      // Full semaphore should have the consumer in waiting queue
      const fullSemaphore = getSemaphoreByName(newState2.semaphores, 'full');
      expect(fullSemaphore?.waitingQueue).toContain('C1');
    });

    it('should complete producer cycle: empty -> mutex -> produce -> signal mutex -> signal full', () => {
      let currentState = initialState;
      
      // Step 1: Producer acquires empty semaphore
      currentState = simulationReducer(currentState, { type: 'STEP_FORWARD' });
      expect(currentState.history[0].action).toContain('acquired empty semaphore');
      
      // Step 2: Producer should acquire mutex and complete production
      currentState = simulationReducer(currentState, { type: 'STEP_FORWARD' });
      expect(currentState.history[1].action).toContain('produced an item');
      
      // Verify final state
      expect(currentState.statistics.totalItemsProduced).toBe(1);
      expect(currentState.buffer.filter(slot => slot.occupied)).toHaveLength(1);
      
      const emptySemaphore = getSemaphoreByName(currentState.semaphores, 'empty');
      const fullSemaphore = getSemaphoreByName(currentState.semaphores, 'full');
      const mutexSemaphore = getSemaphoreByName(currentState.semaphores, 'mutex');
      
      expect(emptySemaphore?.value).toBe(4); // One less empty slot
      expect(fullSemaphore?.value).toBe(1); // One more full slot
      expect(mutexSemaphore?.value).toBe(1); // Mutex should be released
    });

    it('should complete consumer cycle: full -> mutex -> consume -> signal mutex -> signal empty', () => {
      // Start with a state that has an item in the buffer
      let currentState = createInitialState(DEFAULT_CONFIG);
      
      // Add an item to buffer
      currentState.buffer[0].occupied = true;
      currentState.buffer[0].item = {
        id: 'test-item',
        producedBy: 'P1',
        timestamp: Date.now()
      };
      
      // Update semaphores to reflect the item
      const emptySemaphore = getSemaphoreByName(currentState.semaphores, 'empty')!;
      const fullSemaphore = getSemaphoreByName(currentState.semaphores, 'full')!;
      emptySemaphore.value = 4;
      fullSemaphore.value = 1;
      
      // Reorder processes to put consumers first
      const producers = currentState.processes.filter(p => p.type === 'producer');
      const consumers = currentState.processes.filter(p => p.type === 'consumer');
      currentState.processes = [...consumers, ...producers];
      
      // Step 1: Consumer acquires full semaphore
      currentState = simulationReducer(currentState, { type: 'STEP_FORWARD' });
      expect(currentState.history[0].action).toContain('acquired full semaphore');
      
      // Step 2: Consumer should acquire mutex and complete consumption
      currentState = simulationReducer(currentState, { type: 'STEP_FORWARD' });
      expect(currentState.history[1].action).toContain('consumed an item');
      
      // Verify final state
      expect(currentState.statistics.totalItemsConsumed).toBe(1);
      expect(currentState.buffer.filter(slot => slot.occupied)).toHaveLength(0);
      
      const emptyAfter = getSemaphoreByName(currentState.semaphores, 'empty');
      const fullAfter = getSemaphoreByName(currentState.semaphores, 'full');
      const mutexAfter = getSemaphoreByName(currentState.semaphores, 'mutex');
      
      expect(emptyAfter?.value).toBe(5); // One more empty slot
      expect(fullAfter?.value).toBe(0); // One less full slot
      expect(mutexAfter?.value).toBe(1); // Mutex should be released
    });

    it('should handle mutex contention between processes', () => {
      // Create a state where multiple processes are ready to acquire mutex
      let currentState = createInitialState({
        ...DEFAULT_CONFIG,
        bufferSize: 2,
        producerCount: 2,
        consumerCount: 1
      });
      
      // Add one item to buffer so consumer can also compete for mutex
      currentState.buffer[0].occupied = true;
      currentState.buffer[0].item = {
        id: 'test-item',
        producedBy: 'P1',
        timestamp: Date.now()
      };
      
      const emptySemaphore = getSemaphoreByName(currentState.semaphores, 'empty')!;
      const fullSemaphore = getSemaphoreByName(currentState.semaphores, 'full')!;
      emptySemaphore.value = 1;
      fullSemaphore.value = 1;
      
      // Execute several steps to see mutex handling
      for (let i = 0; i < 5; i++) {
        currentState = simulationReducer(currentState, { type: 'STEP_FORWARD' });
      }
      
      // Verify that mutex is properly managed (should always be 0 or 1)
      const mutexSemaphore = getSemaphoreByName(currentState.semaphores, 'mutex');
      expect(mutexSemaphore?.value).toBeGreaterThanOrEqual(0);
      expect(mutexSemaphore?.value).toBeLessThanOrEqual(1);
    });

    it('should update statistics correctly during simulation', () => {
      let currentState = initialState;
      
      // Execute multiple steps
      for (let i = 0; i < 10; i++) {
        currentState = simulationReducer(currentState, { type: 'STEP_FORWARD' });
      }
      
      // Verify statistics are updated
      expect(currentState.statistics.totalItemsProduced).toBeGreaterThan(0);
      expect(currentState.statistics.bufferUtilization).toBeGreaterThanOrEqual(0);
      expect(currentState.statistics.bufferUtilization).toBeLessThanOrEqual(100);
      
      // If items were produced, buffer utilization should be calculated correctly
      if (currentState.statistics.totalItemsProduced > 0) {
        const occupiedSlots = currentState.buffer.filter(slot => slot.occupied).length;
        const expectedUtilization = (occupiedSlots / currentState.buffer.length) * 100;
        expect(currentState.statistics.bufferUtilization).toBe(expectedUtilization);
      }
    });

    it('should handle no ready processes gracefully', () => {
      // Create state where all processes are blocked
      const blockedState = createInitialState(DEFAULT_CONFIG);
      
      // Set all processes to blocked
      blockedState.processes.forEach(process => {
        process.state = 'blocked';
        process.waitingOn = 'mutex';
      });
      
      // Set mutex to 0 so no process can be unblocked
      const mutexSemaphore = getSemaphoreByName(blockedState.semaphores, 'mutex')!;
      mutexSemaphore.value = 0;
      
      const action = { type: 'STEP_FORWARD' as const };
      const newState = simulationReducer(blockedState, action);
      
      // State should remain unchanged when no processes can execute
      expect(newState.currentStep).toBe(blockedState.currentStep);
      expect(newState.history).toHaveLength(0);
    });
  });

  describe('STEP_BACKWARD action', () => {
    it('should go back to previous state', () => {
      let currentState = initialState;
      
      // Execute a few steps forward
      currentState = simulationReducer(currentState, { type: 'STEP_FORWARD' });
      currentState = simulationReducer(currentState, { type: 'STEP_FORWARD' });
      
      expect(currentState.currentStep).toBe(2);
      expect(currentState.history).toHaveLength(2);
      
      // Step backward
      const backwardState = simulationReducer(currentState, { type: 'STEP_BACKWARD' });
      
      expect(backwardState.currentStep).toBe(1);
      expect(backwardState.history).toHaveLength(1);
    });

    it('should go to initial state when stepping back from step 1', () => {
      let currentState = initialState;
      
      // Execute one step forward
      currentState = simulationReducer(currentState, { type: 'STEP_FORWARD' });
      expect(currentState.currentStep).toBe(1);
      
      // Step backward should go to initial state
      const backwardState = simulationReducer(currentState, { type: 'STEP_BACKWARD' });
      
      expect(backwardState.currentStep).toBe(0);
      expect(backwardState.history).toHaveLength(0);
      expect(backwardState.statistics.totalItemsProduced).toBe(0);
      expect(backwardState.statistics.totalItemsConsumed).toBe(0);
    });

    it('should not change state when already at beginning', () => {
      const action = { type: 'STEP_BACKWARD' as const };
      const newState = simulationReducer(initialState, action);
      
      expect(newState).toBe(initialState);
    });
  });

  describe('JUMP_TO_STEP action', () => {
    it('should jump to specific step in history', () => {
      let currentState = initialState;
      
      // Execute several steps forward
      for (let i = 0; i < 5; i++) {
        currentState = simulationReducer(currentState, { type: 'STEP_FORWARD' });
      }
      
      expect(currentState.currentStep).toBe(5);
      
      // Jump to step 3
      const jumpedState = simulationReducer(currentState, { 
        type: 'JUMP_TO_STEP', 
        payload: 3 
      });
      
      expect(jumpedState.currentStep).toBe(3);
      expect(jumpedState.history).toHaveLength(3);
    });

    it('should jump to initial state when target is 0', () => {
      let currentState = initialState;
      
      // Execute steps forward
      currentState = simulationReducer(currentState, { type: 'STEP_FORWARD' });
      currentState = simulationReducer(currentState, { type: 'STEP_FORWARD' });
      
      // Jump to step 0
      const jumpedState = simulationReducer(currentState, { 
        type: 'JUMP_TO_STEP', 
        payload: 0 
      });
      
      expect(jumpedState.currentStep).toBe(0);
      expect(jumpedState.history).toHaveLength(0);
      expect(jumpedState.statistics.totalItemsProduced).toBe(0);
    });

    it('should not change state for invalid step numbers', () => {
      let currentState = initialState;
      
      // Execute a step forward
      currentState = simulationReducer(currentState, { type: 'STEP_FORWARD' });
      
      // Try to jump to invalid step (negative)
      const invalidJump1 = simulationReducer(currentState, { 
        type: 'JUMP_TO_STEP', 
        payload: -1 
      });
      expect(invalidJump1).toBe(currentState);
      
      // Try to jump to invalid step (beyond history)
      const invalidJump2 = simulationReducer(currentState, { 
        type: 'JUMP_TO_STEP', 
        payload: 10 
      });
      expect(invalidJump2).toBe(currentState);
    });
  });

  describe('SET_SPEED action', () => {
    it('should update animation speed within valid range', () => {
      const action = { type: 'SET_SPEED' as const, payload: 2.5 };
      const newState = simulationReducer(initialState, action);
      
      expect(newState.animationSpeed).toBe(2.5);
      expect(newState.config).toBe(initialState.config); // Other state unchanged
    });

    it('should ignore invalid speed values', () => {
      // Test speed too low
      const lowSpeedAction = { type: 'SET_SPEED' as const, payload: 0.3 };
      const lowSpeedState = simulationReducer(initialState, lowSpeedAction);
      expect(lowSpeedState).toBe(initialState);
      
      // Test speed too high
      const highSpeedAction = { type: 'SET_SPEED' as const, payload: 4.0 };
      const highSpeedState = simulationReducer(initialState, highSpeedAction);
      expect(highSpeedState).toBe(initialState);
    });
  });

  describe('semaphore operations', () => {
    it('should properly manage semaphore waiting queues', () => {
      // Create state with limited mutex (set to 0)
      const limitedState = createInitialState(DEFAULT_CONFIG);
      const mutexSemaphore = getSemaphoreByName(limitedState.semaphores, 'mutex')!;
      mutexSemaphore.value = 0;
      
      // Set processes to need mutex
      limitedState.processes.forEach(process => {
        if (process.type === 'producer') {
          process.currentOperation = 'producing';
        }
      });
      
      // Execute steps - processes should queue up for mutex
      let currentState = limitedState;
      for (let i = 0; i < 3; i++) {
        currentState = simulationReducer(currentState, { type: 'STEP_FORWARD' });
      }
      
      const mutexAfter = getSemaphoreByName(currentState.semaphores, 'mutex');
      expect(mutexAfter?.waitingQueue.length).toBeGreaterThan(0);
    });

    it('should wake up waiting processes when semaphore is signaled', () => {
      // This is tested implicitly in the producer/consumer cycle tests
      // but we can add a more direct test here
      let currentState = initialState;
      
      // Execute enough steps to see semaphore signaling in action
      for (let i = 0; i < 6; i++) {
        currentState = simulationReducer(currentState, { type: 'STEP_FORWARD' });
      }
      
      // Verify that processes are being unblocked appropriately
      const blockedProcesses = currentState.processes.filter(p => p.state === 'blocked');
      const readyProcesses = currentState.processes.filter(p => p.state === 'ready');
      
      // At least some processes should be ready or running
      expect(readyProcesses.length + currentState.processes.filter(p => p.state === 'running').length).toBeGreaterThan(0);
    });
  });

  describe('history management and state restoration', () => {
    it('should create complete snapshots with all state data', () => {
      let currentState = initialState;
      
      // Execute a step to create a snapshot
      currentState = simulationReducer(currentState, { type: 'STEP_FORWARD' });
      
      expect(currentState.history).toHaveLength(1);
      const snapshot = currentState.history[0];
      
      // Verify snapshot contains all required data
      expect(snapshot.stepNumber).toBe(1);
      expect(snapshot.action).toBeTruthy();
      expect(snapshot.processId).toBeTruthy();
      expect(snapshot.semaphores).toHaveLength(3);
      expect(snapshot.processes).toHaveLength(4); // 2 producers + 2 consumers
      expect(snapshot.buffer).toHaveLength(5); // Default buffer size
      expect(snapshot.statistics).toBeDefined();
      expect(snapshot.statistics.totalItemsProduced).toBeGreaterThanOrEqual(0);
      expect(snapshot.statistics.totalItemsConsumed).toBeGreaterThanOrEqual(0);
      expect(snapshot.statistics.bufferUtilization).toBeGreaterThanOrEqual(0);
      expect(snapshot.statistics.averageWaitTime).toBeGreaterThanOrEqual(0);
    });

    it('should restore complete state from snapshots during STEP_BACKWARD', () => {
      let currentState = initialState;
      
      // Execute several steps to create history
      for (let i = 0; i < 4; i++) {
        currentState = simulationReducer(currentState, { type: 'STEP_FORWARD' });
      }
      
      const stateAtStep4 = JSON.parse(JSON.stringify(currentState));
      
      // Step backward
      currentState = simulationReducer(currentState, { type: 'STEP_BACKWARD' });
      
      // Verify state was restored to step 3
      expect(currentState.currentStep).toBe(3);
      expect(currentState.history).toHaveLength(3);
      
      // Verify all state components were restored
      expect(currentState.semaphores).toHaveLength(3);
      expect(currentState.processes).toHaveLength(4);
      expect(currentState.buffer).toHaveLength(5);
      
      // Verify state is different from step 4
      expect(currentState).not.toEqual(stateAtStep4);
      
      // Verify we can step forward again to recreate step 4
      const forwardAgain = simulationReducer(currentState, { type: 'STEP_FORWARD' });
      expect(forwardAgain.currentStep).toBe(4);
    });

    it('should restore complete state from snapshots during JUMP_TO_STEP', () => {
      let currentState = initialState;
      
      // Execute several steps to create history
      const stateSnapshots = [JSON.parse(JSON.stringify(currentState))];
      
      for (let i = 0; i < 5; i++) {
        currentState = simulationReducer(currentState, { type: 'STEP_FORWARD' });
        stateSnapshots.push(JSON.parse(JSON.stringify(currentState)));
      }
      
      // Jump to step 2
      const jumpedState = simulationReducer(currentState, { 
        type: 'JUMP_TO_STEP', 
        payload: 2 
      });
      
      // Verify state was restored to step 2
      expect(jumpedState.currentStep).toBe(2);
      expect(jumpedState.history).toHaveLength(2);
      
      // Verify all state components match the snapshot at step 2
      const originalStep2 = stateSnapshots[2];
      expect(jumpedState.semaphores).toEqual(originalStep2.semaphores);
      expect(jumpedState.processes).toEqual(originalStep2.processes);
      expect(jumpedState.buffer).toEqual(originalStep2.buffer);
      expect(jumpedState.statistics).toEqual(originalStep2.statistics);
    });

    it('should maintain history integrity during backward navigation', () => {
      let currentState = initialState;
      
      // Execute steps to create history
      for (let i = 0; i < 3; i++) {
        currentState = simulationReducer(currentState, { type: 'STEP_FORWARD' });
      }
      
      expect(currentState.history).toHaveLength(3);
      const originalHistory = [...currentState.history];
      
      // Step backward
      currentState = simulationReducer(currentState, { type: 'STEP_BACKWARD' });
      
      // History should be truncated but remaining entries should be unchanged
      expect(currentState.history).toHaveLength(2);
      expect(currentState.history[0]).toEqual(originalHistory[0]);
      expect(currentState.history[1]).toEqual(originalHistory[1]);
    });

    it('should handle multiple backward steps correctly', () => {
      let currentState = initialState;
      
      // Execute steps forward
      for (let i = 0; i < 5; i++) {
        currentState = simulationReducer(currentState, { type: 'STEP_FORWARD' });
      }
      
      expect(currentState.currentStep).toBe(5);
      
      // Step backward multiple times
      currentState = simulationReducer(currentState, { type: 'STEP_BACKWARD' });
      expect(currentState.currentStep).toBe(4);
      
      currentState = simulationReducer(currentState, { type: 'STEP_BACKWARD' });
      expect(currentState.currentStep).toBe(3);
      
      currentState = simulationReducer(currentState, { type: 'STEP_BACKWARD' });
      expect(currentState.currentStep).toBe(2);
      
      // Verify state consistency
      expect(currentState.history).toHaveLength(2);
      
      // Should be able to step forward again
      currentState = simulationReducer(currentState, { type: 'STEP_FORWARD' });
      expect(currentState.currentStep).toBe(3);
    });

    it('should preserve animation settings during history navigation', () => {
      let currentState = { ...initialState, animationSpeed: 2.5, isPlaying: true };
      
      // Execute steps
      for (let i = 0; i < 3; i++) {
        currentState = simulationReducer(currentState, { type: 'STEP_FORWARD' });
      }
      
      // Step backward
      currentState = simulationReducer(currentState, { type: 'STEP_BACKWARD' });
      
      // Animation settings should be preserved
      expect(currentState.animationSpeed).toBe(2.5);
      expect(currentState.isPlaying).toBe(true);
      
      // Jump to step
      currentState = simulationReducer(currentState, { 
        type: 'JUMP_TO_STEP', 
        payload: 1 
      });
      
      // Animation settings should still be preserved
      expect(currentState.animationSpeed).toBe(2.5);
      expect(currentState.isPlaying).toBe(true);
    });

    it('should handle edge case: jump to current step', () => {
      let currentState = initialState;
      
      // Execute steps
      for (let i = 0; i < 3; i++) {
        currentState = simulationReducer(currentState, { type: 'STEP_FORWARD' });
      }
      
      const beforeJump = JSON.parse(JSON.stringify(currentState));
      
      // Jump to current step (should be no-op)
      currentState = simulationReducer(currentState, { 
        type: 'JUMP_TO_STEP', 
        payload: 3 
      });
      
      // State should remain the same
      expect(currentState).toEqual(beforeJump);
    });

    it('should create deep copies in snapshots to prevent mutation', () => {
      let currentState = initialState;
      
      // Execute a step to create a snapshot
      currentState = simulationReducer(currentState, { type: 'STEP_FORWARD' });
      
      const snapshot = currentState.history[0];
      const originalSnapshot = JSON.parse(JSON.stringify(snapshot));
      
      // Modify current state
      currentState.semaphores[0].value = 999;
      currentState.processes[0].itemsProcessed = 999;
      currentState.buffer[0].occupied = true;
      
      // Snapshot should remain unchanged
      expect(snapshot).toEqual(originalSnapshot);
    });

    it('should handle complex simulation state during restoration', () => {
      let currentState = createInitialState({
        bufferSize: 3,
        producerCount: 3,
        consumerCount: 2,
        animationSpeed: 1.5
      });
      
      // Execute many steps to create complex state
      for (let i = 0; i < 15; i++) {
        currentState = simulationReducer(currentState, { type: 'STEP_FORWARD' });
      }
      
      const complexState = JSON.parse(JSON.stringify(currentState));
      
      // Jump back to middle of execution
      const jumpedState = simulationReducer(currentState, { 
        type: 'JUMP_TO_STEP', 
        payload: 7 
      });
      
      // Verify restoration worked correctly
      expect(jumpedState.currentStep).toBe(7);
      expect(jumpedState.history).toHaveLength(7);
      expect(jumpedState.config).toEqual(complexState.config);
      
      // Verify state components are valid
      expect(jumpedState.semaphores).toHaveLength(3);
      expect(jumpedState.processes).toHaveLength(5); // 3 producers + 2 consumers
      expect(jumpedState.buffer).toHaveLength(3);
      
      // All semaphore values should be valid
      jumpedState.semaphores.forEach(semaphore => {
        expect(semaphore.value).toBeGreaterThanOrEqual(0);
        expect(Array.isArray(semaphore.waitingQueue)).toBe(true);
      });
      
      // All processes should have valid states
      jumpedState.processes.forEach(process => {
        expect(['ready', 'running', 'waiting', 'blocked']).toContain(process.state);
        expect(process.itemsProcessed).toBeGreaterThanOrEqual(0);
        expect(process.totalWaitTime).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('state immutability', () => {
    it('should not mutate original state', () => {
      const originalState = createInitialState(DEFAULT_CONFIG);
      const stateCopy = JSON.parse(JSON.stringify(originalState));

      const action = { type: 'START_SIMULATION' as const };
      simulationReducer(originalState, action);

      // Original state should remain unchanged
      expect(originalState).toEqual(stateCopy);
    });

    it('should create new state objects', () => {
      const action = { type: 'START_SIMULATION' as const };
      const newState = simulationReducer(initialState, action);

      expect(newState).not.toBe(initialState);
      expect(newState.config).toBe(initialState.config); // Config can be same reference since it's not modified
    });

    it('should create deep copies for complex state changes', () => {
      const action = { type: 'STEP_FORWARD' as const };
      const newState = simulationReducer(initialState, action);

      // Arrays should be new references
      expect(newState.semaphores).not.toBe(initialState.semaphores);
      expect(newState.processes).not.toBe(initialState.processes);
      expect(newState.buffer).not.toBe(initialState.buffer);
      expect(newState.history).not.toBe(initialState.history);
    });
  });
});