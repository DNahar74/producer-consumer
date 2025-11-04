import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Gauge } from 'lucide-react';

interface AnimationControlsProps {
  isPlaying: boolean;
  canStepForward: boolean;
  canStepBackward: boolean;
  animationSpeed: number;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onSpeedChange: (speed: number) => void;
}

export const AnimationControls: React.FC<AnimationControlsProps> = ({
  isPlaying,
  canStepForward,
  canStepBackward,
  animationSpeed,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onSpeedChange
}) => {
  return (
    <motion.div 
      className="flex items-center space-x-4"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.button
        onClick={onStepBackward}
        disabled={!canStepBackward}
        className={`btn-enhanced rounded-lg transition-all duration-200 flex items-center ${
          canStepBackward 
            ? 'bg-slate-700 hover:bg-slate-600 text-cyan-400 hover:text-cyan-300' 
            : 'bg-slate-800 text-slate-600 cursor-not-allowed'
        }`}
        whileHover={{ scale: canStepBackward ? 1.05 : 1 }}
        whileTap={{ scale: canStepBackward ? 0.95 : 1 }}
      >
        <SkipBack className="h-5 w-5" />
      </motion.button>
      
      <motion.button
        onClick={isPlaying ? onPause : onPlay}
        className={`btn-enhanced rounded-lg transition-all duration-200 flex items-center ${
          isPlaying 
            ? 'bg-red-500 hover:bg-red-600 text-white neon-red' 
            : 'bg-green-500 hover:bg-green-600 text-white neon-green'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isPlaying ? (
          <>
            <Pause className="mr-2 h-5 w-5" />
            PAUSE
          </>
        ) : (
          <>
            <Play className="mr-2 h-5 w-5" />
            PLAY
          </>
        )}
      </motion.button>
      
      <motion.button
        onClick={onStepForward}
        disabled={!canStepForward}
        className={`btn-enhanced rounded-lg transition-all duration-200 flex items-center ${
          canStepForward 
            ? 'bg-slate-700 hover:bg-slate-600 text-cyan-400 hover:text-cyan-300' 
            : 'bg-slate-800 text-slate-600 cursor-not-allowed'
        }`}
        whileHover={{ scale: canStepForward ? 1.05 : 1 }}
        whileTap={{ scale: canStepForward ? 0.95 : 1 }}
      >
        <SkipForward className="h-5 w-5" />
      </motion.button>
      
      <motion.div 
        className="flex items-center space-x-3 bg-high-contrast px-4 py-3 rounded-lg border-2 border-cyan-400/50"
      >
        <Gauge className="h-5 w-5 text-cyan-400" />
        <span className="font-enhanced">Speed:</span>
        <motion.input
          type="range"
          min="0.5"
          max="3"
          step="0.1"
          value={animationSpeed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="w-20 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
          whileHover={{ scale: 1.05 }}
        />
        <motion.span 
          className="font-glow-cyan text-base min-w-[3rem] text-center"
          key={animationSpeed}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {animationSpeed}x
        </motion.span>
      </motion.div>
    </motion.div>
  );
};