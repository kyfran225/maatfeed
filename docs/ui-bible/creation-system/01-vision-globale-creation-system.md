# 1. VISION GLOBALE DU CREATION SYSTEM

## 1. OBJECTIF UX

Le Creation System de MAATFEED doit permettre à l'utilisateur de créer facilement plusieurs types de contenus sans se sentir écrasé par un studio complexe.

L'utilisateur doit pouvoir créer :

- un post simple
- une capsule audio
- une vidéo courte
- une réponse multimédia
- un débat
- une série
- une citation commentée
- un document sourcé
- une contribution enrichie par IA
- un contenu monétisable ou sponsorisable si son profil le permet

L'objectif n'est pas de copier les interfaces de création classiques des réseaux sociaux. MAATFEED doit proposer une expérience de création plus éditoriale, plus intelligente, plus culturelle.

La création doit répondre à une question simple :
"Qu'est-ce que tu veux transmettre au monde africain du savoir ?"

## 2. ÉMOTION RECHERCHÉE

L'expérience doit produire une sensation de puissance douce.

L'utilisateur doit sentir :

- qu'il peut créer vite
- qu'il peut créer sérieusement
- qu'il est accompagné
- qu'il peut enregistrer et revenir plus tard
- qu'il n'a pas besoin d'être expert pour publier un contenu propre
- que MAATFEED l'aide à clarifier sa pensée

La création doit ressembler à un atelier calme, pas à un formulaire administratif.

## 3. STRUCTURE VISUELLE GLOBALE

Le Creation System repose sur 7 grandes couches :

### Point d'entrée création
Bouton central ou action flottante depuis la bottom nav.

### Choix du type de contenu
Post, audio, vidéo, débat, série, réponse, citation, document.

### Composer adaptatif
Interface qui change selon le format choisi.

### Assistant IA contextuel
Suggestions de titre, résumé, tags, sources, reformulation, modération douce.

### Prévisualisation
Voir le rendu exact avant publication.

### Brouillons et reprise
Sauvegarde automatique, offline, retour après coupure.

### Publication et distribution
Choix audience, série, débat associé, monétisation, tags.

## 4. LAYOUT EXACT

### Sur mobile :
- bouton création accessible depuis la bottom nav
- ouverture d'un bottom sheet plein écran ou quasi plein écran
- premier écran : choix rapide du type de création
- second écran : composer adapté
- header compact avec fermer, brouillon, aperçu, publier
- zone centrale dédiée au contenu
- barre basse contextuelle selon format

### Sur desktop :
- workspace de création en 2 ou 3 colonnes
- colonne gauche : type, structure, brouillons
- colonne centrale : composer principal
- colonne droite : aperçu, IA, sources, checklist qualité

### Sur tablette :
- layout hybride
- composer au centre
- assistant IA ou aperçu en panneau latéral

## 5. HIERARCHIE VISUELLE

Priorité visuelle :

1. type de contenu choisi
2. champ principal de création
3. actions média
4. aperçu
5. IA
6. publication
7. paramètres avancés

Le bouton "Publier" doit être visible, mais ne doit pas pousser à publier trop vite. MAATFEED doit encourager la qualité sans lourdeur.

## 6. POSITIONNEMENT DES ÉLÉMENTS

### Mobile :
- header fixed en haut
- zone de création au centre
- toolbar contextuelle en bas
- bouton publier en haut droite ou bas droite selon format
- IA accessible via bouton ambre discret
- brouillons visibles dans menu ou sheet

### Desktop :
- composer central
- aperçu à droite
- navigation types à gauche
- assistant IA à droite sous aperçu
- publication sticky en haut ou bas du panneau droit

## 7. DIMENSIONS & ESPACEMENTS

### Mobile :
- padding horizontal : 16 à 20 px
- header : 56 à 64 px
- toolbar basse : 56 à 72 px
- boutons principaux : 44 à 52 px
- cartes type de contenu : 92 à 128 px de hauteur
- espace entre blocs : 16 à 24 px
- zone texte minimum : 160 px

### Desktop :
- colonne gauche : 240 à 300 px
- composer central : 560 à 760 px
- panneau droit : 320 à 420 px
- gap colonnes : 20 à 28 px

## 8. COULEURS

Palette :

- fond principal : noir charbon profond
- surfaces : noir graphite
- surfaces élevées : noir chaud
- bordures : ambre très faible
- accent principal : ambre/or
- texte principal : blanc cassé
- texte secondaire : gris sable
- brouillon : ocre doux
- erreur : rouge brique discret
- succès : ambre/coche, pas vert SaaS agressif

La création doit rester nocturne, concentrée, luxueuse.

## 9. TYPOGRAPHIE

### Titres :
- mobile : 20 à 24 px
- desktop : 24 à 32 px

### Champs :
- texte principal : 16 à 18 px
- description : 14 à 16 px
- métadonnées : 12 à 13 px
- labels : 11 à 12 px

