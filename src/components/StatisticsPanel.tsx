import React from 'react';

interface StatisticsPanelProps {
  statistics: {
    totalItemsProduced: number;
    totalItemsConsumed: number;
    bufferUtilization: number;
    averageWaitTime: number;
  };
  currentStep: number;
}

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
  statistics,
  currentStep
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Statistics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded-md">
          <div className="text-sm text-gray-600">Current Step</div>
          <div className="text-2xl font-bold">{currentStep}</div>
        </div>
        
        <div className="p-3 bg-blue-50 rounded-md">
          <div className="text-sm text-gray-600">Items Produced</div>
          <div className="text-2xl font-bold text-blue-600">{statistics.totalItemsProduced}</div>
        </div>
        
        <div className="p-3 bg-green-50 rounded-md">
          <div className="text-sm text-gray-600">Items Consumed</div>
          <div className="text-2xl font-bold text-green-600">{statistics.totalItemsConsumed}</div>
        </div>
        
        <div className="p-3 bg-orange-50 rounded-md">
          <div className="text-sm text-gray-600">Buffer Utilization</div>
          <div className="text-2xl font-bold text-orange-600">{statistics.bufferUtilization.toFixed(1)}%</div>
        </div>
        
        <div className="p-3 bg-purple-50 rounded-md col-span-2">
          <div className="text-sm text-gray-600">Average Wait Time</div>
          <div className="text-2xl font-bold text-purple-600">{statistics.averageWaitTime.toFixed(2)}ms</div>
        </div>
      </div>
    </div>
  );
};