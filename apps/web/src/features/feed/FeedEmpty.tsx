import React from 'react';

interface FeedEmptyProps {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const FeedEmpty: React.FC<FeedEmptyProps> = ({
  title = "Aucun contenu",
  message = "Commencez par créer du contenu ou explorez ce que les autres partagent",
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1A1A1A] p-4">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 00-2-2m14 0v2a2 2 0 002 2H5a2 2 0 01-2-2v-2a2 2 0 00-2-2z" />
          </svg>
        </div>
        
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-center max-w-md mb-6">{message}</p>
        
        {action && (
          <button
            onClick={action.onClick}
            className="px-6 py-3 bg-[#FF6B35] hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};
