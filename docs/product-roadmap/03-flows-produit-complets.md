# MAATFEED — FLOWS PRODUIT COMPLETS ULTRA DÉTAILLÉS

## Objectif du document

Ce document définit les flows produit complets de MAATFEED pour transformer l'application en plateforme culturelle, sociale, audio/vidéo, communautaire et monétisable.

Il ne s'agit pas seulement de décrire des pages.

Il s'agit de décrire :
- ce que l'utilisateur veut faire
- ce qu'il ressent
- ce que l'interface doit lui montrer
- ce que le backend doit gérer
- ce que l'IA doit assister
- ce qui doit être mesuré
- ce qui peut être monétisé
- ce qui doit être priorisé pour le MVP

**La logique centrale :**

Chaque contenu MAATFEED doit pouvoir devenir une conversation, chaque conversation doit pouvoir devenir une communauté, et chaque communauté doit pouvoir générer de la valeur.

## 0. Architecture Générale des Flows

### Les grands flows à concevoir
1. Onboarding utilisateur
2. Découverte / Feed principal
3. Création de contenu
4. Upload média
5. Débat
6. Réponses multimédia
7. Audio
8. Séries
9. IA
10. Créateur
11. Live
12. Monétisation utilisateur
13. Sponsor
14. Notifications / rétention
15. Recherche / exploration
16. Profil / identité
17. Modération / signalement
18. Admin
19. Offline / faible connexion
20. SEO public / partage externe

## 1. Flow Onboarding Utilisateur

### Objectif
Comprendre rapidement l'utilisateur pour personnaliser son feed dès la première session.

L'onboarding ne doit pas être long. Il doit donner l'impression que MAATFEED prépare une expérience personnelle.

### État émotionnel utilisateur
L'utilisateur arrive avec :
- curiosité
- impatience
- méfiance légère
- envie de voir vite le contenu

Il ne veut pas remplir un formulaire interminable.

### Entrées possibles
- ouverture directe de l'app
- lien partagé vers un débat
- lien TikTok/Reels vers MAATFEED
- résultat Google
- invitation d'un ami

### Écrans

#### Écran 1 — Promesse
**Titre :** Le feed africain du savoir, du débat et de la culture.

**Actions :**
- Continuer
- Explorer sans compte
- Se connecter

**Règle :** permettre l'exploration sans bloquer immédiatement.

#### Écran 2 — Choix des centres d'intérêt
**Catégories :**
- Histoire africaine
- Kemet
- Spiritualité africaine
- Religions
- Philosophie
- Débats de société
- Afrique moderne
- Musique / audio
- Mythes & mystères
- Civilisations

**UX :** sélection par cartes visuelles.

**Minimum recommandé :** 3 choix.

#### Écran 3 — Préférence de format
**Question :** Tu préfères découvrir comment ?

**Options :**
- Vidéos courtes
- Audios
- Débats
- Séries
- Mix intelligent

**Valeur par défaut :** Mix intelligent.

#### Écran 4 — Style de participation
**Question :** Tu veux surtout…

**Options :**
- Regarder / écouter
- Débattre
- Apprendre
- Créer
- Soutenir des créateurs

#### Écran 5 — Avatar symbolique
L'utilisateur choisit un avatar non humain ou symbolique MAATFEED.

**Exemples :**
- Le Scribe
- La Balance
- Le Papyrus
- L'Œil solaire
- Le Tambour
- La Porte
- Le Masque
- L'Étoile

**Objectif :** identité sans friction.

#### Écran 6 — Feed prêt
**Message :** Ton feed MAAT est prêt.

**CTA :** Entrer dans le feed

### Règles produit
- Ne pas forcer création de compte trop tôt.
- Autoriser navigation invitée avec limites douces.
- Demander inscription au moment où la valeur est claire : sauvegarde, réponse, publication, abonnement, soutien.

### Données collectées
```
UserPreference
├── interests
├── preferredFormats
├── participationIntent
├── avatarId
├── onboardingCompleted
└── initialRecommendationProfile
```

