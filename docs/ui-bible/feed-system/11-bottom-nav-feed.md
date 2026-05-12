# 11. BOTTOM NAV DU FEED

## 1. OBJECTIF UX

Offrir une navigation principale stable : Accueil, Audio, Créer, Communauté, Profil. Elle doit être compréhensible, tactile et élégante.

## 2. ÉMOTION RECHERCHÉE

Ancrage, sécurité, fluidité. L'utilisateur sait toujours où aller.

## 3. STRUCTURE VISUELLE GLOBALE

Barre basse sombre, icônes fines, labels courts, onglet actif doré, bouton créer central plus fort.

## 4. LAYOUT EXACT

Hauteur : 64-76 px avec safe area.
5 items.
Chaque item : largeur égale.
Icône : 22-24 px.
Label : 10-11 px.
Bouton créer : cercle ou pill 44-52 px.

## 5. HIERARCHIE VISUELLE

Accueil actif dans feed. Créer est visuellement spécial, mais ne doit pas dominer tous les contenus.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Fixée en bas. Icône au-dessus label. Créer au centre, légèrement élevé ou dans cercle doré/blanc selon maquette.

## 7. DIMENSIONS & ESPACEMENTS

Padding vertical : 6-8 px.
Écart icône/label : 3-4 px.
Safe bottom : respectée.

## 8. COULEURS

Fond noir/surface élevée. Bordure supérieure graphite. Actif or. Inactif gris. Bouton créer fond clair/or avec icône charbon ou noire.

## 9. TYPOGRAPHIE

Labels courts : Accueil, Audio, Créer, Communauté, Profil. Police 10-11 px medium.

## 10. BOUTONS

Chaque item est un bouton tactile 44 px minimum. Créer ouvre sheet de création, pas une page froide.

## 11. CARTES

Bottom nav n'est jamais à l'intérieur du feed. Les cartes doivent avoir padding bottom pour ne pas être cachées.

## 12. ICONOGRAPHIE

Accueil maison, Audio note/onde, Créer plus, Communauté groupe/débat, Profil utilisateur. Icônes simples, non cartoon.

## 13. COMPORTEMENT SCROLL

Bottom nav reste fixe. Peut se masquer dans lecteur vidéo plein écran ou full player, mais pas dans feed standard.

## 14. ANIMATIONS

Tap item : icône devient or, label actif, micro lift. Changement page : transition courte.

## 15. MICRO INTERACTIONS

Créer : press plus visible, ouverture sheet. Onglet déjà actif tapé : remonter feed en haut ou refresh selon contexte.

## 16. GESTURES MOBILE

Aucun geste obligatoire. Navigation au tap. Zone safe préservée.

## 17. ÉTATS LOADING

Changement page : nav reste visible, contenu skeleton. Pas de nav loading global.

## 18. ÉTATS ERREUR

Erreur page : nav fonctionnelle. L'utilisateur peut changer de section.

## 19. ÉTATS OFFLINE

Nav reste utilisable. Sections non disponibles affichent offline localisé.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Tablet large : bottom nav peut devenir rail gauche. Desktop : sidebar complète avec labels.

## 21. ACCESSIBILITÉ

Labels visibles et accessibles. Onglet actif annoncé. Hitbox correcte.

## 22. PERFORMANCE UX

Composant fixe, léger, pas de blur coûteux si performances faibles.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

La nav doit apparaître instantanément et permettre l'accès au contenu cache.

## 24. RÈGLES NON NÉGOCIABLES

Pas de nav flottante qui bouge sans raison. Pas de label illisible. Pas de bouton créer qui masque le mini-player. Pas de plus central sans fonction claire.

---

*Bottom navigation pour le feed MAATFEED*
