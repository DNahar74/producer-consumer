import { motion, AnimatePresence } from 'framer-motion';
import { Database, Package, PackageOpen } from 'lucide-react';
import type { BufferSlot } from '../types/simulation';

interface BufferVisualizationProps {
  buffer: BufferSlot[];
}

export const BufferVisualization: React.FC<BufferVisualizationProps> = ({
  buffer
}) => {
  return (
    <div className="space-y-6">
      <motion.h3 
        className="text-lg font-bold text-gray-800 flex items-center"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        <Database className="mr-2 h-5 w-5 text-indigo-600" />
        Shared Buffer
      </motion.h3>

      {/* Buffer slots grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {buffer.map((slot, index) => (
          <motion.div
            key={slot.id}
            className={`
              relative p-4 border-2 rounded-xl text-center min-h-[100px] flex flex-col justify-center shadow-lg
              ${slot.occupied 
                ? 'bg-gradient-to-br from-emerald-100 to-green-200 border-emerald-400' 
                : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300'
              }
            `}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: slot.occupied ? 1.05 : 1, 
              opacity: 1,
              boxShadow: slot.occupied 
                ? "0 10px 25px -5px rgba(16, 185, 129, 0.3)" 
                : "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            }}
            transition={{ 
              duration: 0.3, 
              delay: index * 0.05,
              type: "spring",
              stiffness: 200
            }}
            whileHover={{ 
              scale: slot.occupied ? 1.08 : 1.02,
              transition: { duration: 0.2 }
            }}
          >
            {/* Slot number */}
            <motion.div 
              className="text-xs font-bold text-gray-600 mb-2"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 + 0.1 }}
            >
              Slot {slot.id}
            </motion.div>
            
            {/* Slot content */}
            <AnimatePresence mode="wait">
              {slot.occupied && slot.item ? (
                <motion.div 
                  className="space-y-2"
                  key="occupied"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {/* Item indicator */}
                  <motion.div 
                    className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full mx-auto flex items-center justify-center shadow-lg"
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                      scale: { duration: 1, repeat: Infinity, repeatType: "reverse" }
                    }}
                  >
                    <Package className="w-4 h-4 text-white" />
                  </motion.div>
                  
                  {/* Producer info */}
                  <div className="text-xs font-bold text-emerald-700">
                    by {slot.item.producedBy}
                  </div>
                  
                  {/* Item ID */}
                  <div className="text-xs text-gray-600 truncate font-mono" title={slot.item.id}>
                    #{slot.item.id.split('-').pop()}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  className="space-y-2"
                  key="empty"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  {/* Empty slot indicator */}
                  <motion.div 
                    className="w-8 h-8 border-2 border-dashed border-gray-400 rounded-full mx-auto flex items-center justify-center"
                    animate={{ 
                      borderColor: ["#9CA3AF", "#D1D5DB", "#9CA3AF"],
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                  >
                    <PackageOpen className="w-4 h-4 text-gray-400" />
                  </motion.div>
                  
                  {/* Empty label */}
                  <div className="text-xs text-gray-500 font-semibold">
                    Empty
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Buffer statistics */}
      <motion.div 
        className="flex flex-wrap justify-between items-center text-sm text-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border-2 border-indigo-200"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center space-x-6">
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-4 h-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full shadow-sm"></div>
            <span className="font-semibold">Occupied: {buffer.filter(slot => slot.occupied).length}</span>
          </motion.div>
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-4 h-4 border-2 border-dashed border-gray-400 rounded-full"></div>
            <span className="font-semibold">Empty: {buffer.filter(slot => !slot.occupied).length}</span>
          </motion.div>
        </div>
        <motion.div 
          className="font-bold text-indigo-700"
          whileHover={{ scale: 1.05 }}
        >
          Capacity: {buffer.length}
        </motion.div>
      </motion.div>
    </div>
  );
};