### IA dans l'onboarding
L'IA peut générer :
- première playlist personnalisée
- première série recommandée
- premier débat recommandé
- phrase de bienvenue personnalisée

**Exemple :** J'ai préparé un feed entre Histoire africaine, débats spirituels et audios courts.

### Notifications liées
Après première session :
- "Votre premier débat recommandé est prêt."
- "Une série courte correspond à vos intérêts."

### KPI
- taux de complétion onboarding
- temps avant premier contenu regardé
- taux d'inscription après exploration
- intérêt sélectionné le plus fréquent
- D1 retention par intérêt

### Priorité MVP
**Obligatoire :**
- intérêts
- formats préférés
- exploration sans compte

**Plus tard :**
- avatar avancé
- IA onboarding personnalisé
- profil culturel détaillé

## 2. Flow Découverte / Feed Principal

### Objectif
Faire entrer l'utilisateur dans une boucle de découverte, émotion, interaction et retour.

Le feed est le cœur vivant de MAATFEED.

### États émotionnels
L'utilisateur est :
- curieux
- distrait
- pressé
- prêt à scroller
- difficile à retenir

Le feed doit accrocher en moins de 2 secondes.

### Structure de la page

#### Header
**Éléments :**
- logo MAATFEED
- recherche
- notifications
- accès création
- mini avatar

#### Filtres horizontaux
- Pour toi
- Débats chauds
- Audio
- Kemet
- Spiritualité
- Histoire
- Séries
- Créateurs

#### Feed cards
Chaque carte contient :
- média principal
- hook fort
- contexte court
- auteur
- badge éventuel
- activité débat
- actions rapides

### Types de cartes

#### Carte vidéo courte
**Actions :**
- lire / pause
- aimer
- débattre
- répondre
- partager
- sauvegarder

#### Carte audio
**Actions :**
- écouter
- ajouter à playlist
- reprendre plus tard
- voir transcription
- débat lié

#### Carte débat
Affiche :
- question
- positions opposées
- nombre de réponses
- meilleure réponse
- bouton participer

#### Carte série
Affiche :
- titre série
- progression
- épisode suivant
- durée

#### Carte sponsor native
Affiche :
- sponsor discret
- lien avec le thème
- CTA léger

### Règles de ranking simples MVP
Le feed mélange :
- contenu récent
- contenu populaire
- contenu lié aux intérêts
- contenu avec débats actifs
- contenu audio recommandé

**Ratio MVP recommandé :**
- 40% personnalisé
- 25% populaire
- 20% débats actifs
- 10% découverte
- 5% sponsor / expérimental

### Interactions clés

#### Scroll
- précharger contenu suivant
- pause du média précédent
- reprendre si retour

#### Tap sur contenu
- ouvre détail contenu
- ou plein écran vidéo selon format

#### Tap "Débattre"
- ouvre bottom sheet débat
- puis page débat complète si besoin

#### Tap "Écouter"
- lance mini player global

#### Tap "Sauvegarder"
bottom sheet :
- plus tard
- playlist
- série personnelle

### États système

#### Loading
Skeleton cards, jamais spinner vide.

#### Feed vide
**Message :** Choisis quelques sujets pour lancer ton feed.

#### Connexion faible
**Mode léger :**
- thumbnails
- audio prioritaire
- vidéo basse qualité

#### Erreur
**Message simple :** Le feed n'a pas pu se charger. Réessayer.

### Backend
```
FeedService
├── getPersonalFeed(userId)
├── getGuestFeed()
├── trackImpression(contentId)
├── trackWatch(contentId)
├── trackInteraction(contentId)
└── refreshFeedCursor(cursor)
```

### Données à tracker
- impression
- watch time
- completion rate
- like
- save
- share
- debate open
- response started
- audio play
- skip rapide

### Monétisation dans le feed
- sponsor natif après plusieurs contenus
- soutien créateur après forte interaction
- premium proposé après usage répété, pas immédiatement

### Priorité MVP
**Obligatoire :**
- feed mix vidéo/audio/débat
- actions aimer/sauvegarder/partager/débattre
- tracking minimal

