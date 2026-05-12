# 10. BROUILLONS, PRÉVISUALISATION ET PUBLICATION

## 1. OBJECTIF UX

Sécuriser toute création.
L'utilisateur doit pouvoir commencer, quitter, revenir, prévisualiser et publier sans peur.

## 2. ÉMOTION RECHERCHÉE

Sensation :

- sécurité
- maîtrise
- confiance
- calme
- professionnalisme

## 3. STRUCTURE VISUELLE GLOBALE

Système :

- autosave
- brouillons récents
- preview exacte
- checklist avant publication
- publication
- confirmation
- partage

## 4. LAYOUT EXACT

### Mobile :
- badge sauvegarde dans header
- bouton aperçu
- publier
- preview en full sheet
- confirmation après publication

### Desktop :
- preview live à droite
- brouillons à gauche
- publier dans panneau droit

## 5. HIERARCHIE VISUELLE

Priorité :

1. contenu sauvegardé
2. aperçu
3. corrections nécessaires
4. publication
5. partage

## 6. POSITIONNEMENT DES ÉLÉMENTS

- autosave header
- preview haut droite
- publier haut droite ou bas fixed
- checklist avant publication dans sheet
- brouillons accessibles depuis menu

## 7. DIMENSIONS & ESPACEMENTS

- badge autosave : 24 à 28 px hauteur
- preview sheet : 90 à 100 % hauteur
- checklist item : 48 à 64 px
- confirmation card : 260 à 360 px

## 8. COULEURS

- sauvegardé : ambre doux
- brouillon : ocre
- prêt : ambre
- erreur : rouge discret
- publié : or sobre

## 9. TYPOGRAPHIE

- badge : 11 à 12 px
- checklist : 13 à 15 px
- confirmation : 18 à 24 px

## 10. BOUTONS

- aperçu
- publier
- sauvegarder
- reprendre
- supprimer brouillon
- modifier
- partager
- voir publication

## 11. CARTES

Cartes :

- brouillon
- preview
- checklist
- publication réussie
- contenu en attente offline

## 12. ICONOGRAPHIE

- sauvegarde
- œil
- check
- alerte
- publication
- partage

## 13. COMPORTEMENT SCROLL

Preview doit scroller comme le vrai feed ou la vraie page.
Checklist reste compacte.

## 14. ANIMATIONS

- autosave pulse
- preview ouverture
- publication progress
- succès avec carte lumineuse discrète

## 15. MICRO INTERACTIONS

- "sauvegardé à l'instant"
- checklist item validé
- publier disabled jusqu'au minimum requis
- succès : options partager/voir

## 16. GESTURES MOBILE

- swipe down preview
- tap modifier depuis preview
- swipe brouillon : options
- long press brouillon : menu

## 17. ÉTATS LOADING

- autosave
- preview
- publication
- synchronisation offline

## 18. ÉTATS ERREUR

- sauvegarde impossible
- publication échouée
- brouillon corrompu
- réseau

Toujours proposer copie locale ou retry.

## 19. ÉTATS OFFLINE

- brouillon local
- publication en attente
- file de publication
- statut clair
- annulation possible

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :
- preview sheet

### Tablet :
- preview split

### Desktop :
- preview live

## 21. ACCESSIBILITÉ

- état sauvegarde annoncé
- erreurs textuelles
- boutons focus
- preview navigable

## 22. PERFORMANCE UX

- autosave debounced
- preview optimisée
- brouillons indexés localement
- publication non bloquante visuellement

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- local-first
- retry
- publication différée
- statut clair
- pas de perte

## 24. RÈGLES NON NÉGOCIABLES

- Aucun brouillon ne doit être perdu
- L'aperçu doit être fidèle
- La publication doit être réversible avant validation finale
- Offline doit permettre de continuer
- L'utilisateur doit toujours savoir si son contenu est sauvegardé

---

*Brouillons, prévisualisation et publication pour MAATFEED*
