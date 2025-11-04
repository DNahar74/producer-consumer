import { useState } from 'react';
import type { SimulationState } from '../types/simulation';
import {
  generateExecutionTrace,
  traceToJSON,
  traceToText,
  captureScreenshot,
  downloadFile,
  downloadDataUrl,
  generateFilename
} from '../utils/exportUtils';

interface ExportPanelProps {
  simulationState: SimulationState;
}

export function ExportPanel({ simulationState }: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>('');

  const handleScreenshotExport = async () => {
    setIsExporting(true);
    setExportStatus('Capturing screenshot...');
    
    try {
      const dataUrl = await captureScreenshot('visualization-canvas');
      const filename = generateFilename('producer_consumer_screenshot', 'png');
      downloadDataUrl(dataUrl, filename);
      setExportStatus(`Screenshot saved as ${filename}`);
    } catch (error) {
      console.error('Screenshot export failed:', error);
      setExportStatus('Screenshot export failed');
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportStatus(''), 3000);
    }
  };

  const handleTraceExportJSON = () => {
    setIsExporting(true);
    setExportStatus('Generating JSON trace...');
    
    try {
      const trace = generateExecutionTrace(simulationState);
      const jsonData = traceToJSON(trace);
      const filename = generateFilename('producer_consumer_trace', 'json');
      downloadFile(jsonData, filename, 'application/json');
      setExportStatus(`JSON trace saved as ${filename}`);
    } catch (error) {
      console.error('JSON trace export failed:', error);
      setExportStatus('JSON trace export failed');
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportStatus(''), 3000);
    }
  };

  const handleTraceExportText = () => {
    setIsExporting(true);
    setExportStatus('Generating text trace...');
    
    try {
      const trace = generateExecutionTrace(simulationState);
      const textData = traceToText(trace);
      const filename = generateFilename('producer_consumer_trace', 'txt');
      downloadFile(textData, filename, 'text/plain');
      setExportStatus(`Text trace saved as ${filename}`);
    } catch (error) {
      console.error('Text trace export failed:', error);
      setExportStatus('Text trace export failed');
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportStatus(''), 3000);
    }
  };

  const hasExecutionData = simulationState.history.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
      
      <div className="space-y-4">
        {/* Screenshot Export */}
        <div className="border-b border-gray-200 pb-4">
          <h4 className="text-md font-medium text-gray-800 mb-2">Screenshot</h4>
          <p className="text-sm text-gray-600 mb-3">
            Capture the current visualization state as a PNG image.
          </p>
          <button
            onClick={handleScreenshotExport}
            disabled={isExporting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {isExporting ? 'Capturing...' : 'Export Screenshot'}
          </button>
        </div>

        {/* Execution Trace Export */}
        <div className="border-b border-gray-200 pb-4">
          <h4 className="text-md font-medium text-gray-800 mb-2">Execution Trace</h4>
          <p className="text-sm text-gray-600 mb-3">
            Export detailed log of all simulation steps with timestamps, process states, and semaphore values.
          </p>
          
          {!hasExecutionData && (
            <p className="text-sm text-amber-600 mb-3">
              No execution data available. Run the simulation to generate trace data.
            </p>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={handleTraceExportJSON}
              disabled={isExporting || !hasExecutionData}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {isExporting ? 'Exporting...' : 'Export JSON'}
            </button>
            <button
              onClick={handleTraceExportText}
              disabled={isExporting || !hasExecutionData}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {isExporting ? 'Exporting...' : 'Export Text'}
            </button>
          </div>
        </div>

        {/* Export Status */}
        {exportStatus && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
            <p className="text-sm text-gray-700">{exportStatus}</p>
          </div>
        )}

        {/* Export Information */}
        <div className="text-xs text-gray-500">
          <h5 className="font-medium mb-1">Export Information:</h5>
          <ul className="space-y-1">
            <li>• Screenshots capture the current visualization state</li>
            <li>• JSON traces include complete step-by-step execution data</li>
            <li>• Text traces provide human-readable execution logs</li>
            <li>• All exports include timestamps and process information</li>
            {hasExecutionData && (
              <li>• Current simulation has {simulationState.history.length} recorded steps</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}