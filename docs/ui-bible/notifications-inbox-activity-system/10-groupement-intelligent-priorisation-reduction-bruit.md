# 10. GROUPEMENT INTELLIGENT, PRIORISATION ET RÉDUCTION DU BRUIT

## 1. OBJECTIF UX

Réduire le volume apparent des notifications sans perdre les informations importantes.

## 2. ÉMOTION RECHERCHÉE

Soulagement.

L'utilisateur doit sentir que MAATFEED trie avec intelligence.

## 3. STRUCTURE VISUELLE GLOBALE

Groupements :

- par débat
- par créateur
- par série
- par type
- par journée
- par priorité
- par action requise

## 4. LAYOUT EXACT

### Groupe fermé :

- titre
- compteur
- aperçu 1 à 2 éléments
- bouton développer

### Groupe ouvert :

- sous-liste indentée
- actions groupées
- bouton replier

## 5. HIERARCHIE VISUELLE

Même groupé, un élément critique doit pouvoir remonter.

Les groupes ne doivent pas cacher une réponse directe importante.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Groupes dans la liste à la place des multiples notifications.

Le compteur du groupe apparaît à droite.

L'aperçu reste sous le titre.

## 7. DIMENSIONS & ESPACEMENTS

### Groupe fermé :

- 96 à 130 px

### Groupe ouvert :

- hauteur variable
- indentation 12 à 18 px
- sous-item 64 à 90 px

## 8. COULEURS

### Groupe :

- surface légèrement plus dense
- bordure ambre si non-lu
- sous-items plus mats

## 9. TYPOGRAPHIE

- titre groupe : 15 à 17 px
- compteur : 12 px
- aperçu : 13 px
- sous-item : 13 à 14 px

## 10. BOUTONS

Actions :

- développer
- replier
- tout marquer lu
- ouvrir le plus important
- gérer ce groupe

## 11. CARTES

### Groupe débat :

"Débat : Origines de la MAAT"
"8 nouvelles réponses, dont 2 audios"

### Groupe série :

"Série : Kemet et justice"
"2 nouveaux épisodes"

## 12. ICONOGRAPHIE

- pile
- chevron
- compteur
- type dominant
- priorité

## 13. COMPORTEMENT SCROLL

Déplier un groupe ne doit pas propulser l'utilisateur ailleurs.

Si le groupe est long, limiter l'ouverture et proposer "voir tout".

## 14. ANIMATIONS

- accordéon doux
- compteur qui baisse
- sous-items qui apparaissent progressivement

## 15. MICRO INTERACTIONS

- tap compteur développe
- tap titre ouvre résumé
- long press gère notifications similaires
- action groupée avec undo

## 16. GESTURES MOBILE

- swipe groupe marquer lu
- long press gérer
- tap chevron développer

## 17. ÉTATS LOADING

Skeleton groupe :

- carte large
- compteur fantôme
- deux lignes aperçu

## 18. ÉTATS ERREUR

Si groupe incomplet :

- afficher ce qui est chargé
- message discret :
  "Certaines activités de ce groupe ne sont pas disponibles."

## 19. ÉTATS OFFLINE

Groupement basé sur cache.

Possibilité de déplier uniquement éléments déjà synchronisés.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :

- groupes fermés par défaut

### Desktop :

- groupes ouverts partiellement selon espace

### Tablet :

- groupes + preview

## 21. ACCESSIBILITÉ

- groupe annoncé avec nombre
- état ouvert/fermé
- navigation sous-items claire
- actions groupées nommées

## 22. PERFORMANCE UX

- groupement côté backend ou pré-calcul
- ne pas rendre trop d'items
- virtualisation si besoin

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- groupement réduit données
- charger aperçus seulement
- détails à la demande

## 24. RÈGLES NON NÉGOCIABLES

- Grouper sans cacher l'important
- Réduire le bruit
- Respecter les priorités
- L'utilisateur doit pouvoir déplier
- Ne pas multiplier les alertes identiques

---

*Groupement intelligent, priorisation et réduction du bruit pour MAATFEED*
