import { ConfigurationPanel } from './components/ConfigurationPanel';
import { VisualizationCanvas } from './components/VisualizationCanvas';
import { AnimationControls } from './components/AnimationControls';
import { StatisticsPanel } from './components/StatisticsPanel';
import { TimelineControl } from './components/TimelineControl';
import type { SimulationConfig } from './types/simulation';

function App() {
  // Placeholder state - will be replaced with useSimulation hook in task 3
  const mockConfig: SimulationConfig = {
    bufferSize: 5,
    producerCount: 2,
    consumerCount: 2,
    animationSpeed: 1.0
  };

  const mockSemaphores = [
    { name: 'empty' as const, value: 5, waitingQueue: [] },
    { name: 'full' as const, value: 0, waitingQueue: [] },
    { name: 'mutex' as const, value: 1, waitingQueue: [] }
  ];

  const mockProcesses = [
    { id: 'P1', type: 'producer' as const, state: 'ready' as const, itemsProcessed: 0, totalWaitTime: 0 },
    { id: 'P2', type: 'producer' as const, state: 'ready' as const, itemsProcessed: 0, totalWaitTime: 0 },
    { id: 'C1', type: 'consumer' as const, state: 'ready' as const, itemsProcessed: 0, totalWaitTime: 0 },
    { id: 'C2', type: 'consumer' as const, state: 'ready' as const, itemsProcessed: 0, totalWaitTime: 0 }
  ];

  const mockBuffer = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    occupied: false
  }));

  const mockStatistics = {
    totalItemsProduced: 0,
    totalItemsConsumed: 0,
    bufferUtilization: 0,
    averageWaitTime: 0
  };

  // Placeholder handlers - will be replaced with actual simulation logic
  const handleConfigChange = (config: SimulationConfig) => {
    console.log('Config changed:', config);
  };

  const handleStartSimulation = () => {
    console.log('Start simulation');
  };

  const handleResetSimulation = () => {
    console.log('Reset simulation');
  };

  const handlePlay = () => {
    console.log('Play');
  };

  const handlePause = () => {
    console.log('Pause');
  };

  const handleStepForward = () => {
    console.log('Step forward');
  };

  const handleStepBackward = () => {
    console.log('Step backward');
  };

  const handleSpeedChange = (speed: number) => {
    console.log('Speed changed:', speed);
  };

  const handleJumpToStep = (step: number) => {
    console.log('Jump to step:', step);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            Producer-Consumer Problem Visualization
          </h1>
          <p className="text-gray-600 text-center mt-2">
            Interactive demonstration of semaphore-based synchronization
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <ConfigurationPanel
              config={mockConfig}
              onConfigChange={handleConfigChange}
              onStartSimulation={handleStartSimulation}
              onResetSimulation={handleResetSimulation}
              isSimulationRunning={false}
            />
          </div>

          {/* Main Visualization */}
          <div className="lg:col-span-3">
            <VisualizationCanvas
              semaphores={mockSemaphores}
              processes={mockProcesses}
              buffer={mockBuffer}
            />
          </div>

          {/* Animation Controls */}
          <div className="lg:col-span-4">
            <AnimationControls
              isPlaying={false}
              canStepForward={true}
              canStepBackward={false}
              animationSpeed={mockConfig.animationSpeed}
              onPlay={handlePlay}
              onPause={handlePause}
              onStepForward={handleStepForward}
              onStepBackward={handleStepBackward}
              onSpeedChange={handleSpeedChange}
            />
          </div>

          {/* Statistics Panel */}
          <div className="lg:col-span-2">
            <StatisticsPanel
              statistics={mockStatistics}
              currentStep={0}
            />
          </div>

          {/* Timeline Control */}
          <div className="lg:col-span-2">
            <TimelineControl
              currentStep={0}
              totalSteps={0}
              onJumpToStep={handleJumpToStep}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App
