# 7. RECHERCHE OFFLINE LÉGÈRE & NAVIGATION LOCALE DU SAVOIR

## 1. OBJECTIF UX

La recherche offline légère permet à l'utilisateur de retrouver des contenus déjà consultés, téléchargés ou sauvegardés sans connexion. Elle ne remplace pas la recherche globale intelligente, mais elle évite l'impression de mur fermé.
MAATFEED doit rester navigable même quand le réseau disparaît.

## 2. ÉMOTION RECHERCHÉE

L'utilisateur doit ressentir :

- autonomie ;
- calme ;
- continuité intellectuelle ;
- maîtrise de sa bibliothèque.

L'offline ne doit pas être un arrêt du savoir, mais une bibliothèque locale réduite.

## 3. STRUCTURE VISUELLE GLOBALE

Recherche offline :

- barre de recherche locale ;
- filtres par type ;
- résultats issus du cache ;
- indication claire de limite ;
- suggestion de recherche complète au retour réseau.

## 4. LAYOUT EXACT

Page recherche en offline :

- header : "Recherche hors connexion" ;
- barre de recherche ;
- filtres horizontaux ;
- résultats locaux ;
- bloc "Recherche complète disponible avec connexion".

Dans recherche globale :

- si offline, basculer automatiquement vers locale ;
- garder la saisie ;
- afficher un badge "local".

## 5. HIERARCHIE VISUELLE

Priorité résultats :

- contenus téléchargés ;
- contenus sauvegardés ;
- contenus récemment consultés ;
- brouillons ;
- actions en attente.

La recherche ne doit pas afficher des résultats qu'elle ne peut pas ouvrir.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Badge "local" :

- dans la barre de recherche ;
- à droite du champ ou sous le champ ;
- très visible mais discret.

Message limite :

- sous les filtres ;
- avant les résultats ;
- texte court.

## 7. DIMENSIONS & ESPACEMENTS

Barre :

- hauteur : 48 à 54 px ;
- radius : 18 à 24 px ;
- padding horizontal : 14 à 16 px.

Filtres :

- capsules 32 à 36 px ;
- scroll horizontal ;
- gap 8 px.

Résultat :

- carte 76 à 110 px ;
- thumbnail 52 à 68 px ;
- texte sur deux lignes.

## 8. COULEURS

Recherche offline :

- fond sombre ;
- barre surface noire/brune ;
- badge local ambre ;
- filtres actifs or doux ;
- filtres inactifs gris chaud ;
- message limite beige-gris.

## 9. TYPOGRAPHIE

Libellés :

- "Recherche locale"
- "Résultats disponibles hors connexion"
- "La recherche complète reviendra avec Internet"
- "Aucun contenu local trouvé"
- "Télécharge des audios ou séries pour les retrouver ici"

Texte pédagogique, jamais sec.

## 10. BOUTONS

Boutons :

- "Voir téléchargements"
- "Réessayer en ligne"
- "Gérer le cache"
- "Effacer recherche"
- "Ouvrir le contenu"

Pas de bouton inutile si aucun résultat.

## 11. CARTES

Résultat local :

- type ;
- titre ;
- extrait ;
- statut offline ;
- dernière consultation ;
- action ouvrir.

Brouillon :

- extrait ;
- destination ;
- date ;
- action continuer.

## 12. ICONOGRAPHIE

Icônes :

- loupe ;
- disque local ;
- casque ;
- débat ;
- document ;
- série ;
- brouillon ;
- signal offline.

La loupe peut être accompagnée d'un petit point or pour signifier local.

## 13. COMPORTEMENT SCROLL

Résultats :

- scroll fluide ;
- pas d'infinite scroll ;
- pagination inutile ;
- message de fin clair ;
- filtres sticky si liste longue.

## 14. ANIMATIONS

Recherche :

- résultats apparaissent rapidement ;
- pas de shimmer lourd ;
- transition champ → résultats courte ;
- badge local fade-in.

Aucune animation complexe en offline.

## 15. MICRO INTERACTIONS

Micro-interactions :

- tap filtre affine instantanément ;
- tap résultat ouvre local ;
- recherche sans résultat propose téléchargement futur ;
- retour réseau propose relancer la recherche complète ;
- saisie conservée.

## 16. GESTURES MOBILE

Gestes :

- swipe entre filtres ;
- pull-to-refresh pour essayer réseau ;
- long press résultat pour options ;
- back conserve recherche.

## 17. ÉTATS LOADING

Recherche locale :

- quasi instantanée ;
- loader seulement si index local lourd ;
- skeleton court ;
- aucun spinner réseau.

## 18. ÉTATS ERREUR

Erreur index local :

- "Recherche locale indisponible pour le moment."
- "Tes contenus restent accessibles depuis la bibliothèque hors connexion."

Toujours proposer un chemin alternatif.

## 19. ÉTATS OFFLINE

Offline :

- recherche locale activée ;
- recherche globale désactivée proprement ;
- historique local disponible ;
- suggestions IA non disponibles sauf cache.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Mobile :

- recherche simple ;
- filtres horizontaux ;
- résultats verticaux.

Tablette :

- résultats + aperçu ;
- filtres plus larges.

Desktop :

- colonne filtres ;
- résultats détaillés ;
- aperçu document possible.

## 21. ACCESSIBILITÉ

La recherche doit :

- annoncer "mode recherche locale" ;
- avoir champ bien labellisé ;
- permettre navigation clavier ;
- indiquer nombre de résultats ;
- expliquer les limites offline.

## 22. PERFORMANCE UX

Index local léger :

- titres ;
- tags ;
- auteurs ;
- extraits courts ;
- types ;
- progression.

Ne pas indexer lourdement des médias bruts.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

La recherche locale doit encourager l'usage stratégique :

- sauvegarder séries ;
- télécharger audios ;
- garder documents ;
- reprendre débats consultés.

Elle transforme MAATFEED en bibliothèque mobile résiliente.

## 24. RÈGLES NON NÉGOCIABLES

- Ne jamais afficher des résultats impossibles à ouvrir.
- Ne jamais prétendre faire une recherche globale offline.
- Toujours indiquer que la recherche est locale.
- Toujours conserver la saisie au retour réseau.
- Toujours proposer contenus hors connexion pertinents.
- Toujours rester rapide.
- Toujours éviter les loaders réseau en mode offline.

---

*Recherche offline légère et navigation locale du savoir pour MAATFEED*