Le composer doit être agréable pour écrire longtemps.

## 10. BOUTONS

Boutons essentiels :

- fermer
- enregistrer brouillon
- aperçu
- publier
- ajouter média
- enregistrer audio
- importer
- IA
- ajouter source
- programmer
- options avancées

Hiérarchie :

- publier : accent ambre plein
- aperçu : contour ambre
- brouillon : surface sombre
- fermer : icône simple
- IA : bouton spécial mais discret

## 11. CARTES

Cartes principales :

- carte type de création
- carte média ajouté
- carte source
- carte brouillon
- carte preview
- carte IA suggestion
- carte checklist qualité

Les cartes doivent être arrondies, respirantes, sans effet dashboard.

## 12. ICONOGRAPHIE

Icônes nécessaires :

- plume
- micro
- vidéo
- débat
- série
- citation
- document
- image
- IA
- source
- brouillon
- publication
- verrou premium
- téléchargement/offline

Style :

- traits fins
- angles doux
- état actif ambre
- état inactif gris sable

## 13. COMPORTEMENT SCROLL

Le composer doit avoir un scroll interne fluide.
Règles :

- header reste visible
- barre d'action reste accessible
- bouton publier ne disparaît pas totalement
- champ actif reste au-dessus du clavier mobile
- retour à l'aperçu sans perdre la position

## 14. ANIMATIONS

Animations principales :

- ouverture création : sheet depuis le bas
- choix type : cartes qui montent en douceur
- changement type : transition horizontale calme
- ajout média : insertion avec fade/scale
- sauvegarde brouillon : micro confirmation
- publication : progression douce
- succès : écran de confirmation premium

Durées :

- micro : 120 à 180 ms
- changement écran : 240 à 320 ms
- publication : animation non bloquante

## 15. MICRO INTERACTIONS

Exemples :

- compteur de caractères qui devient ambre proche limite
- IA qui propose sans interrompre
- source ajoutée avec coche
- brouillon sauvegardé avec petite pulsation
- média uploadé avec anneau progressif
- erreur champ avec secousse très légère
- publication réussie avec carte de partage

## 16. GESTURES MOBILE

Gestures :

- swipe down pour fermer avec confirmation si contenu non sauvegardé
- swipe entre étapes
- long press média pour options
- drag pour réordonner médias
- tap toolbar pour ajouter
- maintenir micro pour enregistrement rapide

Gestures interdits :

- fermeture accidentelle d'un brouillon
- suppression média sans confirmation douce
- publication par geste involontaire

## 17. ÉTATS LOADING

Loading création :

- sauvegarde brouillon
- upload média
- génération IA
- prévisualisation
- publication

Chaque loading doit être localisé.
Jamais de spinner global plein écran sauf publication finale critique.

## 18. ÉTATS ERREUR

Erreurs possibles :

- upload échoué
- réseau coupé
- format non supporté
- texte trop court
- source manquante
- contenu modération
- publication impossible

UI erreur :

- message court
- action claire
- contenu conservé
- retry
- sauvegarde brouillon automatique

## 19. ÉTATS OFFLINE

Offline :

- création autorisée
- brouillon local
- audio/texte/image gardés localement
- publication mise en attente
- badge "sera publié quand la connexion revient"
- possibilité d'annuler la file d'attente

Le mode offline doit être un allié, pas une cage.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :
- flow étape par étape
- sheets
- toolbar contextuelle

### Tablet :
- composer + aperçu côte à côte

### Desktop :
- workspace complet
- IA visible
- sources visibles
- preview live

## 21. ACCESSIBILITÉ

Obligatoire :

- labels champs
- boutons 44 px minimum
- focus visible
- navigation clavier desktop
- alternatives aux gestures
- messages erreur textuels
- transcription audio/vidéo si disponible
- contraste fort

## 22. PERFORMANCE UX

Règles :

- sauvegarde locale fréquente mais légère
- upload chunké visuellement
- preview optimisée
- IA lazy
- médias compressés avant publication
- pas de blocage clavier
- pas de re-render lourd

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Priorités :

- texte et audio avant vidéo lourde
- brouillons locaux
- compression média
- reprise upload
- publication différée
- messages simples
- mode léger création
- pas d'obligation de charger les previews lourdes

## 24. RÈGLES NON NÉGOCIABLES

- Ne jamais perdre un brouillon
- Ne jamais fermer sans sauvegarde ou confirmation
- Ne jamais forcer un workflow desktop sur mobile
- Ne jamais transformer la création en formulaire administratif
- Ne jamais publier sans prévisualisation possible
- Ne jamais bloquer la création à cause d'une connexion faible
- L'IA doit aider, pas remplacer l'intention du créateur
- Le style doit rester MAATFEED : noir/or, culturel, premium, intelligent

---

*Vision globale du système de création pour MAATFEED*