**Plus tard :**
- ranking avancé
- IA recommandation
- feed faible connexion intelligent

## 3. Flow Création de Contenu

### Objectif
Permettre à un utilisateur ou créateur de publier un contenu riche sans complexité.

La création doit être rapide pour les simples utilisateurs, puissante pour les créateurs.

### Entrées
- bouton + global
- réponse à un débat
- créer depuis profil
- créer depuis série
- créer depuis audio
- créer depuis dashboard créateur

### Écran 1 — Choisir le type de création
**Options :**
- Vidéo
- Audio
- Texte
- Débat
- Image
- Document
- Série
- Live

**UX :** cartes larges avec description courte.

### Écran 2 — Choisir l'intention
**Question :** Tu veux créer quoi ?

**Options :**
- Expliquer
- Réagir
- Poser une question
- Lancer un débat
- Raconter
- Partager une source
- Promouvoir une série

Cette intention aide l'IA et le ranking.

### Écran 3 — Ajouter média ou texte
Selon format :
- upload vidéo
- enregistrement caméra
- upload audio
- enregistrement vocal
- texte long
- document
- image

### Écran 4 — Éditer contenu
**Champs :**
- titre
- description
- hook
- catégories
- tags
- langue
- visibilité
- sources
- IA assistante

**Boutons IA :**
- Améliorer le titre
- Créer un hook
- Résumer
- Proposer tags
- Reformuler
- Rendre plus clair
- Ajouter question de débat

### Écran 5 — Aperçu
Affiche :
- rendu feed
- rendu détail
- rendu partage social

### Écran 6 — Publication
**États :**
- upload
- processing
- modération automatique
- publié

### Règles produit
- Sauvegarde automatique en brouillon.
- Ne jamais perdre le contenu si réseau coupe.
- Si média lourd, afficher progression claire.
- La publication peut apparaître comme "en traitement".

### Backend
```
ContentCreationService
├── createDraft()
├── updateDraft()
├── uploadMedia()
├── processMedia()
├── runModeration()
├── publishContent()
└── notifyFollowers()
```

### Données
```
ContentDraft
├── userId
├── type
├── title
├── hook
├── description
├── mediaIds
├── tags
├── categories
├── sources
├── visibility
├── aiSuggestions
└── status
```

### Notifications
**Créateur :**
- "Votre contenu est publié."
- "Votre vidéo est en traitement."
- "Votre contenu nécessite une vérification."

**Followers :**
- "Nouveau contenu de [créateur]."

### Monétisation
- proposer sponsorisation créateur plus tard
- permettre contenu premium pour créateurs validés
- encourager soutien créateur après publication performante

### Priorité MVP
**Obligatoire :**
- vidéo
- audio
- texte
- débat
- brouillon simple
- tags/catégories

**Plus tard :**
- IA avancée
- génération clips
- programmation publication
- séries premium

## 4. Flow Upload Média

### Objectif
Rendre l'upload fiable, rassurant et adapté aux connexions instables.

### Formats acceptés
- vidéo MP4/WebM
- audio MP3/M4A/WAV
- images JPG/PNG/WebP
- documents PDF/DOCX

### Étapes upload

#### 1. Sélection
**Sources :**
- galerie
- caméra
- micro
- fichiers
- URL externe plus tard

#### 2. Vérification locale
**Contrôles :**
- taille
- durée
- format
- résolution

#### 3. Prévisualisation
Selon média :
- vidéo player
- audio waveform
- image preview
- document preview

#### 4. Upload résumable
Important.

Le système doit pouvoir reprendre si coupure.

#### 5. Processing
**Backend :**
- compression
- transcription
- thumbnail
- waveform
- modération

#### 6. Publication ou brouillon

### États UX
- prêt
- upload en cours
- pause réseau
- reprise
- traitement
- échec
- succès

### Messages
**Connexion faible :** Connexion instable. L'envoi reprendra automatiquement.

**Traitement :** Votre média est en préparation.

### Backend recommandé
```
MediaService
├── initUpload()
├── uploadChunk()
├── completeUpload()
├── transcodeVideo()
├── normalizeAudio()
├── generateThumbnail()
├── generateWaveform()
├── transcribeMedia()
└── attachToContent()
```

