# 2. POINT D'ENTRÉE CRÉATION ET SÉLECTEUR DE FORMAT

## 1. OBJECTIF UX

Permettre à l'utilisateur de commencer une création en moins de deux secondes.
Le point d'entrée doit répondre clairement :
"Que veux-tu créer maintenant ?"

Il doit éviter la confusion entre publier, répondre, débattre, enregistrer, importer ou créer une série.

## 2. ÉMOTION RECHERCHÉE

L'utilisateur doit ressentir une invitation, pas une pression.
La création doit donner envie d'ouvrir l'atelier.

## 3. STRUCTURE VISUELLE GLOBALE

Le sélecteur contient :

- titre court
- sous-phrase inspirante
- cartes de formats
- raccourcis récents
- brouillons
- mode rapide audio
- bouton fermer

### Formats principaux :
- Post
- Audio
- Vidéo
- Débat
- Série
- Réponse
- Citation
- Document/source

## 4. LAYOUT EXACT

### Mobile :
- bottom sheet 85 à 95 % hauteur
- header : "Créer sur MAATFEED"
- grille 2 colonnes de cartes
- brouillon récent sous la grille
- bouton audio rapide en bas

### Desktop :
- modal centrée ou panneau création
- grille 3 ou 4 colonnes
- brouillons à droite

## 5. HIERARCHIE VISUELLE

Priorité :

1. audio rapide
2. débat
3. post
4. vidéo
5. série
6. document
7. brouillons

MAATFEED étant audio-first et debate-first, audio et débat doivent être légèrement plus valorisés visuellement.

## 6. POSITIONNEMENT DES ÉLÉMENTS

- bouton fermer en haut droite
- titre haut gauche
- cartes au centre
- brouillons bas
- action "reprendre brouillon" visible si disponible

## 7. DIMENSIONS & ESPACEMENTS

### Mobile :
- carte format : 150 à 170 px largeur selon écran
- hauteur : 104 à 128 px
- radius : 22 à 28 px
- padding : 16 px
- gap : 12 px
- icône : 28 à 34 px

## 8. COULEURS

- carte audio active : ambre doux
- carte débat : brun/or profond
- autres cartes : surface charbon
- bordure hover/active : ambre faible
- texte : blanc cassé
- description : gris sable

## 9. TYPOGRAPHIE

- titre sheet : 22 à 26 px
- carte titre : 15 à 16 px
- carte description : 12 à 13 px
- brouillon : 13 à 14 px

## 10. BOUTONS

Boutons :

- fermer
- choisir format
- reprendre brouillon
- audio rapide

Le bouton audio rapide peut être une grande capsule en bas : "Enregistrer une idée audio".

## 11. CARTES

Chaque carte doit contenir :

- icône
- titre
- description courte
- indication durée/usage si utile

Exemple d'intention :

- Audio : "Voix, réflexion, capsule."
- Débat : "Lancer une discussion."
- Série : "Construire un parcours."

## 12. ICONOGRAPHIE

Icônes :

- micro
- bulles débat
- plume
- caméra
- pile série
- guillemets
- document
- réponse

## 13. COMPORTEMENT SCROLL

Si petit écran :

- grille scrollable
- header fixe
- brouillons accessibles en bas
- pas de scroll horizontal obligatoire

## 14. ANIMATIONS

- cartes apparaissent en cascade légère
- sélection : scale 0.98 puis ouverture
- retour : transition douce
- brouillon : highlight si récent

## 15. MICRO INTERACTIONS

- tap carte : feedback tactile
- long press carte : explication rapide
- brouillon récent : badge "il y a quelques minutes"
- format recommandé : halo ambre très léger

## 16. GESTURES MOBILE

- swipe down pour fermer
- tap extérieur si modal partielle
- swipe vertical pour voir plus
- pas de swipe horizontal obligatoire

## 17. ÉTATS LOADING

Le sélecteur doit charger instantanément.
Si brouillons pas encore chargés :

- skeleton fin
- cartes format visibles immédiatement

## 18. ÉTATS ERREUR

Si brouillons indisponibles :

- cacher section ou afficher "Brouillons momentanément indisponibles"
- ne pas bloquer création

## 19. ÉTATS OFFLINE

Offline :

- formats texte, audio local et brouillon restent disponibles
- vidéo lourde affiche avertissement doux
- publication différée indiquée

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :
- bottom sheet

### Tablet :
- sheet large avec grille 3 colonnes

### Desktop :
- modal premium ou workspace

## 21. ACCESSIBILITÉ

- cartes accessibles clavier
- labels clairs
- descriptions non uniquement visuelles
- focus visible

## 22. PERFORMANCE UX

- ouverture immédiate
- icônes légères
- pas de gros asset
- brouillons lazy

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- sélecteur local-first
- audio rapide disponible
- brouillons locaux prioritaires
- pas d'attente réseau pour commencer

## 24. RÈGLES NON NÉGOCIABLES

- Le point d'entrée doit être instantané
- Audio et débat doivent être valorisés
- La création ne doit jamais commencer par un formulaire long
- Les brouillons doivent être visibles
- Offline ne doit pas empêcher de créer

---

*Point d'entrée création et sélecteur de format pour MAATFEED*
