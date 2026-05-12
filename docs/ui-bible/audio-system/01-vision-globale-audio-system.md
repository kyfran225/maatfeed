# 1. VISION GLOBALE DE L'AUDIO SYSTEM

## 1. OBJECTIF UX

L'Audio System de MAATFEED doit devenir une couche permanente de l'expérience, pas un simple lecteur secondaire.

L'audio doit permettre à l'utilisateur de :

- écouter du savoir pendant qu'il scrolle
- reprendre une discussion sans rester bloqué sur un écran
- suivre des débats sous forme orale
- écouter des séries, réponses, commentaires, analyses IA ou contenus de créateurs
- passer d'un format court à une écoute longue sans rupture
- continuer même avec une connexion instable

L'objectif principal est de créer une sensation de radio culturelle intelligente, fusionnée avec un feed social premium.

L'utilisateur doit comprendre immédiatement :

- ce qui joue
- d'où vient l'audio
- pourquoi c'est recommandé
- comment ouvrir le lecteur complet
- comment revenir au feed sans perdre l'écoute

## 2. ÉMOTION RECHERCHÉE

L'expérience doit donner une impression de continuité, de profondeur et de calme actif.

L'utilisateur ne doit pas sentir qu'il "lance un fichier audio". Il doit sentir qu'il entre dans un flux vivant : voix, débat, savoir, rythme, respiration.

Émotion cible :

- immersion
- maîtrise
- curiosité
- confort
- écoute intelligente
- premium discret
- proximité humaine sans surcharge visuelle

L'audio doit être ressenti comme une braise sous le feed : toujours présent, jamais envahissant.

## 3. STRUCTURE VISUELLE GLOBALE

Le système audio repose sur 4 couches principales :

### Audio intégré au feed
Présent dans les cartes audio, cartes débat, cartes série, recommandations et réponses.

### Mini-player global
Persistant en bas de l'écran, au-dessus de la navigation principale.

### Full audio player
Écran immersif dédié à l'écoute longue, avec waveform, queue, description, sources, réactions et actions.

### Audio contextuel dans les débats
Réponses audio, résumés audio IA, citations orales, extraits et fils de discussion audio.

L'audio ne doit jamais casser le parcours principal. Il doit accompagner.

## 4. LAYOUT EXACT

### Sur mobile :
- feed principal plein écran
- mini-player fixé en bas
- bottom navigation sous le mini-player
- cards audio visibles dans le flux
- tap sur mini-player ouvre le full-player en sheet verticale
- swipe down referme le full-player
- audio continue en arrière-plan de navigation interne

### Sur desktop :
- feed ou débat au centre
- player sticky à droite ou en bas selon contexte
- queue visible dans un panneau latéral
- mini-player devient une barre horizontale premium
- waveform plus détaillée
- raccourcis clavier disponibles

### Sur tablette :
- mode hybride
- feed à gauche
- player compact ou étendu à droite
- queue accessible par panneau coulissant

## 5. HIERARCHIE VISUELLE

Priorité visuelle :

1. état lecture : play/pause
2. titre du contenu
3. créateur/source
4. progression
5. contexte : feed, débat, série, playlist
6. actions secondaires : queue, vitesse, téléchargement, partager

Le bouton lecture doit toujours être l'élément dominant.

La waveform ne doit jamais écraser le titre. Elle est informative, respirante, presque musicale.

## 6. POSITIONNEMENT DES ÉLÉMENTS

### Sur mobile :
- mini-player : bottom fixed, au-dessus de la bottom nav
- full-player : overlay/sheet depuis le bas
- bouton play principal : centre de la zone de contrôle
- titre : haut de la carte ou haut du player
- waveform : sous le titre, avant les contrôles
- actions secondaires : ligne basse ou menu overflow

### Dans le feed :
- icône audio visible avant le titre
- durée toujours visible
- badge "À écouter" ou "Débat audio" discret
- bouton play dans une pastille ambre ou verre sombre

## 7. DIMENSIONS & ESPACEMENTS

