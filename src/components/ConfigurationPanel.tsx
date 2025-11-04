import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Settings, Play, RotateCcw, Info } from 'lucide-react';
import type { SimulationConfig } from '../types/simulation';
import { Tooltip } from './Tooltip';
import { useNotifications } from './NotificationSystem';

interface ConfigurationPanelProps {
  config: SimulationConfig;
  onConfigChange: (config: SimulationConfig) => void;
  onStartSimulation: () => void;
  onResetSimulation: () => void;
  isSimulationRunning: boolean;
}

interface ValidationErrors {
  bufferSize?: string;
  producerCount?: string;
  consumerCount?: string;
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  config,
  onConfigChange,
  onStartSimulation,
  onResetSimulation,
  isSimulationRunning
}) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const { addNotification } = useNotifications();

  const validateValue = useCallback((field: keyof SimulationConfig, value: number): string | undefined => {
    if (isNaN(value) || value === null || value === undefined) {
      return `${field} must be a valid number`;
    }

    switch (field) {
      case 'bufferSize':
        if (value < 1 || value > 10) {
          return 'Buffer size must be between 1 and 10';
        }
        break;
      case 'producerCount':
        if (value < 1 || value > 5) {
          return 'Producer count must be between 1 and 5';
        }
        break;
      case 'consumerCount':
        if (value < 1 || value > 5) {
          return 'Consumer count must be between 1 and 5';
        }
        break;
    }
    return undefined;
  }, []);

  const handleInputChange = useCallback((field: keyof SimulationConfig, value: string) => {
    const numValue = parseInt(value);
    const error = validateValue(field, numValue);
    
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));

    // Always update config - let parent handle validation
    // But only if we have a valid number
    if (!isNaN(numValue)) {
      onConfigChange({ ...config, [field]: numValue });
    }
  }, [config, onConfigChange, validateValue]);

  const hasErrors = Object.values(errors).some(error => error !== undefined);
  const isConfigValid = !hasErrors && 
    config.bufferSize >= 1 && config.bufferSize <= 10 &&
    config.producerCount >= 1 && config.producerCount <= 5 &&
    config.consumerCount >= 1 && config.consumerCount <= 5;

  const handleStartSimulation = useCallback(() => {
    try {
      if (!isConfigValid) {
        addNotification({
          type: 'error',
          title: 'Invalid Configuration',
          message: 'Please fix all validation errors before starting the simulation.'
        });
        return;
      }
      onStartSimulation();
      addNotification({
        type: 'success',
        title: 'Simulation Started',
        message: 'The Producer-Consumer simulation is now running.'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to Start Simulation',
        message: 'An unexpected error occurred while starting the simulation.'
      });
    }
  }, [isConfigValid, onStartSimulation, addNotification]);

  const handleResetSimulation = useCallback(() => {
    try {
      onResetSimulation();
      addNotification({
        type: 'info',
        title: 'Simulation Reset',
        message: 'The simulation has been reset to its initial state.'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to Reset Simulation',
        message: 'An unexpected error occurred while resetting the simulation.'
      });
    }
  }, [onResetSimulation, addNotification]);

  return (
    <motion.div 
      className="w-full"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h2 
        className="font-glow-cyan text-xl mb-6 flex items-center"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Settings className="mr-3 h-6 w-6 text-cyan-400" />
        SYSTEM CONFIG
      </motion.h2>
      <div className="space-y-4">
        {/* Buffer Size Input */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center mb-2">
            <label htmlFor="buffer-size-input" className="block text-base font-enhanced">
              Buffer Size
            </label>
            <Tooltip
              content={
                <div>
                  <p className="font-medium mb-1">Shared Buffer Size</p>
                  <p>The number of slots in the shared buffer between producers and consumers.</p>
                  <p className="mt-1 text-xs">• Larger buffers reduce blocking but use more memory</p>
                  <p className="text-xs">• Smaller buffers increase synchronization frequency</p>
                </div>
              }
              position="top"
            >
              <Info className="ml-2 h-4 w-4 text-cyan-400 cursor-help hover:text-cyan-300 transition-colors" />
            </Tooltip>
          </div>
          <motion.input
            id="buffer-size-input"
            type="number"
            min="1"
            max="10"
            value={config.bufferSize}
            onChange={(e) => handleInputChange('bufferSize', e.target.value)}
            className={`input-enhanced w-full rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
              errors.bufferSize 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-400' 
                : 'focus:ring-cyan-500 focus:border-cyan-400'
            }`}
            disabled={isSimulationRunning}
            aria-describedby={errors.bufferSize ? 'buffer-size-error' : undefined}
            whileFocus={{ scale: 1.02 }}
          />
          {errors.bufferSize && (
            <motion.p 
              id="buffer-size-error" 
              className="mt-1 text-sm text-red-400 font-medium" 
              role="alert"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {errors.bufferSize}
            </motion.p>
          )}
        </motion.div>

        {/* Producer Count Input */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center mb-2">
            <label htmlFor="producer-count-input" className="block text-base font-enhanced">
              Producers
            </label>
            <Tooltip
              content={
                <div>
                  <p className="font-medium mb-1">Producer Processes</p>
                  <p>The number of producer processes that will generate items and add them to the buffer.</p>
                  <p className="mt-1 text-xs">• More producers increase item generation rate</p>
                  <p className="text-xs">• May cause more contention for buffer access</p>
                </div>
              }
              position="top"
            >
              <Info className="ml-2 h-4 w-4 text-cyan-400 cursor-help hover:text-cyan-300 transition-colors" />
            </Tooltip>
          </div>
          <motion.input
            id="producer-count-input"
            type="number"
            min="1"
            max="5"
            value={config.producerCount}
            onChange={(e) => handleInputChange('producerCount', e.target.value)}
            className={`input-enhanced w-full rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
              errors.producerCount 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-400' 
                : 'focus:ring-cyan-500 focus:border-cyan-400'
            }`}
            disabled={isSimulationRunning}
            aria-describedby={errors.producerCount ? 'producer-count-error' : undefined}
            whileFocus={{ scale: 1.02 }}
          />
          {errors.producerCount && (
            <motion.p 
              id="producer-count-error" 
              className="mt-1 text-sm text-red-400 font-medium" 
              role="alert"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {errors.producerCount}
            </motion.p>
          )}
        </motion.div>

        {/* Consumer Count Input */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center mb-2">
            <label htmlFor="consumer-count-input" className="block text-base font-enhanced">
              Consumers
            </label>
            <Tooltip
              content={
                <div>
                  <p className="font-medium mb-1">Consumer Processes</p>
                  <p>The number of consumer processes that will remove items from the buffer.</p>
                  <p className="mt-1 text-xs">• More consumers increase item consumption rate</p>
                  <p className="text-xs">• Balance with producers for optimal throughput</p>
                </div>
              }
              position="top"
            >
              <Info className="ml-2 h-4 w-4 text-cyan-400 cursor-help hover:text-cyan-300 transition-colors" />
            </Tooltip>
          </div>
          <motion.input
            id="consumer-count-input"
            type="number"
            min="1"
            max="5"
            value={config.consumerCount}
            onChange={(e) => handleInputChange('consumerCount', e.target.value)}
            className={`input-enhanced w-full rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
              errors.consumerCount 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-400' 
                : 'focus:ring-cyan-500 focus:border-cyan-400'
            }`}
            disabled={isSimulationRunning}
            aria-describedby={errors.consumerCount ? 'consumer-count-error' : undefined}
            whileFocus={{ scale: 1.02 }}
          />
          {errors.consumerCount && (
            <motion.p 
              id="consumer-count-error" 
              className="mt-1 text-sm text-red-400 font-medium" 
              role="alert"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {errors.consumerCount}
            </motion.p>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="flex flex-col gap-3 pt-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            onClick={handleStartSimulation}
            disabled={isSimulationRunning || !isConfigValid}
            className={`btn-enhanced w-full rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 flex items-center justify-center ${
              isSimulationRunning || !isConfigValid
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 focus:ring-green-500 shadow-lg shadow-green-500/25'
            }`}
            aria-label="Start simulation with current configuration"
            whileHover={{ scale: isSimulationRunning || !isConfigValid ? 1 : 1.02 }}
            whileTap={{ scale: isSimulationRunning || !isConfigValid ? 1 : 0.98 }}
          >
            <Play className="mr-2 h-4 w-4" />
            {isSimulationRunning ? 'RUNNING...' : 'START SYSTEM'}
          </motion.button>
          <motion.button
            onClick={handleResetSimulation}
            className="btn-enhanced w-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 flex items-center justify-center"
            aria-label="Reset simulation to initial state"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            RESET
          </motion.button>
        </motion.div>

        {/* Configuration Status */}
        {!isConfigValid && !isSimulationRunning && (
          <motion.div 
            className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <p className="text-sm text-red-300 font-medium">
              Invalid parameters detected. Please correct all values.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};