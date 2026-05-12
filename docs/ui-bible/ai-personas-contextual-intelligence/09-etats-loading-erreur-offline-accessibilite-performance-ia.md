# 9. ÉTATS LOADING, ERREUR, OFFLINE, ACCESSIBILITÉ ET PERFORMANCE IA

## 1. OBJECTIF UX

Garantir que les fonctionnalités IA restent fiables, compréhensibles et non bloquantes même quand le réseau, le serveur ou le contexte échoue.

## 2. ÉMOTION RECHERCHÉE

Stabilité.

L'utilisateur doit sentir que l'app reste solide même si l'IA n'est pas disponible.

## 3. STRUCTURE VISUELLE GLOBALE

États IA :

- idle
- suggestion disponible
- génération
- réponse partielle
- erreur
- limite atteinte
- offline
- mode léger
- masqué
- signalé

## 4. LAYOUT EXACT

Chaque zone IA doit avoir :

- header persona
- statut
- contenu ou skeleton
- action principale
- option fermer
- limite visible si nécessaire

## 5. HIERARCHIE VISUELLE

Priorité :

1. contenu humain
2. état IA
3. action alternative
4. détails techniques seulement si utiles

## 6. POSITIONNEMENT DES ÉLÉMENTS

Les états IA doivent rester dans le panneau IA, la carte ou le sheet concerné.

Ne pas afficher une erreur IA globale qui couvre tout l'écran.

## 7. DIMENSIONS & ESPACEMENTS

### Skeleton IA :

- lignes de 60 à 90 % largeur
- hauteur par bloc : 16 px
- gap 8 à 12 px

### Message erreur :

- carte 80 à 140 px
- padding 16 px

## 8. COULEURS

### Loading :

- graphite doux

### Erreur :

- ocre sobre

### Offline :

- ambre sombre

### Limite :

- gris chaud + icône info

## 9. TYPOGRAPHIE

Messages courts :

- "Analyse en cours…"
- "Réponse partielle."
- "IA indisponible."
- "Connexion instable."
- "Mode léger actif."

## 10. BOUTONS

Actions :

- Réessayer
- Continuer sans IA
- Réduire
- Voir résumé partiel
- Passer en mode léger
- Masquer IA

## 11. CARTES

### Carte erreur IA :

- icône
- message
- action
- alternative

### Carte offline IA :

- ce qui reste disponible
- ce qui attend le réseau

## 12. ICONOGRAPHIE

- constellation en loading
- nuage offline
- information
- alerte ocre
- réduire
- retry

## 13. COMPORTEMENT SCROLL

Les réponses longues ne doivent pas bloquer le scroll principal.

Le panneau IA a son propre scroll.

## 14. ANIMATIONS

- skeleton calme
- pas d'effet typing interminable
- transition réponse partielle vers complète
- erreur fade

## 15. MICRO INTERACTIONS

- annuler génération
- copier réponse partielle
- sauvegarder
- retry
- feedback

## 16. GESTURES MOBILE

- swipe down fermer IA
- tap annuler
- long press copier
- swipe suggestions

## 17. ÉTATS LOADING

Loading ne doit jamais être infini sans feedback.

Après délai perceptible :

- afficher message
- proposer continuer sans IA
- garder contenu principal actif

## 18. ÉTATS ERREUR

Types :

- réseau
- limite contexte
- persona indisponible
- modération impossible
- génération annulée

Chaque erreur a une action.

## 19. ÉTATS OFFLINE

Offline :

- IA distante désactivée
- résumés cache disponibles
- modèles locaux de structure
- actions en attente si possible

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :

- état dans sheet

### Tablet :

- état dans panneau

### Desktop :

- état dans panneau droit

## 21. ACCESSIBILITÉ

- statut annoncé
- loading non lu comme contenu final
- annulation accessible
- focus conservé
- réduction motion

## 22. PERFORMANCE UX

- IA lazy
- cache
- génération courte
- annulation
- pas de blocage
- fallback

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- mode léger
- réponses courtes
- retry contrôlé
- pas de génération automatique
- cache essentiel

## 24. RÈGLES NON NÉGOCIABLES

- L'app doit fonctionner sans IA
- L'IA ne doit jamais bloquer le contenu
- Les erreurs doivent être calmes
- Offline doit être clair
- Pas de loading infini
- L'utilisateur garde le contrôle

---

*États loading, erreur, offline, accessibilité et performance IA pour MAATFEED*
