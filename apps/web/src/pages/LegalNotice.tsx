import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function LegalNotice() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Mentions Légales - MAAT FEED</title>
        <meta name="description" content="Mentions légales de MAAT FEED" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Mentions Légales</h1>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Éditeur de la plateforme</h2>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-gray-700 mb-2"><strong>MAAT FEED</strong></p>
                <p className="text-gray-700 mb-2">Plateforme d'intelligence culturelle</p>
                <p className="text-gray-700 mb-2">Forme juridale : [À compléter - SAS/EURL/Auto-entreprise]</p>
                <p className="text-gray-700 mb-2">Capital social : [À compléter]</p>
                <p className="text-gray-700 mb-2">Adresse : [À compléter - Adresse complète]</p>
                <p className="text-gray-700 mb-2">Téléphone : +33 1 XX XX XX XX</p>
                <p className="text-gray-700">Email : contact@maatfeed.com</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>Représentant légal</strong></p>
                <p className="text-gray-700 mb-2">Nom : [À compléter]</p>
                <p className="text-gray-700 mb-2">Fonction : [Gérant/Directeur]</p>
                <p className="text-gray-700">Email : [À compléter]</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Hébergeur</h2>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>Render</strong></p>
                <p className="text-gray-700 mb-2">Service d'hébergement cloud</p>
                <p className="text-gray-700 mb-2">Siège social : [Adresse de Render]</p>
                <p className="text-gray-700 mb-2">Téléphone : [Numéro Render]</p>
                <p className="text-gray-700">Email : support@render.com</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Propriété intellectuelle</h2>
              
              <p className="text-gray-700 mb-4">
                L'ensemble du contenu de MAAT FEED (textes, images, graphismes, logo, icônes, 
                logiciels, etc.) est protégé par le droit d'auteur et les droits de propriété 
                intellectuelle.
              </p>

              <p className="text-gray-700 mb-4">
                Toute reproduction, distribution, modification, adaptation, retransmission ou 
                publication, même partielle, des éléments du site est interdite sans autorisation 
                préalable écrite de MAAT FEED.
              </p>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-gray-700">
                  <strong>Attention</strong> : Toute exploitation non autorisée du site ou de l'un 
                  de ses éléments constitue une contrefaçon sanctionnée par les articles 
                  L335-2 et suivants du Code de la propriété intellectuelle.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Limitation de responsabilité</h2>
              
              <p className="text-gray-700 mb-4">
                MAAT FEED s'efforce de fournir des informations aussi précises que possible, 
                mais ne pourra être tenue responsable des omissions, des inexactitudes ou des 
                carences dans la mise à jour.
              </p>

              <p className="text-gray-700 mb-4">
                Les informations présentes sur le site sont données à titre indicatif et ne 
                sauraient engager la responsabilité de MAAT FEED.
              </p>

              <p className="text-gray-700">
                MAAT FEED ne pourra être tenue responsable de tout dommage direct ou indirect 
                résultant de l'accès ou de l'utilisation du site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Liens hypertextes</h2>
              
              <p className="text-gray-700 mb-4">
                Le site peut contenir des liens hypertextes vers d'autres sites. MAAT FEED 
                décline toute responsabilité quant au contenu de ces sites externes.
              </p>

              <p className="text-gray-700">
                La création de liens hypertextes vers le site nécessite une autorisation 
                préalable écrite de MAAT FEED.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Cookies</h2>
              
              <p className="text-gray-700 mb-4">
                Le site utilise des cookies techniques nécessaires à son bon fonctionnement. 
                Vous pouvez les désactiver dans les paramètres de votre navigateur.
              </p>

              <p className="text-gray-700">
                Pour plus d'informations, consultez notre 
                <a href="/privacy-policy" className="text-blue-600 hover:underline ml-1">
                  politique de confidentialité
                </a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Droit applicable et juridiction</h2>
              
              <p className="text-gray-700 mb-4">
                Les présentes mentions légales sont régies par le droit français. 
                Tout litige relatif à l'interprétation ou à l'exécution des présentes 
                mentions légales relèvera de la compétence des tribunaux français.
              </p>

              <p className="text-gray-700">
                En cas de litige, le consommateur a la possibilité de recourir à une 
                médiation conventionnelle ou à tout mode alternatif de règlement des différends.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. TVA et facturation</h2>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>Informations fiscales</strong></p>
                <p className="text-gray-700 mb-2">Numéro SIRET : [À compléter]</p>
                <p className="text-gray-700 mb-2">Numéro TVA intracommunautaire : [À compléter]</p>
                <p className="text-gray-700 mb-2">Taux de TVA applicable : 20%</p>
                <p className="text-gray-700">Mode de facturation : Électronique</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Contact</h2>
              
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-gray-700 mb-2">
                  <strong>Pour toute question juridique</strong>
                </p>
                <p className="text-gray-700">
                  Email : <a href="mailto:legal@maatfeed.com" className="text-blue-600 hover:underline">legal@maatfeed.com</a><br />
                  Adresse postale : [À compléter]<br />
                  Téléphone : +33 1 XX XX XX XX
                </p>
              </div>
            </section>

            <div className="mt-12 p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                Date de dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
