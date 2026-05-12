# 6. AUDIO SPONSORISÉ

## 1. OBJECTIF UX

Permettre une monétisation audio respectueuse, notamment via courts messages sponsorisés, séries audio sponsorisées ou recommandations audio sponsorisées, sans casser l'expérience d'écoute.

## 2. ÉMOTION RECHERCHÉE

Continuité.
L'utilisateur doit comprendre qu'un audio est sponsorisé sans avoir l'impression que son écoute est prise en otage.

## 3. STRUCTURE VISUELLE GLOBALE

Formats possibles :

- épisode audio sponsorisé
- courte mention sponsorisée avant audio
- playlist sponsorisée
- série audio soutenue par un partenaire
- recommandation audio sponsorisée

Éléments :

- label sponsorisé
- durée du sponsor si pre-roll
- option passer si politique prévue
- transparence
- retour à l'audio principal

## 4. LAYOUT EXACT

### Dans le player :

- label discret sous le titre
- sponsor indiqué avant lecture
- progression séparée si message sponsor
- retour automatique à l'audio principal
- aucune confusion avec l'audio principal

### Dans le feed :

- carte audio sponsorisée avec label

## 5. HIERARCHIE VISUELLE

1. audio principal
2. statut sponsorisé
3. sponsor
4. durée
5. contrôle utilisateur

Le sponsor ne doit pas visuellement remplacer le contenu.

## 6. POSITIONNEMENT DES ÉLÉMENTS

### Label :

- proche du titre audio
- dans mini-player si sponsor actif
- dans full player sous la métadonnée principale

## 7. DIMENSIONS & ESPACEMENTS

### Mini-player :

- badge sponsorisé : 20 à 24 px haut
- texte court

### Full player :

- bloc sponsor : 64 à 96 px
- progression sponsor distincte

## 8. COULEURS

### Audio sponsorisé :

- accent cuivre
- label beige
- progression sponsor légèrement différente mais dans palette
- pas de couleur publicitaire criarde

## 9. TYPOGRAPHIE

- label : 11 à 12 px
- sponsor : 12 à 14 px
- audio principal : hiérarchie normale

## 10. BOUTONS

Actions :

- écouter
- passer si autorisé
- en savoir plus
- masquer sponsors similaires si applicable
- signaler

Si "passer" existe, il doit être clair.
Si non, la durée doit être courte et annoncée.

## 11. CARTES

Carte audio sponsorisée :

- play
- titre
- sponsor
- durée
- label
- action

## 12. ICONOGRAPHIE

- onde audio
- label sponsor
- information
- skip si applicable
- casque

## 13. COMPORTEMENT SCROLL

Audio sponsorisé ne doit pas bloquer le scroll.
Le mini-player continue normalement.

## 14. ANIMATIONS

- transition sponsor vers audio principal fluide
- progression distincte
- pas de jingles visuels agressifs

## 15. MICRO INTERACTIONS

- tap label sponsor
- tap skip si disponible
- tap sponsor info
- retour automatique au contenu

## 16. GESTURES MOBILE

- tap player
- swipe mini-player vers full
- aucun geste accidentel qui relance sponsor

## 17. ÉTATS LOADING

Sponsor ne doit pas retarder l'audio principal trop longtemps.
Si sponsor ne charge pas, lancer audio principal selon règle produit.

## 18. ÉTATS ERREUR

Erreur sponsor :

- silencieuse ou ignorée
- ne pas bloquer audio principal

Erreur audio principal :

- message classique audio

## 19. ÉTATS OFFLINE

Pas de sponsor audio en offline sauf contenu sponsorisé préchargé et clairement indiqué.
Audio téléchargé ne doit pas dépendre d'un sponsor non disponible.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :

- mini-player prioritaire

### Tablet :

- player plus riche

### Desktop :

- player sticky avec label

## 21. ACCESSIBILITÉ

- sponsor annoncé
- durée annoncée
- contrôle skip accessible
- pas de son sponsor autoplay si audio non lancé

## 22. PERFORMANCE UX

- sponsor léger
- pas de blocage
- pas de média lourd
- cache contrôlé
- audio principal protégé

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- éviter sponsor lourd
- priorité à l'audio principal
- sponsor textuel ou court
- pas de double chargement coûteux

## 24. RÈGLES NON NÉGOCIABLES

- Sponsor audio toujours identifié
- Ne jamais casser la lecture
- Ne jamais bloquer audio téléchargé
- Durée claire
- Pas d'autoplay sponsor hors action utilisateur
- Priorité au contenu principal

---

*Audio sponsorisé pour MAATFEED*
