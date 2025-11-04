import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import type { Semaphore, Process, BufferSlot, ProcessId } from '../types/simulation';
import { SemaphoreVisualization } from './SemaphoreVisualization';
import { BufferVisualization } from './BufferVisualization';
import { ProcessVisualization } from './ProcessVisualization';

interface VisualizationCanvasProps {
  semaphores: Semaphore[];
  processes: Process[];
  buffer: BufferSlot[];
  highlightedProcess?: ProcessId;
}

export const VisualizationCanvas: React.FC<VisualizationCanvasProps> = ({
  semaphores,
  processes,
  buffer
}) => {
  return (
    <motion.div 
      id="visualization-canvas" 
      className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-indigo-100"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h2 
        className="text-xl font-bold mb-6 text-gray-800 flex items-center"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Eye className="mr-2 h-5 w-5 text-indigo-600" />
        Producer-Consumer Visualization
      </motion.h2>
      
      <div className="space-y-8">
        {/* Semaphores Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <SemaphoreVisualization semaphores={semaphores} />
        </motion.div>
        
        {/* Buffer Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <BufferVisualization buffer={buffer} />
        </motion.div>
        
        {/* Processes Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <ProcessVisualization processes={processes} />
        </motion.div>
      </div>
    </motion.div>
  );
};