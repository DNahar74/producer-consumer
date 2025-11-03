import { describe, it, expect } from 'vitest'
import {
  SimulationConfig,
  ProcessId,
  Semaphore,
  Process,
  BufferSlot,
  SimulationState,
  SimulationSnapshot,
  isValidConfig,
  DEFAULT_CONFIG,
  createInitialState,
  createStateSnapshot,
  isValidProcessId,
  isProducerId,
  isConsumerId,
  calculateBufferUtilization,
  getSemaphoreByName,
  getProcessById
} from '../simulation'

describe('SimulationConfig validation', () => {
  it('should validate a correct configuration', () => {
    const validConfig: SimulationConfig = {
      bufferSize: 5,
      producerCount: 2,
      consumerCount: 3,
      animationSpeed: 1.5
    }
    
    expect(isValidConfig(validConfig)).toBe(true)
  })

  it('should reject configuration with invalid buffer size', () => {
    const invalidConfig = {
      bufferSize: 0, // Invalid: below minimum
      producerCount: 2,
      consumerCount: 2,
      animationSpeed: 1.0
    }
    
    expect(isValidConfig(invalidConfig)).toBe(false)
    
    const invalidConfig2 = {
      bufferSize: 11, // Invalid: above maximum
      producerCount: 2,
      consumerCount: 2,
      animationSpeed: 1.0
    }
    
    expect(isValidConfig(invalidConfig2)).toBe(false)
  })

  it('should reject configuration with invalid producer count', () => {
    const invalidConfig = {
      bufferSize: 5,
      producerCount: 0, // Invalid: below minimum
      consumerCount: 2,
      animationSpeed: 1.0
    }
    
    expect(isValidConfig(invalidConfig)).toBe(false)
    
    const invalidConfig2 = {
      bufferSize: 5,
      producerCount: 6, // Invalid: above maximum
      consumerCount: 2,
      animationSpeed: 1.0
    }
    
    expect(isValidConfig(invalidConfig2)).toBe(false)
  })

  it('should reject configuration with invalid consumer count', () => {
    const invalidConfig = {
      bufferSize: 5,
      producerCount: 2,
      consumerCount: 0, // Invalid: below minimum
      animationSpeed: 1.0
    }
    
    expect(isValidConfig(invalidConfig)).toBe(false)
    
    const invalidConfig2 = {
      bufferSize: 5,
      producerCount: 2,
      consumerCount: 6, // Invalid: above maximum
      animationSpeed: 1.0
    }
    
    expect(isValidConfig(invalidConfig2)).toBe(false)
  })

  it('should reject configuration with invalid animation speed', () => {
    const invalidConfig = {
      bufferSize: 5,
      producerCount: 2,
      consumerCount: 2,
      animationSpeed: 0.4 // Invalid: below minimum
    }
    
    expect(isValidConfig(invalidConfig)).toBe(false)
    
    const invalidConfig2 = {
      bufferSize: 5,
      producerCount: 2,
      consumerCount: 2,
      animationSpeed: 3.1 // Invalid: above maximum
    }
    
    expect(isValidConfig(invalidConfig2)).toBe(false)
  })

  it('should reject configuration with missing properties', () => {
    const incompleteConfig = {
      bufferSize: 5,
      producerCount: 2
      // Missing consumerCount and animationSpeed
    }
    
    expect(isValidConfig(incompleteConfig)).toBe(false)
  })

  it('should reject configuration with wrong types', () => {
    const wrongTypeConfig = {
      bufferSize: '5', // Should be number
      producerCount: 2,
      consumerCount: 2,
      animationSpeed: 1.0
    }
    
    expect(isValidConfig(wrongTypeConfig)).toBe(false)
  })
})

describe('DEFAULT_CONFIG', () => {
  it('should have valid default values', () => {
    expect(isValidConfig(DEFAULT_CONFIG)).toBe(true)
    expect(DEFAULT_CONFIG.bufferSize).toBe(5)
    expect(DEFAULT_CONFIG.producerCount).toBe(2)
    expect(DEFAULT_CONFIG.consumerCount).toBe(2)
    expect(DEFAULT_CONFIG.animationSpeed).toBe(1.0)
  })
})

