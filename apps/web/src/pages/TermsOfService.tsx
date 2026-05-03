import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Conditions Générales d'Utilisation - MAAT FEED</title>
        <meta name="description" content="Conditions générales d'utilisation de MAAT FEED" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Conditions Générales d'Utilisation</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Acceptation des conditions</h2>
              
              <p className="text-gray-700 mb-4">
                L'accès et l'utilisation de MAAT FEED (ci-après &quot;l'Application&quot;) sont 
                soumis à l'acceptation sans réserve des présentes conditions générales 
                d'utilisation (ci-après &quot;CGU&quot;).
              </p>

              <p className="text-gray-700">
                En utilisant l'Application, vous reconnaissez avoir lu, compris et accepté 
                de vous conformer à l'ensemble des dispositions des présentes CGU.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Objet du service</h2>
              
              <p className="text-gray-700 mb-4">
                MAAT FEED est une plateforme d'intelligence culturelle qui propose :
              </p>

              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li>Un fil d'actualité personnalisé</li>
                <li>Des débats et discussions communautaires</li>
                <li>Des contenus audio et éducatifs</li>
                <li>Des recommandations basées sur vos intérêts</li>
                <li>Un profil personnalisé</li>
              </ul>

              <p className="text-gray-700">
                Le service est accessible gratuitement aux utilisateurs disposant d'une 
                connexion internet et d'un compte utilisateur.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Inscription et compte utilisateur</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">3.1 Création du compte</h3>
              <p className="text-gray-700 mb-4">
                Pour accéder à certaines fonctionnalités, vous devez créer un compte en 
                fournissant des informations exactes, complètes et à jour.
              </p>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-gray-700">
                  <strong>Important</strong> : Vous êtes seul responsable de la confidentialité 
                  de vos identifiants et de toute activité réalisée depuis votre compte.
                </p>
              </div>

              <h3 className="text-xl font-medium text-gray-800 mb-3">3.2 Vérification de l'email</h3>
              <p className="text-gray-700 mb-4">
                Une adresse email valide est requise pour l'inscription. Un email de 
                confirmation vous sera envoyé pour valider votre compte.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">3.3 Suspension et suppression</h3>
              <p className="text-gray-700">
                MAAT FEED se réserve le droit de suspendre ou supprimer tout compte 
                en cas de violation des présentes CGU ou de la loi.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Règles de conduite</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">4.1 Contenus autorisés</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li>Respect de la dignité humaine</li>
                <li>Absence de discrimination ou de haine</li>
                <li>Respect des opinions divergentes</li>
                <li>Contenus constructifs et pertinents</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">4.2 Contenus interdits</h3>
              <div className="bg-red-50 p-4 rounded-lg mb-4">
                <ul className="list-disc list-inside text-gray-700">
                  <li>Contenus illégaux, haineux ou discriminatoires</li>
                  <li>Harasslement, intimidation ou menaces</li>
                  <li>Contenus à caractère sexuel ou violent</li>
                  <li>Spam, publicité non sollicitée</li>
                  <li>Contenus violant la propriété intellectuelle</li>
                  <li>Informations personnelles de tiers</li>
                </ul>
              </div>

              <h3 className="text-xl font-medium text-gray-800 mb-3">4.3 Modération</h3>
              <p className="text-gray-700">
                MAAT FEED se réserve le droit de modérer, supprimer ou signaler tout 
                contenu ne respectant pas ces règles, sans préavis.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Propriété intellectuelle</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">5.1 Contenu de la plateforme</h3>
              <p className="text-gray-700 mb-4">
                MAAT FEED et ses partenaires détiennent les droits de propriété 
                intellectuelle sur l'ensemble des éléments de l'Application.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">5.2 Contenu utilisateur</h3>
              <p className="text-gray-700 mb-4">
                En publiant du contenu sur MAAT FEED, vous accordez une licence 
                non exclusive d'utilisation, de reproduction et de diffusion de ce contenu.
              </p>

              <p className="text-gray-700">
                Vous gardez la propriété de vos créations mais autorisez MAAT FEED 
                à les utiliser dans le cadre du fonctionnement de la plateforme.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Protection des données</h2>
              
              <p className="text-gray-700 mb-4">
                La collecte et le traitement de vos données personnelles sont régis 
                par notre politique de confidentialité, disponible 
                <a href="/privacy-policy" className="text-blue-600 hover:underline ml-1">
                  ici
                </a>.
              </p>

              <p className="text-gray-700">
                Conformément au RGPD, vous disposez de droits sur vos données 
                (accès, rectification, suppression, portabilité).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Responsabilité</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">7.1 Limitation de responsabilité</h3>
              <p className="text-gray-700 mb-4">
                MAAT FEED ne peut être tenue responsable des dommages directs ou 
                indirects résultant de l'utilisation de l'Application.
              </p>

              <p className="text-gray-700 mb-4">
                Nous ne garantissons pas la disponibilité continue du service ni 
                l'absence d'erreurs ou d'interruptions.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">7.2 Contenu utilisateur</h3>
              <p className="text-gray-700">
                MAAT FEED n'est pas responsable des contenus publiés par les 
                utilisateurs. Chaque utilisateur est seul responsable de ses publications.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Cookies et technologies</h2>
              
              <p className="text-gray-700 mb-4">
                L'Application utilise des cookies techniques nécessaires à son 
                fonctionnement et des cookies de mesure d'audience.
              </p>

              <p className="text-gray-700">
                Vous pouvez gérer vos préférences cookies via les paramètres 
                de votre navigateur ou notre panneau de configuration.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Durée et résiliation</h2>
              
              <p className="text-gray-700 mb-4">
                Les présentes CGU sont conclues pour une durée indéterminée. 
                Vous pouvez résilier votre compte à tout moment via les paramètres 
                de votre profil.
              </p>

              <p className="text-gray-700">
                MAAT FEED se réserve le droit de résilier unilatéralement l'accès 
                au service en cas de violation des CGU.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Évolution des services</h2>
              
              <p className="text-gray-700 mb-4">
                MAAT FEED se réserve le droit de faire évoluer ses services, 
                d'ajouter ou de supprimer des fonctionnalités.
              </p>

              <p className="text-gray-700">
                Les modifications importantes seront notifiées aux utilisateurs 
                par email ou via l'Application.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Litiges</h2>
              
              <p className="text-gray-700 mb-4">
                En cas de litige relatif à l'interprétation ou à l'exécution 
                des présentes CGU, les parties s'efforceront de trouver une 
                solution amiable.
              </p>

              <p className="text-gray-700">
                À défaut d'accord, le litige sera soumis à la compétence des 
                tribunaux français.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. Contact</h2>
              
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-gray-700 mb-2">
                  <strong>Pour toute question sur les CGU</strong>
                </p>
                <p className="text-gray-700">
                  Email : <a href="mailto:legal@maatfeed.com" className="text-blue-600 hover:underline">legal@maatfeed.com</a><br />
                  Service client : <a href="mailto:support@maatfeed.com" className="text-blue-600 hover:underline">support@maatfeed.com</a>
                </p>
              </div>
            </section>

            <div className="mt-12 p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                En utilisant MAAT FEED, vous confirmez avoir lu et accepté 
                l'ensemble des présentes conditions générales d'utilisation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
