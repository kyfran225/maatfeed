# 17. ÉTATS VIDES, LOADING, ERREUR & OFFLINE DU DÉBAT

## 1. OBJECTIF UX

Prévoir tous les états non idéaux du débat sans casser l'expérience ni perdre les contributions.

## 2. ÉMOTION RECHERCHÉE

Calme, robustesse, confiance. L'utilisateur doit sentir que l'app tient bon.

## 3. STRUCTURE VISUELLE GLOBALE

États sous forme de cartes sombres : aucun débat, aucune réponse, chargement, erreur, offline, synchronisation en attente.

## 4. LAYOUT EXACT

Empty state réponses : carte centrée sous tabs, hauteur 160 à 240 px.
Erreur : carte largeur utile.
Offline : bandeau + contenus cache.
Sync brouillon : petit badge ou carte compacte.

## 5. HIERARCHIE VISUELLE

Préserver le sujet si possible. L'état concerne les réponses ou actions, pas toute la page sauf panne totale.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Loading réponses sous tabs. Erreur réponses au même endroit. Offline bandeau sous header ou au-dessus composer.

## 7. DIMENSIONS & ESPACEMENTS

Carte état : padding 20 px, radius 18 à 22 px. Icône 32 à 44 px. CTA 44 à 48 px.

## 8. COULEURS

Surface sombre. Icône ambre. Erreur rouge doux si nécessaire. Offline graphite/ambre.

## 9. TYPOGRAPHIE

Titre état : 16 à 18 px. Message : 13 à 14 px. CTA : 14 px.

## 10. BOUTONS

Réessayer, Répondre le premier, Voir brouillons, Continuer hors ligne, Synchroniser.

## 11. CARTES

Les skeletons doivent ressembler aux réponses finales. Empty state doit rester dans le style MAATFEED.

## 12. ICONOGRAPHIE

Bulle vide, micro, wifi off, refresh, brouillon, check sync.

## 13. COMPORTEMENT SCROLL

États ne doivent pas faire sauter le scroll. Si nouvelles réponses arrivent, proposer insertion contrôlée.

## 14. ANIMATIONS

Skeleton shimmer subtil. Empty state fade. Retour online toast discret.

## 15. MICRO INTERACTIONS

Tap réessayer : loader dans bouton. Tap brouillon : ouvre composer. Tap synchroniser : badge progress.

## 16. GESTURES MOBILE

Pull refresh réessaye. Composer garde brouillon même si sheet fermée.

## 17. ÉTATS LOADING

Sujet d'abord, réponses ensuite. Médias après texte. IA après débat si demandée.

## 18. ÉTATS ERREUR

Erreur localisée. Conserver contenu déjà chargé. Message clair, pas technique.

## 19. ÉTATS OFFLINE

Débat cache, réponses cache, brouillons, actions en attente. Indiquer fraîcheur si possible.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Desktop : état par panel. Mobile : état dans la colonne.

## 21. ACCESSIBILITÉ

États annoncés. CTA focusable. Pas de spinner sans texte.

## 22. PERFORMANCE UX

Éviter écran vide. Réutiliser cache. Charger progressivement.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Offline et slow network traités comme scénarios normaux. Texte et brouillons prioritaires.

## 24. RÈGLES NON NÉGOCIABLES

Pas de perte de réponse. Pas d'écran blanc. Pas de skeleton infini. Pas d'erreur technique brute.

---

*États vides, loading, erreur et offline pour le débat MAATFEED*
