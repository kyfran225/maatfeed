import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-h-screen bg-black text-white flex items-center justify-center p-4"
        >
          <div className="max-w-md w-full text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="mb-8"
            >
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold text-white mb-4"
            >
              Oups ! Une erreur est survenue
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 mb-8"
            >
              Nous sommes désolés, mais quelque chose s'est mal passé. 
              Nos équipes ont été notifiées et travaillent à résoudre le problème.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <button
                onClick={this.handleRetry}
                className="w-full flex items-center justify-center px-4 py-3 bg-amber-500 text-black rounded-lg font-medium hover:bg-amber-400 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={this.handleGoBack}
                  className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Accueil
                </button>
              </div>
            </motion.div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <motion.details
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 text-left"
              >
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-400 transition-colors">
                  Détails techniques (développement)
                </summary>
                <div className="mt-4 p-4 bg-gray-900 rounded-lg text-xs text-red-400 overflow-auto max-h-40">
                  <pre>{this.state.error.toString()}</pre>
                  {this.state.errorInfo && (
                    <pre className="mt-2">{this.state.errorInfo.componentStack}</pre>
                  )}
                </div>
              </motion.details>
            )}
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

// Error Boundary simplifié pour les composants individuels
export function SimpleErrorBoundary({ children, fallback }: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={
        fallback || (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">
              Une erreur est survenue lors du chargement de ce composant.
            </p>
          </div>
        )
      }
    >
      {children}
    </ErrorBoundary>
  );
}
