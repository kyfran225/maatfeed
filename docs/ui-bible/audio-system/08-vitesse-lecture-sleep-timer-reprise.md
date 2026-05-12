# 8. VITESSE DE LECTURE, SLEEP TIMER ET REPRISE

## 1. OBJECTIF UX

Donner à l'utilisateur un contrôle personnel sur son écoute.

Fonctions :

- vitesse
- sleep timer
- reprise
- historique
- mémorisation de progression

## 2. ÉMOTION RECHERCHÉE

Sensation :

- autonomie
- confort
- écoute à son rythme
- intelligence discrète

## 3. STRUCTURE VISUELLE GLOBALE

### Dans full-player :
- bouton vitesse
- bouton timer
- indication reprise
- historique discret

### Dans mini-player :
- vitesse non visible par défaut
- reprise automatique

## 4. LAYOUT EXACT

### Vitesse :
- bottom sheet courte mobile
- menu popover desktop

### Timer :
- sheet avec options rapides
- choix personnalisé si nécessaire

### Reprise :
- badge "reprendre à…"
- progression visible

## 5. HIERARCHIE VISUELLE

Priorité :

1. reprise
2. vitesse actuelle
3. timer actif
4. historique

## 6. POSITIONNEMENT DES ÉLÉMENTS

- vitesse près des contrôles
- timer dans actions secondaires
- reprise dans continue listening
- historique dans bibliothèque

## 7. DIMENSIONS & ESPACEMENTS

- bouton action : 40 à 44 px
- sheet vitesse : hauteur 220 à 300 px
- options : 48 px hauteur
- timer options : grille 2 colonnes possible

## 8. COULEURS

- option active : ambre
- timer actif : badge ocre
- fond sheet : noir surface
- séparateurs : gris sombre

## 9. TYPOGRAPHIE

- option vitesse : 15 à 16 px
- label secondaire : 12 px
- timer actif : 12 à 13 px

## 10. BOUTONS

### Vitesse :
- 0.75x
- 1x
- 1.25x
- 1.5x
- 2x

### Timer :
- 10 min
- 20 min
- 30 min
- fin de piste
- fin épisode
- désactiver

## 11. CARTES

### Reprise d'écoute :
- carte avec titre
- progression
- temps restant
- bouton reprendre

## 12. ICONOGRAPHIE

- vitesse
- lune
- horloge
- reprise
- historique

## 13. COMPORTEMENT SCROLL

Les sheets ne doivent pas perturber le player.

Le timer actif reste visible sous forme de badge discret.

## 14. ANIMATIONS

- sélection vitesse : check animé
- timer : apparition badge
- reprise : barre de progression douce

## 15. MICRO INTERACTIONS

- changement vitesse : toast court
- timer activé : confirmation
- reprise : transition directe vers lecture
- fin timer : fade-out audio doux

## 16. GESTURES MOBILE

- tap bouton
- swipe sheet down
- sélection simple
- pas de sliders complexes pour vitesse

## 17. ÉTATS LOADING

Pas de gros loading.

Si reprise sync :

- afficher local immédiatement
- sync cloud ensuite

## 18. ÉTATS ERREUR

- vitesse non supportée : désactiver option
- timer erreur : revenir état normal
- reprise indisponible : démarrer au début avec message discret

## 19. ÉTATS OFFLINE

- vitesse disponible
- timer disponible
- reprise locale
- sync plus tard

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :
- bottom sheets

### Tablet :
- popover large

### Desktop :
- menus compacts
- raccourcis clavier vitesse possibles

## 21. ACCESSIBILITÉ

- options lisibles
- boutons accessibles
- état actif annoncé
- timer annoncé

## 22. PERFORMANCE UX

- stocker progression localement
- sync en arrière-plan pendant session
- éviter sauvegarde à chaque seconde

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- reprise locale prioritaire
- vitesse sans réseau
- timer sans réseau
- sync différée

## 24. RÈGLES NON NÉGOCIABLES

- La reprise doit être fiable
- Le timer ne doit pas couper brutalement
- La vitesse active doit être visible
- Les préférences doivent persister
- Aucun contrôle ne doit être caché trop profondément

---

*Vitesse de lecture, sleep timer et reprise pour MAATFEED*
