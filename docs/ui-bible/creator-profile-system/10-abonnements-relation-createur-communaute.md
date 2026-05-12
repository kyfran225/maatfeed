# 10. ABONNEMENTS, RELATION CRÉATEUR ET COMMUNAUTÉ

## 1. OBJECTIF UX

Créer une relation claire entre utilisateur, créateur et communauté.

L'utilisateur doit pouvoir :

- suivre
- se désabonner
- soutenir
- voir les séries du créateur
- recevoir des notifications
- comprendre pourquoi il suit quelqu'un

## 2. ÉMOTION RECHERCHÉE

La relation doit être calme, choisie, respectueuse.

Pas de pression sociale. Pas de mécanique agressive.

## 3. STRUCTURE VISUELLE GLOBALE

Éléments :

- bouton suivre
- état suivi
- notifications créateur
- soutien
- abonnements personnels
- suggestions de créateurs similaires

## 4. LAYOUT EXACT

### Sur profil public :

- bouton suivre principal
- soutien secondaire
- menu notifications après suivi
- suggestion séries après follow

### Dans profil personnel :

- liste abonnements
- filtres par sujets
- créateurs actifs

## 5. HIERARCHIE VISUELLE

Priorité :

1. suivre
2. séries du créateur
3. notifications
4. soutien
5. créateurs similaires

## 6. POSITIONNEMENT DES ÉLÉMENTS

- bouton suivre dans header
- notifications dans menu adjacent
- soutien visible mais non agressif
- abonnements dans bibliothèque/profil

## 7. DIMENSIONS & ESPACEMENTS

- bouton suivre : 44 à 52 px
- bouton notification : 40 à 44 px
- carte créateur : 72 à 100 px
- liste abonnements : gap 12 px

## 8. COULEURS

- suivre : ambre plein
- suivi : surface sombre bordée ambre
- soutien : or doux
- notification active : ambre
- désabonner : gris/rouge discret

## 9. TYPOGRAPHIE

- bouton : 14 à 15 px
- carte créateur : 14 px
- sujet : 12 px

## 10. BOUTONS

- suivre
- suivi
- notifications
- soutenir
- désabonner
- voir contenus
- gérer

## 11. CARTES

Cartes :

- créateur suivi
- suggestion créateur
- série suivie
- notification setting

## 12. ICONOGRAPHIE

- suivre
- cloche
- soutien
- créateur
- sujet
- check

## 13. COMPORTEMENT SCROLL

Liste abonnements paginée.

Sur profil, bouton suivre peut devenir sticky compact.

## 14. ANIMATIONS

- follow : transition vers suivi
- cloche : activation douce
- désabonnement : confirmation

## 15. MICRO INTERACTIONS

- après follow : proposer séries phares
- notification activée : toast
- soutien : ouverture sheet

## 16. GESTURES MOBILE

- swipe carte abonnement : options
- long press : gérer notifications
- tap créateur : profil

## 17. ÉTATS LOADING

- follow pending
- soutien pending
- liste abonnements skeleton

## 18. ÉTATS ERREUR

- follow échoué
- notification indisponible
- soutien indisponible

Le bouton doit revenir à l'état stable.

## 19. ÉTATS OFFLINE

- follow mis en attente
- état pending visible
- notifications non modifiées jusqu'à sync

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :

- actions compactes

### Desktop :

- relations visibles dans panneau droit

### Tablet :

- liste abonnements en grille

## 21. ACCESSIBILITÉ

- états suivi/non suivi annoncés
- boutons clairs
- confirmation désabonnement

## 22. PERFORMANCE UX

- état optimiste contrôlé
- rollback si erreur
- cache abonnements

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- follow léger
- mise en attente
- feedback immédiat
- sync plus tard

## 24. RÈGLES NON NÉGOCIABLES

- Le follow doit être clair
- Le soutien ne doit pas être forcé
- Les notifications doivent être contrôlables
- Le désabonnement doit être possible sans culpabilisation
- La relation créateur doit rester respectueuse

---

*Abonnements, relation créateur et communauté pour MAATFEED*
