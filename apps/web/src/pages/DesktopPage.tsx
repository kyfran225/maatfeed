import React from 'react';
import { DesktopApp } from '../components/desktop/DesktopApp';
import { useResponsive } from '../hooks/useResponsive';

const DesktopPage: React.FC = () => {
  const { isDesktop, isLargeDesktop } = useResponsive();

  // Only render desktop layout on desktop screens
  if (!isDesktop && !isLargeDesktop) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">MAATFEED Desktop</h1>
          <p className="text-white/60 mb-6">
            Cette expérience desktop est optimisée pour les écrans de bureau. 
            Veuillez utiliser un ordinateur pour accéder à toutes les fonctionnalités.
          </p>
          <div className="space-y-2 text-sm text-white/40">
            <p>• Layout multi-panneaux avancé</p>
            <p>• Raccourcis clavier complets</p>
            <p>• Studio créateur professionnel</p>
            <p>• Espace débats immersif</p>
          </div>
        </div>
      </div>
    );
  }

  return <DesktopApp />;
};

export default DesktopPage;
