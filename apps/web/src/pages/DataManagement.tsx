import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Download, Trash2, Edit3, History, Shield, AlertCircle } from 'lucide-react';

export default function DataManagement() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [consentHistory, setConsentHistory] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadConsentHistory();
  }, []);

  const loadConsentHistory = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/gdpr/consent-history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConsentHistory(data.consentHistory);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/gdpr/export', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessage('✅ Vos données seront envoyées par email dans les prochaines minutes.');
      } else {
        setMessage('❌ Erreur lors de l\'export des données.');
      }
    } catch (error) {
      setMessage('❌ Erreur lors de l\'export des données.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/gdpr/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setMessage('✅ Votre compte a été supprimé. Redirection...');
        setTimeout(() => {
          localStorage.clear();
          window.location.href = '/';
        }, 3000);
      } else {
        setMessage('❌ Erreur lors de la suppression du compte.');
      }
    } catch (error) {
      setMessage('❌ Erreur lors de la suppression du compte.');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleRectifyData = async (field: string, newValue: string) => {
    setLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/gdpr/rectify', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ field, newValue })
      });
      
      if (response.ok) {
        setMessage('✅ Vos données ont été mises à jour.');
      } else {
        setMessage('❌ Erreur lors de la mise à jour des données.');
      }
    } catch (error) {
      setMessage('❌ Erreur lors de la mise à jour des données.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawConsent = async (consentType: string) => {
    setLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/gdpr/withdraw-consent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ consentType })
      });
      
      if (response.ok) {
        setMessage('✅ Votre consentement a été retiré.');
        loadConsentHistory();
      } else {
        setMessage('❌ Erreur lors du retrait du consentement.');
      }
    } catch (error) {
      setMessage('❌ Erreur lors du retrait du consentement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Gestion des Données - MAAT FEED</title>
        <meta name="description" content="Gérez vos données personnelles conformément au RGPD" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Gestion de vos Données Personnelles
          </h1>
          <p className="text-gray-600 mb-8">
            Exercez vos droits RGPD : accès, modification, export et suppression de vos données.
          </p>

          {message && (
            <div className={`p-4 rounded-lg mb-6 ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Export des données */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-600" />
                Exporter mes données
              </h2>
              <p className="text-gray-600 mb-4">
                Recevez toutes vos données personnelles au format JSON par email.
              </p>
              <button
                onClick={handleExportData}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Export en cours...' : 'Exporter mes données'}
              </button>
            </div>

            {/* Suppression du compte */}
            <div className="border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-800 mb-3 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                Supprimer mon compte
              </h2>
              <p className="text-gray-600 mb-4">
                Suppression définitive de toutes vos données personnelles.
              </p>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Supprimer mon compte
              </button>
            </div>

            {/* Modification des données */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                Modifier mes données
              </h2>
              <p className="text-gray-600 mb-4">
                Mettez à jour vos informations personnelles.
              </p>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nouveau nom d'affichage"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="displayName"
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('displayName') as HTMLInputElement;
                    if (input.value.trim()) {
                      handleRectifyData('displayName', input.value.trim());
                    }
                  }}
                  disabled={loading}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Mettre à jour
                </button>
              </div>
            </div>

            {/* Historique du consentement */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                Historique du consentement
              </h2>
              <p className="text-gray-600 mb-4">
                Consultez et gérez vos consentements.
              </p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {consentHistory.slice(0, 3).map((consent: any, index) => (
                  <div key={index} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${consent.consentGiven ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {consent.consentType}
                    </span>
                    <span className="ml-2 text-xs">
                      {new Date(consent.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gestion des consentements */}
          <div className="border border-gray-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Gestion des consentements</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-800">Cookies d'analyse</h3>
                  <p className="text-sm text-gray-600">Mesure d'audience et statistiques</p>
                </div>
                <button
                  onClick={() => handleWithdrawConsent('analytics')}
                  disabled={loading}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Retirer
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-800">Cookies marketing</h3>
                  <p className="text-sm text-gray-600">Publicités personnalisées</p>
                </div>
                <button
                  onClick={() => handleWithdrawConsent('marketing')}
                  disabled={loading}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Retirer
                </button>
              </div>
            </div>
          </div>

          {/* Informations importantes */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Vos droits RGPD</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Droit d'accès : savoir quelles données nous avons sur vous</li>
                  <li>• Droit de rectification : corriger vos données inexactes</li>
                  <li>• Droit à l'oubli : demander la suppression de vos données</li>
                  <li>• Droit de portabilité : recevoir vos données dans un format lisible</li>
                  <li>• Droit d'opposition : retirer votre consentement à tout moment</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact DPO */}
          <div className="bg-gray-50 border-l-4 border-gray-400 p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Contact DPO</h3>
            <p className="text-sm text-gray-700">
              Pour toute question concernant vos données personnelles :<br />
              Email : <a href="mailto:dpo@maatfeed.com" className="text-blue-600 hover:underline">dpo@maatfeed.com</a><br />
              Téléphone : +33 1 XX XX XX XX
            </p>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmation de suppression</h3>
            <p className="text-gray-600 mb-6">
              Cette action est irréversible. Toutes vos données personnelles seront définitivement supprimées.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Suppression...' : 'Confirmer la suppression'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
