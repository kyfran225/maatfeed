import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Wifi, Home, Search } from 'lucide-react';
import { ReactNode } from 'react';

interface EnhancedErrorStateProps {
  message?: string;
  type?: 'network' | 'content' | 'auth' | 'general';
  onRetry?: () => void;
  onGoHome?: () => void;
  showDetails?: boolean;
  details?: string;
}

export const EnhancedErrorState: React.FC<EnhancedErrorStateProps> = ({
  message = 'Une erreur est survenue',
  type = 'general',
  onRetry,
  onGoHome,
  showDetails = false,
  details
}) => {
  const typeConfig = {
    network: {
      icon: Wifi,
      color: 'from-red-500 to-orange-500',
      title: 'Erreur de connexion',
      suggestions: [
        'Vérifiez votre connexion internet',
        'Essayez de rafraîchir la page',
        'Réessayez plus tard'
      ]
    },
    content: {
      icon: AlertTriangle,
      color: 'from-yellow-500 to-red-500',
      title: 'Erreur de contenu',
      suggestions: [
        'Le contenu demandé est indisponible',
        'Essayez de rechercher autre chose',
        'Contactez le support si le problème persiste'
      ]
    },
    auth: {
      icon: AlertTriangle,
      color: 'from-indigo-500 to-purple-500',
      title: 'Erreur d\'authentification',
      suggestions: [
        'Vérifiez vos identifiants',
        'Essayez de vous reconnecter',
        'Réinitialisez votre mot de passe'
      ]
    },
    general: {
      icon: AlertTriangle,
      color: 'from-gray-500 to-red-500',
      title: 'Erreur inattendue',
      suggestions: [
        'Réessayez l\'opération',
        'Rafraîchissez la page',
        'Contactez le support technique'
      ]
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center"
    >
      {/* Error Icon with Animation */}
      <motion.div
        className={`w-20 h-20 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center mb-6`}
        animate={{
          rotate: [0, -5, 5, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{
          rotate: { duration: 0.5, repeat: 3, repeatDelay: 2 },
          scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        }}
      >
        <Icon className="w-10 h-10 text-white" />
      </motion.div>

      {/* Error Title and Message */}
      <motion.div
        className="mb-6 max-w-md"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-white mb-3">{config.title}</h2>
        <p className="text-sand/70 text-lg">{message}</p>
      </motion.div>

      {/* Suggestions */}
      <motion.div
        className="mb-8 max-w-md"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-sm font-medium text-sand/50 mb-3 uppercase tracking-wide">Suggestions</h3>
        <ul className="space-y-2 text-left">
          {config.suggestions.map((suggestion, index) => (
            <motion.li
              key={index}
              className="flex items-start gap-2 text-sand/60 text-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
              <span>{suggestion}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className="flex flex-col sm:flex-row gap-3 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {onRetry && (
          <motion.button
            onClick={onRetry}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center gap-2 min-w-[140px]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </motion.button>
        )}
        
        {onGoHome && (
          <motion.button
            onClick={onGoHome}
            className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/20 transition-all duration-200 flex items-center justify-center gap-2 min-w-[140px]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Home className="w-4 h-4" />
            Accueil
          </motion.button>
        )}
      </motion.div>

      {/* Error Details (Development) */}
      {showDetails && details && process.env.NODE_ENV === 'development' && (
        <motion.details
          className="max-w-md w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <summary className="text-xs text-sand/50 cursor-pointer hover:text-sand/70 transition-colors mb-2">
            Détails techniques
          </summary>
          <motion.div
            className="bg-black/50 rounded-lg p-3 text-left"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <pre className="text-xs text-red-400 font-mono whitespace-pre-wrap break-all">
              {details}
            </pre>
          </motion.div>
        </motion.details>
      )}

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1
          }}
        />
      </div>
    </motion.div>
  );
};

export default EnhancedErrorState;