### Mobile :
- mini-player hauteur : 64 à 76 px
- marge horizontale : 12 à 16 px
- radius mini-player : 18 à 22 px
- artwork miniature : 44 à 52 px
- bouton play mini : 36 à 42 px
- waveform mini : hauteur 18 à 24 px
- full-player padding horizontal : 20 px
- zone contrôle principale : 72 à 96 px de hauteur
- boutons secondaires : 40 à 44 px minimum

### Desktop :
- player sticky largeur : 340 à 420 px
- full-player modal largeur max : 720 à 860 px
- queue panel : 320 à 380 px
- artwork : 220 à 320 px selon écran

### Espacement interne :
- titre et source : 4 à 6 px
- waveform et titre : 16 à 20 px
- contrôles et waveform : 20 à 28 px
- actions secondaires : gap 12 px

## 8. COULEURS

Palette audio :

- fond principal : noir charbon profond
- surface player : noir légèrement plus clair
- bordure : ambre très faible opacité
- accent actif : or/ambre
- waveform inactive : gris chaud
- waveform active : ambre progressif
- texte principal : blanc cassé
- texte secondaire : gris sable
- erreurs : rouge brique discret
- offline : ocre doux
- premium : or plus lumineux mais jamais criard

Règle : L'ambre signale l'activité, la progression, la chaleur vocale. Le noir garde la concentration.

## 9. TYPOGRAPHIE

### Titre audio :
- mobile : 14 à 16 px, semi-bold
- full-player : 22 à 28 px
- desktop : 18 à 24 px selon espace

### Source/créateur :
- 12 à 14 px
- couleur gris sable
- jamais plus visible que le titre

### Durée/progression :
- 11 à 12 px
- chiffres alignés
- lisibles mais discrets

### Libellés actions :
- 11 à 13 px
- optionnels sur mobile
- visibles sur desktop

## 10. BOUTONS

### Boutons principaux :
- play/pause
- skip backward
- skip forward
- ouvrir full-player
- fermer player

### Boutons secondaires :
- vitesse
- sleep timer
- queue
- télécharger
- ajouter playlist
- partager
- signaler
- ouvrir débat associé

Le bouton play doit avoir :

- taille minimum 44 px
- contraste fort
- état pressed
- état loading
- état disabled si audio indisponible

## 11. CARTES

Les cartes audio doivent être plus calmes que les cartes vidéo.

Structure recommandée :

- badge type audio
- titre
- source/créateur
- courte description
- waveform ou barre de durée
- bouton play
- durée
- contexte : série, débat, playlist, réponse
- actions sociales discrètes

La carte audio doit pouvoir exister en trois densités :

- compact feed
- medium éditorial
- large immersive

## 12. ICONOGRAPHIE

Icônes à utiliser :

- play/pause
- onde audio
- casque
- micro
- playlist
- queue
- téléchargement
- vitesse
- lune/minuteur
- volume
- transcription
- source
- IA si contenu généré ou résumé

Style :

- traits arrondis
- pas d'icônes trop techniques
- icônes dorées uniquement pour l'état actif
- icônes secondaires en gris chaud

## 13. COMPORTEMENT SCROLL

L'audio doit survivre au scroll.

### Dans le feed :
- lorsqu'un audio est lancé, la carte peut afficher un état "en lecture"
- le mini-player apparaît avec transition douce
- la carte ne doit pas rester visuellement agressive
- si l'utilisateur scrolle loin, le mini-player garde le contexte

### Dans les débats :
- une réponse audio en lecture reste indiquée même si elle sort de l'écran
- retour possible vers la réponse source depuis le player

## 14. ANIMATIONS

Animations clés :

- apparition mini-player : slide-up doux + fade
- changement audio : crossfade de titre/artwork
- play : micro-pulse sur bouton
- pause : retour calme
- waveform : progression fluide
- ouverture full-player : sheet magnétique
- fermeture : snap naturel vers mini-player

Durée :

- micro-interactions : 120 à 180 ms
- transitions player : 240 à 360 ms
- changement de piste : 180 à 260 ms

