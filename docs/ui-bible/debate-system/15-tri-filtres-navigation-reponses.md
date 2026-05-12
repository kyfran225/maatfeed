# 15. TRI, FILTRES & NAVIGATION DANS LES RÉPONSES

## 1. OBJECTIF UX

Aider l'utilisateur à lire un débat dense selon ses besoins : pertinent, récent, populaire, audio, vidéo, réponses IA, réponses sourcées.

## 2. ÉMOTION RECHERCHÉE

Contrôle, clarté, exploration. L'utilisateur doit pouvoir trouver le bon angle sans fouiller dans un chaos.

## 3. STRUCTURE VISUELLE GLOBALE

Tabs de tri sous bloc sujet : "Pertinentes", "Récentes", "Top", "Audio", "Vidéo", "Sourcées". Sur mobile, une partie peut être dans un sheet filtres.

## 4. LAYOUT EXACT

Barre tabs : 44 à 48 px.
Tabs visibles : 3 à 4 max.
Autres filtres dans bouton "Filtres".
Chips filtres : 32 à 36 px.

## 5. HIERARCHIE VISUELLE

Tri principal visible. Filtres avancés cachés mais accessibles. L'onglet actif doit être évident.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Tabs sticky sous header compact après scroll. Bouton filtres à droite si nécessaire.

## 7. DIMENSIONS & ESPACEMENTS

Écart tabs : 18 à 24 px. Underline actif : 2 px. Chips filtres : 8 px entre elles.

## 8. COULEURS

Actif or. Inactif gris. Fond tabs noir. Filtres actifs avec bordure or.

## 9. TYPOGRAPHIE

Tabs : 13 à 14 px. Chips : 12 à 13 px.

## 10. BOUTONS

Pertinentes, Récentes, Top, Filtres, Réinitialiser. Bouton filtres icône + label si place.

## 11. CARTES

Le tri change l'ordre des cartes, pas leur style. Une réponse peut être surlignée si elle correspond au filtre.

## 12. ICONOGRAPHIE

Tri, filtre, audio, vidéo, document, IA, source.

## 13. COMPORTEMENT SCROLL

Changer tri garde l'utilisateur près du haut des réponses, pas en haut complet du débat sauf logique claire. Chaque tri peut conserver sa position.

## 14. ANIMATIONS

Underline glisse. Liste change avec fade court ou skeleton minimal si réseau.

## 15. MICRO INTERACTIONS

Tap filtre : sélection immédiate. Tap réinitialiser : retour pertinent. Badge nombre de filtres actifs.

## 16. GESTURES MOBILE

Swipe horizontal tabs. Scroll horizontal chips. Pas de conflit avec back gesture.

## 17. ÉTATS LOADING

Skeleton de réponses uniquement, sujet intact. Si résultats cache, afficher cache puis refresh.

## 18. ÉTATS ERREUR

Erreur tri : message compact dans liste + réessayer. Revenir au tri précédent possible.

## 19. ÉTATS OFFLINE

Filtres sur cache disponibles. Indiquer si résultats non actualisés.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Desktop : filtres avancés dans panneau droit ou barre supérieure. Mobile : sheet.

## 21. ACCESSIBILITÉ

Tabs accessibles, actif annoncé, filtres labellisés.

## 22. PERFORMANCE UX

Ne pas recharger tout si tri local possible. Pagination par tri.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Tri cache d'abord. Filtres médias peuvent afficher moins de résultats offline.

## 24. RÈGLES NON NÉGOCIABLES

Pas de dix onglets visibles sur mobile. Pas de changement de tri qui vide brutalement l'écran. Pas de filtres incompréhensibles.

---

*Tri, filtres et navigation pour le débat MAATFEED*
