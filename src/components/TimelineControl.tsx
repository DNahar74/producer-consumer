import React from 'react';

interface TimelineControlProps {
  currentStep: number;
  totalSteps: number;
  onJumpToStep: (step: number) => void;
}

export const TimelineControl: React.FC<TimelineControlProps> = ({
  currentStep,
  totalSteps,
  onJumpToStep
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Timeline</h2>
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Step:</span>
          <input
            type="range"
            min="0"
            max={totalSteps}
            value={currentStep}
            onChange={(e) => onJumpToStep(parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm">{currentStep} / {totalSteps}</span>
        </div>
        
        <div className="text-sm text-gray-600">
          Use the timeline to jump to specific execution points
        </div>
      </div>
    </div>
  );
};