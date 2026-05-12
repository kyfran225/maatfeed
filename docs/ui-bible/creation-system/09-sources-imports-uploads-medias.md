# 9. SOURCES, IMPORTS, UPLOADS ET MÉDIAS

## 1. OBJECTIF UX

Permettre d'ajouter des médias et sources de façon fiable, claire et légère.
MAATFEED doit encourager le contenu sourcé sans rendre l'ajout de sources pénible.

## 2. ÉMOTION RECHERCHÉE

L'utilisateur doit sentir que la plateforme valorise la crédibilité.
Ajouter une source doit être aussi naturel qu'ajouter une image.

## 3. STRUCTURE VISUELLE GLOBALE

Modules :

- upload média
- import lien
- ajout source
- preview source
- validation
- compression
- statut upload
- remplacement/suppression

## 4. LAYOUT EXACT

### Mobile :
- bouton ajouter
- sheet options
- galerie/import/lien/source
- cartes médias sous composer
- progression visible

### Desktop :
- drag-and-drop
- panneau sources
- preview enrichie

## 5. HIERARCHIE VISUELLE

Priorité :

1. média ajouté
2. statut
3. source
4. options
5. suppression

## 6. POSITIONNEMENT DES ÉLÉMENTS

- médias sous champ principal
- sources après contenu
- upload progress sur carte
- menu options sur coin haut droit carte

## 7. DIMENSIONS & ESPACEMENTS

- carte média image : 120 à 180 px hauteur
- carte document : 64 à 80 px
- source card : 72 à 96 px
- progress bar : 3 à 5 px
- icône type : 28 à 36 px

## 8. COULEURS

- upload actif : ambre
- terminé : coche ambre
- erreur : rouge discret
- source validée : bordure ambre
- surface : noir graphite

## 9. TYPOGRAPHIE

- nom fichier : 13 à 14 px
- taille : 11 à 12 px
- source titre : 13 à 15 px
- URL/meta : 11 px

## 10. BOUTONS

- ajouter média
- importer lien
- ajouter source
- remplacer
- supprimer
- réessayer
- compresser
- voir aperçu

## 11. CARTES

### Carte source :
- titre
- domaine/auteur
- type
- état validation
- bouton ouvrir
- bouton supprimer

### Carte upload :
- miniature
- nom
- progression
- statut

## 12. ICONOGRAPHIE

- image
- vidéo
- audio
- document
- lien
- source
- upload
- check
- erreur

## 13. COMPORTEMENT SCROLL

Les médias restent dans le flux du composer.
Sur long contenu, panneau médias peut se compacter.

## 14. ANIMATIONS

- upload progress
- insertion média
- remplacement
- suppression avec collapse
- erreur shake léger

## 15. MICRO INTERACTIONS

- tap carte : preview
- long press : options
- drag : réordonner
- source validée : coche
- upload repris : badge

## 16. GESTURES MOBILE

- swipe média : options
- long press : menu
- drag reorder
- tap preview

## 17. ÉTATS LOADING

- lecture fichier
- compression
- upload
- validation source
- génération preview

## 18. ÉTATS ERREUR

- fichier trop lourd
- format interdit
- upload interrompu
- source inaccessible
- preview impossible

Toujours proposer une action.

## 19. ÉTATS OFFLINE

- média gardé localement
- upload en attente
- source enregistrée brute
- validation plus tard
- statut visible

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :
- sheets et cartes verticales

### Tablet :
- grille médias

### Desktop :
- drag-and-drop
- panneau source avancé

## 21. ACCESSIBILITÉ

- noms fichiers lisibles
- actions labellisées
- progression textuelle
- focus visible

## 22. PERFORMANCE UX

- compression
- previews légères
- upload reprenable
- lazy preview
- pas de blocage composer

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- upload différé
- compression forte proposée
- audio/texte prioritaire
- preview source optionnelle
- reprise automatique

## 24. RÈGLES NON NÉGOCIABLES

- Un média ajouté ne doit pas disparaître sans action utilisateur
- L'état upload doit être visible
- Les sources doivent être claires
- Les erreurs doivent être réparables
- Les médias lourds ne doivent pas bloquer la création

---

*Sources, imports, uploads et médias pour MAATFEED*