## 15. MICRO INTERACTIONS

Exemples :

- tap play : bouton se contracte légèrement
- lancement : waveform s'allume progressivement
- téléchargement terminé : petite coche ambre
- ajout playlist : icône se remplit
- vitesse modifiée : badge temporaire "1.25x"
- retour à la source : petite vibration visuelle de la carte cible
- erreur réseau : player respire en mode attente, sans brutalité

## 16. GESTURES MOBILE

Gestures :

- tap mini-player : ouvrir full-player
- swipe up mini-player : ouvrir rapidement
- swipe down full-player : réduire
- horizontal swipe sur waveform : scrub contrôlé
- long press sur carte audio : options rapides
- double tap gauche/droite full-player : recul/avance courte
- swipe horizontal dans queue : retirer de la file

Gestures interdits :

- gestures qui entrent en conflit avec scroll principal
- scrub trop sensible
- fermeture accidentelle du player

## 17. ÉTATS LOADING

### Audio loading :
- bouton play devient spinner minimal
- waveform skeleton
- titre visible
- durée peut afficher "chargement..."
- mini-player ne doit pas clignoter

### Préchargement :
- charger les premières secondes
- afficher état "préparation audio"
- ne jamais bloquer toute la page

## 18. ÉTATS ERREUR

Types d'erreurs :

- audio indisponible
- réseau instable
- source externe bloquée
- fichier supprimé
- téléchargement échoué
- lecture interrompue

UI erreur :

- message court
- action claire : réessayer, passer, ouvrir source
- garder le contexte
- ne pas effacer la queue entière
- ne pas faire disparaître brutalement le player

## 19. ÉTATS OFFLINE

Offline :

- afficher badge "hors ligne"
- permettre lecture des audios téléchargés
- griser les audios non disponibles
- proposer "télécharger pour plus tard" quand réseau revient
- garder la progression locale

Le mode offline doit être digne, pas punitif.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :
- priorité mini-player
- full-player en sheet
- queue en panneau secondaire
- actions cachées dans menu

### Tablet :
- player en panneau droit possible
- queue accessible
- waveform plus large

### Desktop :
- player sticky
- queue visible
- raccourcis clavier
- contexte source plus riche
- affichage des transcriptions et sources possible

## 21. ACCESSIBILITÉ

Obligatoire :

- boutons minimum 44 px
- labels accessibles
- focus visible
- navigation clavier desktop
- support lecteur d'écran
- transcription disponible quand possible
- indication claire play/pause
- ne pas dépendre uniquement de la couleur

Audio :

- contrôle vitesse
- transcription
- reprise
- volume
- compatibilité réduction animations

## 22. PERFORMANCE UX

Le système audio doit être léger.

Règles :

- ne pas charger toutes les pistes du feed
- lazy load audio
- précharger uniquement la piste active ou probable
- éviter les grosses waveforms calculées en temps réel côté client
- utiliser des placeholders
- éviter les re-renders du feed à chaque seconde de progression

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Priorités :

- démarrage rapide
- qualité audio adaptative
- reprise fiable
- téléchargement hors ligne
- cache intelligent
- messages simples
- pas de dépendance permanente à la vidéo

Sur faible connexion :

- audio prioritaire sur image lourde
- artwork basse résolution
- waveform simplifiée
- queue texte disponible
- préchargement réduit
- mode data saver

## 24. RÈGLES NON NÉGOCIABLES

- L'audio continue pendant la navigation interne
- Le mini-player ne doit jamais masquer la bottom nav
- Aucun audio ne se lance automatiquement avec son sans action utilisateur claire
- Le player doit rester lisible sur petit écran
- Les contrôles essentiels doivent rester accessibles
- Le système doit fonctionner en faible connexion
- Le full-player ne doit pas ressembler à un lecteur générique
- L'identité MAATFEED noir/or doit rester dominante
- L'audio doit être intégré au débat, au feed et aux séries
- Aucun état loading ou erreur ne doit casser l'immersion

---

*Vision globale du système audio pour MAATFEED*
