import { SEO } from "../components/SEO";

export function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <SEO 
        title="Maintenance - Maatfeed"
        description="Maatfeed est actuellement en maintenance. Nous serons bientôt de retour !"
        robots="noindex, nofollow"
      />
      
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
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
