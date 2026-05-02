import { motion } from 'framer-motion';
import { useResponsiveCheck } from '../../hooks/useResponsiveCheck';
import { useState } from 'react';

export const ResponsiveChecker = ({ show = false }: { show?: boolean }) => {
  const responsiveData = useResponsiveCheck();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!show || process.env.NODE_ENV === 'production') {
    return null;
  }

  const hasIssues = responsiveData.issues.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-48 right-4 z-50"
    >
      <div className={`backdrop-blur-md rounded-lg border ${
        hasIssues ? 'bg-red-500/20 border-red-400/50' : 'bg-black/50 border-white/10'
      } p-3 max-w-xs`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-xs font-medium text-white hover:text-white/80 transition-colors"
        >
          <div className={`w-2 h-2 rounded-full ${
            hasIssues ? 'bg-red-400' : 'bg-green-400'
          } animate-pulse`} />
          Responsive {responsiveData.currentBreakpoint}
          <span className="text-white/60">{responsiveData.windowWidth}x{responsiveData.windowHeight}</span>
        </button>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 space-y-2 text-xs"
          >
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-white/60">Breakpoint:</span>
                <span className="text-white font-medium">{responsiveData.currentBreakpoint}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Orientation:</span>
                <span className="text-white font-medium">{responsiveData.orientation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Touch Device:</span>
                <span className={`font-medium ${
                  responsiveData.isTouchDevice ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {responsiveData.isTouchDevice ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            {responsiveData.issues.length > 0 && (
              <div className="pt-2 border-t border-white/10">
                <div className="text-red-400 font-medium mb-1">Issues:</div>
                <ul className="space-y-1">
                  {responsiveData.issues.map((issue, index) => (
                    <li key={index} className="text-red-300 text-xs">
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 border-t border-white/10">
              <div className="text-white/60 mb-1">Breakpoints:</div>
              <div className="grid grid-cols-2 gap-1">
                {responsiveData.breakpoints.map((bp) => (
                  <div
                    key={bp.name}
                    className={`px-2 py-1 rounded text-center ${
                      responsiveData.currentBreakpoint === bp.name
                        ? 'bg-white/20 text-white'
                        : 'bg-white/5 text-white/40'
                    }`}
                  >
                    {bp.name}
                    <div className="text-xs opacity-60">
                      {bp.minWidth}{bp.maxWidth ? `-${bp.maxWidth}` : '+'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
