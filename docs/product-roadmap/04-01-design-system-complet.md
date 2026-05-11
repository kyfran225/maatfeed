# MAATFEED — DESIGN SYSTEM COMPLET

## Architecture visuelle, comportementale et émotionnelle de la plateforme

### Philosophie du Design System

Le Design System MAATFEED ne doit pas être pensé comme :
- un simple guide UI
- une bibliothèque de composants
- un thème noir et or

Le système doit devenir : **une grammaire visuelle complète du savoir africain moderne.**

MAATFEED doit transmettre :
- profondeur
- modernité
- mystère
- élégance
- intelligence
- culture
- débat
- spiritualité
- technologie

Le produit doit donner la sensation : **d'une plateforme premium culturelle du futur.**

## Principes UX Fondamentaux

### 1. Immersion Rapide
Le contenu doit apparaître immédiatement.

### 2. Clarté
Même avec richesse fonctionnelle :
- navigation simple
- lecture fluide
- hiérarchie forte

### 3. Densité Contrôlée
MAATFEED contient beaucoup d'informations.

Le système doit éviter :
- surcharge
- chaos
- fatigue visuelle

### 4. Émotion
Chaque interaction doit produire :
- élégance
- fluidité
- prestige
- satisfaction

### 5. Identité Africaine Moderne
Pas folklore. Pas caricature.

Mais :
- sophistication
- symbolisme subtil
- textures légères
- inspiration Kemet contemporaine

## Couleurs Principales

### Background Principal
**Noir profond**
```css
--black-900: #050505
```

**Utilisation :**
- arrière-plan principal
- immersion
- contraste premium

### Surface Principale
**Noir charbon**
```css
--black-800: #0D0D0D
```

**Pour :**
- cards
- panels
- modales

### Surface Élevée
**Noir premium**
```css
--black-700: #141414
```

**Pour :**
- hover
- états actifs
- éléments focus

## Couleurs Identitaires

### Or MAATFEED
**Or principal**
```css
--gold-500: #D4A64A
```

**Usage :**
- CTA principaux
- progression
- badges
- premium
- highlights

**Or lumineux**
```css
--gold-400: #F3C76B
```

**Usage :**
- hover
- glow
- interactions premium

**Or sombre**
```css
--gold-600: #8A6424
```

**Usage :**
- bordures
- accents subtils

### Couleurs IA
**Bleu IA**
```css
--ai-primary: #5E8BFF
```

**Usage :**
- IA
- résumés
- coach
- suggestions

### Couleurs Débat
**Orange débat actif**
```css
--debate-active: #FF8A3D
```

**Usage :**
- débats chauds
- controverses
- activité forte

### Couleurs Succès
**Vert validation**
```css
--success: #31D07F
```

### Couleurs Alertes
**Rouge modération**
```css
--error: #FF4A57
```

## Typographie

### Titres Principaux
**Police :** moderne, forte, premium

**Style :**
- semi-bold
- tracking léger
- lisibilité mobile

### Hooks du Feed
Très importants.

Doivent être :
- émotionnels
- lisibles instantanément
- puissants

**Taille :** 18 à 24px mobile

### Texte Débat
**Priorité :**
- lisibilité
- confort lecture

### Textes IA
**Différence subtile :**
- légère teinte bleue
- italique légère possible

## Grille & Espacement

### Système 8PT
Tout doit suivre :
- 4
- 8
- 16
- 24
- 32
- 48

### Rayons
**Cards :** 20px
**Modales :** 28px
**Boutons :** 16px

## Ombres
**Ombres très subtiles**

Pas style Material agressif.

MAATFEED doit sembler :
- dense
- premium
- cinématique

## Iconographie

**Style :**
- minimal
- moderne
- léger
- cohérent

### Icones Importantes

#### Débat
Flamme / Agora / Bulles.

#### Audio
Onde sonore élégante.

#### IA
Symbole abstrait intelligent.

#### Premium
Couronne subtile.

#### Série
Pile/chapitres.

## Composants Principaux

### 1. FEED CARD

#### Structure
- **Média**
  - vidéo
  - audio
  - image
