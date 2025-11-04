import { motion } from 'framer-motion';
import { BarChart3, Clock, Package, Gauge, TrendingUp, Activity } from 'lucide-react';

interface StatisticsPanelProps {
  statistics: {
    totalItemsProduced: number;
    totalItemsConsumed: number;
    bufferUtilization: number;
    averageWaitTime: number;
  };
  currentStep: number;
  startTime: number | null;
}

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
  statistics,
  currentStep,
  startTime
}) => {
  // Calculate execution time
  const executionTime = startTime ? (Date.now() - startTime) / 1000 : 0;
  
  // Calculate throughput (items per second)
  const totalItemsProcessed = statistics.totalItemsProduced + statistics.totalItemsConsumed;
  const throughput = executionTime > 0 ? totalItemsProcessed / executionTime : 0;

  return (
    <motion.div 
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
        <BarChart3 className="mr-2 h-5 w-5 text-indigo-600" />
        Statistics
      </motion.h2>
      
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 shadow-sm"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02, boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.1)" }}
        >
          <div className="text-sm text-gray-600 font-semibold flex items-center mb-1">
            <Activity className="mr-1 h-3 w-3" />
            Current Step
          </div>
          <motion.div 
            className="text-2xl font-bold text-gray-800"
            key={currentStep}
            initial={{ scale: 1.2, color: "#6366f1" }}
            animate={{ scale: 1, color: "#1f2937" }}
            transition={{ duration: 0.3 }}
          >
            {currentStep}
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="p-4 bg-gradient-to-br from-indigo-50 to-purple-100 rounded-xl border-2 border-indigo-200 shadow-sm"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.25 }}
          whileHover={{ scale: 1.02, boxShadow: "0 8px 25px -5px rgba(99, 102, 241, 0.2)" }}
        >
          <div className="text-sm text-indigo-700 font-semibold flex items-center mb-1">
            <Clock className="mr-1 h-3 w-3" />
            Execution Time
          </div>
          <motion.div 
            className="text-2xl font-bold text-indigo-600"
            key={executionTime.toFixed(1)}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {executionTime.toFixed(1)}s
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="p-4 bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl border-2 border-blue-200 shadow-sm"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, boxShadow: "0 8px 25px -5px rgba(59, 130, 246, 0.2)" }}
        >
          <div className="text-sm text-blue-700 font-semibold flex items-center mb-1">
            <Package className="mr-1 h-3 w-3" />
            Items Produced
          </div>
          <motion.div 
            className="text-2xl font-bold text-blue-600"
            key={statistics.totalItemsProduced}
            initial={{ scale: 1.3, color: "#10b981" }}
            animate={{ scale: 1, color: "#2563eb" }}
            transition={{ duration: 0.4, type: "spring" }}
          >
            {statistics.totalItemsProduced}
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border-2 border-green-200 shadow-sm"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.35 }}
          whileHover={{ scale: 1.02, boxShadow: "0 8px 25px -5px rgba(34, 197, 94, 0.2)" }}
        >
          <div className="text-sm text-green-700 font-semibold flex items-center mb-1">
            <span className="mr-1">🍽️</span>
            Items Consumed
          </div>
          <motion.div 
            className="text-2xl font-bold text-green-600"
            key={statistics.totalItemsConsumed}
            initial={{ scale: 1.3, color: "#10b981" }}
            animate={{ scale: 1, color: "#16a34a" }}
            transition={{ duration: 0.4, type: "spring" }}
          >
            {statistics.totalItemsConsumed}
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="p-4 bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl border-2 border-orange-200 shadow-sm"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02, boxShadow: "0 8px 25px -5px rgba(249, 115, 22, 0.2)" }}
        >
          <div className="text-sm text-orange-700 font-semibold flex items-center mb-1">
            <Gauge className="mr-1 h-3 w-3" />
            Buffer Utilization
          </div>
          <motion.div 
            className="text-2xl font-bold text-orange-600"
            key={statistics.bufferUtilization.toFixed(1)}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {statistics.bufferUtilization.toFixed(1)}%
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="p-4 bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl border-2 border-purple-200 shadow-sm"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.45 }}
          whileHover={{ scale: 1.02, boxShadow: "0 8px 25px -5px rgba(147, 51, 234, 0.2)" }}
        >
          <div className="text-sm text-purple-700 font-semibold flex items-center mb-1">
            <Clock className="mr-1 h-3 w-3" />
            Avg Wait Time
          </div>
          <motion.div 
            className="text-2xl font-bold text-purple-600"
            key={statistics.averageWaitTime.toFixed(2)}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {statistics.averageWaitTime.toFixed(2)}ms
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="p-4 bg-gradient-to-br from-teal-50 to-cyan-100 rounded-xl border-2 border-teal-200 shadow-sm col-span-2"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02, boxShadow: "0 8px 25px -5px rgba(20, 184, 166, 0.2)" }}
        >
          <div className="text-sm text-teal-700 font-semibold flex items-center mb-1">
            <TrendingUp className="mr-1 h-4 w-4" />
            Throughput
          </div>
          <motion.div 
            className="text-3xl font-bold text-teal-600"
            key={throughput.toFixed(2)}
            initial={{ scale: 1.2, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.3, type: "spring" }}
          >
            {throughput.toFixed(2)} items/sec
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};