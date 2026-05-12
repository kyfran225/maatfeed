# 2. PAGE DÉTAIL D'UN DÉBAT

## 1. OBJECTIF UX

Permettre à l'utilisateur de comprendre immédiatement le sujet, son contexte, son niveau d'activité et les meilleures réponses disponibles.

## 2. ÉMOTION RECHERCHÉE

Entrée dans une conversation importante. La page doit donner une impression de gravité douce, de qualité et de clarté.

## 3. STRUCTURE VISUELLE GLOBALE

La page contient : header de navigation, bloc sujet, statistiques, règles ou contexte, tabs de tri, liste de réponses, composer sticky.

## 4. LAYOUT EXACT

Header : 56 px.
Bloc sujet : 180 à 300 px.
Stats : ligne de 3 à 4 colonnes, hauteur 52 à 70 px.
Tabs : 44 à 48 px.
Liste : cartes réponses.
Composer bas : 52 à 64 px.

## 5. HIERARCHIE VISUELLE

Question dominante. Description courte ensuite. Stats compactes. Les réponses ne commencent pas trop haut pour laisser le sujet exister.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Back en haut gauche. Actions partage/suivre/options en haut droite. Question sous header. Stats sous description. Tabs sticky après bloc sujet.

## 7. DIMENSIONS & ESPACEMENTS

Question : marge 16 px.
Description : 8 à 12 px sous question.
Stats : 16 px sous description.
Tabs : 16 à 20 px sous stats.
Réponses : 12 px sous tabs.

## 8. COULEURS

Bloc sujet : surface noire élevée avec gradient ambre faible. Stats : séparateurs graphite. Tabs : fond noir, actif or. Composer : surface élevée.

## 9. TYPOGRAPHIE

Question : 21 à 24 px.
Description : 14 à 15 px.
Stat nombre : 16 à 18 px semibold.
Stat label : 11 à 12 px gris.

## 10. BOUTONS

Actions haut : retour, partager, suivre, options. CTA bas : "Écrire une réponse..." ou bouton composer complet. Bouton "Nouveau débat" absent sur détail sauf contexte communauté.

## 11. CARTES

Le bloc sujet est une carte hero. Les réponses sont des cartes secondaires. Les réponses épinglées peuvent avoir un halo discret.

## 12. ICONOGRAPHIE

Retour, partage, cloche/suivre, options, stats, réponse, œil, cœur, citation.

## 13. COMPORTEMENT SCROLL

Au scroll, le bloc sujet peut se réduire en header compact affichant une version courte de la question. Les tabs restent sticky. Composer reste accessible.

## 14. ANIMATIONS

Transition feed vers détail : la carte débat peut s'étendre. Header compact apparaît progressivement. Tabs glissent en sticky sans saut.

## 15. MICRO INTERACTIONS

Tap stat réponses : descend à la liste. Tap stat vues : aucune action obligatoire. Tap suivre : icône active dorée + toast. Tap partager : sheet.

## 16. GESTURES MOBILE

Back gesture retourne au feed avec position restaurée. Swipe down si page ouverte comme modal profonde depuis feed. Long press question : copier/citer.

## 17. ÉTATS LOADING

Skeleton du bloc sujet complet, puis réponses. Si question déjà connue depuis feed, afficher question immédiatement et charger détails.

## 18. ÉTATS ERREUR

Si détails manquants mais question disponible, afficher question + message "Détails indisponibles". Réponses peuvent charger séparément.

## 19. ÉTATS OFFLINE

Si débat déjà consulté : afficher cache + badge "hors ligne". Composer enregistre brouillon. Stats peuvent être marquées non actualisées.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Desktop : la page devient panneau central dans workspace. Bloc sujet en haut, réponses au centre, contexte/IA à droite.

## 21. ACCESSIBILITÉ

Question en H1 logique. Stats avec labels textuels. Tabs accessibles. Composer labellisé.

## 22. PERFORMANCE UX

Ne pas attendre toutes les réponses pour afficher le sujet. Précharger réponses top uniquement. Charger le reste au scroll.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Sujet et texte d'abord. Réponses audio en qualité légère. Vidéos à la demande. Documents sans preview lourde.

## 24. RÈGLES NON NÉGOCIABLES

La page détail doit toujours préserver le contexte du débat. Pas de détails noyés par les réponses. Pas de composer qui masque la lecture.

---

*Page détail de débat pour MAATFEED*