describe('createInitialState', () => {
  it('should create initial state with default configuration', () => {
    const state = createInitialState()
    
    expect(state.config).toEqual(DEFAULT_CONFIG)
    expect(state.currentStep).toBe(0)
    expect(state.isPlaying).toBe(false)
    expect(state.animationSpeed).toBe(DEFAULT_CONFIG.animationSpeed)
    expect(state.history).toEqual([])
  })

  it('should create initial state with custom configuration', () => {
    const customConfig: SimulationConfig = {
      bufferSize: 3,
      producerCount: 1,
      consumerCount: 3,
      animationSpeed: 2.0
    }
    
    const state = createInitialState(customConfig)
    
    expect(state.config).toEqual(customConfig)
    expect(state.animationSpeed).toBe(2.0)
  })

  it('should create correct semaphores', () => {
    const config: SimulationConfig = {
      bufferSize: 4,
      producerCount: 2,
      consumerCount: 2,
      animationSpeed: 1.0
    }
    
    const state = createInitialState(config)
    
    expect(state.semaphores).toHaveLength(3)
    
    const emptySemaphore = state.semaphores.find(s => s.name === 'empty')
    const fullSemaphore = state.semaphores.find(s => s.name === 'full')
    const mutexSemaphore = state.semaphores.find(s => s.name === 'mutex')
    
    expect(emptySemaphore).toBeDefined()
    expect(emptySemaphore!.value).toBe(4) // Should equal buffer size
    expect(emptySemaphore!.waitingQueue).toEqual([])
    
    expect(fullSemaphore).toBeDefined()
    expect(fullSemaphore!.value).toBe(0) // Should start at 0
    expect(fullSemaphore!.waitingQueue).toEqual([])
    
    expect(mutexSemaphore).toBeDefined()
    expect(mutexSemaphore!.value).toBe(1) // Should start at 1
    expect(mutexSemaphore!.waitingQueue).toEqual([])
  })

  it('should create correct number of processes', () => {
    const config: SimulationConfig = {
      bufferSize: 5,
      producerCount: 3,
      consumerCount: 2,
      animationSpeed: 1.0
    }
    
    const state = createInitialState(config)
    
    expect(state.processes).toHaveLength(5) // 3 producers + 2 consumers
    
    const producers = state.processes.filter(p => p.type === 'producer')
    const consumers = state.processes.filter(p => p.type === 'consumer')
    
    expect(producers).toHaveLength(3)
    expect(consumers).toHaveLength(2)
    
    // Check producer IDs
    expect(producers.map(p => p.id)).toEqual(['P1', 'P2', 'P3'])
    
    // Check consumer IDs
    expect(consumers.map(p => p.id)).toEqual(['C1', 'C2'])
    
    // Check initial process state
    state.processes.forEach(process => {
      expect(process.state).toBe('ready')
      expect(process.itemsProcessed).toBe(0)
      expect(process.totalWaitTime).toBe(0)
      expect(process.currentOperation).toBeUndefined()
      expect(process.waitingOn).toBeUndefined()
    })
  })

  it('should create correct buffer structure', () => {
    const config: SimulationConfig = {
      bufferSize: 6,
      producerCount: 1,
      consumerCount: 1,
      animationSpeed: 1.0
    }
    
    const state = createInitialState(config)
    
    expect(state.buffer).toHaveLength(6)
    
    state.buffer.forEach((slot, index) => {
      expect(slot.id).toBe(index)
      expect(slot.occupied).toBe(false)
      expect(slot.item).toBeUndefined()
    })
  })

  it('should initialize statistics correctly', () => {
    const state = createInitialState()
    
    expect(state.statistics).toEqual({
      totalItemsProduced: 0,
      totalItemsConsumed: 0,
      bufferUtilization: 0,
      averageWaitTime: 0
    })
  })
})

describe('createStateSnapshot', () => {
  it('should create a complete state snapshot', () => {
    const state = createInitialState()
    const snapshot = createStateSnapshot(state, 5, 'Test action', 'P1')
    
    expect(snapshot.stepNumber).toBe(5)
    expect(snapshot.action).toBe('Test action')
    expect(snapshot.processId).toBe('P1')
    expect(snapshot.semaphores).toEqual(state.semaphores)
    expect(snapshot.processes).toEqual(state.processes)
    expect(snapshot.buffer).toEqual(state.buffer)
    expect(snapshot.statistics).toEqual(state.statistics)
  })

  it('should create deep copies of arrays and objects', () => {
    const state = createInitialState()
    const snapshot = createStateSnapshot(state, 1, 'Test', 'P1')
    
    // Modify original state
    state.semaphores[0].value = 999
    state.processes[0].state = 'running'
    state.buffer[0].occupied = true
    state.statistics.totalItemsProduced = 100
    
    // Snapshot should remain unchanged
    expect(snapshot.semaphores[0].value).not.toBe(999)
    expect(snapshot.processes[0].state).toBe('ready')
    expect(snapshot.buffer[0].occupied).toBe(false)
    expect(snapshot.statistics.totalItemsProduced).toBe(0)
  })
})

