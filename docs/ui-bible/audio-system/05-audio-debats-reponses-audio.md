# 5. AUDIO DANS LES DÉBATS ET AUDIO REPLIES

## 1. OBJECTIF UX

Permettre aux débats MAATFEED d'avoir une dimension orale forte.

Les utilisateurs doivent pouvoir :

- écouter une réponse audio
- répondre par audio
- comparer des positions
- entendre une nuance
- suivre un fil sans lire tout le texte
- accéder à la transcription

## 2. ÉMOTION RECHERCHÉE

La réponse audio doit donner une sensation de présence.

Le débat devient moins froid, plus vivant, mais reste maîtrisé.

Émotion cible :

- écoute respectueuse
- proximité
- réflexion
- nuance
- dignité

## 3. STRUCTURE VISUELLE GLOBALE

Une audio reply contient :

- avatar ou symbole utilisateur
- nom/pseudonyme
- badge audio
- waveform
- durée
- bouton play
- transcription courte ou "voir transcription"
- réactions
- bouton répondre
- qualité/modération

## 4. LAYOUT EXACT

### Dans thread mobile :
- audio reply dans une carte imbriquée
- indentation selon niveau
- bouton play à gauche
- waveform à droite
- durée sous waveform
- transcription repliée sous le lecteur

### Dans détail :
- player audio intégré
- contexte du parent visible
- actions sous la réponse

## 5. HIERARCHIE VISUELLE

Priorité :

1. auteur
2. play
3. waveform
4. résumé/transcription
5. réactions
6. source/contexte

## 6. POSITIONNEMENT DES ÉLÉMENTS

- auteur en haut
- bouton play aligné verticalement avec waveform
- durée à droite
- transcription sous waveform
- actions sous transcription
- bouton répondre toujours visible

## 7. DIMENSIONS & ESPACEMENTS

- carte audio reply : padding 12 à 16 px
- waveform : 36 à 52 px hauteur
- bouton play : 40 à 44 px
- indentation thread : 12 à 18 px par niveau, maximum 2 niveaux visibles
- transcription : margin top 10 px

## 8. COULEURS

- carte : noir surface
- active : bordure ambre fine
- waveform : gris/ambre
- auteur : blanc cassé
- transcription : gris clair
- badge audio : ambre doux

## 9. TYPOGRAPHIE

- auteur : 13 à 14 px semi-bold
- durée : 11 px
- transcription : 13 à 14 px
- réactions : 12 px
- contexte parent : 12 px gris

## 10. BOUTONS

- play/pause
- répondre
- transcription
- partager
- signaler
- source
- plus

Bouton répondre doit rester textuel et calme.

## 11. CARTES

Les audio replies sont des cartes de conversation, pas des cartes média.

Elles doivent rester compactes, lisibles, et adaptées aux fils imbriqués.

## 12. ICONOGRAPHIE

- micro pour audio reply
- onde pour lecture
- transcription pour texte
- bouclier pour modération
- IA si résumé/transcription généré

## 13. COMPORTEMENT SCROLL

Pendant lecture :

- si la réponse sort de l'écran, mini-player prend le relais
- tap sur mini-player peut ramener à la réponse
- le thread conserve la position

## 14. ANIMATIONS

- réponse active : bordure douce
- waveform active
- transcription expand/collapse fluide
- retour à la réponse : highlight court

## 15. MICRO INTERACTIONS

- tap play : lecture
- tap transcription : expansion
- long press : options
- réaction : feedback subtil
- réponse IA : badge doux

## 16. GESTURES MOBILE

- swipe réponse : répondre ou sauvegarder
- long press : menu
- tap waveform : scrub léger
- swipe dans thread ne doit pas déclencher accidentellement suppression

## 17. ÉTATS LOADING

- waveform skeleton
- play spinner
- transcription "préparation"
- réponse reste en place

## 18. ÉTATS ERREUR

- audio indisponible
- transcription disponible si possible
- bouton réessayer
- signalement si contenu cassé

## 19. ÉTATS OFFLINE

- réponses téléchargées lisibles
- autres grisées
- transcription en cache prioritaire
- possibilité de répondre offline en brouillon audio

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :
- thread compact
- transcription repliée

### Tablet :
- thread + contexte parent

### Desktop :
- audio reply avec transcription latérale
- mini waveform plus large
- actions au hover

## 21. ACCESSIBILITÉ

- transcription obligatoire si disponible
- labels boutons
- lecture clavier
- focus visible
- indication état actif

## 22. PERFORMANCE UX

- ne pas charger tous les audios du thread
- transcription lazy
- waveform statique possible
- limiter animations sur longs threads

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- transcription cache-first
- audio compressé
- lecture progressive
- brouillons locaux
- reprise fiable

## 24. RÈGLES NON NÉGOCIABLES

- Une audio reply doit toujours avoir une durée visible
- La transcription doit être facile à trouver
- Le débat doit rester lisible sans écouter
- Le player ne doit pas casser la hiérarchie du thread
- Les réponses audio ne doivent jamais devenir du bruit visuel

---

*Audio dans les débats et réponses audio pour MAATFEED*
