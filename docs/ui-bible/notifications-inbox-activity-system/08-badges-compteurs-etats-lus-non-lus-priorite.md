# 8. BADGES, COMPTEURS, ÉTATS LUS/NON LUS ET PRIORITÉ

## 1. OBJECTIF UX

Faire comprendre l'importance et l'état des activités sans transformer l'interface en sapin de Noël numérique.

## 2. ÉMOTION RECHERCHÉE

Maîtrise tranquille.

Les compteurs doivent informer sans stresser.

## 3. STRUCTURE VISUELLE GLOBALE

Éléments :

- badge global
- badge par catégorie
- point non-lu
- compteur groupé
- priorité
- état traité
- état archivé
- état silencieux

## 4. LAYOUT EXACT

### Badge global :

- sur icône notification
- petit
- maximum visuel "9+" ou "99+" selon choix
- ne doit pas déformer la navigation

### Badge catégorie :

- dans onglets
- compact
- visible sans dominer

## 5. HIERARCHIE VISUELLE

### Critique :

- priorité haute

### Direct :

- priorité moyenne-haute

### Information :

- priorité normale

### Recommandation :

- priorité basse

Le badge global doit plutôt refléter les éléments utiles, pas toute activité brute.

## 6. POSITIONNEMENT DES ÉLÉMENTS

### Badge :

- coin supérieur droit de l'icône
- alignement précis
- pas trop proche du bord écran

### Point non-lu :

- dans carte
- à droite ou liseré gauche
- pas les deux si surcharge

## 7. DIMENSIONS & ESPACEMENTS

### Badge rond :

- 16 à 20 px
- texte 10 à 11 px

### Point non-lu :

- 8 à 10 px

### Liseré :

- 2 à 3 px

## 8. COULEURS

### Non-lu :

- ambre/or

### Critique :

- ocre/cuivre intense

### Lu :

- pas de couleur spéciale

### Archivé :

- gris chaud

## 9. TYPOGRAPHIE

Compteurs :

- chiffres lisibles
- pas trop petits
- éviter textes longs dans badges

## 10. BOUTONS

Actions associées :

- marquer lu
- marquer non-lu
- archiver
- prioriser
- réduire notifications similaires

## 11. CARTES

État carte :

- non-lu : surface plus claire + point
- lu : surface normale
- priorité : badge discret
- traité : coche subtile ou disparition de la section "À traiter"

## 12. ICONOGRAPHIE

- point
- coche
- archive
- priorité
- silencieux
- cloche barrée

## 13. COMPORTEMENT SCROLL

Les compteurs doivent se mettre à jour sans repositionner brutalement la liste.

## 14. ANIMATIONS

- badge change avec petite transition
- pas de rebond cartoon
- disparition non-lu douce
- archive glisse

## 15. MICRO INTERACTIONS

- tap point : lu
- long press : priorité
- tap badge catégorie : filtre
- undo après archive

## 16. GESTURES MOBILE

- swipe lu
- swipe archiver
- long press priorité
- tap compteur catégorie

## 17. ÉTATS LOADING

Si compteur inconnu :

- pas afficher 0 par défaut
- afficher placeholder discret ou rien
- éviter faux compteur

## 18. ÉTATS ERREUR

Si compteur échoue :

- ne pas bloquer
- afficher liste si possible
- recalculer plus tard

## 19. ÉTATS OFFLINE

Compteurs offline :

- basés sur cache
- indication discrète si non actualisé
- actions locales en attente

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :

- badges minimalistes

### Desktop :

- compteurs par catégorie visibles

### Tablet :

- entre les deux

## 21. ACCESSIBILITÉ

- non-lu annoncé textuellement
- priorité annoncée
- badges lisibles
- pas de couleur seule

## 22. PERFORMANCE UX

- compteur global léger
- calcul côté serveur ou cache
- mise à jour optimiste prudente

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- badge cache
- synchronisation différée
- éviter rafraîchissements incessants

## 24. RÈGLES NON NÉGOCIABLES

- Pas de badge anxiogène
- Pas de compteur gonflé artificiellement
- Priorité claire
- Non-lu compréhensible sans couleur
- L'utilisateur contrôle le bruit

---

*Badges, compteurs, états lus/non lus et priorité pour MAATFEED*