describe('Type definitions', () => {
  it('should have correct ProcessId type', () => {
    const processId: ProcessId = 'P1'
    expect(typeof processId).toBe('string')
  })

  it('should have correct Semaphore interface', () => {
    const semaphore: Semaphore = {
      name: 'mutex',
      value: 1,
      waitingQueue: ['P1', 'C1']
    }
    
    expect(semaphore.name).toBe('mutex')
    expect(semaphore.value).toBe(1)
    expect(semaphore.waitingQueue).toEqual(['P1', 'C1'])
  })

  it('should have correct Process interface', () => {
    const process: Process = {
      id: 'P1',
      type: 'producer',
      state: 'waiting',
      currentOperation: 'producing',
      waitingOn: 'empty',
      itemsProcessed: 5,
      totalWaitTime: 1500
    }
    
    expect(process.id).toBe('P1')
    expect(process.type).toBe('producer')
    expect(process.state).toBe('waiting')
    expect(process.currentOperation).toBe('producing')
    expect(process.waitingOn).toBe('empty')
    expect(process.itemsProcessed).toBe(5)
    expect(process.totalWaitTime).toBe(1500)
  })

  it('should have correct BufferSlot interface', () => {
    const emptySlot: BufferSlot = {
      id: 0,
      occupied: false
    }
    
    const occupiedSlot: BufferSlot = {
      id: 1,
      occupied: true,
      item: {
        id: 'item-123',
        producedBy: 'P1',
        timestamp: Date.now()
      }
    }
    
    expect(emptySlot.occupied).toBe(false)
    expect(emptySlot.item).toBeUndefined()
    
    expect(occupiedSlot.occupied).toBe(true)
    expect(occupiedSlot.item).toBeDefined()
    expect(occupiedSlot.item!.producedBy).toBe('P1')
  })
})

describe('Utility functions', () => {
  it('should validate process IDs correctly', () => {
    expect(isValidProcessId('P1')).toBe(true)
    expect(isValidProcessId('C5')).toBe(true)
    expect(isValidProcessId('P10')).toBe(true)
    expect(isValidProcessId('C100')).toBe(true)
    
    expect(isValidProcessId('X1')).toBe(false)
    expect(isValidProcessId('P')).toBe(false)
    expect(isValidProcessId('1P')).toBe(false)
    expect(isValidProcessId('PA')).toBe(false)
    expect(isValidProcessId('')).toBe(false)
  })

  it('should identify producer IDs correctly', () => {
    expect(isProducerId('P1')).toBe(true)
    expect(isProducerId('P10')).toBe(true)
    expect(isProducerId('C1')).toBe(false)
    expect(isProducerId('C10')).toBe(false)
  })

  it('should identify consumer IDs correctly', () => {
    expect(isConsumerId('C1')).toBe(true)
    expect(isConsumerId('C10')).toBe(true)
    expect(isConsumerId('P1')).toBe(false)
    expect(isConsumerId('P10')).toBe(false)
  })

  it('should calculate buffer utilization correctly', () => {
    const emptyBuffer: BufferSlot[] = [
      { id: 0, occupied: false },
      { id: 1, occupied: false },
      { id: 2, occupied: false }
    ]
    
    const partiallyFilledBuffer: BufferSlot[] = [
      { id: 0, occupied: true, item: { id: 'item1', producedBy: 'P1', timestamp: 123 } },
      { id: 1, occupied: false },
      { id: 2, occupied: true, item: { id: 'item2', producedBy: 'P2', timestamp: 456 } }
    ]
    
    const fullBuffer: BufferSlot[] = [
      { id: 0, occupied: true, item: { id: 'item1', producedBy: 'P1', timestamp: 123 } },
      { id: 1, occupied: true, item: { id: 'item2', producedBy: 'P2', timestamp: 456 } }
    ]
    
    expect(calculateBufferUtilization(emptyBuffer)).toBe(0)
    expect(calculateBufferUtilization(partiallyFilledBuffer)).toBeCloseTo(66.67, 1)
    expect(calculateBufferUtilization(fullBuffer)).toBe(100)
    expect(calculateBufferUtilization([])).toBe(0)
  })

  it('should find semaphore by name', () => {
    const state = createInitialState()
    
    const emptySemaphore = getSemaphoreByName(state.semaphores, 'empty')
    const fullSemaphore = getSemaphoreByName(state.semaphores, 'full')
    const mutexSemaphore = getSemaphoreByName(state.semaphores, 'mutex')
    
    expect(emptySemaphore).toBeDefined()
    expect(emptySemaphore!.name).toBe('empty')
    expect(fullSemaphore).toBeDefined()
    expect(fullSemaphore!.name).toBe('full')
    expect(mutexSemaphore).toBeDefined()
    expect(mutexSemaphore!.name).toBe('mutex')
  })

  it('should find process by ID', () => {
    const state = createInitialState()
    
    const producer1 = getProcessById(state.processes, 'P1')
    const consumer1 = getProcessById(state.processes, 'C1')
    const nonExistent = getProcessById(state.processes, 'X1')
    
    expect(producer1).toBeDefined()
    expect(producer1!.id).toBe('P1')
    expect(producer1!.type).toBe('producer')
    
    expect(consumer1).toBeDefined()
    expect(consumer1!.id).toBe('C1')
    expect(consumer1!.type).toBe('consumer')
    
    expect(nonExistent).toBeUndefined()
  })
})