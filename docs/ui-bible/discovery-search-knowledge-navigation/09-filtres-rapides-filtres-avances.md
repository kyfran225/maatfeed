# 9. FILTRES RAPIDES ET FILTRES AVANCÉS

## 1. OBJECTIF UX

Permettre d'affiner la recherche sans complexifier l'écran. Les filtres doivent être puissants mais progressifs.

## 2. ÉMOTION RECHERCHÉE

Maîtrise sans fatigue.

L'utilisateur doit pouvoir filtrer en un geste, sans avoir l'impression de remplir un formulaire.

## 3. STRUCTURE VISUELLE GLOBALE

Deux niveaux :

- filtres rapides visibles
- filtres avancés dans bottom sheet mobile ou panneau desktop

### Filtres rapides :

- Tout
- Débats
- Audios
- Vidéos
- Séries
- Créateurs
- Sources
- Premium
- Récent
- Populaire

### Filtres avancés :

- format
- durée
- langue
- thème
- niveau
- fiabilité source
- créateur
- date
- popularité
- sauvegardé
- disponible offline

## 4. LAYOUT EXACT

### Mobile :

- chips horizontaux sous search bar
- bouton "Filtres" ouvre bottom sheet
- sheet monte depuis bas
- actions appliquer/réinitialiser en bas sticky

### Desktop :

- filtres rapides sous search bar
- filtres avancés colonne gauche
- changements appliqués instantanément ou avec bouton selon lourdeur

## 5. HIERARCHIE VISUELLE

Filtres rapides d'abord.

Filtres avancés groupés par catégories.

Les filtres actifs doivent être visibles au-dessus des résultats.

## 6. POSITIONNEMENT DES ÉLÉMENTS

### Mobile :

- chips sous search bar
- bouton filtres à droite de la rangée
- sheet occupe 70 à 90 % hauteur selon contenu

### Desktop :

- gauche
- actifs sous search bar
- reset visible mais discret

## 7. DIMENSIONS & ESPACEMENTS

### Chips :

- hauteur : 34 à 40 px
- radius : pilule
- padding : 12 à 16 px
- gap : 8 px

### Bottom sheet :

- radius haut : 28 à 32 px
- padding : 20 px
- sections espacées : 24 px
- boutons sticky : 52 px hauteur

## 8. COULEURS

### Filtre actif :

- fond ambre sombre
- texte or clair
- bordure ambre

### Filtre inactif :

- fond graphite
- texte beige
- bordure discrète

### Sheet :

- fond noir charbon
- séparateurs or/brun très faibles

## 9. TYPOGRAPHIE

- chips : 13 à 14 px
- titre sheet : 20 à 22 px
- groupe filtre : 14 à 16 px
- options : 14 px
- compteurs : 12 px

## 10. BOUTONS

Boutons :

- appliquer
- réinitialiser
- fermer
- voir résultats
- effacer filtre actif

"Appliquer" doit être clair, mais pas énorme.

## 11. CARTES

Les filtres avancés peuvent utiliser des mini-cartes pour :

- niveau débutant/intermédiaire/profond
- durée audio
- fiabilité source
- disponible offline

## 12. ICONOGRAPHIE

- sliders
- horloge
- onde audio
- document
- débat
- source fiable
- téléchargement
- calendrier
- langue

## 13. COMPORTEMENT SCROLL

### Mobile sheet :

- scroll interne
- boutons appliquer/réinitialiser sticky en bas
- arrière-plan assombri
- fermeture par swipe down

### Desktop :

- filtres sticky
- sections repliables

## 14. ANIMATIONS

- chip actif : remplissage doux
- sheet : montée fluide
- reset : disparition progressive des filtres
- résultats : transition skeleton courte

## 15. MICRO INTERACTIONS

- sélection filtre : feedback instantané
- compteur résultats mis à jour
- filtre incompatible désactivé avec explication
- reset confirme visuellement

## 16. GESTURES MOBILE

- swipe chips
- swipe down fermer sheet
- tap extérieur fermer
- long press filtre pour explication si nécessaire

## 17. ÉTATS LOADING

Quand filtres changent :

- conserver anciens résultats légèrement
- afficher skeleton local
- ne pas vider brutalement

## 18. ÉTATS ERREUR

Si filtre échoue :

- conserver recherche précédente
- message local :
  "Ce filtre n'a pas pu être appliqué."
- bouton réessayer

## 19. ÉTATS OFFLINE

Filtres disponibles offline :

- sauvegardé
- téléchargé
- consulté récemment
- audio disponible
- série commencée

Filtres non disponibles grisés avec explication.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :

- chips + bottom sheet

### Tablet :

- drawer latéral

### Desktop :

- colonne gauche permanente

## 21. ACCESSIBILITÉ

- filtres actifs annoncés
- options atteignables au clavier
- sheet focus trap
- fermeture claire
- pas de couleur seule

## 22. PERFORMANCE UX

- filtres rapides locaux si possible
- filtres lourds appliqués après validation
- debounce
- éviter rechargement complet
- cache par combinaison

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- limiter filtres coûteux
- proposer mode léger
- afficher résultat approximatif si nécessaire
- ne pas relancer tout à chaque tap

## 24. RÈGLES NON NÉGOCIABLES

- Les filtres doivent être progressifs
- Le mobile ne doit pas être saturé
- Le desktop ne doit pas devenir un panneau Excel
- Les filtres actifs doivent être visibles
- Reset doit toujours exister
- Offline doit avoir ses filtres dédiés

---

*Filtres rapides et filtres avancés pour MAATFEED*
