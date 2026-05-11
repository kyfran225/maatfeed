import React from 'react';

export const FeedLoading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1A1A1A] p-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] border-t-transparent"></div>
      <p className="text-gray-400 mt-4">Chargement du contenu...</p>
    </div>
  );
};