### Priorité MVP
**Obligatoire :** upload vidéo/audio/image/document classique.

**Plus tard :** upload chunk/résumable, transcription, compression avancée.

## 5. Flow Débat

### Objectif
Transformer un contenu en conversation structurée, vivante et différenciante.

Le débat est l'âme sociale de MAATFEED.

### Entrées
- bouton Débattre sur carte feed
- page Débats
- notification
- réponse reçue
- partage externe
- recherche Google

### Structure débat

#### Zone 1 — Contenu source
Affiche :
- vidéo/audio/texte source
- hook
- auteur
- contexte

#### Zone 2 — Question centrale
**Exemple :** Les religions africaines ont-elles été diabolisées ?

#### Zone 3 — Résumé IA facultatif
**Résumé :**
- idée principale
- points de tension
- positions dominantes

#### Zone 4 — Réponses
**Filtres :**
- pertinentes
- populaires
- récentes
- audio
- vidéo
- contradictoires
- avec sources

#### Zone 5 — Composer une réponse
**Options :**
- texte
- audio
- vidéo
- image
- document
- citation timestamp

### Règles UX
- Ne pas afficher profondeur infinie.
- Afficher 2 niveaux visibles maximum.
- Permettre "voir plus".
- Mettre en valeur réponses de qualité.
- Ne pas encourager insultes ou chaos.

### Réactions débat
Au lieu de simples likes :
- D'accord
- Pas d'accord
- Nuancé
- Source utile
- À vérifier

### IA dans débat
**Fonctions :**
- résumer fil
- expliquer termes
- reformuler ma réponse
- proposer contre-argument
- signaler manque de source
- calmer ton agressif

### États débat
- actif
- chaud
- sensible
- modéré
- verrouillé
- premium
- live

### Backend
```
DebateService
├── createDebateFromContent()
├── getDebateThread()
├── addResponse()
├── voteResponse()
├── rankResponses()
├── summarizeDebate()
├── flagDebate()
└── moderateResponse()
```

### Données
```
Debate
├── sourceContentId
├── topic
├── question
├── tags
├── responseCount
├── controversyScore
├── qualityScore
├── aiSummary
├── moderationState
└── status

DebateResponse
├── debateId
├── userId
├── type
├── body
├── media
├── parentId
├── timestampRef
├── reactions
├── sourceAttachments
├── aiAssisted
└── moderationState
```

### Notifications
- réponse à votre argument
- nouveau contre-argument
- débat devient populaire
- IA a résumé le débat
- votre réponse est mise en avant

### Monétisation
- débat sponsorisé, avec grande prudence
- série premium liée au débat
- soutien créateur du débat
- accès live débat premium plus tard

### Priorité MVP
**Obligatoire :**
- débat attaché à contenu
- réponses texte/audio/vidéo
- tri simple
- signalement

**Plus tard :**
- IA résumé
- réactions nuancées
- compare mode
- live débat

## 6. Flow Réponses Multimédia

### Objectif
Faire de chaque réponse un contenu riche pouvant vivre dans le débat et parfois remonter dans le feed.

### Types de réponse
- Texte
- Audio
- Vidéo
- Image
- Document
- Citation d'un passage
- Réponse IA assistée

### Flow réponse texte
**Étapes :**
1. Tap "Répondre"
2. Zone texte ouverte
3. Suggestions IA facultatives
4. Ajout source possible
5. Aperçu
6. Publication

**Options IA :**
- rendre plus clair
- rendre plus respectueux
- ajouter nuance
- raccourcir
- structurer en argument

### Flow réponse audio
**Étapes :**
1. Tap micro
2. Rappel du sujet
3. Enregistrement
4. Réécoute
5. Transcription auto plus tard
6. Publication

**UX :**
- durée recommandée : 30 sec à 3 min
- waveform visible
- bouton pause/reprendre

### Flow réponse vidéo
**Étapes :**
1. Tap caméra
2. sujet affiché en overlay
3. enregistrement vertical
4. aperçu
5. titre auto ou manuel
6. publication