- **Overlay gradient**
  - Bas vers haut.
- **Hook**
  - Très visible.
- **Meta**
  - auteur
  - vues
  - débat actif
- **Actions**
  - aimer
  - débattre
  - partager
  - sauvegarder

#### États
- Normal
- Hover
- Active
- Sponsorisé
- Débat chaud
- Premium

### 2. DEBATE CARD

#### Contient
- sujet
- activité
- réponses
- émotion
- tendance

#### États
**chaud**
- Glow orange léger.

**IA active**
- Accent bleu.

### 3. AUDIO PLAYER

#### Mini Player
Toujours accessible.

#### Full Player
**Contient :**
- artwork
- transcription
- vitesse
- timer
- playlist
- résumé IA

#### Animations
**waveform animée**
- Très important.

### 4. IA CARD

Différence visuelle légère.

Ne pas transformer l'app en chatbot.

#### Contient
- personnalité IA
- résumé
- suggestion
- aide

#### Style
- glow bleu subtil
- bordure discrète

### 5. SPONSOR CARD

Doit être :
- élégante
- native
- non agressive

#### Structure
- sponsor
- contenu lié
- CTA discret

### 6. PROFILE BLOCK

#### Contient
- avatar
- badges
- activité
- débats
- favoris

### 7. BOTTOM SHEET

Très importante mobile.

#### Usage
- partage
- upload
- options
- IA
- playlist

#### Animation
Doit être :
- fluide
- lourde
- premium

### 8. NOTIFICATIONS

#### Types
- débat
- réponse
- IA
- live
- sponsor
- série

#### États
**non lue**
- Accent or.

**importante**
- Accent orange.

### 9. BADGES

#### Types
- Historien
- Analyste
- Créateur
- Sage
- Premium
- Supporter

#### Style
Très premium.
Pas enfantin.

### 10. MODALES

Très importantes.

#### Types
- partage
- upload
- IA assist
- signalement
- playlist
- premium

## Comportements UX

### SCROLL

#### Feed
Ultra fluide.
Momentum fort
Type TikTok premium.

### TRANSITIONS

Doivent être :
- lentes juste assez
- élégantes
- organiques

#### Durées
**Rapides**
- 150ms

**Normales**
- 250ms

**Premium**
- 350ms

### HAPTIC FEEDBACK

#### Mobile
- likes
- publication
- notifications
- débat

### MICRO-INTERACTIONS

#### Like
Explosion légère.

#### Save
Glow discret.

#### Débat
Pulse orange.

#### IA
Wave bleu léger.

## États Système

### LOADING

**Skeleton premium**
Pas spinner vide.

### OFFLINE

Important Afrique.

Le système doit :
- informer clairement
- proposer reprise
- cacher brutalité technique

### ERREURS

Jamais agressives.

Toujours :
- élégantes
- humaines
- rassurantes

## Responsive System

### MOBILE
Priorité absolue.

### TABLETTE
Deux colonnes possibles.

### DESKTOP
Expérience premium.

#### Layout
- sidebar
- feed central
- débat latéral
- mini player fixe

## Accessibilité

**Important**
- contraste fort
- taille texte
- sous-titres
- audio captions
- navigation claire

## Design Émotionnel

MAATFEED doit produire :

### Curiosité
via hooks.

### Prestige
via finition.

### Immersion
via audio/vidéo.

### Intelligence
via IA et débats.

### Appartenance
via communauté.

## La Signature Visuelle MAATFEED

Le produit doit donner la sensation : **d'un sanctuaire numérique moderne du savoir africain vivant.**

Pas :
- un réseau social cheap
- une app crypto bizarre
- un forum ancien
- une plateforme éducative froide

Mais :
- moderne
- cinématique
- élégante
- culturelle
- immersive
- intelligente
- émotionnelle
- premium

## Objectif Final du Design System

Créer une plateforme où :
- chaque interaction semble précieuse
- chaque contenu semble vivant
- chaque débat semble important
- chaque utilisateur se sent impliqué

Et où :
**le savoir africain devient une expérience numérique premium mondiale.**
