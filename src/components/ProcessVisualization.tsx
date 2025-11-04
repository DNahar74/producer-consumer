import { motion, AnimatePresence } from 'framer-motion';
import { Users, Cpu, Clock, AlertCircle, CheckCircle, Pause } from 'lucide-react';
import type { Process } from '../types/simulation';

interface ProcessVisualizationProps {
  processes: Process[];
}

export const ProcessVisualization: React.FC<ProcessVisualizationProps> = ({
  processes
}) => {
  // Helper function to get process state color
  const getProcessStateColor = (process: Process) => {
    switch (process.state) {
      case 'running':
        return process.type === 'producer' ? 'bg-blue-500' : 'bg-green-500';
      case 'ready':
        return process.type === 'producer' ? 'bg-blue-400' : 'bg-green-400';
      case 'waiting':
      case 'blocked':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  // Helper function to get process background color
  const getProcessBackgroundColor = (process: Process) => {
    const isActive = process.state === 'running';
    const isDimmed = process.state === 'waiting' || process.state === 'blocked';
    
    if (process.type === 'producer') {
      if (isActive) return 'bg-blue-50 border-blue-300 shadow-lg';
      if (isDimmed) return 'bg-gray-50 border-gray-200 opacity-60';
      return 'bg-blue-50 border-blue-200';
    } else {
      if (isActive) return 'bg-green-50 border-green-300 shadow-lg';
      if (isDimmed) return 'bg-gray-50 border-gray-200 opacity-60';
      return 'bg-green-50 border-green-200';
    }
  };

  // Helper function to get process text color
  const getProcessTextColor = (process: Process) => {
    const isDimmed = process.state === 'waiting' || process.state === 'blocked';
    
    if (isDimmed) return 'text-gray-500';
    
    return process.type === 'producer' ? 'text-blue-800' : 'text-green-800';
  };

  // Helper function to get current operation display
  const getCurrentOperationDisplay = (process: Process) => {
    if (!process.currentOperation) {
      return process.state === 'ready' ? 'Ready to work' : 'Idle';
    }

    switch (process.currentOperation) {
      case 'producing':
        return 'Producing item';
      case 'consuming':
        return 'Consuming item';
      case 'waiting_semaphore':
        return `Waiting on ${process.waitingOn || 'semaphore'}`;
      default:
        return 'Unknown operation';
    }
  };

  // Helper function to get state display text
  const getStateDisplayText = (state: string) => {
    switch (state) {
      case 'ready':
        return 'Ready';
      case 'running':
        return 'Running';
      case 'waiting':
        return 'Waiting';
      case 'blocked':
        return 'Blocked';
      default:
        return state;
    }
  };

  // Separate producers and consumers
  const producers = processes.filter(p => p.type === 'producer');
  const consumers = processes.filter(p => p.type === 'consumer');

  return (
    <div className="space-y-8">
      <motion.h3 
        className="text-lg font-bold text-gray-800 flex items-center"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        <Users className="mr-2 h-5 w-5 text-indigo-600" />
        Processes
      </motion.h3>
      
      {/* Producers Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <motion.h4 
          className="text-base font-bold text-blue-700 mb-4 flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-sm"></div>
          Producers ({producers.length})
        </motion.h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {producers.map((process, index) => (
            <motion.div
              key={process.id}
              className={`p-5 border-2 rounded-xl shadow-lg transition-all duration-300 ${getProcessBackgroundColor(process)}`}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ 
                scale: process.state === 'running' ? 1.02 : 1, 
                opacity: 1, 
                y: 0,
                boxShadow: process.state === 'running' 
                  ? "0 10px 25px -5px rgba(59, 130, 246, 0.3)" 
                  : "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 200
              }}
              whileHover={{ 
                scale: process.state === 'running' ? 1.05 : 1.02,
                transition: { duration: 0.2 }
              }}
            >
              {/* Process Header */}
              <div className="flex items-center justify-between mb-4">
                <motion.h5 
                  className={`text-base font-bold ${getProcessTextColor(process)} flex items-center`}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.1 }}
                >
                  <Cpu className="mr-2 h-4 w-4" />
                  {process.id}
                </motion.h5>
                <motion.div
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${getProcessStateColor(process)} shadow-sm`}
                  title={`State: ${getStateDisplayText(process.state)}`}
                  animate={{ 
                    scale: process.state === 'running' ? [1, 1.2, 1] : 1,
                  }}
                  transition={{ 
                    scale: { duration: 1, repeat: process.state === 'running' ? Infinity : 0 }
                  }}
                />
              </div>

              {/* Process State */}
              <motion.div 
                className="mb-4"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <div className={`text-sm font-bold ${getProcessTextColor(process)} flex items-center mb-1`}>
                  {process.state === 'running' && <CheckCircle className="mr-1 h-3 w-3" />}
                  {process.state === 'blocked' && <AlertCircle className="mr-1 h-3 w-3" />}
                  {process.state === 'ready' && <Pause className="mr-1 h-3 w-3" />}
                  State: {getStateDisplayText(process.state)}
                </div>
                <div className={`text-xs ${getProcessTextColor(process)} font-medium`}>
                  {getCurrentOperationDisplay(process)}
                </div>
              </motion.div>

              {/* Process Statistics */}
              <motion.div 
                className="space-y-3 text-xs"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                <div className={`flex justify-between items-center ${getProcessTextColor(process)} bg-white/50 p-2 rounded-lg`}>
                  <span className="flex items-center">
                    <span className="mr-1">📦</span>
                    Items Produced:
                  </span>
                  <motion.span 
                    className="font-bold text-lg"
                    key={process.itemsProcessed}
                    initial={{ scale: 1.2, color: "#059669" }}
                    animate={{ scale: 1, color: "inherit" }}
                    transition={{ duration: 0.3 }}
                  >
                    {process.itemsProcessed}
                  </motion.span>
                </div>
                <div className={`flex justify-between items-center ${getProcessTextColor(process)} bg-white/50 p-2 rounded-lg`}>
                  <span className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    Wait Time:
                  </span>
                  <span className="font-bold">{process.totalWaitTime}ms</span>
                </div>
              </motion.div>

              {/* Waiting Information */}
              <AnimatePresence>
                {process.waitingOn && (
                  <motion.div 
                    className="mt-4 pt-3 border-t border-gray-200"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div 
                      className="text-xs text-yellow-800 bg-gradient-to-r from-yellow-100 to-orange-100 px-3 py-2 rounded-lg font-semibold flex items-center"
                      animate={{ 
                        backgroundColor: ["#FEF3C7", "#FED7AA", "#FEF3C7"],
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                    >
                      <AlertCircle className="mr-1 h-3 w-3" />
                      Waiting on: {process.waitingOn}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Consumers Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.h4 
          className="text-base font-bold text-green-700 mb-4 flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-sm"></div>
          Consumers ({consumers.length})
        </motion.h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {consumers.map((process, index) => (
            <motion.div
              key={process.id}
              className={`p-5 border-2 rounded-xl shadow-lg transition-all duration-300 ${getProcessBackgroundColor(process)}`}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ 
                scale: process.state === 'running' ? 1.02 : 1, 
                opacity: 1, 
                y: 0,
                boxShadow: process.state === 'running' 
                  ? "0 10px 25px -5px rgba(34, 197, 94, 0.3)" 
                  : "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 200
              }}
              whileHover={{ 
                scale: process.state === 'running' ? 1.05 : 1.02,
                transition: { duration: 0.2 }
              }}
            >
              {/* Process Header */}
              <div className="flex items-center justify-between mb-4">
                <motion.h5 
                  className={`text-base font-bold ${getProcessTextColor(process)} flex items-center`}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.1 }}
                >
                  <Cpu className="mr-2 h-4 w-4" />
                  {process.id}
                </motion.h5>
                <motion.div
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${getProcessStateColor(process)} shadow-sm`}
                  title={`State: ${getStateDisplayText(process.state)}`}
                  animate={{ 
                    scale: process.state === 'running' ? [1, 1.2, 1] : 1,
                  }}
                  transition={{ 
                    scale: { duration: 1, repeat: process.state === 'running' ? Infinity : 0 }
                  }}
                />
              </div>

              {/* Process State */}
              <motion.div 
                className="mb-4"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <div className={`text-sm font-bold ${getProcessTextColor(process)} flex items-center mb-1`}>
                  {process.state === 'running' && <CheckCircle className="mr-1 h-3 w-3" />}
                  {process.state === 'blocked' && <AlertCircle className="mr-1 h-3 w-3" />}
                  {process.state === 'ready' && <Pause className="mr-1 h-3 w-3" />}
                  State: {getStateDisplayText(process.state)}
                </div>
                <div className={`text-xs ${getProcessTextColor(process)} font-medium`}>
                  {getCurrentOperationDisplay(process)}
                </div>
              </motion.div>

              {/* Process Statistics */}
              <motion.div 
                className="space-y-3 text-xs"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                <div className={`flex justify-between items-center ${getProcessTextColor(process)} bg-white/50 p-2 rounded-lg`}>
                  <span className="flex items-center">
                    <span className="mr-1">🍽️</span>
                    Items Consumed:
                  </span>
                  <motion.span 
                    className="font-bold text-lg"
                    key={process.itemsProcessed}
                    initial={{ scale: 1.2, color: "#059669" }}
                    animate={{ scale: 1, color: "inherit" }}
                    transition={{ duration: 0.3 }}
                  >
                    {process.itemsProcessed}
                  </motion.span>
                </div>
                <div className={`flex justify-between items-center ${getProcessTextColor(process)} bg-white/50 p-2 rounded-lg`}>
                  <span className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    Wait Time:
                  </span>
                  <span className="font-bold">{process.totalWaitTime}ms</span>
                </div>
              </motion.div>

              {/* Waiting Information */}
              <AnimatePresence>
                {process.waitingOn && (
                  <motion.div 
                    className="mt-4 pt-3 border-t border-gray-200"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div 
                      className="text-xs text-yellow-800 bg-gradient-to-r from-yellow-100 to-orange-100 px-3 py-2 rounded-lg font-semibold flex items-center"
                      animate={{ 
                        backgroundColor: ["#FEF3C7", "#FED7AA", "#FEF3C7"],
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                    >
                      <AlertCircle className="mr-1 h-3 w-3" />
                      Waiting on: {process.waitingOn}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div 
        className="mt-8 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.h4 
          className="text-sm font-bold text-gray-800 mb-4 flex items-center"
          whileHover={{ scale: 1.02 }}
        >
          <span className="mr-2">🏷️</span>
          Process States Legend:
        </motion.h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <motion.div 
            className="flex items-center gap-2 bg-white/70 p-2 rounded-lg"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.9)" }}
          >
            <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
            <span className="font-medium">Running Producer</span>
          </motion.div>
          <motion.div 
            className="flex items-center gap-2 bg-white/70 p-2 rounded-lg"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.9)" }}
          >
            <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
            <span className="font-medium">Running Consumer</span>
          </motion.div>
          <motion.div 
            className="flex items-center gap-2 bg-white/70 p-2 rounded-lg"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.9)" }}
          >
            <div className="w-3 h-3 bg-blue-400 rounded-full shadow-sm"></div>
            <span className="font-medium">Ready Producer</span>
          </motion.div>
          <motion.div 
            className="flex items-center gap-2 bg-white/70 p-2 rounded-lg"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.9)" }}
          >
            <div className="w-3 h-3 bg-green-400 rounded-full shadow-sm"></div>
            <span className="font-medium">Ready Consumer</span>
          </motion.div>
          <motion.div 
            className="flex items-center gap-2 bg-white/70 p-2 rounded-lg"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.9)" }}
          >
            <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm"></div>
            <span className="font-medium">Waiting/Blocked</span>
          </motion.div>
          <motion.div 
            className="flex items-center gap-2 bg-white/70 p-2 rounded-lg"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.9)" }}
          >
            <div className="w-3 h-3 bg-gray-400 rounded-full shadow-sm"></div>
            <span className="font-medium">Inactive</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};