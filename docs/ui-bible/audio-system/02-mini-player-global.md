# 2. MINI-PLAYER GLOBAL

## 1. OBJECTIF UX

Le mini-player global sert de fil d'Ariane sonore.

Il permet à l'utilisateur de :

- voir ce qui joue
- mettre pause rapidement
- reprendre l'écoute
- ouvrir le full-player
- rester dans son feed ou débat sans perdre l'audio

Il doit être visible seulement lorsqu'un audio est actif, en pause récente, ou prêt à reprendre.

## 2. ÉMOTION RECHERCHÉE

Le mini-player doit sembler précieux, compact, intelligent.

Il doit donner l'impression d'un petit objet premium posé sur l'interface : dense, utile, calme.

## 3. STRUCTURE VISUELLE GLOBALE

Composition :

- capsule flottante
- miniature ou symbole audio
- titre sur une ligne
- source sur une ligne secondaire
- mini waveform ou barre de progression
- bouton play/pause
- bouton close optionnel
- indicateur de contexte

## 4. LAYOUT EXACT

### Mobile :
- position : fixed bottom
- au-dessus de la bottom nav
- largeur : calculée avec marges latérales
- hauteur : 68 px environ
- forme : capsule arrondie
- contenu horizontal

Ordre gauche vers droite :

- miniature carrée arrondie
- bloc titre/source/progression
- bouton play/pause
- chevron ou poignée subtile

## 5. HIERARCHIE VISUELLE

Priorité :

1. bouton play/pause
2. titre
3. progression
4. source
5. contexte

Le mini-player ne doit pas voler l'attention au feed, mais il doit rester immédiatement utilisable.

## 6. POSITIONNEMENT DES ÉLÉMENTS

- miniature : gauche, 10 à 12 px du bord
- texte : centre, largeur flexible
- bouton play : droite, marge 10 à 12 px
- barre progression : bas du bloc texte
- poignée d'ouverture : optionnelle, au-dessus ou à droite

## 7. DIMENSIONS & ESPACEMENTS

- hauteur : 64 à 76 px
- radius : 20 à 24 px
- marge gauche/droite : 12 px mobile
- marge bas : hauteur bottom nav + safe area + 8 px
- miniature : 44 à 50 px
- bouton play : 38 à 44 px
- padding interne : 8 à 12 px
- gap : 10 à 12 px

## 8. COULEURS

- fond : noir charbon translucide
- bordure : ambre à très faible opacité
- titre : blanc cassé
- source : gris sable
- progression active : ambre
- progression inactive : gris sombre
- bouton play : ambre ou surface sombre avec icône ambre

Effet : léger blur si supporté, fallback opaque pour faible performance.

## 9. TYPOGRAPHIE

- titre : 13 à 14 px, semi-bold
- source : 11 à 12 px
- durée : 10 à 11 px
- ellipsis obligatoire après une ligne

## 10. BOUTONS

### Boutons visibles :
- play/pause
- ouvrir full-player par tap sur capsule

### Boutons cachés ou contextuels :
- fermer
- suivant
- queue

Sur mobile, éviter trop de boutons. Le mini-player n'est pas une télécommande complète.

## 11. CARTES

Le mini-player est une carte flottante permanente.

Règles carte :

- shadow douce
- pas de bordure lumineuse épaisse
- pas d'effet néon
- pas d'opacité excessive qui gêne la lecture
- fond suffisamment contrasté

## 12. ICONOGRAPHIE

- play/pause central
- waveform mini ou icône onde
- chevron haut discret
- casque ou micro selon type audio

L'icône doit indiquer la nature :

- micro : réponse audio
- casque : écoute
- onde : contenu audio
- débat : audio lié à un débat

## 13. COMPORTEMENT SCROLL

Au scroll :

- mini-player reste fixed
- il peut se réduire légèrement si le feed est en scroll rapide
- il revient à sa taille normale quand le scroll ralentit
- il ne doit jamais rebondir

## 14. ANIMATIONS

- apparition : slide-up + fade
- disparition : slide-down + fade
- changement piste : titre glisse doucement
- play/pause : bouton pulse léger
- progression : animation fluide, pas de saut visuel

## 15. MICRO INTERACTIONS

- tap sur titre : ouvre full-player
- tap play : feedback immédiat
- long press : options rapides
- changement de piste : micro glow ambre
- audio terminé : passage doux à suivant ou état terminé

## 16. GESTURES MOBILE

- swipe up : full-player
- swipe down léger : minimiser si full-player ouvert
- swipe horizontal court : piste suivante/précédente seulement si clairement indiqué
- long press : menu compact

## 17. ÉTATS LOADING

- miniature skeleton
- titre déjà affiché si connu
- bouton play remplacé par spinner
- progression en shimmer très discret

## 18. ÉTATS ERREUR

Afficher :

- "Lecture impossible"
- "Réessayer"
- bouton passer si queue disponible

Ne pas afficher de gros bloc rouge.

## 19. ÉTATS OFFLINE

Si audio téléchargé :

- badge "hors ligne"
- lecture normale

Si non disponible :

- bouton désactivé
- texte "Disponible en ligne"
- option télécharger plus tard grisée

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :
- capsule flottante

### Tablet :
- capsule plus large
- bouton queue possible

### Desktop :
- barre sticky bottom ou widget latéral
- boutons précédent/suivant visibles
- durée affichée

## 21. ACCESSIBILITÉ

- bouton play labellisé
- titre accessible
- état lecture annoncé
- focus clavier desktop
- contraste suffisant
- taille tactile minimum

## 22. PERFORMANCE UX

- mini-player indépendant du rendu feed
- progression optimisée
- pas de recalcul layout chaque seconde
- artwork compressé

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- pas de grosse image obligatoire
- fallback icône audio
- progression locale
- reprise après micro-coupure
- message discret

## 24. RÈGLES NON NÉGOCIABLES

- Toujours au-dessus de la bottom nav
- Jamais plus haut que nécessaire
- Jamais de texte sur deux lignes pour le titre
- Jamais de bouton trop petit
- Jamais de disparition brutale pendant lecture
- Toujours ouvrir le full-player par tap sur la capsule

---

*Mini-player global pour MAATFEED*
