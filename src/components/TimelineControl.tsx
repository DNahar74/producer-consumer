import React from 'react';

interface TimelineControlProps {
  currentStep: number;
  totalSteps: number;
  onJumpToStep: (step: number) => void;
  history?: Array<{
    stepNumber: number;
    action: string;
    processId: string;
  }>;
}

export function TimelineControl({ 
  currentStep, 
  totalSteps, 
  onJumpToStep,
  history = []
}: TimelineControlProps) {
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const step = parseInt(event.target.value, 10);
    onJumpToStep(step);
  };

  const handleTimelineClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const targetStep = Math.round(percentage * totalSteps);
    const clampedStep = Math.max(0, Math.min(totalSteps, targetStep));
    onJumpToStep(clampedStep);
  };

  // Determine if an event is significant (semaphore operations, context switches)
  const isSignificantEvent = (action: string): boolean => {
    return action.includes('acquired') || 
           action.includes('produced') || 
           action.includes('consumed') || 
           action.includes('waiting');
  };

  // Get marker position as percentage
  const getMarkerPosition = (stepNumber: number): number => {
    if (totalSteps === 0) return 0;
    return (stepNumber / totalSteps) * 100;
  };

  // Get current position as percentage
  const getCurrentPosition = (): number => {
    if (totalSteps === 0) return 0;
    return (currentStep / totalSteps) * 100;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Timeline Control</h3>
      
      {/* Step Information */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-600">
          Step {currentStep} of {totalSteps}
        </span>
        {history[currentStep - 1] && (
          <span className="text-sm text-blue-600 font-medium">
            {history[currentStep - 1].action}
          </span>
        )}
      </div>

      {/* Interactive Timeline */}
      <div className="mb-4">
        <div 
          className="relative h-8 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300 transition-colors duration-200"
          onClick={handleTimelineClick}
          role="button"
          tabIndex={0}
          aria-label="Timeline navigation"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleTimelineClick(e as any);
            }
          }}
        >
          {/* Progress Track */}
          <div 
            className="absolute top-0 left-0 h-full bg-blue-500 rounded-lg transition-all duration-300 ease-in-out"
            style={{ width: `${getCurrentPosition()}%` }}
          />
          
          {/* Significant Event Markers */}
          {history.map((snapshot) => {
            if (!isSignificantEvent(snapshot.action)) return null;
            
            return (
              <div
                key={`marker-${snapshot.stepNumber}`}
                className="absolute top-1 w-1.5 h-6 bg-yellow-400 rounded-full shadow-sm hover:bg-yellow-500 transition-colors duration-200"
                style={{ left: `${getMarkerPosition(snapshot.stepNumber)}%` }}
                title={`Step ${snapshot.stepNumber}: ${snapshot.action}`}
              />
            );
          })}
          
          {/* Current Position Indicator */}
          <div
            className="absolute top-0 w-4 h-8 bg-blue-700 rounded-lg shadow-md transform -translate-x-2 transition-all duration-300 ease-in-out hover:bg-blue-800"
            style={{ left: `${getCurrentPosition()}%` }}
            title={`Current step: ${currentStep}`}
          />
        </div>
      </div>

      {/* Range Slider */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max={totalSteps}
          value={currentStep}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          disabled={totalSteps === 0}
          aria-label="Timeline slider"
        />
      </div>

      {/* Quick Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => onJumpToStep(0)}
          disabled={currentStep === 0}
          className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
          aria-label="Jump to beginning"
        >
          ⏮ Start
        </button>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onJumpToStep(Math.max(0, currentStep - 10))}
            disabled={currentStep === 0}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            aria-label="Jump back 10 steps"
          >
            -10
          </button>
          
          <button
            onClick={() => onJumpToStep(Math.min(totalSteps, currentStep + 10))}
            disabled={currentStep === totalSteps}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            aria-label="Jump forward 10 steps"
          >
            +10
          </button>
        </div>
        
        <button
          onClick={() => onJumpToStep(totalSteps)}
          disabled={currentStep === totalSteps}
          className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
          aria-label="Jump to end"
        >
          End ⏭
        </button>
      </div>

      {/* Event Legend */}
      {history.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span>Significant Events</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-700 rounded-full"></div>
              <span>Current Position</span>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}