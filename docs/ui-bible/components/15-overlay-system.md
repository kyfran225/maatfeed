# 15. OVERLAY SYSTEM

## 1. OBJECTIF UX

Gérer les couches visuelles qui assombrissent, focalisent ou contextualisent l'écran : média, player, menus, onboarding, sponsor, loading critique.

## 2. ÉMOTION RECHERCHÉE

Immersion contrôlée. L'utilisateur doit sentir qu'il entre dans un mode concentré sans être perdu.

## 3. STRUCTURE VISUELLE GLOBALE

Overlay noir translucide, parfois blur léger, parfois gradient vertical sur médias pour lisibilité.

## 4. LAYOUT EXACT

- **Overlay complet** : couvre 100 % écran
- **Gradient média** : haut 20 à 30 %, bas 30 à 45 % selon texte/actions
- **Blur** : faible à moyen, désactivable performance

## 5. HIERARCHIE VISUELLE

L'overlay diminue l'arrière-plan et met en avant la couche active. Les actions de fermeture restent visibles.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Dans un overlay média, titre et actions se placent sur les zones gradient. Dans un overlay de menu, la surface active est centrée ou basse.

## 7. DIMENSIONS & ESPACEMENTS

- **Fermeture** : hitbox 44 px
- **Marges internes** : 16 px mobile, 24 px desktop

## 8. COULEURS

- Noir 50 à 80 %
- Gradient noir transparent vers noir
- Accent or limité aux actions

## 9. TYPOGRAPHIE

Texte sur média : blanc chaud avec shadow légère. Labels secondaires gris clair.

## 10. BOUTONS

Boutons sur overlay média : fonds noirs translucides ou icônes blanches/or. CTA important reste doré.

## 11. CARTES

Cartes dans overlay : surface élevée, bordure graphite, radius 18 à 24 px.

## 12. ICONOGRAPHIE

Icônes overlay : blanc/or, assez grandes, hitbox généreuse. Ne jamais utiliser icônes gris trop faibles sur vidéo.

## 13. COMPORTEMENT SCROLL

Overlay média plein écran peut bloquer scroll arrière. Overlay de détail peut avoir scroll interne.

## 14. ANIMATIONS

Fade 160 à 240 ms. Gradient déjà présent sur média, pas d'apparition brutale.

## 15. MICRO INTERACTIONS

Tap overlay ferme si contexte simple. Actions média donnent feedback immédiat.

## 16. GESTURES MOBILE

Swipe down ferme media overlay. Tap simple peut afficher/masquer contrôles vidéo/audio.

## 17. ÉTATS LOADING

Overlay loading critique : message + progression, jamais spinner seul pendant plus de quelques secondes sans info.

## 18. ÉTATS ERREUR

Overlay média erreur : conserver poster ou fond, message central, action réessayer.

## 19. ÉTATS OFFLINE

Overlay offline média : proposer écouter audio téléchargé, lire transcription, ou réessayer plus tard.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Desktop : overlay peut être centré avec contenu max. Fullscreen média garde contrôles sur les bords.

## 21. ACCESSIBILITÉ

Contrastes forts, fermeture accessible, pas d'information uniquement visuelle dans gradient.

## 22. PERFORMANCE UX

Blur limité, gradients légers. Pas d'overlays multiples.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Overlay ne doit pas masquer un contenu utile en attendant média. Poster + texte toujours visibles.

## 24. RÈGLES NON NÉGOCIABLES

- Pas d'overlay qui obscurcit tout sans action claire
- Pas de texte illisible sur image
- Pas d'effet glassmorphism lourd partout

---

*Système d'overlays pour l'immersion contrôlée*
