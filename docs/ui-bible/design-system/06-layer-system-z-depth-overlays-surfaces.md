# 6. LAYER SYSTEM — Z-DEPTH, OVERLAYS & SURFACES

## 1. OBJECTIF UX

Organiser les couches visuelles pour que les menus, sheets, modales, players, toasts et overlays n'entrent jamais en conflit.

## 2. ÉMOTION RECHERCHÉE

Maîtrise, fluidité, orientation. L'utilisateur doit comprendre immédiatement ce qui est principal, secondaire ou temporaire.

## 3. STRUCTURE VISUELLE GLOBALE

Les couches officielles : fond global, contenu scrollable, headers, actions flottantes, mini-player, bottom nav, bottom sheets, overlays, modales, toasts critiques.

## 4. LAYOUT EXACT

- **Niveau 0** : fond
- **Niveau 1** : contenu
- **Niveau 2** : cartes élevées
- **Niveau 3** : header sticky/bottom nav
- **Niveau 4** : mini-player
- **Niveau 5** : bottom sheet
- **Niveau 6** : overlay sombre
- **Niveau 7** : modal
- **Niveau 8** : toast critique ou permission prompt

## 5. HIERARCHIE VISUELLE

Une seule couche dominante à la fois. Si une modal est ouverte, la page derrière devient secondaire. Si le full player est ouvert, la bottom nav disparaît ou passe clairement au second plan.

## 6. POSITIONNEMENT DES ÉLÉMENTS

- Les overlays couvrent tout l'écran
- Les sheets partent du bas
- Les modales sont centrées
- Les toasts sont en haut ou bas selon contexte, jamais sur un CTA critique

## 7. DIMENSIONS & ESPACEMENTS

- **Overlay opacity** : 50 à 72 % selon profondeur
- **Blur** : léger, désactivable en mode performance
- **Toast** : marge 16 px, largeur utile
- **Modal mobile** : largeur utile 358 px, max 90 % hauteur

## 8. COULEURS

- Overlay noir translucide
- Surfaces modales graphite/noir
- Bordure graphite
- Accent or pour action

## 9. TYPOGRAPHIE

Les couches temporaires doivent avoir des titres courts, lisibles, hiérarchisés. Aucun texte long dans toast.

## 10. BOUTONS

Les actions de modal sont en bas. Primaire à droite ou pleine largeur selon mobile. Annuler en secondaire sombre.

## 11. CARTES

Une carte ouverte en détail peut devenir une surface de niveau supérieur avec fond plus profond et bordure plus visible.

## 12. ICONOGRAPHIE

Icône de fermeture toujours visible : 24 px dans hitbox 44 px. Pas de fermeture minuscule.

## 13. COMPORTEMENT SCROLL

Quand une sheet ou modal est ouverte, le scroll arrière doit être bloqué. Les sheets longues ont leur propre scroll interne.

## 14. ANIMATIONS

- **Overlay fade** : 160 à 220 ms
- **Sheet slide** : 260 à 360 ms
- **Modal scale/fade** : 180 à 240 ms
- **Toast slide/fade** : 180 ms

## 15. MICRO INTERACTIONS

Tap hors modal ferme uniquement quand l'action n'est pas critique. Pour publication, paiement, suppression : demander confirmation explicite.

## 16. GESTURES MOBILE

Swipe down ferme les sheets non critiques. Pour les flows de publication ou paiement, swipe down peut afficher une confirmation "continuer ou quitter".

## 17. ÉTATS LOADING

Un loader dans modal doit être intégré au bouton ou à la surface. Éviter les overlays de chargement plein écran sauf action bloquante.

## 18. ÉTATS ERREUR

Les erreurs liées à une modal restent dans la modal. Les erreurs globales apparaissent en toast ou bandeau.

## 19. ÉTATS OFFLINE

Un overlay offline complet est interdit sauf première ouverture sans cache. Préférer bandeau + actions disponibles.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

- **Desktop** : modales max 520 à 720 px
- Sheets peuvent devenir side panels
- Player peut être panneau latéral plutôt que plein écran

## 21. ACCESSIBILITÉ

- Focus trap dans modales
- Retour clavier
- Labels pour fermeture
- Annonce des toasts importants

## 22. PERFORMANCE UX

Limiter blur et transparences multiples. Les overlays doivent être simples sur bas de gamme.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Ne jamais bloquer l'utilisateur derrière un écran vide. Les couches doivent préserver les contenus déjà chargés.

## 24. RÈGLES NON NÉGOCIABLES

- Pas de couches concurrentes
- Pas de modal au-dessus d'une modal sauf cas exceptionnel
- Pas de toast qui cache un bouton publier/payer/envoyer

---

*Système de couches pour une interface organisée et fluide*
