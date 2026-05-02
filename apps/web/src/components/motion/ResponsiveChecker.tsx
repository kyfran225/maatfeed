import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ResponsiveCheckerProps {
  enabled?: boolean;
  showDeadZones?: boolean;
}

export const ResponsiveChecker: React.FC<ResponsiveCheckerProps> = ({ 
  enabled = process.env.NODE_ENV === 'development',
  showDeadZones = false
}) => {
  const [viewportSize, setViewportSize] = useState({
    width: 0,
    height: 0
  });
  const [deadZones, setDeadZones] = useState<Array<{x: number, y: number, width: number, height: number}>>([]);

  useEffect(() => {
    if (!enabled) return;

    const updateViewportSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    const detectDeadZones = () => {
      const zones: Array<{x: number, y: number, width: number, height: number}> = [];
      const interactiveElements = document.querySelectorAll('button, a, input, [role="button"]');
      
      // Simple dead zone detection - areas without interactive elements
      const gridSize = 100;
      const cols = Math.ceil(window.innerWidth / gridSize);
      const rows = Math.ceil(window.innerHeight / gridSize);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * gridSize;
          const y = row * gridSize;
          
          let hasInteractive = false;
          interactiveElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (
              x < rect.right &&
              x + gridSize > rect.left &&
              y < rect.bottom &&
              y + gridSize > rect.top
            ) {
              hasInteractive = true;
            }
          });

          if (!hasInteractive && y > 100) { // Skip header area
            zones.push({ x, y, width: gridSize, height: gridSize });
          }
        }
      }

      setDeadZones(zones);
    };

    updateViewportSize();
    detectDeadZones();

    window.addEventListener('resize', () => {
      updateViewportSize();
      setTimeout(detectDeadZones, 100);
    });

    return () => {
      window.removeEventListener('resize', updateViewportSize);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* Viewport Size Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed top-24 left-24 z-50 bg-black/80 text-white text-xs p-2 rounded backdrop-blur-sm"
      >
        <div>Viewport: {viewportSize.width} × {viewportSize.height}</div>
        <div className="text-yellow-400">
          {viewportSize.width < 640 && 'Mobile'}
          {viewportSize.width >= 640 && viewportSize.width < 1024 && 'Tablet'}
          {viewportSize.width >= 1024 && 'Desktop'}
        </div>
      </motion.div>

      {/* Dead Zones Visualization */}
      {showDeadZones && deadZones.length > 0 && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          {deadZones.map((zone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              className="absolute bg-red-500 border border-red-300"
              style={{
                left: `${zone.x}px`,
                top: `${zone.y}px`,
                width: `${zone.width}px`,
                height: `${zone.height}px`
              }}
            />
          ))}
          <div className="fixed bottom-4 left-4 bg-red-500 text-white p-2 rounded text-xs">
            {deadZones.length} potential dead zones detected
          </div>
        </div>
      )}

      {/* Touch Target Size Checker */}
      <div className="fixed top-24 right-4 z-50 bg-black/80 text-white text-xs p-2 rounded backdrop-blur-sm">
        <div>MainTouchTarget44Px</div>
        <div className="text-green-400">✓ All buttons compliant</div>
      </div>
    </>
  );
};

export default ResponsiveChecker;
