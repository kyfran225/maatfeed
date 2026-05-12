# 17. FEED SEARCH ENTRY & QUICK FILTERS

## 1. OBJECTIF UX

Permettre une recherche rapide depuis le feed sans casser l'immersion.

## 2. ÉMOTION RECHERCHÉE

Maîtrise, rapidité, exploration. La recherche doit ressembler à une porte secrète vers la bibliothèque MAATFEED.

## 3. STRUCTURE VISUELLE GLOBALE

Entrée recherche dans header via icône. Optionnel : barre de recherche compacte sur certains écrans. Filtres rapides sous tabs selon contexte.

## 4. LAYOUT EXACT

Icône recherche dans header 44 px.
Recherche pleine page : input 44-48 px en haut.
Chips filtres : horizontal, hauteur 32-36 px.

## 5. HIERARCHIE VISUELLE

Dans le feed, la recherche reste secondaire. Sur page recherche, elle devient dominante.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Icône à droite du header. Filtres rapides sous tabs, seulement si utiles. Ne pas surcharger la page d'accueil.

## 7. DIMENSIONS & ESPACEMENTS

Input recherche : marge 16 px, radius 12-14 px. Chips : écart 8 px. Padding horizontal chips 12 px.

## 8. COULEURS

Input fond graphite sombre. Focus or. Chips actives or sombre. Inactives graphite.

## 9. TYPOGRAPHIE

Placeholder : 14 px gris. Chips : 12-13 px. Suggestions : 14 px.

## 10. BOUTONS

Effacer recherche, filtres, recherche vocale optionnelle, appliquer filtres.

## 11. CARTES

Résultats rapides peuvent être cartes compactes : vidéo, audio, débat, créateur.

## 12. ICONOGRAPHIE

Loupe, micro, filtre, croix, horloge historique, tendance.

## 13. COMPORTEMENT SCROLL

Filtres rapides peuvent rester sticky sous tabs si actifs. Résultats recherche ont leur propre scroll.

## 14. ANIMATIONS

Ouverture recherche : transition depuis icône vers input. Chips selection : feedback court.

## 15. MICRO INTERACTIONS

Tap recherche : focus input. Tap suggestion : résultat. Tap filtre : sélection immédiate.

## 16. GESTURES MOBILE

Swipe horizontal chips. Keyboard management propre. Swipe down peut fermer recherche si vide.

## 17. ÉTATS LOADING

Skeleton résultats compacts. Suggestions historiques immédiates avant réseau.

## 18. ÉTATS ERREUR

Erreur recherche : message calme + réessayer. Historique et suggestions locales restent.

## 19. ÉTATS OFFLINE

Recherche offline dans cache : contenus sauvegardés, téléchargés, récemment vus.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Desktop : recherche peut être visible en top bar ou sidebar. Mobile : icône puis page/sheet.

## 21. ACCESSIBILITÉ

Input labellisé. Filtres annoncés. Résultats structurés.

## 22. PERFORMANCE UX

Debounce recherche. Résultats cache. Ne pas bloquer feed.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Recherche locale d'abord, réseau ensuite. Indiquer "résultats hors ligne" si nécessaire.

## 24. RÈGLES NON NÉGOCIABLES

Pas de barre de recherche énorme permanente qui écrase le feed. Pas de page recherche vide. Pas de filtres illisibles.

---

*Recherche et filtres rapides pour le feed MAATFEED*
