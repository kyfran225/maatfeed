# 12. OVERLAY MÉDIA DANS LE FEED

## 1. OBJECTIF UX

Afficher les contrôles vidéo/audio/images de manière immersive et lisible sans encombrer l'expérience.

## 2. ÉMOTION RECHERCHÉE

Contrôle cinématographique, élégance, confort. L'utilisateur doit pouvoir se concentrer sur le contenu.

## 3. STRUCTURE VISUELLE GLOBALE

Overlay gradient sur média avec contrôles : play/pause, durée, progress, volume, fullscreen, titre ou contexte selon format.

## 4. LAYOUT EXACT

Gradient haut : 20-30 % si header média.
Gradient bas : 35-45 % pour contrôles.
Play central : 56-72 px.
Progress : bas, 2-4 px.
Contrôles : bas gauche/droite, hitbox 44 px.

## 5. HIERARCHIE VISUELLE

Play/pause et progression d'abord. Titre seulement si nécessaire. Les actions sociales restent hors overlay dans feed standard, sauf mode plein écran.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Play central. Progress bas. Durée près progress. Volume/fullscreen en coin inférieur droit. Retour/fermer en haut gauche en fullscreen.

## 7. DIMENSIONS & ESPACEMENTS

Contrôles espacés de 12-16 px. Texte sur média à 16 px des bords. Bouton central ne doit pas couvrir visage/élément principal si possible, mais reste centré par défaut.

## 8. COULEURS

Contrôles blancs/or sur fond noir translucide. Progress or. Fond boutons noir 40-60 %.

## 9. TYPOGRAPHIE

Durée : 11-12 px. Titre overlay : 14-16 px si affiché. Labels minimalistes.

## 10. BOUTONS

Play/pause, mute, fullscreen, fermer, options. Tous avec hitbox 44 px.

## 11. CARTES

Overlay reste à l'intérieur du média, avec radius du média. En fullscreen, overlay couvre écran.

## 12. ICONOGRAPHIE

Icônes claires et universelles. Pas d'icônes décoratives dans les contrôles.

## 13. COMPORTEMENT SCROLL

Dans feed : contrôles visibles au tap puis disparaissent. En scroll, vidéo pause ou continue selon état et préférence. En fullscreen, scroll feed bloqué.

## 14. ANIMATIONS

Contrôles fade in/out 160-220 ms. Progress fluide. Fullscreen transition douce.

## 15. MICRO INTERACTIONS

Tap média : afficher contrôles/play-pause. Tap progress : seek. Mute : icône change immédiatement.

## 16. GESTURES MOBILE

Tap simple contrôles. Double tap média possible pour like sur vidéo, mais si contrôles visibles, priorité aux contrôles. Swipe down ferme fullscreen.

## 17. ÉTATS LOADING

Poster + loader discret. Progress peut afficher buffer. Message court si buffering long.

## 18. ÉTATS ERREUR

Overlay erreur avec icône, message, réessayer. Garder poster.

## 19. ÉTATS OFFLINE

Overlay indique "Connexion requise" ou "Disponible hors ligne". Proposer audio/transcription si disponible.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Desktop : hover révèle contrôles. Mobile : tap révèle. Tablet : mix selon interaction.

## 21. ACCESSIBILITÉ

Contrôles focusables. Labels. Sous-titres/transcriptions. Contraste fort sur média.

## 22. PERFORMANCE UX

Overlays légers. Pas de blur permanent sur vidéo. Contrôles masqués quand inutiles.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Si vidéo charge lentement, proposer qualité basse et audio. Ne pas bloquer sur loader silencieux.

## 24. RÈGLES NON NÉGOCIABLES

Pas de contrôles minuscules. Pas de texte illisible sur image. Pas d'overlay qui cache le contenu principal en permanence.

---

*Overlay média pour le feed MAATFEED*
