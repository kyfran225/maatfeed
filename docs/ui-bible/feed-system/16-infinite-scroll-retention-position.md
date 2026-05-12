# 16. INFINITE SCROLL, RÉTENTION & MÉMOIRE DE POSITION

## 1. OBJECTIF UX

Permettre une exploration continue sans perte de contexte, avec retour exact à la carte vue après ouverture d'un détail.

## 2. ÉMOTION RECHERCHÉE

Confort, continuité, confiance. L'utilisateur ne doit jamais avoir peur de perdre sa place.

## 3. STRUCTURE VISUELLE GLOBALE

Feed infini par blocs. Position mémorisée par tab. Cartes déjà chargées conservées. Détails ouverts sans détruire l'état du feed.

## 4. LAYOUT EXACT

Chargement suivant déclenché avant fin de liste. Skeleton 2-3 cartes en bas. Retour détail restaure scroll, carte active et média/audio.

## 5. HIERARCHIE VISUELLE

La continuité prime. Le feed ne doit pas se réinitialiser sans action explicite.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Skeletons en bas de feed. Indicateur "nouveaux contenus" en haut si refresh arrière-plan, pas insertion brutale.

## 7. DIMENSIONS & ESPACEMENTS

Skeleton bas : même dimensions que cartes réelles. Bouton "Voir nouveaux contenus" : pill 36-40 px sous tabs ou flottant haut.

## 8. COULEURS

Indicateur nouveaux contenus : surface sombre + bordure or + texte or/blanc.

## 9. TYPOGRAPHIE

Message court : "Nouveaux contenus disponibles", "Retour à votre position". 12-13 px.

## 10. BOUTONS

"Voir les nouveaux" ne doit pas forcer. Bouton flottant discret.

## 11. CARTES

Les cartes gardent leurs états : like, save, position vidéo, audio actif, commentaires préchargés.

## 12. ICONOGRAPHIE

Icône flèche haut pour nouveaux contenus. Loader discret pour bas de liste.

## 13. COMPORTEMENT SCROLL

Pas de jump. Pas d'insertion en haut pendant lecture. Si refresh manuel, l'utilisateur accepte le repositionnement.

## 14. ANIMATIONS

Nouveaux contenus : bouton slide/fade. Ajout bas : skeleton remplacé par cartes sans shift.

## 15. MICRO INTERACTIONS

Tap "voir nouveaux" : scroll doux en haut ou insertion contrôlée. Retour détail : carte peut être brièvement surlignée.

## 16. GESTURES MOBILE

Pull to refresh depuis le haut. Back gesture restaure position. Swipe entre tabs restaure position de chaque tab.

## 17. ÉTATS LOADING

Chargement suivant non bloquant. Initial loading seulement au premier accès. Refresh background discret.

## 18. ÉTATS ERREUR

Erreur bas de liste : petite carte "Impossible de charger plus" + réessayer. Feed existant reste.

## 19. ÉTATS OFFLINE

Infinite scroll s'arrête proprement sur cache. Message "Fin des contenus disponibles hors ligne".

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Desktop : chaque panel garde son scroll. Feed central restaure position indépendamment du panneau détail.

## 21. ACCESSIBILITÉ

Annoncer chargement de nouveaux contenus sans perturber la lecture. Bouton nouveaux contenus focusable.

## 22. PERFORMANCE UX

Virtualisation ou stratégie légère pour longues listes. Garder médias lourds déchargés hors viewport.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Charger par petits lots. Préserver cache. Réessayer en arrière-plan. Ne pas vider liste existante.

## 24. RÈGLES NON NÉGOCIABLES

Ne jamais réinitialiser la position après détail. Ne jamais vider le feed sur erreur. Ne jamais insérer des cartes au-dessus pendant que l'utilisateur lit.

---

*Infinite scroll et rétention pour le feed MAATFEED*
