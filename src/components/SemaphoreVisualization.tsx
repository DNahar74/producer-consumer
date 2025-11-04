import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Users, Shield, Key, Clock, Zap } from 'lucide-react';
import type { Semaphore } from '../types/simulation';

interface SemaphoreVisualizationProps {
  semaphores: Semaphore[];
}

export const SemaphoreVisualization: React.FC<SemaphoreVisualizationProps> = ({
  semaphores
}) => {




  return (
    <div className="space-y-8">
      <motion.h3 
        className="text-lg font-bold text-gray-800 flex items-center"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Shield className="mr-2 h-5 w-5 text-indigo-600" />
        </motion.div>
        Semaphore Control System
      </motion.h3>

      {/* Semaphore Overview */}
      <motion.div 
        className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-2xl relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Animated Background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-green-600/20"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            backgroundSize: "200% 200%"
          }}
        />
        
        <div className="relative z-10">
          <h4 className="text-xl font-bold mb-4 flex items-center">
            <Zap className="mr-2 h-6 w-6 text-yellow-400" />
            Synchronization Status
          </h4>
          <div className="grid grid-cols-3 gap-4">
            {semaphores.map((sem, idx) => (
              <motion.div 
                key={sem.name}
                className="text-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.1, type: "spring" }}
              >
                <motion.div
                  className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    sem.value > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  animate={{
                    boxShadow: sem.value > 0 
                      ? [
                          "0 0 0 0 rgba(34, 197, 94, 0.7)",
                          "0 0 0 20px rgba(34, 197, 94, 0)",
                          "0 0 0 0 rgba(34, 197, 94, 0)"
                        ]
                      : [
                          "0 0 0 0 rgba(239, 68, 68, 0.7)",
                          "0 0 0 20px rgba(239, 68, 68, 0)",
                          "0 0 0 0 rgba(239, 68, 68, 0)"
                        ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {sem.value > 0 ? <Unlock className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                </motion.div>
                <div className="text-sm font-semibold capitalize">{sem.name}</div>
                <div className="text-xs opacity-75">{sem.waitingQueue.length} waiting</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* Individual Semaphore Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {semaphores.map((semaphore, index) => (
          <motion.div
            key={semaphore.name}
            className="relative"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.6, 
              delay: index * 0.2,
              type: "spring",
              stiffness: 100
            }}
          >
            {/* Semaphore Lock Mechanism */}
            <motion.div
              className={`relative p-8 rounded-2xl shadow-2xl border-4 overflow-hidden ${
                semaphore.value > 0 
                  ? 'bg-gradient-to-br from-green-100 to-emerald-200 border-green-400' 
                  : 'bg-gradient-to-br from-red-100 to-rose-200 border-red-400'
              }`}
              animate={{
                boxShadow: semaphore.value > 0 
                  ? [
                      "0 10px 30px rgba(34, 197, 94, 0.3)",
                      "0 20px 60px rgba(34, 197, 94, 0.5)",
                      "0 10px 30px rgba(34, 197, 94, 0.3)"
                    ]
                  : [
                      "0 10px 30px rgba(239, 68, 68, 0.3)",
                      "0 20px 60px rgba(239, 68, 68, 0.5)",
                      "0 10px 30px rgba(239, 68, 68, 0.3)"
                    ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.05, rotate: 2 }}
            >
              {/* Animated Background Pattern */}
              <motion.div
                className="absolute inset-0 opacity-10"
                animate={{
                  backgroundImage: semaphore.value > 0 
                    ? [
                        "radial-gradient(circle at 20% 50%, #10b981 0%, transparent 50%)",
                        "radial-gradient(circle at 80% 50%, #10b981 0%, transparent 50%)",
                        "radial-gradient(circle at 20% 50%, #10b981 0%, transparent 50%)"
                      ]
                    : [
                        "radial-gradient(circle at 20% 50%, #ef4444 0%, transparent 50%)",
                        "radial-gradient(circle at 80% 50%, #ef4444 0%, transparent 50%)",
                        "radial-gradient(circle at 20% 50%, #ef4444 0%, transparent 50%)"
                      ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Semaphore Header */}
              <div className="relative z-10 text-center mb-6">
                <motion.h4 
                  className="text-xl font-bold capitalize text-gray-800 mb-2"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.2 + 0.3 }}
                >
                  {semaphore.name} Semaphore
                </motion.h4>
                
                {/* Lock Animation */}
                <motion.div 
                  className="relative w-20 h-20 mx-auto mb-4"
                  animate={{ 
                    rotate: semaphore.value > 0 ? 0 : [0, -10, 10, 0],
                  }}
                  transition={{ 
                    rotate: { duration: 0.5, repeat: semaphore.value === 0 ? Infinity : 0 }
                  }}
                >
                  <motion.div
                    className={`w-full h-full rounded-2xl flex items-center justify-center shadow-xl ${
                      semaphore.value > 0 
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                        : 'bg-gradient-to-br from-red-400 to-rose-500'
                    }`}
                    animate={{
                      scale: semaphore.value > 0 ? [1, 1.1, 1] : [1, 0.9, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <AnimatePresence mode="wait">
                      {semaphore.value > 0 ? (
                        <motion.div
                          key="unlocked"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <Unlock className="h-10 w-10 text-white" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="locked"
                          initial={{ scale: 0, rotate: 180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: -180 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <Lock className="h-10 w-10 text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Key Animation for Unlocked State */}
                  {semaphore.value > 0 && (
                    <motion.div
                      className="absolute -top-2 -right-2"
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{
                        rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                        scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                      }}
                    >
                      <Key className="h-6 w-6 text-yellow-500" />
                    </motion.div>
                  )}
                </motion.div>
              </div>
              {/* Semaphore Value Display */}
              <motion.div 
                className="relative z-10 text-center mb-6"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.2 + 0.4, type: "spring" }}
              >
                <div className="text-sm font-semibold text-gray-700 mb-2">Current Value</div>
                <motion.div
                  className={`text-6xl font-bold ${
                    semaphore.value > 0 ? 'text-green-600' : 'text-red-600'
                  } relative`}
                  key={semaphore.value}
                  initial={{ scale: 2, rotate: 360, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 150, damping: 10 }}
                >
                  {semaphore.value}
                  
                  {/* Value Change Animation */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className={`text-6xl font-bold ${
                      semaphore.value > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {semaphore.value}
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Waiting Queue Visualization */}
              <motion.div 
                className="relative z-10 bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-gray-200"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.2 + 0.5 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-gray-600" />
                    <span className="text-sm font-bold text-gray-700">Waiting Queue</span>
                  </div>
                  <motion.div 
                    className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold"
                    animate={{ scale: semaphore.waitingQueue.length > 0 ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 1, repeat: semaphore.waitingQueue.length > 0 ? Infinity : 0 }}
                  >
                    {semaphore.waitingQueue.length}
                  </motion.div>
                </div>

                <AnimatePresence mode="wait">
                  {semaphore.waitingQueue.length === 0 ? (
                    <motion.div 
                      className="text-center py-4"
                      key="no-waiting"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      </motion.div>
                      <div className="text-sm text-gray-500 font-medium">No processes waiting</div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="space-y-3"
                      key="waiting-queue"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {/* Queue Line Visualization */}
                      <div className="relative">
                        <motion.div 
                          className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 to-red-500"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.5 }}
                        />
                        <div className="flex justify-between items-center relative z-10">
                          {semaphore.waitingQueue.map((processId, queueIndex) => (
                            <motion.div
                              key={`${processId}-${queueIndex}`}
                              className="relative"
                              initial={{ scale: 0, y: -20 }}
                              animate={{ scale: 1, y: 0 }}
                              exit={{ scale: 0, y: 20 }}
                              transition={{ 
                                type: "spring", 
                                stiffness: 200,
                                delay: queueIndex * 0.1
                              }}
                            >
                              <motion.div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-lg ${
                                  processId.startsWith('P')
                                    ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white' 
                                    : 'bg-gradient-to-br from-green-400 to-green-600 text-white'
                                }`}
                                animate={{
                                  y: [0, -5, 0],
                                  boxShadow: [
                                    "0 4px 15px rgba(0, 0, 0, 0.2)",
                                    "0 8px 25px rgba(0, 0, 0, 0.3)",
                                    "0 4px 15px rgba(0, 0, 0, 0.2)"
                                  ]
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  delay: queueIndex * 0.3,
                                  ease: "easeInOut"
                                }}
                                whileHover={{ scale: 1.2, rotate: 10 }}
                              >
                                {processId.slice(-1)}
                              </motion.div>
                              
                              {/* Position indicator */}
                              <motion.div 
                                className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-600 bg-white px-2 py-1 rounded-full shadow-sm"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: queueIndex * 0.1 + 0.3 }}
                              >
                                #{queueIndex + 1}
                              </motion.div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Semaphore Description */}
              <motion.div 
                className="relative z-10 mt-4 p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl border-2 border-indigo-200"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.2 + 0.6 }}
              >
                <div className="text-sm text-gray-800 font-semibold">
                  {semaphore.name === 'empty' && (
                    <motion.div 
                      className="flex items-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.span 
                        className="mr-2 text-lg"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        📦
                      </motion.span>
                      Tracks available buffer slots for producers
                    </motion.div>
                  )}
                  {semaphore.name === 'full' && (
                    <motion.div 
                      className="flex items-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.span 
                        className="mr-2 text-lg"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        📋
                      </motion.span>
                      Tracks occupied buffer slots for consumers
                    </motion.div>
                  )}
                  {semaphore.name === 'mutex' && (
                    <motion.div 
                      className="flex items-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.div
                        className="mr-2"
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      >
                        <Shield className="h-4 w-4 text-indigo-600" />
                      </motion.div>
                      Controls exclusive buffer access (mutual exclusion)
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <motion.div 
        className="mt-8 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.h4 
          className="text-sm font-bold text-gray-800 mb-4 flex items-center"
          whileHover={{ scale: 1.02 }}
        >
          <span className="mr-2">🏷️</span>
          Semaphore Legend:
        </motion.h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <motion.div 
            className="flex items-center gap-2 bg-white/70 p-2 rounded-lg"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.9)" }}
          >
            <Unlock className="h-3 w-3 text-green-500" />
            <span className="font-medium">Available</span>
          </motion.div>
          <motion.div 
            className="flex items-center gap-2 bg-white/70 p-2 rounded-lg"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.9)" }}
          >
            <Lock className="h-3 w-3 text-red-500" />
            <span className="font-medium">Blocked</span>
          </motion.div>
          <motion.div 
            className="flex items-center gap-2 bg-white/70 p-2 rounded-lg"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.9)" }}
          >
            <div className="px-2 py-1 bg-gradient-to-r from-blue-200 to-blue-300 text-blue-800 rounded text-xs font-bold">P</div>
            <span className="font-medium">Producer</span>
          </motion.div>
          <motion.div 
            className="flex items-center gap-2 bg-white/70 p-2 rounded-lg"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.9)" }}
          >
            <div className="px-2 py-1 bg-gradient-to-r from-green-200 to-green-300 text-green-800 rounded text-xs font-bold">C</div>
            <span className="font-medium">Consumer</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};