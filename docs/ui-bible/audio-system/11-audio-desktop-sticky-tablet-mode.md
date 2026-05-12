# 11. AUDIO DESKTOP STICKY ET TABLET MODE

## 1. OBJECTIF UX

Adapter l'audio aux écrans larges sans perdre l'âme mobile-first.

Desktop doit permettre :

- écoute longue
- queue visible
- débat et audio côte à côte
- transcription
- sources
- productivité

## 2. ÉMOTION RECHERCHÉE

Sensation :

- studio calme
- bureau culturel
- contrôle
- profondeur éditoriale

## 3. STRUCTURE VISUELLE GLOBALE

### Desktop :
- colonne centrale : feed/débat
- panneau droit : player sticky
- queue sous player
- transcription possible
- sources accessibles

### Tablet :
- split partiel
- player compact à droite ou bottom

## 4. LAYOUT EXACT

### Desktop large :
- contenu principal : 640 à 760 px
- player droit : 340 à 420 px
- marge : 24 px
- sticky top : 84 à 96 px

### Tablet :
- contenu : 60 %
- player : 40 %
- ou bottom player si portrait

## 5. HIERARCHIE VISUELLE

### Desktop :
- contenu actif
- player
- queue
- recommandations

Le player ne doit pas écraser le débat.

## 6. POSITIONNEMENT DES ÉLÉMENTS

- player sticky à droite
- mini-player bottom si écran moyen
- queue sous contrôles
- transcription en onglet

## 7. DIMENSIONS & ESPACEMENTS

- panneau player : 360 px idéal
- artwork : 160 à 220 px
- waveform : 60 px
- queue item : 64 px
- gap colonnes : 24 px

## 8. COULEURS

Même palette, mais surfaces plus différenciées :

- panneau droit : noir surface
- bordure gauche : ambre faible
- actif : ambre subtil

## 9. TYPOGRAPHIE

- titre player : 18 à 22 px
- queue : 13 à 14 px
- transcription : 14 à 15 px
- sources : 12 à 13 px

## 10. BOUTONS

Desktop peut afficher :

- précédent
- play
- suivant
- vitesse
- timer
- queue
- download
- transcription

## 11. CARTES

Queue et recommandations deviennent cartes compactes.

Ne pas transformer desktop en dashboard administratif.

## 12. ICONOGRAPHIE

Plus visible sur desktop, mais toujours fine.

## 13. COMPORTEMENT SCROLL

### Player sticky :
- reste en place
- queue interne scrollable
- feed indépendant
- pas de double scroll confus

## 14. ANIMATIONS

- sticky sans saut
- queue transitions douces
- changement piste fluide

## 15. MICRO INTERACTIONS

- hover révèle options
- keyboard shortcuts
- hover waveform preview
- clic source ouvre panneau

## 16. GESTURES MOBILE

Pour tablette tactile :

- swipe panel
- drag queue
- tap large

## 17. ÉTATS LOADING

- skeleton panneau
- queue lazy
- player prioritaire

## 18. ÉTATS ERREUR

- panneau conserve contexte
- retry
- passer piste

## 19. ÉTATS OFFLINE

- desktop affiche cache
- offline moins prioritaire mais clair

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Breakpoints :

- mobile : mini-player bottom
- tablet portrait : bottom ou side compact
- tablet landscape : side player
- desktop : sticky right
- large desktop : player + queue + transcription

## 21. ACCESSIBILITÉ

- clavier complet
- focus visible
- raccourcis non obligatoires
- labels
- contraste

## 22. PERFORMANCE UX

- player isolé
- queue virtualisée si longue
- transcription lazy

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Même sur desktop :

- audio d'abord
- artwork ensuite
- fallback simple
- reprise locale

## 24. RÈGLES NON NÉGOCIABLES

- Desktop ne doit pas devenir SaaS dashboard
- Player sticky ne doit pas gêner la lecture
- Queue visible mais secondaire
- Le style doit rester culturel, premium, MAATFEED
- Le comportement mobile reste la référence

---

*Audio desktop sticky et tablet mode pour MAATFEED*
