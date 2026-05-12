# 6. ONGLETS CONTENUS, SÉRIES, DÉBATS, AUDIOS ET RÉPONSES

## 1. OBJECTIF UX

Organiser les contributions d'un profil sans noyer l'utilisateur.

Les onglets doivent permettre de voir :

- publications
- audios
- vidéos
- débats lancés
- réponses
- séries
- documents
- contenus épinglés

## 2. ÉMOTION RECHERCHÉE

La navigation doit donner une sensation d'ordre et de richesse.

Le visiteur doit pouvoir explorer sans fatigue.

## 3. STRUCTURE VISUELLE GLOBALE

Tabs possibles :

- Aperçu
- Posts
- Audios
- Débats
- Séries
- Réponses
- Sources
- Sauvegardes, seulement pour soi ou selon confidentialité

## 4. LAYOUT EXACT

### Mobile :

- tabs horizontaux sticky
- contenu en feed vertical
- filtre compact sous tabs si nécessaire

### Desktop :

- tabs en haut du centre
- contenu en grille ou liste
- filtres à droite ou sous tabs

## 5. HIERARCHIE VISUELLE

Priorité :

1. Aperçu
2. Séries
3. Audios
4. Débats
5. Posts
6. Réponses

Sur profil créateur, séries et contenus épinglés doivent être fortement visibles.

## 6. POSITIONNEMENT DES ÉLÉMENTS

- tabs sous header
- indicateur actif ambre
- contenu commence immédiatement sous tabs
- filtres sous tabs, non envahissants

## 7. DIMENSIONS & ESPACEMENTS

- tab hauteur : 44 à 52 px
- tab padding horizontal : 14 à 18 px
- indicateur actif : 2 à 3 px
- carte contenu : selon type feed
- gap cartes : 12 à 18 px

## 8. COULEURS

- tab actif : ambre
- tab inactif : gris sable
- fond tabs sticky : noir charbon avec blur léger
- indicateur : or

## 9. TYPOGRAPHIE

- tab : 13 à 14 px
- compteur optionnel : 11 px
- filtre : 12 px

## 10. BOUTONS

- tab
- filtre
- tri
- voir plus
- reprendre lecture
- ouvrir série

## 11. CARTES

Cartes par onglet :

- post card
- audio card
- débat card
- série card
- réponse card
- document card

Chaque carte conserve le design défini dans les phases précédentes.

## 12. ICONOGRAPHIE

Onglets peuvent avoir icône + texte sur desktop, texte seul sur mobile si espace réduit.

## 13. COMPORTEMENT SCROLL

Tabs sticky.

Chaque onglet garde sa position de scroll temporairement.

Retour profil doit restaurer l'onglet actif.

## 14. ANIMATIONS

- changement tab : slide/fade
- indicateur actif glisse
- cartes apparaissent progressivement

## 15. MICRO INTERACTIONS

- tap tab actif : remonte en haut
- long press tab : description
- filtre actif : chip visible

## 16. GESTURES MOBILE

- swipe horizontal entre onglets
- scroll vertical contenu
- éviter conflit entre swipe tabs et cartes

## 17. ÉTATS LOADING

- skeleton spécifique par onglet
- ne pas recharger les onglets déjà ouverts inutilement
- garder tabs visibles

## 18. ÉTATS ERREUR

- erreur par onglet
- bouton réessayer
- autres onglets disponibles

## 19. ÉTATS OFFLINE

- onglets déjà consultés disponibles
- contenus non cache indiqués
- sauvegardes locales disponibles

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :

- tabs scrollables

### Tablet :

- tabs avec plus d'espace

### Desktop :

- tabs fixes et filtres visibles

## 21. ACCESSIBILITÉ

- tabs accessibles
- état actif annoncé
- navigation clavier
- labels clairs

## 22. PERFORMANCE UX

- charger onglet actif seulement
- pagination
- virtualisation si nécessaire
- cache par onglet

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- Aperçu léger
- audios avant vidéos
- pagination
- skeleton courts
- pas de chargement massif

## 24. RÈGLES NON NÉGOCIABLES

- Les onglets doivent rester simples
- L'onglet actif doit être évident
- Les contenus ne doivent pas être mélangés sans logique
- Le profil doit restaurer la position
- L'aperçu doit donner une synthèse utile

---

*Onglets contenus, séries, débats, audios et réponses pour MAATFEED*