**Options :**
- sous-titres
- miniature
- couper début/fin

### Flow réponse document
**Usage :** Pour PDF, extrait livre, article, source, preuve

**UX :**
- upload document
- titre source
- commentaire associé
- preview document

### Règles produit
- Une réponse populaire peut devenir contenu recommandé.
- Une réponse toxique doit être limitée.
- Une réponse avec source peut être valorisée.

### Backend
```
ResponseService
├── createTextResponse()
├── createAudioResponse()
├── createVideoResponse()
├── attachDocument()
├── transcribeResponse()
├── promoteResponseToFeed()
└── moderateResponse()
```

### Priorité MVP
**Obligatoire :** texte, audio, vidéo, image/document basique.

**Plus tard :** transcription, promotion feed, citation timestamp avancée.

## 7. Flow Audio Complet

### Objectif
Faire de l'audio un pilier d'usage quotidien.

MAATFEED doit pouvoir être consommé sans regarder l'écran.

### Entrées
- onglet Écouter
- carte audio dans feed
- résumé audio d'un débat
- série audio
- réponse audio
- playlist

### Page Écouter
**Sections :**
- Reprendre
- Audio du jour
- Débats audio
- Séries audio
- Playlists recommandées
- Créateurs audio
- Téléchargements premium plus tard

### Mini player global
Toujours visible après lecture.

**Contient :**
- titre
- créateur
- play/pause
- progression
- ouvrir plein écran

### Full player
**Contient :**
- artwork
- waveform
- transcription
- débat lié
- vitesse
- sauvegarder
- partager
- file d'attente

### Règles
- Continuer lecture entre pages.
- Sauvegarder progression.
- Reprendre automatiquement.
- Baisser qualité si connexion faible.

### IA audio
- résumé audio
- chapitres
- transcription
- points clés
- quiz rapide

### Backend
```
AudioService
├── playAudio()
├── saveProgress()
├── getContinueListening()
├── generateWaveform()
├── transcribeAudio()
├── createAudioSummary()
└── manageQueue()
```

### Monétisation audio
- playlists premium
- téléchargement offline
- séries audio exclusives
- sponsor audio discret

### Priorité MVP
**Obligatoire :** mini player, progression, page écouter, sauvegarde.

**Plus tard :** offline, transcription, chapitres IA, premium audio.

## 8. Flow Séries

### Objectif
Transformer le contenu dispersé en parcours suivis.

Les séries créent la fidélité.

### Types de séries
- vidéo
- audio
- mixte
- débat
- premium
- créateur
- IA guidée

### Page série
**Contient :**
- couverture
- titre
- description
- créateur
- épisodes
- progression
- bouton reprendre
- débat de la série
- recommandations liées

### Flow utilisateur
1. Découvre un épisode dans feed
2. Ouvre série
3. Regarde/écoute épisode
4. Suit la série
5. Reçoit suite
6. Participe au débat
7. Termine série
8. Reçoit badge ou résumé

### Flow créateur série
1. Créer série
2. Définir thème
3. Ajouter épisodes
4. Choisir ordre
5. Ajouter couverture
6. Définir gratuit/premium
7. Publier

### IA dans séries
- générer plan
- résumer épisodes
- proposer quiz
- créer épisode suivant suggéré

### Backend
```
SeriesService
├── createSeries()
├── addEpisode()
├── reorderEpisodes()
├── followSeries()
├── trackProgress()
├── unlockPremiumEpisode()
└── recommendNextEpisode()
```

### Monétisation
- séries sponsorisées
- épisodes premium
- soutien créateur
- pack connaissance

### Priorité MVP
**Obligatoire :** séries gratuites, suivi, progression.

**Plus tard :** premium, quiz, badges, IA parcours.

## 9. Flow IA Complet

### Objectif
Faire de l'IA un compagnon culturel discret, utile et contextuel.

L'IA ne doit pas remplacer la communauté.

Elle doit enrichir l'expérience.

### Points d'entrée IA
- contenu
- débat
- création
- audio
- série
- recherche
- profil
- onboarding

