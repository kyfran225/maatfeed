# 4. AUDIO CREATION STUDIO

## 1. OBJECTIF UX

Permettre à l'utilisateur d'enregistrer, importer, nettoyer, titrer et publier une capsule audio ou une réponse audio.
L'audio doit être le format de création le plus rapide et le plus naturel de MAATFEED.

## 2. ÉMOTION RECHERCHÉE

Le studio audio doit donner une impression de calme et de confiance.
L'utilisateur doit pouvoir parler sans stress.
L'interface doit dire : "Exprime ton idée, on s'occupe de la structure."

## 3. STRUCTURE VISUELLE GLOBALE

Le studio audio contient :

- bouton enregistrer
- waveform live
- timer
- pause/reprendre
- recommencer
- importer audio
- titre
- description
- transcription
- IA résumé/tags
- aperçu
- publication

## 4. LAYOUT EXACT

### Mobile :
- header simple
- grand cercle micro au centre
- waveform sous micro
- timer visible
- actions principales en bas
- options après enregistrement

#### Pendant enregistrement :
- écran minimal
- fond sombre
- micro ambre
- waveform live

#### Après enregistrement :
- player de preview
- titre
- transcription
- options publication

## 5. HIERARCHIE VISUELLE

### Pendant enregistrement :
1. état enregistrement
2. timer
3. waveform
4. pause/stop

### Après :
1. lecture preview
2. titre
3. transcription
4. publier

## 6. POSITIONNEMENT DES ÉLÉMENTS

- micro au centre vertical
- timer au-dessus
- waveform sous micro
- bouton pause gauche
- bouton stop droite
- bouton publier seulement après preview

## 7. DIMENSIONS & ESPACEMENTS

- bouton micro : 88 à 112 px
- bouton pause/stop : 52 à 64 px
- waveform live : 80 à 120 px hauteur
- timer : 28 à 36 px
- padding : 20 px
- preview player : 96 à 140 px

## 8. COULEURS

- recording actif : ambre chaud
- pause : ocre
- stop : rouge discret, jamais alarmiste
- waveform : ambre
- fond : noir profond
- transcription : surface charbon

## 9. TYPOGRAPHIE

- timer : 28 à 36 px, chiffres tabulaires
- titre audio : 20 à 24 px
- transcription : 14 à 16 px
- statut : 12 à 14 px

## 10. BOUTONS

Boutons :

- enregistrer
- pause
- reprendre
- stop
- écouter
- recommencer
- couper début/fin
- importer
- transcription
- publier

Bouton recommencer doit demander confirmation douce.

## 11. CARTES

Après enregistrement :

- carte preview audio
- carte transcription
- carte suggestion IA
- carte source si liée
- carte débat associé

## 12. ICONOGRAPHIE

- micro
- pause
- stop
- waveform
- ciseaux simples
- transcription
- IA
- upload

## 13. COMPORTEMENT SCROLL

### Pendant enregistrement :
- pas de scroll inutile

### Après enregistrement :
- contenu scrollable
- preview player sticky en haut si transcription longue

## 14. ANIMATIONS

- micro pulse pendant enregistrement
- waveform live
- pause : waveform ralentie
- stop : transition vers preview
- transcription : apparition progressive

## 15. MICRO INTERACTIONS

- début enregistrement : vibration visuelle douce
- pause : badge "pause"
- reprise : timer continue
- preview : mini-player interne
- IA titre : suggestion en chips

## 16. GESTURES MOBILE

- maintenir micro pour note rapide
- tap micro pour mode classique
- swipe up pendant enregistrement : verrouiller
- swipe down : annuler avec confirmation
- long press preview : options

## 17. ÉTATS LOADING

- préparation micro
- traitement audio
- génération waveform
- transcription
- compression
- upload

Chaque étape doit afficher un statut précis.

## 18. ÉTATS ERREUR

Erreurs :

- micro non autorisé
- stockage insuffisant
- traitement échoué
- upload échoué
- transcription indisponible

Toujours garder le fichier audio local si possible.

## 19. ÉTATS OFFLINE

Offline :

- enregistrement autorisé
- preview locale
- transcription locale si disponible, sinon plus tard
- publication en attente
- badge "sera envoyé quand réseau revient"

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :
- studio micro central

### Tablet :
- micro + transcription côte à côte après enregistrement

### Desktop :
- waveform large
- transcription à droite
- import drag-and-drop

## 21. ACCESSIBILITÉ

- boutons labellisés
- timer lisible
- transcription
- alternative import
- pas uniquement waveform
- état recording annoncé

## 22. PERFORMANCE UX

- enregistrement local robuste
- compression après capture
- waveform optimisée
- upload reprenable
- éviter traitement lourd bloquant

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- audio compressé
- upload différé
- reprise upload
- transcription plus tard
- preview locale
- publication queue

## 24. RÈGLES NON NÉGOCIABLES

- Ne jamais perdre un audio enregistré
- Ne jamais publier sans preview possible
- Le micro doit être central et clair
- L'utilisateur doit savoir s'il enregistre
- L'audio doit rester prioritaire sur la vidéo
- Offline doit permettre d'enregistrer

---

*Audio creation studio pour MAATFEED*
