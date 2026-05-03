import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Politique de Confidentialité - MAAT FEED</title>
        <meta name="description" content="Politique de confidentialité de MAAT FEED conforme au RGPD" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Politique de Confidentialité</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                MAAT FEED (&quot;l'Application&quot;) s'engage à protéger la vie privée et les données personnelles 
                de ses utilisateurs conformément au Règlement Général sur la Protection des Données (RGPD) 
                et à la législation française applicable.
              </p>
              <p className="text-gray-700">
                Cette politique explique quelles données nous collectons, pourquoi nous les collectons, 
                et comment nous les protégeons.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Données Collectées</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">2.1 Données d'identification</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li>Adresse email</li>
                <li>Mot de passe hashé</li>
                <li>Nom d'affichage (pseudo)</li>
                <li>Adresse IP (lors de la connexion)</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">2.2 Données de profil</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li>Centres d'intérêt et préférences</li>
                <li>Avatar et image de profil</li>
                <li>Historique d'utilisation</li>
                <li>Statistiques d'interaction</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">2.3 Données techniques</h3>
              <ul className="list-disc list-inside text-gray-700">
                <li>Cookies de session</li>
                <li>Jetons d'authentification</li>
                <li>Préférences de navigation</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Base Légale du Traitement</h2>
              
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-gray-700">
                  <strong>Consentement explicite</strong> : Vous consentez activement à la collecte 
                  et au traitement de vos données lors de votre inscription.
                </p>
              </div>

              <ul className="list-disc list-inside text-gray-700">
                <li><strong>Exécution du contrat</strong> : Fournir les services de l'Application</li>
                <li><strong>Intérêt légitime</strong> : Améliorer nos services et sécuriser la plateforme</li>
                <li><strong>Obligation légale</strong> : Respecter les lois et réglementations applicables</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Durée de Conservation</h2>
              
              <table className="min-w-full divide-y divide-gray-200 mb-4">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type de données</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durée de conservation</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">Données de compte</td>
                    <td className="px-6 py-4 text-sm text-gray-700">Jusqu'à suppression du compte</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">Logs de connexion</td>
                    <td className="px-6 py-4 text-sm text-gray-700">12 mois</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">Cookies</td>
                    <td className="px-6 py-4 text-sm text-gray-700">13 mois maximum</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Vos Droits RGPD</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">🔍 Droit d'accès</h3>
                  <p className="text-sm text-gray-700">Savoir quelles données nous avons sur vous</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">✏️ Droit de rectification</h3>
                  <p className="text-sm text-gray-700">Corriger vos données inexactes</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">🗑️ Droit à l'oubli</h3>
                  <p className="text-sm text-gray-700">Demander la suppression de vos données</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">📤 Droit de portabilité</h3>
                  <p className="text-sm text-gray-700">Recevoir vos données dans un format lisible</p>
                </div>
              </div>

              <p className="text-gray-700">
                Pour exercer ces droits, contactez-nous à : 
                <a href="mailto:privacy@maatfeed.com" className="text-blue-600 hover:underline ml-1">
                  privacy@maatfeed.com
                </a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Cookies</h2>
              
              <p className="text-gray-700 mb-4">
                Nous utilisons les cookies suivants :
              </p>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">Cookies essentiels</h3>
                <ul className="list-disc list-inside text-gray-700 text-sm">
                  <li>Authentification et session</li>
                  <li>Sécurité du compte</li>
                  <li>Préférences utilisateur</li>
                </ul>
              </div>

              <p className="text-gray-700">
                Vous pouvez gérer vos préférences cookies via notre 
                <Link to="/cookie-settings" className="text-blue-600 hover:underline ml-1">
                  panneau de configuration des cookies
                </Link>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Sécurité</h2>
              
              <p className="text-gray-700 mb-4">
                Nous mettons en œuvre des mesures de sécurité appropriées :
              </p>
              
              <ul className="list-disc list-inside text-gray-700">
                <li>Chiffrement des mots de passe (bcrypt)</li>
                <li>Connexions HTTPS sécurisées</li>
                <li>Contrôle d'accès strict</li>
                <li>Audits de sécurité réguliers</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Sous-traitants</h2>
              
              <p className="text-gray-700 mb-4">
                Nous partageons certaines données avec des prestataires de confiance :
              </p>

              <ul className="list-disc list-inside text-gray-700">
                <li><strong>Cloudinary</strong> : Hébergement d'images</li>
                <li><strong>Resend</strong> : Service d'emails transactionnels</li>
                <li><strong>MongoDB/Redis</strong> : Base de données et cache</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Contact DPO</h2>
              
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-gray-700 mb-2">
                  <strong>Délégué à la Protection des Données (DPO)</strong>
                </p>
                <p className="text-gray-700">
                  Email : <a href="mailto:dpo@maatfeed.com" className="text-blue-600 hover:underline">dpo@maatfeed.com</a><br />
                  Adresse : MAAT FEED, France<br />
                  Téléphone : +33 1 XX XX XX XX
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Réclamations</h2>
              
              <p className="text-gray-700">
                Si vous estimez que vos droits ne sont pas respectés, vous pouvez :
              </p>
              
              <ol className="list-decimal list-inside text-gray-700 mt-2">
                <li>Nous contacter directement</li>
                <li>Déposer une réclamation auprès de la CNIL</li>
                <li>Saisir le tribunal compétent</li>
              </ol>
            </section>

            <div className="mt-12 p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                Cette politique peut être modifiée. Les changements seront notifiés 
                par email et publiés sur cette page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