### Personnalités IA
- Sage MAAT
- Expert Kemet
- Animateur communautaire
- Théologien catholique
- Érudit musulman
- Érudit juif
- Coach débat
- Narrateur audio

### Fonctions IA

#### Sur contenu
- résumer
- expliquer
- contextualiser
- proposer contenus liés

#### Sur débat
- résumer arguments
- comparer positions
- reformuler réponse
- calmer ton
- proposer source

#### Sur création
- titre
- hook
- tags
- description
- script court

#### Sur audio
- transcription
- résumé
- chapitres
- quiz

#### Sur recherche
- réponse guidée
- suggestions sujets

### UX IA
L'IA apparaît comme :
- bouton discret
- carte contextuelle
- bottom sheet
- assistant latéral desktop

**Pas comme :**
- chatbot omniprésent
- pop-up permanent

### Backend
```
AIService
├── summarizeContent()
├── summarizeDebate()
├── suggestTitle()
├── improveResponse()
├── classifyContent()
├── generateQuiz()
├── recommendTopics()
└── moderateText()
```

### Règles sécurité
- indiquer quand contenu IA est généré
- éviter fausses certitudes
- recommander sources quand nécessaire
- ne pas faire passer IA pour humain

### Monétisation IA
**Gratuit :**
- quelques résumés
- reformulation légère

**Premium :**
- IA avancée
- coach culturel
- analyses longues
- quiz illimités

### Priorité MVP
**Obligatoire :** résumé contenu, aide réponse, tags/titres.

**Plus tard :** personnalités IA complètes, coach, quiz, recherche IA.

## 10. Flow Créateur

### Objectif
Transformer les bons utilisateurs en créateurs valorisés.

### Onboarding créateur
**Étapes :**
1. Devenir créateur
2. Choisir domaine
3. Choisir formats
4. Compléter profil
5. Publier premier contenu
6. Voir dashboard

### Profil créateur
**Contient :**
- bio
- expertise
- badges
- contenus
- séries
- débats
- supporters
- liens externes

### Dashboard créateur
**Sections :**
- performances
- contenus
- séries
- revenus
- sponsors
- audience
- suggestions IA

### Analytics
- vues
- watch time
- audio completion
- débats générés
- sauvegardes
- partages
- abonnés
- revenus

### Outils créateur
- upload avancé
- séries
- clips
- IA titre/hook
- brouillons
- programmation plus tard

### Monétisation créateur
- soutien direct
- séries premium
- sponsors
- live payant
- abonnement supporter

### Backend
```
CreatorService
├── applyCreator()
├── updateCreatorProfile()
├── getCreatorDashboard()
├── getCreatorAnalytics()
├── enableMonetization()
├── manageSeries()
└── matchSponsorCampaigns()
```

### Priorité MVP
**Obligatoire :** profil créateur, publication, stats basiques.

**Plus tard :** revenus, sponsors, analytics avancées.

## 11. Flow Live

### Objectif
Créer des rendez-vous communautaires forts.

Le live doit arriver après stabilisation du feed/débat/audio.

### Types de live
- live audio
- live débat
- conférence
- questions/réponses
- live créateur
- live sponsorisé

### Flow création live
1. Choisir type live
2. Titre
3. thème
4. date immédiate ou programmée
5. invités
6. visibilité
7. sponsor optionnel
8. publier annonce

### Flow utilisateur live
1. Voit annonce
2. Active rappel
3. Rejoint live
4. écoute/regarde
5. réagit
6. pose question
7. soutient
8. replay disponible

### Interface live
- scène principale
- participants
- chat contrôlé
- questions
- réactions
- modération
- bouton soutien

### Modération live
- mute
- slow mode
- retirer question
- bannir temporairement
- IA transcription toxicité

### Monétisation live
- donations
- tickets premium
- sponsor live
- replay premium

### Backend
```
LiveService
├── createLiveEvent()
├── scheduleLive()
├── joinLive()
├── manageParticipants()
├── moderateLiveChat()
├── saveReplay()
└── notifySubscribers()
```

### Priorité MVP
**Pas phase 1.**

