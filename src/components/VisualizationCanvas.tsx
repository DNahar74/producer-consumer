import React from 'react';
import type { Semaphore, Process, BufferSlot, ProcessId } from '../types/simulation';

interface VisualizationCanvasProps {
  semaphores: Semaphore[];
  processes: Process[];
  buffer: BufferSlot[];
  highlightedProcess?: ProcessId;
}

export const VisualizationCanvas: React.FC<VisualizationCanvasProps> = ({
  semaphores,
  processes,
  buffer,
  highlightedProcess
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Producer-Consumer Visualization</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Semaphores Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Semaphores</h3>
          {semaphores.map((semaphore) => (
            <div key={semaphore.name} className="p-3 border rounded-md">
              <div className="font-medium capitalize">{semaphore.name}</div>
              <div className="text-2xl font-bold">{semaphore.value}</div>
              {semaphore.waitingQueue.length > 0 && (
                <div className="text-sm text-gray-600">
                  Waiting: {semaphore.waitingQueue.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Buffer Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Shared Buffer</h3>
          <div className="grid grid-cols-2 gap-2">
            {buffer.map((slot) => (
              <div
                key={slot.id}
                className={`p-3 border rounded-md text-center ${
                  slot.occupied ? 'bg-orange-200' : 'bg-gray-100'
                }`}
              >
                <div className="text-sm">Slot {slot.id}</div>
                {slot.item ? (
                  <div className="text-xs text-gray-600">
                    Item by {slot.item.producedBy}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400">Empty</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Processes Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Processes</h3>
          <div className="space-y-2">
            {processes.map((process) => (
              <div
                key={process.id}
                className={`p-3 border rounded-md ${
                  process.type === 'producer' ? 'bg-blue-50' : 'bg-green-50'
                } ${highlightedProcess === process.id ? 'ring-2 ring-yellow-400' : ''}`}
              >
                <div className="font-medium">{process.id}</div>
                <div className="text-sm capitalize">{process.type}</div>
                <div className="text-sm text-gray-600">State: {process.state}</div>
                {process.currentOperation && (
                  <div className="text-xs text-gray-500">
                    {process.currentOperation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};