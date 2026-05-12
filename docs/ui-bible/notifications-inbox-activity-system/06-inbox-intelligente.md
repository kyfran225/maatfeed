# 6. INBOX INTELLIGENTE

## 1. OBJECTIF UX

Créer un espace plus organisé que la simple liste de notifications. L'inbox MAATFEED doit regrouper ce qui demande attention, réponse, reprise ou décision.

## 2. ÉMOTION RECHERCHÉE

Ordre.

L'utilisateur doit ouvrir l'inbox et comprendre immédiatement : "Voici ce qui mérite mon attention."

## 3. STRUCTURE VISUELLE GLOBALE

Inbox divisée en boîtes :

- À traiter
- Réponses directes
- Débats suivis
- Audios à reprendre
- Séries à continuer
- Créateurs suivis
- Système et sécurité
- Archivés

## 4. LAYOUT EXACT

### Mobile :

- header "Inbox"
- résumé court
- cartes de catégories
- liste prioritaire
- filtres

### Desktop :

- colonne gauche catégories
- centre liste
- droite détail

## 5. HIERARCHIE VISUELLE

Inbox priorise les éléments actionnables.

Un simple "nouveau contenu recommandé" ne doit pas entrer dans "À traiter" sauf si l'utilisateur l'a explicitement demandé.

## 6. POSITIONNEMENT DES ÉLÉMENTS

En haut :

- résumé :
  - "3 réponses directes"
  - "2 audios à reprendre"
  - "1 alerte sécurité"

Puis liste prioritaire.

## 7. DIMENSIONS & ESPACEMENTS

- carte catégorie : 92 à 120 px
- liste item : 80 à 130 px
- padding : 16 px
- gap catégories : 12 px
- radius : 22 à 26 px

## 8. COULEURS

### Inbox :

- fond noir charbon
- catégories graphite
- prioritaire ambre
- sécurité ocre
- audio cuivre
- débat ambre profond

## 9. TYPOGRAPHIE

- titre inbox : 24 à 28 px mobile
- catégorie : 15 à 17 px
- compteur : 20 à 24 px
- description : 12 à 14 px

## 10. BOUTONS

Actions :

- traiter maintenant
- répondre
- reprendre
- archiver
- marquer lu
- filtrer
- gérer préférences

## 11. CARTES

Carte catégorie :

- icône
- nom
- compteur
- phrase courte
- état urgent si applicable

Exemple :

"Réponses directes — 4 — Des personnes ont répondu à tes interventions."

## 12. ICONOGRAPHIE

- boîte
- réponse
- débat
- audio
- série
- créateur
- bouclier
- archive

## 13. COMPORTEMENT SCROLL

Inbox doit être plus courte que Notifications.

Elle doit éviter les listes interminables.

Les anciennes activités vont dans centre d'activité ou archives.

## 14. ANIMATIONS

- catégorie se déploie
- compteur se met à jour
- archiver glisse doucement
- passage traité diminue le compteur

## 15. MICRO INTERACTIONS

- tap catégorie filtre
- long press action
- bouton traiter
- archiver avec undo court
- compteur animé doucement

## 16. GESTURES MOBILE

- swipe archiver
- swipe marquer traité
- long press options
- pull-to-refresh

## 17. ÉTATS LOADING

Skeleton catégories d'abord.

Ensuite skeleton liste.

## 18. ÉTATS ERREUR

Si inbox indisponible :

- afficher notifications récentes en fallback
- message :
  "Inbox intelligente indisponible. Les notifications restent accessibles."

## 19. ÉTATS OFFLINE

Inbox offline :

- éléments synchronisés
- actions en attente
- affichage "non actualisé"

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :

- catégories puis liste

### Tablet :

- catégories + liste

### Desktop :

- trois panneaux

## 21. ACCESSIBILITÉ

- catégories annoncées
- compteurs lisibles
- actions au clavier
- état traité/non traité explicite

## 22. PERFORMANCE UX

- calcul inbox prétraité
- cache
- limites par catégorie
- chargement progressif

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- inbox cache-first
- pas de média
- titres et actions d'abord
- synchro différée

## 24. RÈGLES NON NÉGOCIABLES

- Inbox n'est pas une copie de notifications
- Inbox = action et priorité
- Elle doit rester courte
- Elle doit réduire le bruit
- Elle doit fonctionner offline

---

*Inbox intelligente pour MAATFEED*
