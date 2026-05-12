# 3. FULL AUDIO PLAYER

## 1. OBJECTIF UX

Le full audio player est l'espace d'écoute immersive.

Il doit permettre :

- écouter longtemps
- comprendre le contexte du contenu
- naviguer dans la queue
- voir la progression
- accéder aux sources
- réagir
- sauvegarder
- télécharger
- revenir au débat ou au feed

## 2. ÉMOTION RECHERCHÉE

Sensation recherchée :

- profondeur
- concentration
- cérémonie sobre
- contrôle total
- confort nocturne
- écoute savante

L'utilisateur doit avoir l'impression d'ouvrir une chambre d'écoute, pas une simple modal.

## 3. STRUCTURE VISUELLE GLOBALE

### Structure verticale mobile :
- handle de fermeture
- contexte : "Depuis un débat", "Série", "Réponse audio"
- artwork ou symbole
- titre
- créateur/source
- waveform large
- temps actuel/durée
- contrôles principaux
- actions secondaires
- description/transcription
- queue ou recommandations

## 4. LAYOUT EXACT

### Mobile full-screen sheet :
- part du bas
- couvre 92 à 100 % de l'écran selon action
- fond noir charbon
- coins supérieurs arrondis si sheet partielle
- mode plein écran après expansion

### Desktop :
- modal centrée ou panneau latéral
- artwork à gauche, détails à droite
- queue visible à droite
- description sous player

## 5. HIERARCHIE VISUELLE

Priorité :

1. titre
2. bouton play/pause
3. waveform
4. contexte
5. actions
6. description
7. queue

Le full-player peut être riche, mais jamais confus.

## 6. POSITIONNEMENT DES ÉLÉMENTS

### Mobile :
- handle : haut centre
- contexte : haut gauche
- menu : haut droite
- artwork : centre
- titre : sous artwork
- waveform : zone centrale
- contrôles : sous waveform
- actions : sous contrôles
- description : partie scrollable basse

## 7. DIMENSIONS & ESPACEMENTS

- padding horizontal : 20 px
- handle : 38 x 4 px
- artwork : 180 à 240 px
- radius artwork : 28 à 36 px
- titre : marge top 24 px
- waveform hauteur : 72 à 110 px
- bouton play principal : 64 à 72 px
- boutons skip : 44 à 52 px
- actions secondaires : 40 px
- espace bas safe area : minimum 24 px

## 8. COULEURS

- fond : noir profond
- artwork background : gradient sombre
- accent : ambre
- waveform active : ambre
- waveform inactive : brun/gris
- texte : blanc cassé
- meta : gris sable
- source vérifiée : ambre doux
- transcription : surface sombre légèrement contrastée

## 9. TYPOGRAPHIE

- contexte : 11 à 12 px uppercase léger
- titre : 24 à 30 px mobile, 30 à 36 desktop
- créateur : 14 px
- description : 14 à 15 px
- transcription : 14 px avec line-height confortable
- temps : 12 px tabular

## 10. BOUTONS

### Contrôles principaux :
- retour 10/15 sec
- play/pause
- avance 10/15 sec

### Contrôles secondaires :
- vitesse
- sleep timer
- télécharger
- queue
- playlist
- partager
- transcription
- source
- signaler

Bouton principal :

- rond
- ambre
- icône noire ou blanc cassé selon contraste
- shadow chaude très douce

## 11. CARTES

Dans full-player :

- carte description
- carte transcription
- carte source
- carte débat associé
- carte queue
- carte recommandation

Toutes doivent rester sobres.

## 12. ICONOGRAPHIE

- icônes grandes pour contrôles
- icônes fines pour actions
- état actif en ambre
- état inactif gris sable

Éviter icônes enfantines. L'interface doit sentir le calme d'une bibliothèque nocturne.

## 13. COMPORTEMENT SCROLL

Le haut du player reste fixe jusqu'aux contrôles.

La partie basse peut scroller :

- description
- transcription
- queue
- commentaires liés

Pendant scroll interne, le player ne doit pas fermer accidentellement.

## 14. ANIMATIONS

- ouverture : montée fluide
- artwork : léger scale à l'ouverture
- waveform : fade-in progressif
- contrôles : apparition séquentielle courte
- fermeture : retour vers mini-player
- changement de piste : crossfade complet

## 15. MICRO INTERACTIONS

- play : bouton respire
- vitesse : badge flottant
- sleep timer : confirmation mini toast
- téléchargement : cercle progressif
- ajout playlist : coche discrète
- partage : sheet native ou modal MAATFEED
- transcription : surlignage possible de la phrase en cours

## 16. GESTURES MOBILE

- swipe down depuis haut : réduire
- swipe horizontal sur artwork : piste suivante/précédente
- scrub waveform : déplacement précis
- double tap gauche/droite : skip
- long press waveform : aperçu temps

## 17. ÉTATS LOADING

- artwork skeleton sombre
- waveform skeleton
- titre affiché si disponible
- play disabled jusqu'au buffer minimal
- message : "Préparation de l'écoute"

## 18. ÉTATS ERREUR

Écran partiel :

- titre conservé
- artwork conservé
- message court
- boutons : réessayer, passer, ouvrir source

Ne jamais remplacer tout le player par une page erreur vide.

## 19. ÉTATS OFFLINE

Full-player offline :

- badge clair
- uniquement contenus téléchargés
- queue filtrée
- progression conservée
- téléchargement non disponible expliqué

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :
- sheet plein écran

### Tablet :
- split : player + queue

### Desktop :
- layout 2 ou 3 colonnes
- artwork large
- queue sticky
- transcription visible à côté

## 21. ACCESSIBILITÉ

- contrôles clavier
- espace focus visible
- labels play/pause
- transcription lisible
- vitesse accessible
- timer accessible
- pas d'animation obligatoire
- durée annoncée correctement

## 22. PERFORMANCE UX

- waveform pré-générée ou simplifiée
- images compressées
- chargement progressif de la queue
- description lazy
- transcription lazy si longue

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- audio avant artwork
- waveform simplifiée
- pas d'autoload transcription lourde
- bouton télécharger prioritaire
- reprise après coupure
- qualité adaptative

## 24. RÈGLES NON NÉGOCIABLES

- Le full-player doit toujours pouvoir revenir en mini-player
- Le titre reste lisible
- Le bouton play reste accessible
- La progression ne doit pas être approximative visuellement
- La queue ne doit pas cacher les contrôles
- Le player ne doit jamais ressembler à une page musique générique
- Le contexte MAATFEED doit rester visible

---

*Full audio player pour MAATFEED*