**Phase future :** live audio simple avant live vidéo.

## 12. Flow Monétisation Utilisateur

### Objectif
Permettre revenus sans casser confiance.

### Types
- soutien MAATFEED
- premium utilisateur
- soutien créateur
- achat série premium
- ticket live

### Flow soutien simple
1. Utilisateur clique "Soutenir"
2. Choisisit montant
3. Choisisit paiement
4. Confirme
5. Badge/remerciement
6. reçu

### Flow premium
1. Découverte avantage
2. Comparaison plans
3. paiement
4. activation immédiate
5. onboarding premium

### Plans recommandés
- Supporter : petit soutien
- Premium Light
- Premium MAAT
- Créateur Premium

### Backend
```
PaymentService
├── createCheckout()
├── verifyPayment()
├── activatePremium()
├── recordDonation()
├── handleWebhook()
└── issueReceipt()
```

### Règles
- petits montants adaptés Afrique
- Mobile Money prioritaire
- pas de paywall brutal au début

### Priorité MVP
**Dons + premium simple.**

**Plus tard :** marketplace, tickets, abonnements créateur.

## 13. Flow Sponsor

### Objectif
Créer revenus B2B via sponsoring natif et culturellement cohérent.

### Types sponsor
- série sponsorisée
- audio sponsorisé
- débat sponsorisé
- carte feed native
- événement live sponsorisé
- créateur sponsorisé

### Flow sponsor admin
1. Créer campagne
2. Sponsor
3. budget
4. dates
5. thèmes ciblés
6. format
7. contenu associé
8. validation
9. lancement
10. analytics

### Flow utilisateur
Le sponsor apparaît naturellement :
- "Cette série est soutenue par…"
- "Partenaire culturel"
- "Découvrir"

Jamais agressif.

### Dashboard sponsor
- impressions
- clics
- engagement
- watch time
- débats générés
- audience thèmes

### Backend
```
SponsorService
├── createCampaign()
├── targetCampaign()
├── injectSponsorCard()
├── trackImpression()
├── trackClick()
├── generateReport()
└── validateSponsorContent()
```

### Priorité MVP
**Cartes sponsor natives + tracking simple.**

**Plus tard :** dashboard sponsor complet.

## 14. Flow Notifications / Rétention

### Objectif
Faire revenir l'utilisateur naturellement.

### Types notifications
- réponse reçue
- débat actif
- série disponible
- audio recommandé
- créateur publié
- live bientôt
- IA résumé prêt
- badge obtenu

### Règles
**Bonne notification :** Quelqu'un a répondu à votre argument.

**Mauvaise notification :** Reviens vite !

### Centre notifications
**Filtres :**
- Tout
- Débats
- Créateurs
- Séries
- IA
- Système

### Backend
```
NotificationService
├── createNotification()
├── sendPush()
├── sendEmailOptional()
├── markRead()
├── groupNotifications()
└── personalizeFrequency()
```

### Priorité MVP
**Notifications in-app + push basique.**

**Plus tard :** fréquence intelligente, regroupement, email.

## 15. Flow Recherche / Exploration

### Objectif
Permettre de retrouver et explorer le savoir.

### Recherche globale
**Catégories :**
- contenus
- débats
- créateurs
- séries
- audio
- documents

### Page explorer
**Sections :**
- sujets populaires
- débats chauds
- créateurs tendance
- séries recommandées
- audio à écouter
- IA recherche plus tard

**Exemple :** Explique-moi les liens entre Maât, spiritualité et justice.

### Backend
```
SearchService
├── indexContent()
├── searchAll()
├── searchByTopic()
├── filterResults()
└── semanticSearchFuture()
```

### Priorité MVP
**Recherche simple + tags.**

**Plus tard :** Meilisearch/Typesense + IA.

## 16. Flow Profil / Identité

### Objectif
Créer appartenance et reconnaissance.

### Profil utilisateur
**Contient :**
- avatar
- bio courte
- intérêts
- badges
- contenus sauvegardés
- débats participés
- séries suivies
- créateurs suivis

