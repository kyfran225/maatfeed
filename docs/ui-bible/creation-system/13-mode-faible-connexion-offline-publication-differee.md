# 13. MODE FAIBLE CONNEXION, OFFLINE ET PUBLICATION DIFFÉRÉE

## 1. OBJECTIF UX

Garantir que la création fonctionne même avec réseau faible, coupures, data limitée ou téléphone modeste.

## 2. ÉMOTION RECHERCHÉE

L'utilisateur doit sentir que MAATFEED comprend son terrain.
Émotion :

- confiance
- patience
- continuité
- contrôle

## 3. STRUCTURE VISUELLE GLOBALE

Système :

- brouillon local
- file de publication
- upload différé
- compression
- mode léger
- statut réseau
- reprise

## 4. LAYOUT EXACT

### Mobile :
- badge réseau discret
- statut brouillon
- file d'attente accessible
- option publier plus tard

## 5. HIERARCHIE VISUELLE

Priorité :

1. contenu sauvegardé
2. statut réseau
3. publication différée
4. retry
5. détails techniques cachés

## 6. POSITIONNEMENT DES ÉLÉMENTS

- badge offline header
- file attente dans brouillons
- statut upload sur cartes médias
- notification douce quand publié

## 7. DIMENSIONS & ESPACEMENTS

- badge : 24 à 28 px
- item file : 64 à 84 px
- progress : 3 px
- message offline : 44 à 56 px

## 8. COULEURS

- offline : ocre doux
- pending : ambre faible
- erreur : rouge discret
- publié : or/check

## 9. TYPOGRAPHIE

- statut : 12 à 13 px
- file item : 13 à 15 px
- message : 13 px

## 10. BOUTONS

- publier quand réseau revient
- annuler
- réessayer
- compresser
- garder en brouillon

## 11. CARTES

Carte publication différée :

- titre
- type
- statut
- média restant
- action

## 12. ICONOGRAPHIE

- nuage
- horloge
- offline
- retry
- check
- compression

## 13. COMPORTEMENT SCROLL

File d'attente scrollable.
Composer non bloqué.

## 14. ANIMATIONS

- passage pending
- retry
- succès
- retour réseau badge

## 15. MICRO INTERACTIONS

- "sauvegardé localement"
- "en attente de réseau"
- "upload repris"
- "publié"

## 16. GESTURES MOBILE

- swipe item : annuler
- tap statut : détails
- long press : options

## 17. ÉTATS LOADING

- compression
- upload
- sync
- publication

## 18. ÉTATS ERREUR

- retry échoué
- fichier manquant
- stockage
- conflit version

## 19. ÉTATS OFFLINE

État central :

- création complète
- preview locale
- publication différée
- médias gardés
- source validée plus tard

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :
- priorité absolue

### Tablet/desktop :
- file d'attente plus détaillée

## 21. ACCESSIBILITÉ

- statut textuel
- notifications non uniquement couleur
- focus
- actions claires

## 22. PERFORMANCE UX

- stockage maîtrisé
- compression
- sync intelligente
- retry progressif
- nettoyage cache après publication

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Règles centrales :

- ne jamais forcer vidéo lourde
- proposer audio/texte
- compresser
- publier plus tard
- garder local
- reprendre automatiquement

## 24. RÈGLES NON NÉGOCIABLES

- La connexion faible ne doit pas empêcher de créer
- Aucun contenu ne doit disparaître
- La publication différée doit être visible
- Les médias doivent reprendre leur upload
- L'utilisateur doit garder le contrôle

---

*Mode faible connexion, offline et publication différée pour MAATFEED*
