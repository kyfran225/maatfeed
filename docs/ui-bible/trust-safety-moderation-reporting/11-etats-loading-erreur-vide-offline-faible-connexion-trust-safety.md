# 11. ÉTATS LOADING, ERREUR, VIDE, OFFLINE ET FAIBLE CONNEXION TRUST & SAFETY

## 1. OBJECTIF UX

Garantir que les fonctions de sécurité restent disponibles même lorsque le réseau est instable ou que certains services de modération ne répondent pas.

## 2. ÉMOTION RECHERCHÉE

Stabilité.
La sécurité ne doit pas disparaître parce que la connexion tremble.

## 3. STRUCTURE VISUELLE GLOBALE

États :

- signalement en cours ;
- signalement envoyé ;
- signalement en attente offline ;
- modération indisponible ;
- contenu supprimé ;
- contenu masqué ;
- source non vérifiable ;
- blocage en attente ;
- règles disponibles offline.

## 4. LAYOUT EXACT

Chaque état doit rester dans son contexte :

- carte ;
- sheet ;
- composer ;
- thread ;
- paramètres.

Éviter les écrans globaux sauf cas critique.

## 5. HIERARCHIE VISUELLE

- état ;
- conséquence ;
- action ;
- détails.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Message d'état :

- proche de l'action ;
- jamais uniquement dans toast qui disparaît trop vite.

## 7. DIMENSIONS & ESPACEMENTS

Carte état :

- 72 à 140 px ;
- padding 14 à 16 px ;
- bouton 44 px ;
- badge 24 px.

## 8. COULEURS

En attente :

- ambre sombre.

Erreur :

- ocre.

Succès :

- or doux.

Offline :

- graphite + badge offline.

## 9. TYPOGRAPHIE

Messages :

- "Signalement en attente d'envoi."
- "Ce contenu n'est plus disponible."
- "La vérification de source est indisponible."

## 10. BOUTONS

Actions :

- Réessayer ;
- Annuler ;
- Voir règles ;
- Masquer localement ;
- Synchroniser plus tard ;
- Contacter support.

## 11. CARTES

Carte file d'attente :

- action ;
- statut ;
- heure ;
- option annuler.

Carte contenu supprimé :

- raison courte si disponible ;
- retour.

## 12. ICONOGRAPHIE

- sync ;
- offline ;
- bouclier ;
- alerte ;
- coche ;
- corbeille ;
- œil masqué.

## 13. COMPORTEMENT SCROLL

Les états ne doivent pas déplacer brutalement les threads.
Un contenu supprimé garde un placeholder compact.

## 14. ANIMATIONS

- état en attente pulse très légèrement ;
- succès fade ;
- erreur stable ;
- pas de vibration visuelle anxiogène.

## 15. MICRO INTERACTIONS

- tap retry ;
- tap annuler file ;
- tap détail ;
- undo masquer.

## 16. GESTURES MOBILE

- swipe pour retirer action en attente si non critique ;
- tap ;
- long press détails.

## 17. ÉTATS LOADING

Action loading :

- localisée au bouton ;
- pas de blocage global.

## 18. ÉTATS ERREUR

Erreur doit conserver le contexte et les choix.
Ne jamais effacer un signalement rempli à cause du réseau.

## 19. ÉTATS OFFLINE

Offline robuste :

- signalements en attente ;
- blocages en attente ;
- masquages locaux ;
- règles disponibles ;
- sync visible.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Mobile :

- cartes compactes.

Desktop :

- panneau état.

Tablet :

- sheet/panneau.

## 21. ACCESSIBILITÉ

- état annoncé ;
- actions accessibles ;
- pas de couleur seule ;
- messages durables.

## 22. PERFORMANCE UX

- actions locales ;
- file légère ;
- sync différée ;
- pas de médias.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- priorité au local ;
- message simple ;
- retry manuel ;
- aucune perte de données.

## 24. RÈGLES NON NÉGOCIABLES

- Sécurité disponible offline autant que possible.
- Aucun signalement perdu.
- Aucun état ambigu.
- Pas de blocage global inutile.
- Toujours une action de récupération.
- Les règles restent accessibles.

---

*États loading, erreur, vide, offline et faible connexion Trust & Safety pour MAATFEED*
