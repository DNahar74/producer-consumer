import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { AnimationControls } from './components/AnimationControls';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BrowserCompatibilityWarning } from './components/BrowserCompatibilityWarning';
import { NotificationProvider } from './components/NotificationSystem';
import { LoadingOverlay } from './components/LoadingSpinner';

import { useSimulation } from './hooks/useSimulation';
import type { SimulationConfig } from './types/simulation';
import './styles/animations.css';

function App() {
  const { state, dispatch } = useSimulation();
  const [isAppLoading, setIsAppLoading] = useState(true);

  // Initialize app
  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Derived state for better UX
  const isSimulationActive = state.isPlaying || state.currentStep > 0;
  const hasSimulationStarted = state.currentStep > 0 || state.history.length > 0;
  const canStepForward = !state.isPlaying && (state.currentStep < state.history.length || !hasSimulationStarted);
  const canStepBackward = !state.isPlaying && state.currentStep > 0;
  
  // Get processes from state
  const processes = state.processes;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case ' ': // Spacebar - play/pause
          event.preventDefault();
          if (state.isPlaying) {
            handlePause();
          } else {
            handlePlay();
          }
          break;
        case 'ArrowRight': // Right arrow - step forward
          event.preventDefault();
          handleStepForward();
          break;
        case 'ArrowLeft': // Left arrow - step backward
          event.preventDefault();
          handleStepBackward();
          break;
        case 'r': // R key - reset
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handleResetSimulation();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [state.isPlaying, canStepForward, canStepBackward]);

  // Event handlers with validation
  const handleConfigChange = (config: SimulationConfig) => {
    if (!state.isPlaying) {
      dispatch({ type: 'SET_CONFIG', payload: config });
    }
  };

  const handleStartSimulation = () => {
    if (!state.isPlaying) {
      dispatch({ type: 'START_SIMULATION' });
    }
  };

  const handleResetSimulation = () => {
    dispatch({ type: 'RESET_SIMULATION' });
  };

  const handlePlay = () => {
    if (!state.isPlaying) {
      dispatch({ type: 'START_SIMULATION' });
    }
  };

  const handlePause = () => {
    if (state.isPlaying) {
      dispatch({ type: 'PAUSE_SIMULATION' });
    }
  };

  const handleStepForward = () => {
    if (canStepForward) {
      dispatch({ type: 'STEP_FORWARD' });
    }
  };

  const handleStepBackward = () => {
    if (canStepBackward) {
      dispatch({ type: 'STEP_BACKWARD' });
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (speed >= 0.5 && speed <= 3.0) {
      dispatch({ type: 'SET_SPEED', payload: speed });
    }
  };



  // Show loading screen during app initialization
  if (isAppLoading) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <LoadingOverlay isLoading={true} message="Initializing Producer-Consumer Visualization...">
          <div></div>
        </LoadingOverlay>
      </motion.div>
    );
  }

  return (
    <ErrorBoundary>
      <NotificationProvider>
        {/* Skip to main content link for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
        >
          Skip to main content
        </a>
        
        <BrowserCompatibilityWarning />
        
        <motion.div 
          className="min-h-screen bg-slate-900 relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #111827 100%)'
          }}
        >
          {/* Scan Line Effect */}
          <div className="scan-line" />
          
          {/* Matrix Rain Effect */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="matrix-char"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
              animate={{
                y: ['0vh', '100vh'],
                opacity: [0, 0.3, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "linear"
              }}
            >
              {String.fromCharCode(0x30A0 + Math.random() * 96)}
            </motion.div>
          ))}
          {/* Enhanced Header */}
          <motion.header 
            className="relative bg-slate-900/80 backdrop-blur-md border-b border-cyan-400/30 shadow-lg" 
            role="banner"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Header background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90"></div>
            
            <div className="relative max-w-full mx-auto px-6 py-6">
              <div className="text-center">
                <motion.div
                  className="flex items-center justify-center mb-4"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse mr-3"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                </motion.div>
                
                <motion.h1 
                  className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  Producer-Consumer
                  <span className="block text-2xl md:text-3xl mt-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    System Monitor
                  </span>
                </motion.h1>
                
                <motion.p 
                  className="text-lg text-slate-300 mt-4 max-w-3xl mx-auto font-medium"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  Real-time visualization of semaphore-based process synchronization
                  <span className="block text-sm text-slate-400 mt-1">
                    Interactive OS concepts demonstration with live monitoring
                  </span>
                </motion.p>
                
                {/* Status indicators */}
                <motion.div 
                  className="flex items-center justify-center space-x-6 mt-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isSimulationActive ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`}></div>
                    <span className="text-sm text-slate-400">
                      {isSimulationActive ? 'Active' : 'Standby'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                    <span className="text-sm text-slate-400">
                      Step {state.currentStep}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
                    <span className="text-sm text-slate-400">
                      {state.buffer.filter(s => s.occupied).length}/{state.buffer.length} Buffer
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.header>

          {/* Enhanced Main Content - Responsive Layout */}
          <motion.main 
            id="main-content" 
            className="flex-1 flex flex-col xl:flex-row overflow-hidden min-h-0" 
            role="main"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* LEFT COLUMN: Configuration & Producers */}
            <motion.div 
              className="w-full xl:w-80 bg-slate-900/60 backdrop-blur-md border-b xl:border-b-0 xl:border-r border-cyan-400/20 flex flex-col shadow-xl overflow-y-auto"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {/* Enhanced Configuration Panel */}
              <div className="p-6 border-b border-cyan-400/20 bg-gradient-to-br from-slate-800/40 to-slate-900/60">
                <ErrorBoundary fallback={
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                    <p className="text-red-300 text-sm">Configuration panel failed to load</p>
                  </div>
                }>
                  <ConfigurationPanel
                    config={state.config}
                    onConfigChange={handleConfigChange}
                    onStartSimulation={handleStartSimulation}
                    onResetSimulation={handleResetSimulation}
                    isSimulationRunning={isSimulationActive}
                  />
                </ErrorBoundary>
              </div>

              {/* Producer Nodes */}
              <div className="flex-1 p-6">
                <h3 className="font-glow-cyan text-xl mb-4 flex items-center">
                  <div className="w-4 h-4 bg-cyan-400 rounded-full mr-3 animate-pulse"></div>
                  PRODUCERS
                </h3>
                <div className="space-y-3">
                  {processes.filter((p: any) => p.type === 'producer').map((process: any, index: number) => (
                    <motion.div
                      key={process.id}
                      className={`
                        relative p-4 rounded-xl border-2 transition-all duration-300 backdrop-blur-sm
                        ${process.state === 'running' 
                          ? 'bg-green-500/20 border-green-400 shadow-lg shadow-green-400/30' 
                          : process.state === 'blocked' || process.state === 'waiting'
                          ? 'bg-red-500/20 border-red-400 shadow-lg shadow-red-400/30'
                          : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
                        }
                      `}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-white text-lg font-semibold">{process.id}</div>
                          <div className={`text-sm font-medium ${
                            process.state === 'running' ? 'text-green-300' :
                            process.state === 'blocked' || process.state === 'waiting' ? 'text-red-300' :
                            'text-slate-300'
                          }`}>
                            {process.state === 'running' ? 'Producing...' :
                             process.state === 'blocked' ? 'Waiting...' :
                             process.state === 'waiting' ? 'Waiting...' : 'Idle'}
                          </div>
                        </div>
                        <motion.div
                          className={`w-5 h-5 rounded-full ${
                            process.state === 'running' ? 'bg-green-400' :
                            process.state === 'blocked' || process.state === 'waiting' ? 'bg-red-400' :
                            'bg-slate-500'
                          }`}
                          animate={{
                            scale: process.state === 'running' ? [1, 1.2, 1] : 1,
                            boxShadow: process.state === 'running' 
                              ? ['0 0 0 0 rgba(74, 222, 128, 0.7)', '0 0 0 10px rgba(74, 222, 128, 0)', '0 0 0 0 rgba(74, 222, 128, 0)']
                              : process.state === 'blocked' || process.state === 'waiting'
                              ? ['0 0 0 0 rgba(239, 68, 68, 0.7)', '0 0 0 10px rgba(239, 68, 68, 0)', '0 0 0 0 rgba(239, 68, 68, 0)']
                              : 'none'
                          }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-slate-300">Items Produced:</span>
                        <span className="text-cyan-400 font-semibold">{process.itemsProcessed}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* CENTER COLUMN: Shared Buffer & Semaphores */}
            <motion.div 
              className="flex-1 bg-slate-900/50 backdrop-blur-sm flex flex-col min-h-0 overflow-y-auto"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {/* Enhanced Semaphore Status */}
              <div className="p-6 border-b border-cyan-400/20 bg-gradient-to-br from-slate-800/30 to-slate-900/50">
                <motion.h3 
                  className="text-2xl mb-6 text-center font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  SEMAPHORE CONTROL SYSTEM
                </motion.h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {state.semaphores.map((semaphore, index) => (
                    <motion.div
                      key={semaphore.name}
                      className="text-center"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.6 + index * 0.1, type: "spring" }}
                    >
                      <div className="text-white text-sm mb-3 uppercase font-semibold tracking-wider">
                        {semaphore.name}
                      </div>
                      <motion.div
                        className={`w-20 h-20 mx-auto rounded-xl flex items-center justify-center border-2 shadow-lg ${
                          semaphore.value > 0 
                            ? 'bg-green-500/20 border-green-400 text-green-400' 
                            : 'bg-red-500/20 border-red-400 text-red-400'
                        }`}
                        animate={{
                          boxShadow: semaphore.value > 0 
                            ? ['0 0 0 0 rgba(74, 222, 128, 0.7)', '0 0 0 20px rgba(74, 222, 128, 0)', '0 0 0 0 rgba(74, 222, 128, 0)']
                            : ['0 0 0 0 rgba(239, 68, 68, 0.7)', '0 0 0 20px rgba(239, 68, 68, 0)', '0 0 0 0 rgba(239, 68, 68, 0)']
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <span className="text-3xl font-bold">{semaphore.value}</span>
                      </motion.div>
                      <div className="text-sm mt-3 text-slate-300">
                        <span className="text-amber-400 font-semibold">{semaphore.waitingQueue.length}</span> waiting
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Enhanced Shared Buffer */}
              <div className="flex-1 p-6 flex flex-col justify-center">
                <motion.h3 
                  className="text-2xl mb-8 text-center font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  SHARED BUFFER
                </motion.h3>
                
                {/* Buffer slots */}
                <div className="flex justify-center items-center space-x-3 mb-8 flex-wrap gap-y-4">
                  {state.buffer.map((slot, index) => (
                    <motion.div
                      key={slot.id}
                      className={`
                        w-20 h-20 rounded-xl border-2 flex items-center justify-center relative transition-all duration-300
                        ${slot.occupied 
                          ? 'bg-purple-500/30 border-purple-400 shadow-lg shadow-purple-400/50' 
                          : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
                        }
                      `}
                      initial={{ scale: 0, y: 50 }}
                      animate={{ 
                        scale: 1, 
                        y: 0,
                        boxShadow: slot.occupied 
                          ? ['0 0 20px rgba(168, 85, 247, 0.5)', '0 0 40px rgba(168, 85, 247, 0.8)', '0 0 20px rgba(168, 85, 247, 0.5)']
                          : 'none'
                      }}
                      transition={{ 
                        delay: 0.8 + index * 0.05,
                        boxShadow: { duration: 2, repeat: slot.occupied ? Infinity : 0 }
                      }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <AnimatePresence>
                        {slot.occupied && slot.item && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
                          >
                            {slot.item.id.split('-').pop()?.slice(-1)}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div className="absolute -bottom-6 text-xs text-slate-400 font-mono">
                        {index}
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Buffer statistics */}
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                >
                  <div className="bg-slate-800/50 rounded-lg p-4 inline-block">
                    <div className="text-sm text-slate-300 mb-1">Buffer Utilization</div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {((state.buffer.filter(s => s.occupied).length / state.buffer.length) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {state.buffer.filter(s => s.occupied).length} / {state.buffer.length} slots occupied
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: Consumers & Statistics */}
            <motion.div 
              className="w-full xl:w-80 bg-slate-900/60 backdrop-blur-md border-t xl:border-t-0 xl:border-l border-cyan-400/20 flex flex-col shadow-xl overflow-y-auto"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {/* Consumer Nodes */}
              <div className="p-6 border-b border-cyan-400/20 bg-gradient-to-br from-slate-800/40 to-slate-900/60">
                <h3 className="font-glow-amber text-xl mb-4 flex items-center">
                  <div className="w-4 h-4 bg-amber-400 rounded-full mr-3 animate-pulse"></div>
                  CONSUMERS
                </h3>
                <div className="space-y-3">
                  {processes.filter((p: any) => p.type === 'consumer').map((process: any, index: number) => (
                    <motion.div
                      key={process.id}
                      className={`
                        relative p-4 rounded-xl border-2 transition-all duration-300 backdrop-blur-sm
                        ${process.state === 'running' 
                          ? 'bg-green-500/20 border-green-400 shadow-lg shadow-green-400/30' 
                          : process.state === 'blocked' || process.state === 'waiting'
                          ? 'bg-red-500/20 border-red-400 shadow-lg shadow-red-400/30'
                          : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
                        }
                      `}
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-white text-lg font-semibold">{process.id}</div>
                          <div className={`text-sm font-medium ${
                            process.state === 'running' ? 'text-green-300' :
                            process.state === 'blocked' || process.state === 'waiting' ? 'text-red-300' :
                            'text-slate-300'
                          }`}>
                            {process.state === 'running' ? 'Consuming...' :
                             process.state === 'blocked' ? 'Waiting...' :
                             process.state === 'waiting' ? 'Waiting...' : 'Idle'}
                          </div>
                        </div>
                        <motion.div
                          className={`w-5 h-5 rounded-full ${
                            process.state === 'running' ? 'bg-green-400' :
                            process.state === 'blocked' || process.state === 'waiting' ? 'bg-red-400' :
                            'bg-slate-500'
                          }`}
                          animate={{
                            scale: process.state === 'running' ? [1, 1.2, 1] : 1,
                            boxShadow: process.state === 'running' 
                              ? ['0 0 0 0 rgba(74, 222, 128, 0.7)', '0 0 0 10px rgba(74, 222, 128, 0)', '0 0 0 0 rgba(74, 222, 128, 0)']
                              : process.state === 'blocked' || process.state === 'waiting'
                              ? ['0 0 0 0 rgba(239, 68, 68, 0.7)', '0 0 0 10px rgba(239, 68, 68, 0)', '0 0 0 0 rgba(239, 68, 68, 0)']
                              : 'none'
                          }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-slate-300">Items Consumed:</span>
                        <span className="text-amber-400 font-semibold">{process.itemsProcessed}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Enhanced Statistics */}
              <div className="flex-1 p-6">
                <h3 className="text-xl mb-6 font-bold text-white">SYSTEM STATISTICS</h3>
                <div className="space-y-4">
                  <motion.div 
                    className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border-2 border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-300"
                    whileHover={{ scale: 1.02, y: -2 }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-slate-300 text-sm font-medium">Items Produced</div>
                        <div className="text-cyan-400 text-2xl font-bold">{state.statistics.totalItemsProduced}</div>
                      </div>
                      <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border-2 border-amber-400/30 hover:border-amber-400/50 transition-all duration-300"
                    whileHover={{ scale: 1.02, y: -2 }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-slate-300 text-sm font-medium">Items Consumed</div>
                        <div className="text-amber-400 text-2xl font-bold">{state.statistics.totalItemsConsumed}</div>
                      </div>
                      <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border-2 border-purple-400/30 hover:border-purple-400/50 transition-all duration-300"
                    whileHover={{ scale: 1.02, y: -2 }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-slate-300 text-sm font-medium">Current Step</div>
                        <div className="text-purple-400 text-2xl font-bold">{state.currentStep}</div>
                      </div>
                      <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                    </div>
                  </motion.div>
                  
                  {/* Performance metrics */}
                  <motion.div 
                    className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border-2 border-green-400/30 hover:border-green-400/50 transition-all duration-300"
                    whileHover={{ scale: 1.02, y: -2 }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-slate-300 text-sm font-medium">Throughput</div>
                        <div className="text-green-400 text-lg font-bold">
                          {state.currentStep > 0 ? (state.statistics.totalItemsConsumed / state.currentStep * 100).toFixed(1) : '0.0'}%
                        </div>
                      </div>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.main>

          {/* Enhanced Floating Animation Controls */}
          <motion.div 
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-6 border-2 border-cyan-400/30 shadow-2xl shadow-cyan-400/10">
              <ErrorBoundary fallback={
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                  <p className="text-red-300 text-sm">Animation controls failed to load</p>
                </div>
              }>
                <AnimationControls
                  isPlaying={state.isPlaying}
                  canStepForward={canStepForward}
                  canStepBackward={canStepBackward}
                  animationSpeed={state.animationSpeed}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onStepForward={handleStepForward}
                  onStepBackward={handleStepBackward}
                  onSpeedChange={handleSpeedChange}
                />
              </ErrorBoundary>
            </div>
          </motion.div>

          {/* Enhanced Footer */}
          <motion.footer 
            className="bg-slate-900/80 backdrop-blur-md border-t border-cyan-400/20 py-3" 
            role="contentinfo"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <div className="px-6">
              <div className="flex flex-col md:flex-row items-center justify-between text-sm">
                <p className="text-slate-300 font-medium">
                  Producer-Consumer System Monitor v2.0
                </p>
                <p className="text-slate-400 mt-1 md:mt-0">
                  Real-time OS Synchronization Visualization
                </p>
                <div className="flex items-center space-x-2 mt-2 md:mt-0">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-slate-400">Live System</span>
                </div>
              </div>
            </div>
          </motion.footer>
        </motion.div>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App
