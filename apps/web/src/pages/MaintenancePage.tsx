import { Helmet } from "react-helmet-async";

export function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Helmet>
        <title>Maintenance - Maatfeed</title>
        <meta name="description" content="Maatfeed est actuellement en maintenance. Nous serons bientôt de retour !" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <img 
              src="/logo-kemet-site.webp" 
              alt="Maatfeed Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Maintenance en cours
          </h1>
          
          <p className="text-gray-600 mb-6">
            Maatfeed est actuellement en maintenance pour améliorer votre expérience. 
            Nous serons bientôt de retour avec de nouvelles fonctionnalités !
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800">
              <strong>Prévue pour :</strong> Quelques heures<br />
              <strong>Statut :</strong> Mises à jour en cours
            </p>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Pour toute question, contactez-nous à :
            </p>
            <a 
              href="mailto:support@maatfeed.com" 
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              support@maatfeed.com
            </a>
          </div>
        </div>
        
        <div className="text-xs text-gray-400 mt-8">
          © 2024 Maatfeed. Tous droits réservés.
        </div>
      </div>
    </div>
  );
}

export default MaintenancePage;
