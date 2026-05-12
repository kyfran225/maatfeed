# 7. BADGES IA, TRANSPARENCE, LIMITES ET CONTRÔLE UTILISATEUR

## 1. OBJECTIF UX

Rendre toute présence IA claire, identifiable, contrôlable et honnête.

## 2. ÉMOTION RECHERCHÉE

Confiance lucide.

L'utilisateur doit savoir ce qui vient de l'IA, pourquoi c'est là et comment le contrôler.

## 3. STRUCTURE VISUELLE GLOBALE

Éléments :

- badge IA
- label persona
- panneau "Pourquoi cette réponse ?"
- limites
- source du contexte
- feedback
- signalement
- préférences IA

## 4. LAYOUT EXACT

### Badge IA :

- proche du nom persona
- visible dans carte et réponse
- jamais caché en bas

### Panneau transparence :

- bottom sheet mobile
- popover ou panneau desktop
- sections courtes

## 5. HIERARCHIE VISUELLE

Toujours afficher :

- IA ou persona
- rôle
- contexte utilisé
- limites
- actions utilisateur

## 6. POSITIONNEMENT DES ÉLÉMENTS

Le badge doit être placé :

- dans l'en-tête de réponse IA
- sur les suggestions
- sur les résumés
- sur les recommandations générées

## 7. DIMENSIONS & ESPACEMENTS

### Badge :

- hauteur : 22 à 26 px
- radius pilule
- padding 8 à 10 px
- texte 11 à 12 px

### Panneau limites :

- cartes 80 à 140 px
- padding 16 px

## 8. COULEURS

### Badge :

- fond ambre sombre
- texte or clair
- bordure or faible

### Limites :

- fond graphite
- accent gris chaud
- avertissement ocre si nécessaire

## 9. TYPOGRAPHIE

### Labels courts :

- "IA"
- "Persona IA"
- "Généré par IA"
- "Résumé IA"
- "Suggestion IA"

### Limites en 12 à 13 px

## 10. BOUTONS

Actions :

- Voir pourquoi
- Voir limites
- Masquer IA
- Signaler
- Utile
- Pas utile
- Gérer préférences IA

## 11. CARTES

### Carte transparence :

- persona
- rôle
- données utilisées
- ce que l'IA ne peut pas garantir
- bouton signaler

## 12. ICONOGRAPHIE

- badge étoile
- information
- bouclier
- œil abstrait
- réglages
- signalement

## 13. COMPORTEMENT SCROLL

Les détails de transparence doivent être courts.

Pas de long contrat illisible.

## 14. ANIMATIONS

- ouverture popover douce
- badge sans animation permanente
- feedback utile/pas utile discret

## 15. MICRO INTERACTIONS

- tap badge : détails
- tap utile : confirmation
- tap masquer : disparaît avec undo possible
- signaler : sheet dédié

## 16. GESTURES MOBILE

- tap badge
- swipe down fermer détails
- long press réponse IA pour actions

## 17. ÉTATS LOADING

Le badge ne doit pas attendre la fin de génération.

Il apparaît dès le début.

## 18. ÉTATS ERREUR

Si détails indisponibles :

- message :
  "Les détails de génération ne sont pas disponibles."
- la réponse reste marquée IA

## 19. ÉTATS OFFLINE

Les badges et limites restent visibles offline.

La transparence de base doit être embarquée localement.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :

- badge compact

### Desktop :

- popover riche au hover/focus

### Tablet :

- sheet ou popover selon orientation

## 21. ACCESSIBILITÉ

- badge annoncé
- pas seulement icône
- détails atteignables clavier
- état masqué annoncé
- signalement accessible

## 22. PERFORMANCE UX

- badge statique léger
- détails chargés à la demande
- préférences cache

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- transparence locale
- pas de dépendance réseau
- labels simples
- pas d'assets lourds

## 24. RÈGLES NON NÉGOCIABLES

- Toute IA doit être identifiée
- Jamais de contenu IA déguisé en humain
- L'utilisateur peut masquer
- L'utilisateur peut signaler
- Les limites doivent être accessibles
- Pas de promesse de vérité absolue

---

*Badges IA, transparence, limites et contrôle utilisateur pour MAATFEED*