### Badges
- Supporter
- Débatteur
- Analyste
- Narrateur
- Créateur
- Sage

### Réputation
Basée sur :
- participation
- qualité réponses
- signalements
- soutien communauté

### Priorité MVP
**Profil simple + sauvegardes + historique.**

**Plus tard :** badges, réputation, niveaux.

## 17. Flow Modération / Signalement

### Objectif
Protéger la qualité des débats.

### Flow signalement utilisateur
1. Ouvrir menu
2. Signaler
3. Choisir motif
4. Ajouter détail optionnel
5. confirmer
6. retour rassurant

### Motifs
- haine
- harcèlement
- fake info
- spam
- contenu violent
- hors sujet
- usurpation

### Admin/modération
**Actions :**
- ignorer
- avertir
- limiter visibilité
- supprimer
- suspendre
- verrouiller débat

### IA modération
- score toxicité
- score spam
- score risque
- résumé contexte

### Priorité MVP
**Signalement + suppression/admin basique.**

**Plus tard :** IA modération, trust score, crisis mode.

## 18. Flow Admin

### Objectif
Piloter plateforme, contenus, utilisateurs, sponsors et modération.

### Dashboard admin
**Sections :**
- activité globale
- contenus récents
- débats chauds
- signalements
- utilisateurs
- créateurs
- sponsors
- revenus
- santé système

### Actions admin
- modérer contenu
- valider créateur
- créer sponsor
- gérer catégories
- voir analytics
- envoyer annonce

### Priorité MVP
**Admin contenus + users + signalements + sponsors simples.**

**Plus tard :** analytics avancées, crisis room.

## 19. Flow Offline / Faible Connexion

### Objectif
Adapter MAATFEED au contexte mobile africain.

### Détection
- réseau lent
- coupure
- data saver

### Comportements
- réduire qualité vidéo
- privilégier audio
- afficher thumbnails
- mettre uploads en attente
- sauvegarder brouillons
- reprendre lecture

### UX
**Message :** Mode léger activé pour économiser la connexion.

### Priorité MVP
**Gestion erreurs + brouillons + qualité vidéo basse.**

**Plus tard :** offline audio premium.

## 20. Flow SEO Public / Partage Externe

### Objectif
Faire de chaque contenu important une porte d'entrée publique.

### Pages publiques
- contenu
- débat
- créateur
- série
- sujet

### Structure page publique
- titre SEO
- extrait
- média preview
- débat preview
- CTA ouvrir app
- contenus liés

### Partage social
Chaque contenu doit avoir :
- titre propre
- description
- image OG
- lien canonique

### Priorité MVP
**Pages publiques pour contenu/débat/série.**

**Plus tard :** SEO programmatique par thème.

## Roadmap de Construction des Flows

### Phase 1 — Core magique
**À construire d'abord :**
- onboarding simple
- feed vidéo/audio/débat
- détail contenu
- débat avec réponses texte/audio/vidéo
- upload média simple
- mini player audio
- profil simple
- notifications basiques

**Objectif :** prouver que MAATFEED est vivant.

### Phase 2 — Engagement profond
- séries
- playlists
- badges
- IA contextuelle
- recherche
- créateurs basiques
- rétention avancée

**Objectif :** faire revenir.

### Phase 3 — Monétisation
- dons
- premium simple
- sponsors natifs
- dashboard créateur basique
- séries premium

**Objectif :** générer revenus sans casser l'expérience.

### Phase 4 — Plateforme premium
- live audio
- live débat
- IA avancée
- analytics avancées
- desktop premium
- marketplace savoir
- sponsor dashboard complet

**Objectif :** transformer MAATFEED en écosystème culturel complet.

## Conclusion

MAATFEED doit être construit comme un système vivant.

Le contenu attire. Le débat engage. L'audio fidélise. L'IA enrichit. Les créateurs donnent de la valeur. Les séries créent l'habitude. La monétisation soutient l'écosystème. La modération protège la qualité.

**La phrase directrice :**

MAATFEED transforme le savoir africain en expérience sociale vivante, moderne, audio-visuelle, débattue et monétisable.
