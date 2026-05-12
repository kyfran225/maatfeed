# 12. REPRISE APRÈS INTERRUPTION

## 1. OBJECTIF UX

Permettre à l'utilisateur de reprendre là où il s'est arrêté : onboarding incomplet, feed commencé, audio interrompu, débat ouvert, brouillon non publié.

## 2. ÉMOTION RECHERCHÉE

Continuité.

L'utilisateur doit sentir que MAATFEED ne le punit pas pour les interruptions, très fréquentes en contexte mobile et faible connexion.

## 3. STRUCTURE VISUELLE GLOBALE

Reprise :

- étape onboarding sauvegardée
- choix conservés
- audio repris
- brouillon conservé
- feed positionné
- message doux de reprise

## 4. LAYOUT EXACT

À la réouverture :

- carte courte "Reprendre ?"
- options :
  - continuer onboarding
  - aller au feed
  - reprendre audio
  - retrouver brouillon

Pas de modal obligatoire sauf brouillon critique.

## 5. HIERARCHIE VISUELLE

1. action interrompue importante
2. continuer
3. ignorer
4. gérer plus tard

## 6. POSITIONNEMENT DES ÉLÉMENTS

Carte reprise en haut du feed ou dans onboarding.

Audio via mini-player.

Brouillon via toast ou carte.

## 7. DIMENSIONS & ESPACEMENTS

### Carte reprise :

- hauteur : 80 à 130 px
- radius : 22 px
- padding : 16 px
- bouton compact

## 8. COULEURS

### Reprise :

- fond graphite
- accent ambre
- statut beige

## 9. TYPOGRAPHIE

- titre : 15 à 17 px
- description : 12 à 14 px
- action : 13 px

## 10. BOUTONS

Actions :

- Reprendre
- Plus tard
- Supprimer brouillon
- Aller au feed

## 11. CARTES

Cartes reprise :

- onboarding
- audio
- débat
- brouillon
- série

## 12. ICONOGRAPHIE

- reprise
- horloge
- audio
- brouillon
- débat
- série

## 13. COMPORTEMENT SCROLL

La carte reprise ne doit pas bloquer le feed.

Elle peut être dismissible.

## 14. ANIMATIONS

- apparition douce
- disparition avec undo si suppression
- reprise transition directe

## 15. MICRO INTERACTIONS

- tap reprendre
- swipe masquer
- long press options
- feedback sauvegarde

## 16. GESTURES MOBILE

- swipe carte
- tap
- long press

## 17. ÉTATS LOADING

Si reprise charge :

- skeleton local
- conserver option feed

## 18. ÉTATS ERREUR

Si ressource indisponible :

- proposer alternative
- garder choix utilisateur
- message calme

## 19. ÉTATS OFFLINE

Reprise offline prioritaire :

- brouillons
- audio téléchargé
- onboarding
- contenus cache

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :

- carte compacte

### Desktop :

- panneau "continuer"

## 21. ACCESSIBILITÉ

- carte annoncée
- actions claires
- suppression confirmée

## 22. PERFORMANCE UX

- sauvegarde locale fréquente
- restauration rapide
- pas de réseau obligatoire

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- interruption prévue
- sauvegarde robuste
- reprise sans perte
- synchronisation différée

## 24. RÈGLES NON NÉGOCIABLES

- Ne jamais perdre les choix
- Ne jamais perdre un brouillon sans confirmation
- Reprise visible mais non intrusive
- Offline compatible
- Audio et débats doivent reprendre proprement

---

*Reprise après interruption pour MAATFEED*
