# 11. CARD SYSTEM

## 1. OBJECTIF UX

Définir les cartes comme unité centrale de découverte, débat, audio, profil, sponsor, série et sauvegarde.

## 2. ÉMOTION RECHERCHÉE

Chaque carte doit sembler précieuse, consultable, vivante. Elle doit inviter à ouvrir, écouter, répondre ou sauvegarder.

## 3. STRUCTURE VISUELLE GLOBALE

Types : carte feed vidéo, carte audio, carte débat, carte article/document, carte série, carte profil, carte sponsor, carte premium, carte notification, carte message.

## 4. LAYOUT EXACT

### Carte feed standard
- Avatar + créateur + titre + média + actions + métadonnées

### Carte audio
- Vignette ou icône + titre + waveform/progression + durée + actions

### Carte débat
- Question + auteur/modérateur + stats + extrait de réponses

### Carte série
- Couverture + titre + épisode/progression

### Carte sponsor
- Visuel + label sponsor + CTA discret

## 5. HIERARCHIE VISUELLE

Titre/média en priorité. Créateur ensuite. Stats ensuite. Actions lisibles mais pas envahissantes.

## 6. POSITIONNEMENT DES ÉLÉMENTS

- Avatar en haut gauche
- Menu options en haut droite
- Média sous le titre
- Actions sous média
- CTA en bas si carte orientée conversion

## 7. DIMENSIONS & ESPACEMENTS

- **Padding carte** : 12 à 16 px
- **Radius** : 16 à 22 px
- **Image feed** : ratio selon média, souvent 16:9 ou vertical selon source
- **Audio compact** : hauteur 76 à 96 px
- **Débat compact** : 120 à 180 px selon extrait

## 8. COULEURS

- Surface noire élevée
- Bordure graphite
- Accent or pour actif, audio, premium, sponsor
- Texte blanc chaud

## 9. TYPOGRAPHIE

- **Titre carte** : 15 à 20 px selon importance
- **Métadonnées** : 12 px
- **Stats** : 12 à 13 px medium
- **Extraits débat** : 14 px avec line-height confortable

## 10. BOUTONS

Actions compactes sous carte : icônes + chiffres. CTA dans carte : doré, pleine largeur ou compact selon contexte.

## 11. CARTES

Les cartes ne doivent jamais être uniformes au point de confondre les types. Chaque type a un signe distinct :
- waveform pour audio
- bulle/thread pour débat
- couverture pour série
- badge pour sponsor

## 12. ICONOGRAPHIE

- Icône play sur média centrée ou coin bas selon contexte
- Icône débat, audio, document visibles sur cartes mixtes

## 13. COMPORTEMENT SCROLL

Les cartes feed s'empilent. Les médias peuvent lazy-load. Les actions restent visibles après média. Les cartes ne doivent pas changer de hauteur après chargement.

## 14. ANIMATIONS

Apparition : fade/slide léger. Tap : press. Ouverture : transition vers détail quand possible.

## 15. MICRO INTERACTIONS

- Like/save : remplissage icône
- Audio : waveform animée
- Débat : bouton répondre s'illumine au focus

## 16. GESTURES MOBILE

- Tap carte ouvre détail
- Tap média joue
- Long press ouvre menu
- Swipe limité pour sauvegarder/masquer si explicitement prévu

## 17. ÉTATS LOADING

Skeleton carte complet : avatar, lignes titre, bloc média, actions. Pour audio : skeleton waveform.

## 18. ÉTATS ERREUR

Si média indisponible, garder la carte avec poster fallback, message court et action "ouvrir" ou "réessayer".

## 19. ÉTATS OFFLINE

- Carte consultée cache : visible
- Média non disponible : afficher état "à télécharger" ou "connexion requise"
- Texte et débat restent accessibles

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

- Mobile : cartes pleine largeur
- Tablet : cartes larges ou grille 2 colonnes selon page
- Desktop feed : colonne centrale, cartes jamais trop larges

## 21. ACCESSIBILITÉ

Chaque carte doit avoir un titre accessible. Actions séparées et focusables. Média avec description ou titre.

## 22. PERFORMANCE UX

Lazy-load médias. Réserver les ratios. Ne pas charger toutes les vidéos. Préférer poster + play.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Cartes doivent d'abord afficher texte + miniature basse résolution. Audio peut être proposé avant vidéo lourde.

## 24. RÈGLES NON NÉGOCIABLES

- Pas de carte blanche
- Pas de carte sans hiérarchie
- Pas de sponsor qui ressemble à une pub criarde
- Pas de carte média qui masque débat/audio

---

*Système de cartes pour le contenu MAATFEED*
