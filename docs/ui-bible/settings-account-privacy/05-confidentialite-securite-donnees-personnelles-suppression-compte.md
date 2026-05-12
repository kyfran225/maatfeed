# 5. CONFIDENTIALITÉ, SÉCURITÉ, DONNÉES PERSONNELLES & SUPPRESSION COMPTE

## 1. OBJECTIF UX

Cette section doit permettre à l'utilisateur de comprendre et contrôler sa confidentialité, sa sécurité et ses données personnelles.
Elle couvre :

- visibilité du profil ;
- activité visible ;
- blocage/mute ;
- sessions connectées ;
- mot de passe ;
- vérification email ;
- export des données ;
- suppression compte ;
- consentements ;
- personnalisation IA.

L'objectif est la confiance radicalement claire.

## 2. ÉMOTION RECHERCHÉE

L'utilisateur doit ressentir :

- sécurité ;
- transparence ;
- respect ;
- absence de manipulation ;
- contrôle réel.

Les options sensibles doivent être écrites comme des engagements, pas comme des pièges juridiques.

## 3. STRUCTURE VISUELLE GLOBALE

Groupes :

- Confidentialité du profil ;
- Activité ;
- Interactions ;
- Sécurité du compte ;
- Données personnelles ;
- Personnalisation IA ;
- Zone critique.

La zone critique doit être isolée visuellement en bas.

## 4. LAYOUT EXACT

Mobile :

- cartes séparées ;
- descriptions courtes ;
- badges public/privé ;
- sous-pages pour détails sensibles ;
- confirmation pleine page pour suppression.

Sécurité :

- état global en carte ;
- recommandations simples ;
- sessions listées.

## 5. HIERARCHIE VISUELLE

Priorité :

- visibilité profil ;
- interactions sociales ;
- sécurité connexion ;
- données ;
- IA/personnalisation ;
- suppression compte.

Ne jamais mettre suppression compte en haut.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Visibilité :

- haut de section confidentialité ;
- choix : public, limité, privé selon modèle produit.

Sécurité :

- milieu de page ;
- carte état "Compte protégé" ou "Action recommandée".

Données :

- bas de page ;
- export avant suppression.

Suppression :

- dernière section ;
- carte danger isolée.

## 7. DIMENSIONS & ESPACEMENTS

Cartes sensibles :

- padding 18 à 20 px ;
- radius 22 px ;
- marge supérieure 24 px ;
- bordure rouge argile faible pour zone critique.

Lignes sécurité :

- hauteur 60 à 72 px ;
- descriptions sur deux lignes maximum.

## 8. COULEURS

Confidentialité :

- public : ambre ;
- privé : gris chaud ;
- sécurisé : vert discret ;
- attention : ambre foncé ;
- danger : rouge argile.

Ne jamais utiliser un rouge criard sauf impossibilité absolue.

## 9. TYPOGRAPHIE

Libellés :

- "Profil public"
- "Afficher mon activité"
- "Qui peut me mentionner"
- "Utilisateurs masqués"
- "Sessions connectées"
- "Exporter mes données"
- "Supprimer mon compte"

Descriptions courtes et concrètes.

## 10. BOUTONS

Boutons :

- "Gérer la visibilité"
- "Voir les sessions"
- "Changer le mot de passe"
- "Exporter mes données"
- "Désactiver temporairement"
- "Supprimer définitivement"

Suppression :

- bouton rouge argile ;
- confirmation claire ;
- délai ou explication selon produit ;
- jamais action immédiate en un tap.

## 11. CARTES

Carte confidentialité :

- statut profil ;
- activité visible ;
- mentions ;
- interactions.

Carte sécurité :

- email vérifié ;
- mot de passe ;
- sessions ;
- activité suspecte.

Carte données :

- export ;
- historique ;
- personnalisation ;
- consentements.

Carte danger :

- désactivation ;
- suppression ;
- conséquences.

## 12. ICONOGRAPHIE

Icônes :

- bouclier ;
- cadenas ;
- œil ;
- œil barré ;
- clé ;
- fichier ;
- téléchargement ;
- alerte ;
- corbeille.

La corbeille doit être réservée aux actions réellement destructrices.

## 13. COMPORTEMENT SCROLL

Les sections sensibles doivent laisser respirer l'utilisateur.
Règles :

- pas de suppression visible juste après un switch ordinaire ;
- confirmation sur nouvelle page ou modal forte ;
- retour facile ;
- aucun scroll piégeux.

## 14. ANIMATIONS

Animations :

- changement confidentialité avec transition douce ;
- sécurité validée avec check ;
- alerte avec apparition calme ;
- suppression avec écran de confirmation sobre.

Pas d'animation dramatique.

## 15. MICRO INTERACTIONS

Micro-interactions :

- tap "public/privé" ouvre explication ;
- session déconnectée confirme ;
- export demandé affiche état ;
- suppression nécessite phrase ou double confirmation selon gravité ;
- données IA désactivées avec feedback clair.

## 16. GESTURES MOBILE

Gestes :

- tap simple ;
- swipe retour ;
- aucune suppression par swipe ;
- aucune action sécurité critique par gesture cachée.

## 17. ÉTATS LOADING

Loading sécurité :

- skeleton sessions ;
- état compte affiché rapidement ;
- export peut afficher "préparation" ;
- suppression jamais masquée derrière un simple loader.

## 18. ÉTATS ERREUR

Erreurs :

- mot de passe incorrect ;
- session expirée ;
- export impossible ;
- suppression impossible temporairement ;
- email non vérifié.

Chaque message doit être précis mais non technique.

## 19. ÉTATS OFFLINE

Offline :

- consultation préférences possible ;
- changement sécurité sensible bloqué ;
- export indisponible ;
- suppression indisponible ;
- confidentialité locale modifiable en attente si approprié.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Mobile :

- parcours guidé ;
- confirmations plein écran.

Tablette :

- sections en deux colonnes possibles.

Desktop :

- sécurité avec panneau sessions ;
- détails données plus visibles.

## 21. ACCESSIBILITÉ

Critique :

- confirmations lisibles ;
- boutons danger annoncés ;
- pas de couleur seule ;
- focus clair ;
- descriptions complètes pour suppression.

## 22. PERFORMANCE UX

Sécurité :

- charger seulement informations nécessaires ;
- sessions paginées si nombreuses ;
- export asynchrone côté produit mais UI claire ;
- pas de blocage global.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Ne jamais faire croire qu'une suppression ou sécurité a été appliquée si réseau absent.
En faible connexion :

- afficher statut ;
- autoriser lecture ;
- bloquer actions critiques si validation serveur nécessaire ;
- expliquer simplement.

## 24. RÈGLES NON NÉGOCIABLES

- Ne jamais cacher la suppression compte.
- Ne jamais rendre la suppression trop facile.
- Ne jamais exposer des infos privées par défaut.
- Toujours distinguer public et privé.
- Toujours expliquer la personnalisation IA.
- Toujours protéger les actions sécurité.
- Toujours dire clairement ce qui arrive aux données.

---

*Confidentialité, sécurité, données personnelles et suppression compte pour MAATFEED*
