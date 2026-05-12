# 5. NOTIFICATIONS CRÉATEURS, SÉRIES ET RÉPONSES MULTIMÉDIA

## 1. OBJECTIF UX

Informer l'utilisateur des nouveautés importantes provenant des créateurs suivis, séries commencées, réponses à ses contenus et publications multimédias pertinentes.

## 2. ÉMOTION RECHERCHÉE

Proximité intelligente.

L'utilisateur doit sentir qu'il reste connecté aux voix qu'il respecte sans être noyé par chaque micro-action.

## 3. STRUCTURE VISUELLE GLOBALE

Catégories :

- créateur suivi a publié
- créateur a lancé une série
- nouvel épisode
- réponse à ton contenu
- réponse vidéo
- réponse audio
- réponse documentée
- créateur t'a mentionné
- créateur a répondu dans ton débat
- série terminée ou mise à jour

## 4. LAYOUT EXACT

### Carte créateur :

- avatar symbolique
- nom créateur
- action
- titre contenu
- type
- bouton ouvrir

### Carte série :

- icône série
- titre série
- épisode
- progression
- bouton continuer

### Carte réponse :

- type réponse
- extrait
- origine
- action répondre/voir

## 5. HIERARCHIE VISUELLE

Priorité :

1. réponse directe
2. mention
3. nouvel épisode d'une série suivie
4. publication créateur suivi
5. recommandation créateur
6. activité générale

## 6. POSITIONNEMENT DES ÉLÉMENTS

Avatar ou symbole à gauche.

Titre/action au centre.

Type et temps à droite ou sous texte.

Action principale intégrée à la carte.

## 7. DIMENSIONS & ESPACEMENTS

- carte créateur : 84 à 118 px
- carte série : 110 à 150 px
- carte réponse multimédia : 100 à 150 px
- avatar : 42 à 48 px
- miniature optionnelle : 64 à 82 px
- padding : 14 à 16 px

## 8. COULEURS

### Créateur :

- accent or doux
- badge crédibilité discret

### Série :

- accent ambre/chapitre
- progression or

### Réponse :

selon type média :
- audio cuivre
- vidéo graphite/or
- document papyrus
- texte beige

## 9. TYPOGRAPHIE

- nom créateur : 14 à 15 px
- action : 13 px
- titre contenu : 14 à 16 px
- épisode : 12 à 13 px
- temps : 11 à 12 px

## 10. BOUTONS

Actions :

- ouvrir
- continuer
- écouter
- regarder
- répondre
- sauvegarder
- suivre série
- désactiver notifications créateur
- masquer

## 11. CARTES

Les cartes doivent éviter l'effet "réseau social classique".

Le contenu doit être contextualisé :

- "Nouvel épisode dans une série que tu suis"
- "Réponse audio à ton intervention"
- "Ce créateur a ajouté une source au débat"

## 12. ICONOGRAPHIE

- sceau créateur
- chapitre série
- onde audio
- vidéo
- document
- réponse
- mention
- progression

## 13. COMPORTEMENT SCROLL

Groupement par créateur possible.

Groupement par série obligatoire si plusieurs épisodes ou activités proches.

## 14. ANIMATIONS

- progression série douce
- avatar créateur halo léger si non-lu
- carte réponse s'ouvre vers contenu exact
- nouvelle publication apparaît sans secousse

## 15. MICRO INTERACTIONS

- tap avatar : profil
- tap titre : contenu
- tap série : page série
- long press : gérer notifications
- suivre/sauvegarder : feedback discret

## 16. GESTURES MOBILE

- swipe marquer lu
- long press options
- swipe horizontal si plusieurs épisodes dans même groupe
- tap large sur action principale

## 17. ÉTATS LOADING

Skeleton :

- avatar
- lignes texte
- miniature fantôme
- progression fantôme pour série

## 18. ÉTATS ERREUR

Si créateur supprimé :

"Ce profil n'est plus disponible."

Si contenu retiré :

"Ce contenu a été supprimé ou modéré."

Toujours proposer de retirer la notification.

## 19. ÉTATS OFFLINE

- afficher titres en cache
- ouvrir contenus sauvegardés
- épisodes téléchargés disponibles
- actions follow/lu en attente

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :

- cartes compactes

### Tablet :

- miniatures plus visibles

### Desktop :

- preview à droite
- actions au hover

## 21. ACCESSIBILITÉ

- nom créateur lisible
- type de contenu annoncé
- progression série textuelle
- boutons nommés

## 22. PERFORMANCE UX

- charger avatar local/symbolique
- miniature différée
- groupement
- pagination
- pas de média autoplay

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- texte avant miniature
- série téléchargeable
- audio basse qualité
- groupement créateur pour réduire bruit
- action offline différée

## 24. RÈGLES NON NÉGOCIABLES

- Ne pas notifier chaque micro-action d'un créateur
- Grouper intelligemment
- Toujours contextualiser
- Toujours permettre désactivation par créateur ou série
- Respecter audio et réponses multimédia
- Ne jamais casser la progression série

---

*Notifications créateurs, séries et réponses multimédia pour MAATFEED*
