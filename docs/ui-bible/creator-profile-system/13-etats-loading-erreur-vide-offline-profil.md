# 13. ÉTATS LOADING, ERREUR, VIDE ET OFFLINE DU PROFIL

## 1. OBJECTIF UX

Garantir une expérience profil robuste dans tous les états : chargement, absence de contenu, erreur, réseau faible, offline.

## 2. ÉMOTION RECHERCHÉE

Même quand quelque chose manque, l'utilisateur doit sentir que l'application est stable.

## 3. STRUCTURE VISUELLE GLOBALE

États :

- skeleton profil
- profil vide
- onglet vide
- erreur partielle
- profil privé
- profil supprimé
- offline
- contenu non disponible

## 4. LAYOUT EXACT

Le header doit être conservé dès que possible.

Les erreurs doivent être placées dans la zone concernée, pas remplacer toute la page sauf cas critique.

## 5. HIERARCHIE VISUELLE

Priorité :

1. identité
2. état global
3. action possible
4. détails secondaires

## 6. POSITIONNEMENT DES ÉLÉMENTS

- skeleton header en haut
- état vide dans onglet
- erreur sous tabs
- offline badge en haut
- bouton retry proche erreur

## 7. DIMENSIONS & ESPACEMENTS

- skeleton avatar : même taille réelle
- état vide card : 180 à 260 px hauteur
- message : max 2 lignes
- bouton : 44 px

## 8. COULEURS

- skeleton : gris charbon
- erreur : rouge discret
- vide : gris sable
- offline : ocre
- retry : ambre

## 9. TYPOGRAPHIE

- message état : 14 à 16 px
- détail : 12 à 13 px
- bouton : 14 px

## 10. BOUTONS

- réessayer
- retourner
- explorer
- créer
- modifier profil
- voir contenu cache

## 11. CARTES

Cartes :

- état vide
- erreur
- offline
- privé
- suppression

## 12. ICONOGRAPHIE

- nuage offline
- verrou privé
- profil
- contenu vide
- retry

## 13. COMPORTEMENT SCROLL

Pas de scroll inutile sur état vide simple.

Si header chargé, tabs restent disponibles.

## 14. ANIMATIONS

- skeleton shimmer discret
- retry spinner local
- état vide fade-in

## 15. MICRO INTERACTIONS

- retry
- ouvrir cache
- créer premier contenu
- modifier visibilité

## 16. GESTURES MOBILE

- pull-to-refresh
- swipe entre onglets même si un onglet est vide
- pas de gesture destructive

## 17. ÉTATS LOADING

Loading progressif :

1. header
2. stats
3. tabs
4. contenus

## 18. ÉTATS ERREUR

Erreur partielle d'abord.

Erreur globale seulement si profil impossible à identifier.

## 19. ÉTATS OFFLINE

Offline :

- profil cache
- badge
- contenus cache
- actions pending
- message clair

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Même logique partout.

Desktop peut afficher un panneau détail d'erreur plus complet, sans surcharge.

## 21. ACCESSIBILITÉ

- messages lus par lecteur d'écran
- retry focusable
- état privé expliqué
- contraste

## 22. PERFORMANCE UX

- skeleton léger
- pas de loaders infinis
- timeout raisonnable
- cache

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- afficher cache
- éviter rechargements lourds
- retry manuel
- identité prioritaire

## 24. RÈGLES NON NÉGOCIABLES

- Pas de page blanche
- Pas de spinner infini
- Garder ce qui est disponible
- Les erreurs doivent être réparables
- Offline doit être traité comme un état normal

---

*États loading, erreur, vide et offline du profil pour MAATFEED*
