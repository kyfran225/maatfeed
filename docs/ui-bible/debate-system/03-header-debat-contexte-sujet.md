# 3. HEADER DÉBAT & CONTEXTE DU SUJET

## 1. OBJECTIF UX

Maintenir l'orientation de l'utilisateur dans un débat long, même après plusieurs écrans de scroll.

## 2. ÉMOTION RECHERCHÉE

Sécurité cognitive. L'utilisateur sait toujours de quel sujet on parle.

## 3. STRUCTURE VISUELLE GLOBALE

Header avec retour, titre compact, actions. Au départ, il reste discret. Au scroll, il affiche une version courte de la question.

## 4. LAYOUT EXACT

Header hauteur : 52 à 60 px.
Back : hitbox 44 px.
Titre compact : 1 ligne, ellipsé.
Actions droite : 2 icônes visibles max, options dans menu.

## 5. HIERARCHIE VISUELLE

La question complète reste dans le bloc sujet. Le header compact sert d'ancre, pas de doublon lourd.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Back gauche. Titre au centre ou gauche après back. Partage/suivre/options droite. Si titre trop long, ellipsis.

## 7. DIMENSIONS & ESPACEMENTS

Padding horizontal : 8 à 16 px.
Écart icônes : 4 à 8 px.
Titre max : espace restant entre actions.

## 8. COULEURS

Header noir avec bordure basse graphite faible quand sticky. Titre blanc chaud. Actions gris/or selon état.

## 9. TYPOGRAPHIE

Titre compact : 14 à 16 px semibold.
Meta éventuelle : 11 à 12 px.

## 10. BOUTONS

Retour, suivre, partager, options. Suivre actif : or. Options ouvre sheet.

## 11. CARTES

Header n'est pas une carte. Il peut toutefois reprendre un léger fond blur/surface si contenu passe dessous.

## 12. ICONOGRAPHIE

Chevrons, partage, cloche/suivi, trois points. Icônes fines.

## 13. COMPORTEMENT SCROLL

Avant seuil : header sans titre ou titre page simple. Après seuil : titre compact de la question apparaît. Tabs peuvent coller sous header.

## 14. ANIMATIONS

Titre compact fade/slide léger. Bordure basse apparaît progressivement. Pas de clignotement.

## 15. MICRO INTERACTIONS

Tap titre compact : remonte au bloc sujet. Tap suivre : feedback. Tap options : sheet.

## 16. GESTURES MOBILE

Back gesture prioritaire. Swipe down possible si débat ouvert en overlay.

## 17. ÉTATS LOADING

Header visible immédiatement. Si titre inconnu, afficher "Débat" puis remplacer.

## 18. ÉTATS ERREUR

Header reste fonctionnel même si contenu échoue. Retour toujours disponible.

## 19. ÉTATS OFFLINE

Header peut afficher badge discret offline si page cache.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Desktop : header peut être intégré au panneau détail. Actions plus nombreuses possibles, mais groupées.

## 21. ACCESSIBILITÉ

Retour labellisé. Titre compact annoncé. Actions labellisées.

## 22. PERFORMANCE UX

Header sticky léger. Éviter blur lourd si performances faibles.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Header et titre connus depuis feed doivent apparaître sans réseau.

## 24. RÈGLES NON NÉGOCIABLES

Pas de header qui cache la question. Pas d'actions trop nombreuses. Pas de retour inaccessible.

---

*Header débat et contexte pour MAATFEED*
