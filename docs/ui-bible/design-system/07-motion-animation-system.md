# 7. MOTION & ANIMATION SYSTEM

## 1. OBJECTIF UX

Créer des transitions premium qui rendent MAATFEED vivant, tactile et compréhensible sans ralentir l'usage.

## 2. ÉMOTION RECHERCHÉE

Fluidité, chaleur, finesse. L'utilisateur doit sentir une interface réactive, jamais lourde.

## 3. STRUCTURE VISUELLE GLOBALE

Les animations suivent quatre familles : navigation, apparition de contenu, feedback d'action, transformation de média/player.

## 4. LAYOUT EXACT

### Durées recommandées
- **Micro feedback** : 80 à 160 ms
- **Changement onglet** : 160 à 220 ms
- **Ouverture carte/detail** : 220 à 320 ms
- **Bottom sheet** : 260 à 360 ms
- **Full player** : 300 à 420 ms
- **Toast** : 180 à 240 ms

## 5. HIERARCHIE VISUELLE

Les animations principales concernent les éléments importants. Les éléments secondaires apparaissent avec un fade léger ou sans animation.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Les entrées respectent la direction logique :
- Sheet depuis bas
- Side panel depuis côté
- Page depuis droite
- Retour vers gauche
- Full player depuis mini-player

## 7. DIMENSIONS & ESPACEMENTS

Les déplacements doivent rester modestes : 8 à 24 px pour apparition, 100 % hauteur pour sheet, transformation complète pour player.

## 8. COULEURS

Les changements de couleur doivent être doux. Les halos ne doivent jamais flasher.

## 9. TYPOGRAPHIE

Texte ne doit pas bouger inutilement. Éviter les animations lettre par lettre dans l'interface principale.

## 10. BOUTONS

- **Press** : échelle 0.98, opacité légèrement ajustée
- **Loading bouton** : spinner discret ou progression interne
- **Success** : micro-flash or/vert doux

## 11. CARTES

- **Carte tap** : pression courte
- **Carte ouverture** : expansion ou transition vers détail si possible
- **Carte audio active** : onde animée douce

## 12. ICONOGRAPHIE

- Icônes like, save, play, pause : animation courte
- Icône play → pause doit être claire
- Icône bookmark se remplit doucement

## 13. COMPORTEMENT SCROLL

Animations au scroll limitées. Pas d'effets parallax lourds dans le feed principal. Les éléments ne doivent pas se décaler pendant scroll rapide.

## 14. ANIMATIONS

Courbes : ease-out pour apparition, ease-in pour disparition, spring doux pour sheets/player. Aucun rebond enfantin.

## 15. MICRO INTERACTIONS

- Double tap like : apparition très discrète d'un symbole ou halo, pas pluie d'icônes
- Réaction débat : petite montée + remplissage

## 16. GESTURES MOBILE

Pendant drag, l'interface suit le doigt. Au relâchement, retour ou ouverture selon seuil. Seuil sheet : environ 25 à 35 % de déplacement selon contexte.

## 17. ÉTATS LOADING

- Shimmer lent et faible
- Pour audio, waveform placeholder animée si l'audio charge
- Pour vidéo, poster + loader circulaire discret

## 18. ÉTATS ERREUR

Erreur : apparition douce, pas de shake agressif sauf input invalide immédiat, et même là très subtil.

## 19. ÉTATS OFFLINE

- Passage offline : bandeau slide léger
- Retour online : petit toast positif, pas de célébration excessive

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

- **Desktop** : hovers plus riches
- **Mobile** : feedback tactile prioritaire
- **Tablet** : transitions panels plus visibles

## 21. ACCESSIBILITÉ

Respecter préférence réduction de mouvement. Garder le sens UX même sans animation.

## 22. PERFORMANCE UX

Animations sur transform/opacity uniquement quand possible. Éviter animations de layout coûteuses.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Mode performance : réduire blur, parallax, shimmer, grandes transitions. Garder seulement feedback essentiel.

## 24. RÈGLES NON NÉGOCIABLES

- Pas d'animations gadgets
- Pas de lenteur entre action et réponse
- Pas de motion qui gêne la lecture des débats ou l'écoute audio

---

*Système d'animation pour une expérience fluide et premium*
