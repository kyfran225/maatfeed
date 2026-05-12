# 7. WAVEFORM, PROGRESSION ET SCRUBBING

## 1. OBJECTIF UX

La waveform doit rendre l'audio tangible.

Elle aide l'utilisateur à :

- comprendre la durée
- voir la progression
- naviguer
- sentir le rythme
- repérer les segments importants

## 2. ÉMOTION RECHERCHÉE

La waveform doit être vivante, élégante, chaude.

Elle ne doit pas être un gadget de studio audio. Elle doit être lisible et émotionnelle.

## 3. STRUCTURE VISUELLE GLOBALE

Types :

- mini waveform
- waveform feed
- waveform full-player
- waveform audio reply
- waveform skeleton
- waveform offline

## 4. LAYOUT EXACT

### Mini :
- ligne compacte
- hauteur faible

### Feed :
- moyenne hauteur
- bouton play adjacent

### Full-player :
- waveform large
- scrubbable
- temps affiché gauche/droite

## 5. HIERARCHIE VISUELLE

Priorité :

1. progression active
2. point actuel
3. durée
4. segments
5. repères éventuels

## 6. POSITIONNEMENT DES ÉLÉMENTS

- waveform centrée
- temps actuel à gauche
- durée totale à droite
- point de lecture visible
- segments importants optionnels

## 7. DIMENSIONS & ESPACEMENTS

- mini : 18 à 24 px
- feed : 32 à 52 px
- full-player : 72 à 110 px
- bar width : 2 à 4 px
- gap barres : 2 à 3 px
- hit area scrubbing : minimum 44 px hauteur

## 8. COULEURS

- actif : ambre
- inactif : brun/gris
- buffered : gris plus clair
- erreur : rouge discret
- offline : ocre doux

## 9. TYPOGRAPHIE

- temps : 11 à 12 px
- segment label : 10 à 11 px
- accessible text : durée complète disponible

## 10. BOUTONS

La waveform elle-même devient contrôle.

Elle doit :

- être scrubbable
- montrer le focus
- permettre retour/avance
- éviter les touches accidentelles

## 11. CARTES

Dans les cartes, la waveform ne doit pas prendre plus de place que le titre.

Dans full-player, elle peut devenir l'élément visuel principal après le titre.

## 12. ICONOGRAPHIE

- point de lecture
- marqueurs de chapitre
- marqueurs IA
- marqueur citation

## 13. COMPORTEMENT SCROLL

La waveform en carte peut devenir statique quand hors écran.

La waveform active reste animée uniquement si visible ou dans player.

## 14. ANIMATIONS

- progression fluide
- pas de vibration excessive
- activation avec fade ambre
- scrubbing avec preview temps

## 15. MICRO INTERACTIONS

- drag : afficher temps
- tap : seek
- long press : aperçu segment
- relâcher : reprise douce

## 16. GESTURES MOBILE

- drag horizontal
- tap précis
- double tap zone contrôles
- bloquer scroll vertical pendant scrub intentionnel seulement

## 17. ÉTATS LOADING

- skeleton bars
- shimmer discret
- fallback barre simple si waveform absente

## 18. ÉTATS ERREUR

- waveform grisée
- message court
- bouton reload

## 19. ÉTATS OFFLINE

- waveform cache si disponible
- sinon barre simple
- progression locale visible

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :
- waveform simplifiée

### Tablet :
- waveform medium détaillée

### Desktop :
- waveform détaillée
- hover preview
- repères de chapitre

## 21. ACCESSIBILITÉ

- alternative slider accessible
- temps actuel annoncé
- clavier gauche/droite
- contraste suffisant

## 22. PERFORMANCE UX

- waveform pré-calculée
- rendu léger
- pas d'animation de centaines de barres
- fallback simple

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- waveform non prioritaire
- barre simple acceptable
- charger audio avant waveform
- cache local

## 24. RÈGLES NON NÉGOCIABLES

- La waveform ne doit jamais ralentir le feed
- Elle doit rester lisible sur petit écran
- Elle ne doit jamais empêcher le scroll
- Elle doit avoir un fallback simple
- Elle doit refléter correctement la progression

---

*Waveform, progression et scrubbing pour MAATFEED*
