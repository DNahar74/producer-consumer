import React from 'react';

interface AnimationControlsProps {
  isPlaying: boolean;
  canStepForward: boolean;
  canStepBackward: boolean;
  animationSpeed: number;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onSpeedChange: (speed: number) => void;
}

export const AnimationControls: React.FC<AnimationControlsProps> = ({
  isPlaying,
  canStepForward,
  canStepBackward,
  animationSpeed,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onSpeedChange
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Animation Controls</h2>
      <div className="flex items-center space-x-4">
        <button
          onClick={onStepBackward}
          disabled={!canStepBackward}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          ⏮ Step Back
        </button>
        
        <button
          onClick={isPlaying ? onPause : onPlay}
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        
        <button
          onClick={onStepForward}
          disabled={!canStepForward}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Step Forward ⏭
        </button>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Speed:</label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={animationSpeed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="w-20"
          />
          <span className="text-sm">{animationSpeed}x</span>
        </div>
      </div>
    </div>
  );
};