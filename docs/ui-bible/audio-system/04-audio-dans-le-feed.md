# 4. AUDIO DANS LE FEED

## 1. OBJECTIF UX

Les audios dans le feed doivent rendre l'écoute aussi naturelle que la lecture d'un post ou le visionnage d'une vidéo courte.

Le feed doit proposer :

- extraits audio
- réponses audio
- séries audio
- débats audio
- capsules de créateurs
- résumés IA
- contenus sponsorisés audio

## 2. ÉMOTION RECHERCHÉE

L'utilisateur doit ressentir :

- envie de lancer
- confiance dans la durée
- clarté du sujet
- curiosité
- faible effort cognitif

Une bonne carte audio doit dire : "Tu peux écouter ça maintenant, même en marchant."

## 3. STRUCTURE VISUELLE GLOBALE

Carte audio feed :

- badge audio
- titre fort
- créateur/source
- contexte
- waveform compact
- durée
- bouton play
- actions sociales
- option sauvegarde/téléchargement

## 4. LAYOUT EXACT

### Deux formats :

#### Compact :
- utilisé dans feed dense
- bouton play à gauche
- titre à droite
- waveform sous titre

#### Immersif :
- grande carte
- artwork/symbole
- titre large
- waveform centrale
- bouton play dominant

## 5. HIERARCHIE VISUELLE

Priorité :

1. sujet
2. play
3. durée
4. source
5. preuve sociale

Le titre doit expliquer le bénéfice d'écoute.

## 6. POSITIONNEMENT DES ÉLÉMENTS

- badge en haut gauche
- durée en haut droite
- titre au-dessus de waveform
- bouton play proche waveform
- actions sociales en bas
- téléchargement dans menu ou bouton discret

## 7. DIMENSIONS & ESPACEMENTS

### Compact :
- hauteur : 112 à 150 px
- padding : 14 à 16 px
- bouton play : 44 px
- waveform : 32 à 44 px

### Immersif :
- hauteur : 220 à 320 px
- padding : 18 à 22 px
- waveform : 60 à 80 px
- bouton play : 56 px

## 8. COULEURS

- fond : surface charbon
- accent audio : ambre
- badge : ambre faible opacité
- waveform : gris/ambre
- texte : blanc cassé
- durée : gris sable

## 9. TYPOGRAPHIE

- badge : 11 px
- titre compact : 15 à 17 px
- titre immersif : 20 à 24 px
- source : 12 à 13 px
- description : 13 à 14 px

## 10. BOUTONS

- play/pause
- sauvegarder
- télécharger
- ouvrir
- partager
- plus

Le play doit être disponible sans ouvrir le détail.

## 11. CARTES

Les cartes audio doivent avoir une matière visuelle distincte :

- texture subtile
- gradient très doux
- onde décorative faible
- pas de photo humaine obligatoire

## 12. ICONOGRAPHIE

- casque
- onde
- micro
- série
- débat
- IA
- téléchargement

Chaque type d'audio doit avoir son micro-langage visuel.

## 13. COMPORTEMENT SCROLL

Quand une carte audio active sort de l'écran :

- mini-player prend le relais
- carte garde état actif si elle réapparaît
- pas de relance au retour

## 14. ANIMATIONS

- waveform active au lancement
- bouton play transforme en pause
- carte active gagne une bordure ambre subtile
- mini-player apparaît

## 15. MICRO INTERACTIONS

- tap waveform : ouvrir full-player
- tap durée : afficher progression
- long press : sauvegarder/télécharger
- like : réaction douce
- partage : sheet native

## 16. GESTURES MOBILE

- swipe carte : options rapides
- long press : preview actions
- tap play : lecture directe
- tap titre : détail

## 17. ÉTATS LOADING

- skeleton waveform
- bouton loading
- titre/source affichés
- durée approximative si connue

## 18. ÉTATS ERREUR

- carte reste visible
- bouton réessayer
- message court
- pas de suppression automatique

## 19. ÉTATS OFFLINE

- audio téléchargé : badge disponible
- non téléchargé : état grisé
- suggestion : "Télécharger quand réseau revient"

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :
- carte pleine largeur

### Tablet :
- deux colonnes possibles avec cartes compactes

### Desktop :
- cartes plus horizontales
- preview queue au hover
- actions visibles au hover

## 21. ACCESSIBILITÉ

- play accessible
- durée lisible
- texte alternatif pour artwork
- labels actions
- focus visible

## 22. PERFORMANCE UX

- lazy load
- pas d'audio préchargé pour toutes les cartes
- waveform légère
- thumbnails compressées
- limiter animations simultanées

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- afficher durée et titre avant média
- bouton téléchargement visible
- waveform statique si nécessaire
- lancement audio prioritaire sur image
- pas de blocage feed

## 24. RÈGLES NON NÉGOCIABLES

- Une carte audio doit être compréhensible sans lancer l'audio
- Le play doit être immédiat
- Le mini-player doit apparaître dès lancement
- Aucun autoplay sonore sauvage
- L'audio ne doit jamais casser le scroll

---

*Audio dans le feed pour MAATFEED*
