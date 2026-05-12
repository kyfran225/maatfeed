# 4. THREAD HIÉRARCHISÉ DES RÉPONSES

## 1. OBJECTIF UX

Afficher les réponses de manière claire, avec hiérarchie, profondeur limitée et accès aux sous-réponses sans effet labyrinthe.

## 2. ÉMOTION RECHERCHÉE

Clarté, conversation maîtrisée, richesse sans chaos. L'utilisateur doit pouvoir parcourir un débat dense sans fatigue.

## 3. STRUCTURE VISUELLE GLOBALE

Chaque réponse est une carte ou une surface avec auteur, contenu, format, réactions, actions. Les sous-réponses sont limitées visuellement à deux niveaux visibles par défaut.

## 4. LAYOUT EXACT

Niveau 1 : carte pleine largeur.
Niveau 2 : indent 16 à 24 px avec ligne verticale subtile.
Niveau 3 et plus : résumé "Voir X réponses" plutôt qu'affichage complet.
Réponse dense : hauteur variable, mais contenu initial limité.

## 5. HIERARCHIE VISUELLE

Réponses top et épinglées en haut. Sous-réponses plus compactes. Les réponses IA/modérateur peuvent être signalées.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Avatar gauche, auteur et meta en haut, contenu dessous, actions en bas. Ligne de thread à gauche des sous-réponses.

## 7. DIMENSIONS & ESPACEMENTS

Carte niveau 1 padding : 14 à 16 px.
Sous-réponse padding : 12 à 14 px.
Indent : 18 à 24 px.
Écart vertical : 10 à 14 px.
Ligne thread : 1 px, opacité faible.

## 8. COULEURS

Niveau 1 : surface sombre.
Sous-réponse : surface légèrement plus discrète.
Ligne thread : graphite.
Réponse active/citée : bordure or faible.

## 9. TYPOGRAPHIE

Auteur : 13 à 14 px.
Contenu : 14 à 16 px.
Meta : 11 à 12 px.
Actions : 12 à 13 px.

## 10. BOUTONS

Répondre, citer, aimer, sauvegarder, partager, plus. Sous-réponses peuvent avoir actions réduites.

## 11. CARTES

Les cartes doivent rester légères. Éviter de mettre chaque sous-réponse dans une boîte trop lourde. Utiliser lignes et indentation.

## 12. ICONOGRAPHIE

Réponse, citation, cœur, audio, vidéo, document, options. Les formats multimédia sont indiqués près du contenu.

## 13. COMPORTEMENT SCROLL

Les threads longs se replient. Ouvrir un thread conserve la position. Retour depuis détail réponse revient au même niveau.

## 14. ANIMATIONS

Expansion sous-réponses : hauteur douce 180 à 260 ms. Surlignage réponse ciblée : halo or temporaire.

## 15. MICRO INTERACTIONS

Tap "Voir les réponses" : expansion. Tap citation : scroll vers source si disponible. Tap auteur : profil.

## 16. GESTURES MOBILE

Long press réponse : menu. Swipe léger sur une réponse : citer ou sauvegarder si activé. Pas de swipe destructif direct.

## 17. ÉTATS LOADING

Skeleton pour réponses et sous-réponses. Expansion affiche skeleton inline si sous-réponses non chargées.

## 18. ÉTATS ERREUR

Si sous-réponses échouent : message compact dans le thread, bouton réessayer. Ne pas fermer tout le thread.

## 19. ÉTATS OFFLINE

Threads déjà consultés disponibles. Réponse à une sous-réponse sauvegardée en brouillon avec cible.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Desktop : threads peuvent être plus larges et afficher plus de contexte, mais garder profondeur visible limitée. Panneau latéral pour thread détaillé possible.

## 21. ACCESSIBILITÉ

Niveaux de réponse annoncés. Actions labellisées. Expansion/repli accessibles.

## 22. PERFORMANCE UX

Limiter rendu profond. Charger sous-réponses à la demande. Éviter recalcul massif sur thread long.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Afficher réponses top d'abord. Sous-réponses à la demande. Texte prioritaire, médias différés.

## 24. RÈGLES NON NÉGOCIABLES

Pas de thread infini visuellement affiché. Pas de réponse noyée sans auteur. Pas de sous-réponses qui détruisent la lisibilité mobile.

---

*Thread hiérarchisé pour le débat MAATFEED*
