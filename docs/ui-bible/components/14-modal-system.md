# 14. MODAL SYSTEM

## 1. OBJECTIF UX

Réserver les modales aux confirmations, décisions importantes, erreurs critiques, permissions, abonnements et moments de paiement/soutien.

## 2. ÉMOTION RECHERCHÉE

Clarté, sérieux, sécurité. Une modal doit demander une vraie décision, pas interrompre gratuitement.

## 3. STRUCTURE VISUELLE GLOBALE

Modal centrée, surface sombre, radius généreux, bordure subtile, titre clair, message court, actions en bas.

## 4. LAYOUT EXACT

- **Mobile** : largeur 320 à 358 px, max 90 % écran
- **Desktop** : largeur 420 à 560 px, sauf premium/paywall jusqu'à 720 px
- **Padding** : 20 à 24 px
- **Radius** : 22 à 28 px

## 5. HIERARCHIE VISUELLE

Icône ou badge en haut si utile, titre, message, détails, actions. Le CTA primaire doit être évident.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Centrage vertical légèrement au-dessus du centre optique. Actions en bas, empilées sur mobile si besoin.

## 7. DIMENSIONS & ESPACEMENTS

- **Titre/message** : 8 à 12 px
- **Message/actions** : 20 à 24 px
- **Boutons** : 8 à 12 px entre eux

## 8. COULEURS

- **Fond modal** : surface élevée
- **Overlay** : noir 60 à 75 %
- **Bordure** : graphite
- **CTA** : or
- **Danger** : rouge discret

## 9. TYPOGRAPHIE

- **Titre** : 18 à 22 px
- **Message** : 14 à 15 px
- **Détails** : 12 à 13 px

## 10. BOUTONS

Primaire doré. Secondaire sombre. Danger rouge seulement pour suppression/signalement. Annuler visible.

## 11. CARTES

Dans modal premium, les avantages peuvent être sous forme de mini-cartes sombres avec check dorés.

## 12. ICONOGRAPHIE

Icône 24 à 32 px selon gravité. Paiement : cadenas/bouclier. Suppression : alerte rouge. Premium : badge or.

## 13. COMPORTEMENT SCROLL

Modal longue : contenu scroll interne, actions sticky bas. Éviter modales très longues sur mobile.

## 14. ANIMATIONS

Fade overlay + scale modal 0.96 → 1 en 180 à 240 ms.

## 15. MICRO INTERACTIONS

Bouton loading intégré. Check success court après action confirmée.

## 16. GESTURES MOBILE

Tap extérieur ferme uniquement les modales non critiques. Swipe down non recommandé pour décisions critiques.

## 17. ÉTATS LOADING

Pendant paiement ou confirmation : modal reste stable, bouton loading, message d'attente clair.

## 18. ÉTATS ERREUR

Erreur dans modal sans fermeture. Message actionnable, bouton réessayer.

## 19. ÉTATS OFFLINE

Paiement et abonnement offline : expliquer connexion nécessaire. Brouillon/sauvegarde : autoriser file d'attente.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Desktop : modales peuvent avoir deux colonnes pour premium/checkout, mais garder clarté. Mobile : une colonne stricte.

## 21. ACCESSIBILITÉ

- Focus trap, escape, labels, rôle dialog, lecture titre/message
- Contraste fort

## 22. PERFORMANCE UX

Modales légères. Pas de vidéos lourdes dans modal sauf aperçu nécessaire.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Ne pas ouvrir une modal vide en attendant réseau. Afficher structure + message immédiat.

## 24. RÈGLES NON NÉGOCIABLES

- Pas de modal pour tout
- Pas de confirmation inutile
- Pas de fermeture accidentelle d'un paiement ou d'une publication

---

*Système de modales pour les décisions importantes*
