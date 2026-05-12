# 9. GESTURE SYSTEM

## 1. OBJECTIF UX

Définir les gestes officiels pour rendre l'app naturelle, rapide et mobile-first sans créer de conflits entre feed, audio, débats et sheets.

## 2. ÉMOTION RECHERCHÉE

Contrôle, fluidité, familiarité. L'utilisateur doit sentir que l'app répond au doigt.

## 3. STRUCTURE VISUELLE GLOBALE

Gestes principaux : scroll vertical, swipe horizontal d'onglets, drag bottom sheet, swipe player, tap long options, double tap réaction, pull to refresh contrôlé.

## 4. LAYOUT EXACT

- **Zones drag** : 24 à 36 px
- **Hitbox tap** : 44 px minimum
- **Seuil double tap** : court et non intrusif
- Swipe horizontal seulement sur zones dédiées, pas sur toute la page si cela gêne le retour système

## 5. HIERARCHIE VISUELLE

Les gestes liés au contenu ne doivent jamais casser les gestes système. Le retour arrière doit rester prioritaire.

## 6. POSITIONNEMENT DES ÉLÉMENTS

- Grab handles centrés en haut des sheets
- Actions swipe révélées sur cartes alignées à droite ou gauche
- Mini-player drag depuis toute sa surface

## 7. DIMENSIONS & ESPACEMENTS

Une action révélée par swipe doit être large de 72 à 96 px minimum. Les boutons de réponse rapide doivent conserver 44 px.

## 8. COULEURS

- Actions révélées : surface sombre + icône dorée ou rouge selon action
- Pendant drag, overlay sombre progressif

## 9. TYPOGRAPHIE

Les labels d'action révélés doivent être courts : "Sauver", "Répondre", "Signaler", "Partager".

## 10. BOUTONS

Les gestes ne remplacent jamais les boutons essentiels. Toute action gestuelle importante doit aussi être accessible par bouton.

## 11. CARTES

- Swipe carte feed : options secondaires seulement
- Tap carte : ouvrir détail
- Long press : menu contextuel

## 12. ICONOGRAPHIE

Chaque geste visible doit avoir un indice : poignée, chevron, icône, micro-label.

## 13. COMPORTEMENT SCROLL

Le scroll vertical reste prioritaire dans le feed. Les carrousels horizontaux doivent capturer le geste seulement quand le mouvement horizontal est clair.

## 14. ANIMATIONS

Le mouvement suit le doigt. Relâchement avec spring doux. Retour annulé rapide mais non brutal.

## 15. MICRO INTERACTIONS

- Long press : léger halo + menu
- Double tap : micro-animation
- Pull refresh : indicateur doré discret

## 16. GESTURES MOBILE

- **Feed** : swipe vertical
- **Onglets** : swipe horizontal
- **Player** : swipe up/down
- **Sheet** : drag up/down
- **Carte** : tap, long press, swipe actions limitées
- **Réponse** : swipe down clavier selon OS

## 17. ÉTATS LOADING

Pendant pull refresh, ne pas bloquer le feed. Afficher progression compacte.

## 18. ÉTATS ERREUR

Si un geste échoue, afficher toast discret. Exemple : "Connexion instable, action enregistrée pour plus tard."

## 19. ÉTATS OFFLINE

Gestes de sauvegarde, like, réponse brouillon doivent fonctionner offline avec file d'attente.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

- Desktop remplace certains gestes par hover, clic droit léger, raccourcis clavier, drag panels si utile
- Tablet garde gestes mobile

## 21. ACCESSIBILITÉ

Toute action gestuelle doit être accessible via bouton ou menu. Ne pas rendre une fonctionnalité dépendante d'un swipe invisible.

## 22. PERFORMANCE UX

Les gestures doivent être fluides à 60 fps quand possible. Éviter effets lourds pendant drag.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Le feedback tactile doit être immédiat même si l'action réseau attend. L'utilisateur doit voir que son geste a été pris en compte.

## 24. RÈGLES NON NÉGOCIABLES

- Pas de geste caché pour action critique
- Pas de conflit entre swipe de page et scroll feed
- Pas de drag qui ferme accidentellement un flow de paiement ou publication

---

*Système de gestes pour une expérience mobile intuitive*
