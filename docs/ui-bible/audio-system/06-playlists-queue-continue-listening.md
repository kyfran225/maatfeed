# 6. PLAYLISTS, QUEUE ET CONTINUE LISTENING

## 1. OBJECTIF UX

Créer une continuité d'écoute intelligente.

L'utilisateur doit pouvoir :

- enchaîner des contenus
- sauvegarder des séries
- retrouver ce qu'il a commencé
- organiser une écoute
- recevoir des recommandations audio cohérentes

## 2. ÉMOTION RECHERCHÉE

Sensation :

- maîtrise
- découverte
- confort
- fidélité
- progression personnelle

Le système doit donner envie de revenir.

## 3. STRUCTURE VISUELLE GLOBALE

Modules :

- queue actuelle
- playlists sauvegardées
- continuer l'écoute
- séries suivies
- recommandations audio
- téléchargements

## 4. LAYOUT EXACT

### Mobile :
- queue en bottom sheet
- playlists dans page dédiée
- continue listening en carrousel horizontal
- téléchargement dans onglet bibliothèque

### Desktop :
- queue à droite
- playlists en colonne
- continue listening en bande horizontale

## 5. HIERARCHIE VISUELLE

Priorité :

1. continuer
2. piste actuelle
3. piste suivante
4. playlists
5. recommandations

## 6. POSITIONNEMENT DES ÉLÉMENTS

- continue listening près du haut
- queue depuis full-player
- playlist dans bibliothèque
- téléchargements accessibles depuis player et bibliothèque

## 7. DIMENSIONS & ESPACEMENTS

- item queue mobile : 64 à 76 px
- artwork : 44 px
- titre : 1 ligne
- progression : mini barre 2 à 4 px
- carrousel continue : cartes 180 à 240 px

## 8. COULEURS

- item actif : fond ambre très faible
- progression : ambre
- item normal : surface sombre
- texte secondaire : gris sable

## 9. TYPOGRAPHIE

- titre item : 13 à 15 px
- meta : 11 à 12 px
- section : 16 à 18 px
- playlist titre : 18 à 22 px

## 10. BOUTONS

- reprendre
- ajouter à queue
- retirer
- télécharger
- sauvegarder playlist
- lire tout
- mélanger seulement si pertinent

## 11. CARTES

### Cartes continue listening :
- progression visible
- contexte
- dernier point d'écoute
- bouton reprendre

### Cartes playlist :
- couverture abstraite
- nombre d'épisodes
- durée totale
- état téléchargement

## 12. ICONOGRAPHIE

- queue
- playlist
- horloge
- téléchargement
- série
- reprise
- coche

## 13. COMPORTEMENT SCROLL

### Queue :
- scroll vertical
- piste active sticky en haut possible
- drag reorder uniquement si clair

### Continue listening :
- scroll horizontal doux
- snap léger
- pas d'effet carrousel gadget

## 14. ANIMATIONS

- ajout queue : item glisse
- retrait : collapse doux
- reprise : transition vers mini-player
- progression : remplissage fluide

## 15. MICRO INTERACTIONS

- tap reprendre
- long press item : options
- drag item : réordonner
- téléchargement : anneau progressif
- playlist saved : coche dorée

## 16. GESTURES MOBILE

- swipe item queue : retirer
- drag handle : réordonner
- swipe playlist : options
- tap long : menu

## 17. ÉTATS LOADING

- skeleton queue
- skeleton playlist
- continuer l'écoute visible en priorité
- pas de spinner global

## 18. ÉTATS ERREUR

- queue indisponible : conserver piste active
- playlist erreur : bouton réessayer
- continue listening erreur : fallback local

## 19. ÉTATS OFFLINE

- afficher seulement contenus disponibles
- playlists téléchargées en premier
- queue locale
- reprise locale

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :
- sheets et carrousels

### Tablet :
- bibliothèque en grille 2 colonnes

### Desktop :
- queue persistante
- playlists en grille
- filtres visibles

## 21. ACCESSIBILITÉ

- réordonner accessible autrement que drag
- boutons labellisés
- focus visible
- progression textuelle

## 22. PERFORMANCE UX

- charger queue progressivement
- thumbnails petites
- éviter recalculs
- cache continue listening

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- continue listening local prioritaire
- queue simple
- téléchargement visible
- playlist texte avant images

## 24. RÈGLES NON NÉGOCIABLES

- Reprise d'écoute toujours fiable
- Queue jamais perdue sans raison
- Playlists lisibles offline si téléchargées
- Continue listening doit être visible et utile
- Les recommandations ne doivent pas remplacer la queue utilisateur

---

*Playlists, queue et continue listening pour MAATFEED*
