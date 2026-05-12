# 10. MINI-PLAYER DANS LE FEED

## 1. OBJECTIF UX

Permettre l'écoute continue pendant la navigation. Le mini-player est l'ancre audio de MAATFEED.

## 2. ÉMOTION RECHERCHÉE

Compagnonnage, continuité, confort. L'audio doit rester avec l'utilisateur comme une braise sous le feed.

## 3. STRUCTURE VISUELLE GLOBALE

Barre flottante sombre au-dessus de la bottom nav : cover miniature, titre, créateur, progression, play/pause, bouton ouvrir.

## 4. LAYOUT EXACT

Hauteur : 60-72 px.
Largeur : 100 % moins marges 12-16 px ou pleine largeur selon shell.
Position : bottom nav + safe area + 8 px au-dessus.
Cover : 40-48 px.
Play : 36-44 px.
Progress bar : 2 px en haut ou bas du mini-player.

## 5. HIERARCHIE VISUELLE

Titre audio d'abord, play ensuite, progression visible mais fine. Le mini-player ne doit pas voler le feed.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Cover gauche, texte centre, play/pause droite, éventuellement chevron ou queue. Progression sur le bord inférieur.

## 7. DIMENSIONS & ESPACEMENTS

Padding : 8-12 px.
Écart cover/texte : 10 px.
Écart texte/play : 8 px.
Radius : 16-22 px.

## 8. COULEURS

Fond surface élevée. Bordure graphite/or faible si actif. Progression or. Texte blanc chaud. Meta gris.

## 9. TYPOGRAPHIE

Titre : 13-14 px semibold, 1 ligne.
Créateur : 11-12 px.
Durée optionnelle : 11 px.

## 10. BOUTONS

Play/pause, ouvrir full player, fermer/stop éventuellement dans menu. Bouton fermer visible seulement si pertinent.

## 11. CARTES

Le mini-player n'est pas une carte feed mais une couche. Il partage radius et profondeur avec les cartes.

## 12. ICONOGRAPHIE

Play/pause fort. Chevron up ou cover tap pour ouvrir. Option queue discrète si place.

## 13. COMPORTEMENT SCROLL

Reste fixe pendant scroll. Ne masque pas les dernières actions grâce au padding bottom. Peut se compacter si clavier ouvert.

## 14. ANIMATIONS

Apparition slide up 240-320 ms. Passage mini → full player morph si possible. Progression fluide.

## 15. MICRO INTERACTIONS

Tap play immédiat. Tap corps ouvre full player. Swipe up ouvre full player. Swipe horizontal peut changer piste seulement si introduit clairement.

## 16. GESTURES MOBILE

Swipe up : full player. Swipe down depuis full player : mini. Long press : options audio.

## 17. ÉTATS LOADING

Si buffering : petit loader dans bouton play, titre reste visible. Progression affiche zone tampon si disponible.

## 18. ÉTATS ERREUR

Erreur lecture : message court dans mini-player, bouton réessayer. Ne pas disparaître brutalement.

## 19. ÉTATS OFFLINE

Audio téléchargé continue. Audio streaming perdu : proposer réessayer ou passer au téléchargé suivant.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Desktop : mini-player devient sticky player bas ou panneau droit. Tablet : barre basse ou panneau latéral selon largeur.

## 21. ACCESSIBILITÉ

Boutons labellisés. Titre annoncé. Progression accessible. Contrôles clavier desktop.

## 22. PERFORMANCE UX

Le mini-player doit être stable, léger et isolé. Aucun scroll feed ne doit couper l'audio.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Buffer minimal, reprise automatique prudente, téléchargement conseillé. Ne jamais redémarrer au début après micro-coupure si possible.

## 24. RÈGLES NON NÉGOCIABLES

Pas de mini-player caché derrière la bottom nav. Pas de coupure audio lors de navigation. Pas de player sans titre. Pas d'état loading muet et incompréhensible.

---

*Mini-player pour le feed MAATFEED*
