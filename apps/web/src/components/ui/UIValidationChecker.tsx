import { motion } from 'framer-motion';
import { useUIValidation } from '../../hooks/useUIValidation';
import { useState } from 'react';

export const UIValidationChecker = ({ show = false }: { show?: boolean }) => {
  const validationData = useUIValidation();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!show || process.env.NODE_ENV === 'production') {
    return null;
  }

  const severityColors = {
    high: 'bg-red-500/20 border-red-400/50 text-red-400',
    medium: 'bg-yellow-500/20 border-yellow-400/50 text-yellow-400',
    low: 'bg-blue-500/20 border-blue-400/50 text-blue-400'
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return '!';
      case 'medium': return '!';
      case 'low': return 'i';
      default: return '!';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-36 right-4 z-[999]"
    >
      <div className={`backdrop-blur-md rounded-lg border ${
        validationData.hasCriticalIssues ? 'bg-red-500/20 border-red-400/50' : 'bg-black/50 border-white/10'
      } p-3 max-w-sm`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-xs font-medium text-white hover:text-white/80 transition-colors w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              validationData.hasCriticalIssues ? 'bg-red-400' : 'bg-green-400'
            } animate-pulse`} />
            UI Validation
            {validationData.isValidating && (
              <div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className={`px-1.5 py-0.5 rounded text-xs ${
              validationData.totalIssues > 0 ? 'bg-red-500/30 text-red-300' : 'bg-green-500/30 text-green-300'
            }`}>
              {validationData.totalIssues}
            </span>
            <svg 
              className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 space-y-3"
          >
            {/* Summary */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="text-red-400 font-medium">{validationData.getHighSeverityIssues().length}</div>
                <div className="text-white/60">High</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-400 font-medium">{validationData.getMediumSeverityIssues().length}</div>
                <div className="text-white/60">Medium</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-medium">{validationData.getLowSeverityIssues().length}</div>
                <div className="text-white/60">Low</div>
              </div>
            </div>

            {/* Issues List */}
            {validationData.issues.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {validationData.issues.map((issue, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-2 rounded border ${severityColors[issue.severity]}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {getSeverityIcon(issue.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium mb-1 capitalize">
                          {issue.type.replace('-', ' ')}
                        </div>
                        <div className="text-xs opacity-80">
                          {issue.description}
                        </div>
                        {issue.element && (
                          <div className="text-xs opacity-60 mt-1 font-mono">
                            {issue.element}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => validationData.runValidation()}
                disabled={validationData.isValidating}
                className="flex-1 px-2 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs text-white transition-colors"
              >
                {validationData.isValidating ? 'Scanning...' : 'Re-scan'}
              </button>
              <button
                onClick={(event) => {
                  const timestamp = new Date().toISOString();
                  const logs = [
                    `=== UI Validation Logs - ${timestamp} ===`,
                    `Total Issues: ${validationData.totalIssues}`,
                    `High Severity: ${validationData.getHighSeverityIssues().length}`,
                    `Medium Severity: ${validationData.getMediumSeverityIssues().length}`,
                    `Low Severity: ${validationData.getLowSeverityIssues().length}`,
                    '',
                    'Issues Details:',
                    ...validationData.issues.map((issue, index) => 
                      `${index + 1}. [${issue.severity.toUpperCase()}] ${issue.type}: ${issue.description} (Element: ${issue.element})`
                    ),
                    '',
                    '=== End of Logs ==='
                  ].join('\n');
                  
                  navigator.clipboard.writeText(logs).then(() => {
                    // Show feedback
                    const button = event.target as HTMLButtonElement;
                    const originalText = button.textContent;
                    button.textContent = 'Copied!';
                    button.classList.add('bg-green-500/30');
                    setTimeout(() => {
                      button.textContent = originalText;
                      button.classList.remove('bg-green-500/30');
                    }, 2000);
                  }).catch(err => {
                    console.error('Failed to copy logs:', err);
                  });
                }}
                className="flex-1 px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-xs transition-colors"
              >
                Copy Logs
              </button>
              {validationData.hasCriticalIssues && (
                <button
                  onClick={() => {
                    // Focus on first high-severity issue
                    const firstIssue = validationData.getHighSeverityIssues()[0];
                    if (firstIssue?.position) {
                      window.scrollTo({
                        top: firstIssue.position.y - 100,
                        left: firstIssue.position.x - 100,
                        behavior: 'smooth'
                      });
                    }
                  }}
                  className="flex-1 px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs transition-colors"
                >
                  Jump to Issue
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
