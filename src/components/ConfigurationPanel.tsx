import React from 'react';
import type { SimulationConfig } from '../types/simulation';

interface ConfigurationPanelProps {
  config: SimulationConfig;
  onConfigChange: (config: SimulationConfig) => void;
  onStartSimulation: () => void;
  onResetSimulation: () => void;
  isSimulationRunning: boolean;
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  config,
  onConfigChange,
  onStartSimulation,
  onResetSimulation,
  isSimulationRunning
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Configuration</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buffer Size (1-10)
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={config.bufferSize}
            onChange={(e) => onConfigChange({ ...config, bufferSize: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSimulationRunning}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Producer Count (1-5)
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={config.producerCount}
            onChange={(e) => onConfigChange({ ...config, producerCount: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSimulationRunning}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Consumer Count (1-5)
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={config.consumerCount}
            onChange={(e) => onConfigChange({ ...config, consumerCount: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSimulationRunning}
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onStartSimulation}
            disabled={isSimulationRunning}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Start Simulation
          </button>
          <button
            onClick={onResetSimulation}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};