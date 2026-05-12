# 3. NOTIFICATIONS DE DÉBAT

## 1. OBJECTIF UX

Informer l'utilisateur des nouvelles réponses, mentions, citations, sources, votes de qualité, interventions IA ou changements importants dans les débats auxquels il participe ou qu'il suit.

## 2. ÉMOTION RECHERCHÉE

L'utilisateur doit ressentir qu'une conversation vivante l'attend, pas qu'une bagarre numérique l'appelle.

Les notifications de débat doivent inviter à la nuance.

## 3. STRUCTURE VISUELLE GLOBALE

Types de notifications débat :

- nouvelle réponse à ton débat
- réponse à ton commentaire
- mention
- citation de ta réponse
- source ajoutée
- intervention IA
- débat très actif
- modération
- résumé disponible
- réponse de qualité mise en avant

## 4. LAYOUT EXACT

Carte débat :

- icône débat ou avatar symbolique
- titre du débat
- nature de l'activité
- extrait court
- compteur de réponses nouvelles
- action "Voir le débat"

Si plusieurs réponses dans le même débat, groupement obligatoire.

## 5. HIERARCHIE VISUELLE

Priorité :

1. réponse directe à l'utilisateur
2. mention
3. citation
4. source ajoutée
5. intervention IA
6. activité générale
7. résumé

## 6. POSITIONNEMENT DES ÉLÉMENTS

Le titre du débat doit être visible avant l'extrait.

Le nombre de nouvelles réponses doit être à droite ou sous le titre.

L'action principale ouvre directement au bon endroit dans le thread.

## 7. DIMENSIONS & ESPACEMENTS

- carte simple : 92 à 120 px
- carte groupée : 120 à 160 px
- icône : 42 px
- extrait : 1 à 2 lignes
- badge réponses : 24 à 30 px
- padding : 14 à 16 px

## 8. COULEURS

### Débat :

- accent ambre profond
- liseré gauche pour non-lu
- fond graphite chaud
- badge activité cuivre doux
- modération en ocre sobre

## 9. TYPOGRAPHIE

- titre débat : 14 à 16 px
- type activité : 12 à 13 px
- extrait : 13 à 14 px
- compteur : 12 px

## 10. BOUTONS

Actions :

- Voir débat
- Répondre
- Écouter réponse audio
- Voir source
- Résumer
- Désactiver notifications de ce débat
- Signaler si nécessaire

## 11. CARTES

Carte débat groupée :

- titre débat
- "5 nouvelles réponses"
- aperçu des 2 plus pertinentes
- badge "dont 1 réponse IA" si applicable
- bouton ouvrir

Ne jamais afficher 10 petites notifications pour le même débat.

## 12. ICONOGRAPHIE

- bulles circulaires
- guillemet pour citation
- papyrus pour source
- étoile IA
- bouclier modération
- flamme douce pour débat actif

## 13. COMPORTEMENT SCROLL

Les notifications débat peuvent être groupées par débat.

L'utilisateur peut déplier le groupe.

Le dépliage ne doit pas faire perdre la position.

## 14. ANIMATIONS

- groupement qui s'ouvre en accordéon
- nouvelle réponse avec halo léger
- passage lu en fade
- ouverture vers thread avec scroll ciblé

## 15. MICRO INTERACTIONS

- tap extrait : ouvre la réponse exacte
- tap titre : ouvre le débat
- long press : désactiver ce débat
- badge source : ouvre source
- réponse audio : mini-play inline

## 16. GESTURES MOBILE

- swipe pour marquer lu
- long press options
- tap audio pour pré-écouter
- swipe entre filtres débat

## 17. ÉTATS LOADING

Skeleton débat :

- icône bulle
- titre
- extrait
- badge réponse

## 18. ÉTATS ERREUR

Si débat supprimé ou modéré :

message clair :
"Ce débat n'est plus disponible."
proposer retour aux débats suivis.

Si réponse supprimée :

"Cette réponse a été retirée."

## 19. ÉTATS OFFLINE

Offline :

- afficher débat en cache
- permettre lecture des réponses déjà chargées
- réponse différée possible si composer offline existe
- marquer actions en attente

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :

- cartes groupées

### Tablet :

- liste + aperçu thread

### Desktop :

- notification à gauche/centre
- aperçu thread à droite

## 21. ACCESSIBILITÉ

- type d'activité annoncé
- nombre de réponses annoncé
- bouton audio accessible
- état modération expliqué
- focus vers réponse exacte

## 22. PERFORMANCE UX

- groupement obligatoire
- pas de chargement complet du débat dans la notification
- extrait léger
- ouverture progressive du thread

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- texte avant média
- audio non préchargé
- groupement pour réduire données
- résumé léger si disponible
- ouverture du thread par morceaux

## 24. RÈGLES NON NÉGOCIABLES

- Ne pas spammer chaque réponse
- Grouper par débat
- Ouvrir au bon endroit
- Prioriser les réponses directes
- Ne pas amplifier les débats toxiques
- Toujours respecter la nuance

---

*Notifications de débat pour MAATFEED*
