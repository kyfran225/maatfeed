# 8. BLOCAGE, MASQUAGE, MUTE ET CONTRÔLE UTILISATEUR

## 1. OBJECTIF UX

Donner à l'utilisateur des outils simples pour contrôler son expérience : bloquer, masquer, réduire, muter, filtrer ou ignorer sans devoir quitter la plateforme.

## 2. ÉMOTION RECHERCHÉE

Soulagement.
L'utilisateur doit pouvoir reprendre de l'air dans un débat ou un feed trop chargé.

## 3. STRUCTURE VISUELLE GLOBALE

Actions disponibles :

- masquer un contenu ;
- masquer un sujet ;
- masquer un utilisateur ;
- bloquer un utilisateur ;
- muter un débat ;
- muter un créateur ;
- réduire les contenus similaires ;
- gérer la liste de blocage ;
- annuler action.

## 4. LAYOUT EXACT

### Mobile :

- menu contextuel ;
- bottom sheet confirmation ;
- undo après action simple ;
- confirmation pour blocage.

### Desktop :

- menu "…" ;
- popover ;
- page paramètres sécurité.

## 5. HIERARCHIE VISUELLE

Actions légères :

- masquer ;
- moins comme ça ;
- muter.

Actions fortes :

- bloquer ;
- signaler ;
- restreindre.

Les actions fortes doivent être séparées visuellement.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Menu contextuel sur :

- cartes feed ;
- réponses ;
- profils ;
- débats ;
- notifications.

La gestion globale dans paramètres sécurité.

## 7. DIMENSIONS & ESPACEMENTS

Menu mobile :

- ligne action : 48 à 56 px ;
- icône 20 px ;
- sheet : hauteur selon actions ;
- bouton confirmation : 52 px.

## 8. COULEURS

Actions normales :

- beige/gris chaud.

Actions fortes :

- ocre/cuivre.

Blocage :

- fond graphite ;
- bordure ocre.

## 9. TYPOGRAPHIE

Labels clairs :

- "Masquer ce contenu"
- "Moins de sujets comme ça"
- "Muter ce débat"
- "Bloquer cet utilisateur"
- "Annuler"

## 10. BOUTONS

Actions :

- Confirmer blocage ;
- Annuler ;
- Débloquer ;
- Voir liste ;
- Masquer seulement ;
- Signaler aussi.

## 11. CARTES

Carte utilisateur bloqué :

- nom/symbole ;
- date ;
- raison si l'utilisateur l'a ajoutée ;
- bouton débloquer.

Carte contenu masqué :

- message compact ;
- bouton annuler.

## 12. ICONOGRAPHIE

- œil masqué ;
- cloche barrée ;
- utilisateur bloqué ;
- filtre ;
- undo ;
- bouclier.

## 13. COMPORTEMENT SCROLL

Après masquage, la carte disparaît avec undo.
Après blocage, contenus de l'utilisateur sont masqués dans feed et débats selon règles.

## 14. ANIMATIONS

- carte glisse ;
- undo apparaît ;
- blocage confirmé sans effet dramatique.

## 15. MICRO INTERACTIONS

- tap masquer ;
- undo ;
- tap bloquer ;
- confirmation ;
- débloquer depuis paramètres.

## 16. GESTURES MOBILE

- long press carte ;
- swipe masquer si prévu ;
- tap menu.

Blocage jamais déclenché par swipe seul.

## 17. ÉTATS LOADING

Blocage :

- bouton loading ;
- action locale immédiate si possible ;
- sync en arrière-plan.

## 18. ÉTATS ERREUR

Si blocage échoue :

- appliquer masquage local temporaire ;
- proposer réessayer ;
- message discret.

## 19. ÉTATS OFFLINE

Offline :

- masquage local ;
- blocage en attente ;
- débloquer en attente ;
- synchronisation plus tard.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Mobile :

- sheet.

Tablet :

- popover/sheet.

Desktop :

- menu + paramètres.

## 21. ACCESSIBILITÉ

- actions nommées ;
- confirmation claire ;
- undo accessible ;
- liste blocage navigable.

## 22. PERFORMANCE UX

- masquage instantané ;
- cache préférences ;
- sync différée ;
- pas de reload complet.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- actions locales ;
- file de synchronisation ;
- messages simples ;
- pas de dépendance réseau immédiate.

## 24. RÈGLES NON NÉGOCIABLES

- L'utilisateur contrôle son espace.
- Blocage confirmé.
- Masquage réversible.
- Pas de blocage accidentel.
- Offline supporté.
- Liste de blocage accessible.
- Séparer masquer, muter, bloquer et signaler.

---

*Blocage, masquage, mute et contrôle utilisateur pour MAATFEED*
