import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnimatedItem {
  id: string;
  fromProducer: string;
  toSlot: number;
  timestamp: number;
}

interface AnimatedItemFlowProps {
  buffer: any[];
  currentStep: number;
}

export const AnimatedItemFlow: React.FC<AnimatedItemFlowProps> = ({
  buffer,
  currentStep
}) => {
  const [flowingItems, setFlowingItems] = useState<AnimatedItem[]>([]);

  useEffect(() => {
    // Detect new items being produced
    const newItems: AnimatedItem[] = [];
    
    buffer.forEach((slot, index) => {
      if (slot.occupied && slot.item) {
        const existingItem = flowingItems.find(item => item.id === slot.item.id);
        if (!existingItem) {
          newItems.push({
            id: slot.item.id,
            fromProducer: slot.item.producedBy,
            toSlot: index,
            timestamp: Date.now()
          });
        }
      }
    });

    if (newItems.length > 0) {
      setFlowingItems(prev => [...prev, ...newItems]);
      
      // Clean up old items after animation
      setTimeout(() => {
        setFlowingItems(prev => 
          prev.filter(item => !newItems.some(newItem => newItem.id === item.id))
        );
      }, 2000);
    }
  }, [buffer, currentStep]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {flowingItems.map((item) => (
          <motion.div
            key={item.id}
            className="absolute w-4 h-4 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full shadow-lg"
            initial={{
              x: 80, // Start from producer column
              y: 200,
              scale: 0,
              opacity: 0
            }}
            animate={{
              x: [80, 400, 600], // Producer -> Buffer -> Consumer
              y: [200, 200, 200],
              scale: [0, 1, 1, 0],
              opacity: [0, 1, 1, 0],
              boxShadow: [
                "0 0 10px rgba(168, 85, 247, 0.5)",
                "0 0 20px rgba(168, 85, 247, 0.8)",
                "0 0 10px rgba(168, 85, 247, 0.5)"
              ]
            }}
            exit={{
              scale: 0,
              opacity: 0
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              times: [0, 0.3, 0.7, 1]
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};