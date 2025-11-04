# Producer-Consumer Visualization Tool

An interactive web-based animation tool that visualizes the classic Producer-Consumer synchronization problem using semaphores. Built with React, TypeScript, and Vite for educational purposes in operating systems courses.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation & Setup

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd producer-consumer
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Open in browser:**
Navigate to `http://localhost:5173` (or the URL shown in terminal)

### Production Build
```bash
npm run build
npm run preview
```

## 📖 How to Use the Application

### 1. Configuration Panel (Left Side)

**Set Simulation Parameters:**
- **Buffer Size**: Choose buffer capacity (1-10 slots)
- **Producers**: Set number of producer processes (1-5)
- **Consumers**: Set number of consumer processes (1-5)

**Start Simulation:**
- Click "Start Simulation" to begin with current parameters
- Click "Reset" to clear and reconfigure

### 2. Main Visualization Canvas (Center)

The canvas displays three key components:

**Buffer Visualization:**
- Gray slots = empty buffer positions
- Orange slots = occupied with items
- Items show which producer created them

**Process Visualization:**
- Blue circles = Producer processes (P1, P2, etc.)
- Green circles = Consumer processes (C1, C2, etc.)
- Process states indicated by color intensity and labels

**Semaphore Display:**
- **Empty**: Shows available buffer slots (starts at buffer size)
- **Full**: Shows occupied buffer slots (starts at 0)
- **Mutex**: Binary semaphore for critical section access (0 or 1)
- Waiting queues shown below each semaphore

### 3. Animation Controls (Bottom)

**Playback Controls:**
- ▶️ **Play**: Auto-advance simulation at current speed
- ⏸️ **Pause**: Stop auto-playback
- ⏭️ **Step Forward**: Advance one simulation step
- ⏮️ **Step Backward**: Go back one simulation step

**Speed Control:**
- Slider to adjust animation speed (0.5x to 3.0x)
- Slower speeds better for learning, faster for overview

### 4. Timeline Control

**Navigation:**
- Click any point on timeline to jump to that execution state
- Scrub through timeline to see state changes
- Significant events marked on timeline

### 5. Statistics Panel (Right Side)

**Real-time Metrics:**
- **Items Produced**: Total items created by all producers
- **Items Consumed**: Total items processed by all consumers
- **Buffer Utilization**: Percentage of buffer slots occupied
- **Average Wait Time**: How long processes wait for semaphores
- **Current Step**: Current execution step number

### 6. Export Features

**Screenshot Export:**
- Click "Export Screenshot" to save current visualization as PNG
- Useful for presentations and reports

**Execution Trace:**
- Click "Export Trace" to download detailed execution log
- Includes all steps, process states, and semaphore operations
- Available in JSON format

## 🎯 Understanding the Producer-Consumer Problem

### The Problem
Multiple producer processes create items and place them in a shared buffer, while consumer processes remove and process items. Without proper synchronization, race conditions occur.

### Semaphore Solution
Three semaphores coordinate access:

1. **Empty Semaphore**: Tracks available buffer slots
   - Producers wait when buffer is full
   - Decremented when item added, incremented when item removed

2. **Full Semaphore**: Tracks occupied buffer slots  
   - Consumers wait when buffer is empty
   - Incremented when item added, decremented when item removed

3. **Mutex Semaphore**: Ensures mutual exclusion
   - Only one process can access buffer at a time
   - Binary semaphore (0 or 1)

### Process Flow

**Producer Algorithm:**
1. Wait on `empty` semaphore (ensure space available)
2. Wait on `mutex` semaphore (enter critical section)
3. Add item to buffer
4. Signal `mutex` semaphore (exit critical section)
5. Signal `full` semaphore (notify consumers)

**Consumer Algorithm:**
1. Wait on `full` semaphore (ensure item available)
2. Wait on `mutex` semaphore (enter critical section)  
3. Remove item from buffer
4. Signal `mutex` semaphore (exit critical section)
5. Signal `empty` semaphore (notify producers)

## 🎮 Interactive Learning Guide

### Beginner Walkthrough

1. **Start Simple:**
   - Set 1 producer, 1 consumer, buffer size 3
   - Click "Start Simulation"
   - Use step-by-step controls to see each operation

2. **Observe Semaphores:**
   - Watch how semaphore values change with each operation
   - Notice when processes wait in queues
   - See how mutex prevents simultaneous buffer access

3. **Experiment with Parameters:**
   - Try multiple producers with one consumer
   - Try multiple consumers with one producer
   - Observe different buffer sizes

### Advanced Scenarios

1. **Race Conditions:**
   - Set equal producers and consumers
   - Watch for deadlock prevention
   - Observe queue management

2. **Performance Analysis:**
   - Compare throughput with different configurations
   - Analyze wait times and buffer utilization
   - Export traces for detailed analysis

3. **Edge Cases:**
   - Buffer size 1 (immediate handoff)
   - Many producers, few consumers (producer blocking)
   - Many consumers, few producers (consumer blocking)

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui
```

### Test Coverage
- Unit tests for all components
- Integration tests for simulation workflows
- Cross-browser compatibility tests
- Responsive design tests

## 🛠️ Development

### Project Structure
```
src/
├── components/          # React components
│   ├── AnimationControls.tsx
│   ├── BufferVisualization.tsx
│   ├── ConfigurationPanel.tsx
│   ├── ProcessVisualization.tsx
│   ├── SemaphoreVisualization.tsx
│   ├── StatisticsPanel.tsx
│   ├── TimelineControl.tsx
│   └── VisualizationCanvas.tsx
├── hooks/              # Custom React hooks
│   └── useSimulation.ts
├── types/              # TypeScript type definitions
│   └── simulation.ts
├── utils/              # Utility functions
│   ├── browserSupport.ts
│   └── exportUtils.ts
├── styles/             # CSS and animations
│   └── animations.css
└── App.tsx            # Main application component
```

### Key Technologies
- **React 19**: UI framework with functional components
- **TypeScript**: Type safety and better development experience
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **Vitest**: Fast unit testing framework
- **Testing Library**: React component testing utilities

### Code Style
- Functional components with hooks
- TypeScript strict mode enabled
- ESLint for code quality
- Tailwind for all styling

## 🌐 Browser Support

**Fully Supported:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Features:**
- Responsive design for desktop and tablet
- Touch-friendly controls
- Keyboard navigation support
- High contrast mode compatibility

## 📚 Educational Use

### For Students
- Step through algorithm execution at your own pace
- Visualize abstract synchronization concepts
- Experiment with different scenarios safely
- Export results for assignments and reports

### For Educators  
- Demonstrate Producer-Consumer problem interactively
- Show impact of different parameter configurations
- Use exported screenshots in presentations
- Assign exploration exercises with specific parameters

### Learning Objectives
- Understand semaphore-based synchronization
- Recognize race conditions and their solutions
- Analyze algorithm performance characteristics
- Visualize concurrent process interactions

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**Application won't start:**
- Ensure Node.js 18+ is installed
- Run `npm install` to install dependencies
- Check for port conflicts (default: 5173)

**Animations are choppy:**
- Reduce animation speed
- Close other browser tabs
- Check browser performance settings

**Export not working:**
- Ensure browser allows downloads
- Check popup blockers
- Try different export format

**Browser compatibility:**
- Update to supported browser version
- Enable JavaScript
- Clear browser cache

### Performance Tips
- Use smaller buffer sizes for smoother animations
- Reduce number of processes for better performance
- Close unnecessary browser tabs
- Use Chrome or Firefox for best performance

---

**Happy Learning! 🎓**

For questions or issues, please open a GitHub issue or contact the development team.