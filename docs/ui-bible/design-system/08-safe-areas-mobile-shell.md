# 8. SAFE AREAS & MOBILE SHELL

## 1. OBJECTIF UX

Assurer une expérience mobile impeccable sur Android, iPhone, PWA, navigateurs mobiles, écrans avec encoche, barres système et zones tactiles variables.

## 2. ÉMOTION RECHERCHÉE

Confort, solidité, application native. MAATFEED doit se sentir comme une app installée, pas une page web coincée dans un navigateur.

## 3. STRUCTURE VISUELLE GLOBALE

Le shell mobile comprend : status area, header/app bar, contenu, mini-player optionnel, bottom nav, safe area bas.

## 4. LAYOUT EXACT

- **Header mobile** : 52 à 60 px hors safe top
- **Bottom nav** : 56 à 64 px + safe bottom
- **Mini-player** : 56 à 72 px, placé au-dessus bottom nav
- **CTA sticky** : 48 à 52 px hauteur, marge 16 px, au-dessus safe area

## 5. HIERARCHIE VISUELLE

Le contenu reste roi. Le shell ne doit pas voler l'attention. La bottom nav guide, le mini-player accompagne, le header oriente.

## 6. POSITIONNEMENT DES ÉLÉMENTS

- Les actions critiques doivent être accessibles au pouce
- Les boutons de fermeture en haut doivent avoir une hitbox large
- Les inputs de réponse se placent en bas au-dessus du clavier

## 7. DIMENSIONS & ESPACEMENTS

- **Safe bottom minimum** : 16 px quand nécessaire
- **Padding bottom contenu** : hauteur bottom nav + mini-player + 16 px si actifs
- **Padding top** : header + 8 à 12 px

## 8. COULEURS

Shell sombre, semi-translucide seulement si performance correcte. Bottom nav fond noir/graphite avec bordure supérieure faible.

## 9. TYPOGRAPHIE

- **Labels bottom nav** : 10 à 11 px
- **Titres header** : 15 à 17 px semibold
- **Métadonnées shell** : 12 px

## 10. BOUTONS

- **Boutons header** : 44 px hitbox, icône 20 à 22 px
- **CTA bas** : minimum 48 px hauteur

## 11. CARTES

Les cartes ne doivent jamais être masquées par le shell. Dernière carte d'une liste doit avoir assez de marge basse.

## 12. ICONOGRAPHIE

- **Bottom nav** : icônes 22 à 24 px
- Onglet actif doré
- Onglet inactif gris
- Le bouton créer peut être central, plus visible, mais pas clownesque

## 13. COMPORTEMENT SCROLL

Le header peut se masquer partiellement dans le feed immersif, mais doit revenir au scroll vers le haut. Bottom nav reste stable sauf full player ou mode immersion.

## 14. ANIMATIONS

- **Bottom nav** : apparition/disparition 180 à 240 ms
- **Mini-player** : slide up depuis bas ou morph depuis player

## 15. MICRO INTERACTIONS

- Tap onglet : icône active dorée + petit déplacement vertical ou halo
- Tap créer : ouverture sheet avec retour tactile

## 16. GESTURES MOBILE

- Swipe up sur mini-player ouvre full player
- Swipe down sur full player revient au mini-player
- Swipe back natif doit être respecté

## 17. ÉTATS LOADING

Shell doit apparaître immédiatement même si contenu absent. Skeleton sous shell.

## 18. ÉTATS ERREUR

Erreur globale peut apparaître dans le contenu, pas remplacer tout le shell sauf crash total.

## 19. ÉTATS OFFLINE

Bandeau offline peut être intégré au shell supérieur ou inférieur. Il ne doit pas casser la bottom nav.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

- **Tablet** : bottom nav peut devenir rail latéral si largeur suffisante
- **Desktop** : navigation latérale ou top navigation selon espace, avec player sticky

## 21. ACCESSIBILITÉ

- Zones tactiles 44 px minimum
- Navigation claire pour lecteur d'écran
- Focus visible en PWA desktop

## 22. PERFORMANCE UX

Shell statique et léger. Éviter recalculs lors du scroll. Garder bottom nav performante.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Le shell permet de naviguer même si contenu réseau tarde. Afficher cache, téléchargements, brouillons, audio local.

## 24. RÈGLES NON NÉGOCIABLES

- Ne jamais laisser le contenu sous la navigation
- Ne jamais rendre la bottom nav illisible
- Ne jamais masquer un input par le clavier

---

*Shell mobile pour une expérience native et premium*
