# 11. DÉCOUVERTE FAIBLE CONNEXION, LOADING, ERREUR ET OFFLINE

## 1. OBJECTIF UX

Garantir que Discovery reste utile même avec une connexion instable, lente, coûteuse ou absente.

## 2. ÉMOTION RECHERCHÉE

Sérénité.
L'utilisateur ne doit pas sentir que l'application l'abandonne dès que le réseau tremble.

## 3. STRUCTURE VISUELLE GLOBALE

Mode faible connexion :

- search bar
- historique
- contenus sauvegardés
- audios disponibles
- thèmes en cache
- résultats textuels
- bouton synchroniser
- indicateur réseau discret

## 4. LAYOUT EXACT

### Mobile :

- bandeau discret sous search bar
- section "Disponible maintenant"
- section "À synchroniser plus tard"

### Desktop :

- badge réseau dans header
- panneau droit historique/cache
- centre limité aux résultats disponibles

## 5. HIERARCHIE VISUELLE

Priorité offline/faible connexion :

1. ce qui est accessible
2. ce qui peut être repris
3. ce qui peut être synchronisé
4. ce qui est indisponible

Ne pas commencer par l'échec.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Indicateur réseau :

- sous search bar ou dans header
- jamais modal bloquante

Bouton mode léger :

- proche des filtres
- visible sans être alarmiste

## 7. DIMENSIONS & ESPACEMENTS

### Bandeau réseau :

- hauteur : 36 à 44 px
- radius : 16 à 20 px
- padding : 10 à 14 px
- texte : 12 à 13 px

### Cartes offline :

- similaires aux cartes standards
- badge "disponible offline"

## 8. COULEURS

### Offline :

- fond brun sombre
- texte beige
- accent ambre doux
- pas de rouge sauf erreur critique

### Loading :

- skeleton graphite
- shimmer faible

### Erreur :

- cuivre/ocre
- pas de panique visuelle

## 9. TYPOGRAPHIE

Messages courts :

- "Connexion instable"
- "Mode léger activé"
- "Résultats locaux"
- "Synchronisation en attente"

Taille : 12 à 14 px

## 10. BOUTONS

Actions :

- réessayer
- mode léger
- voir sauvegardés
- synchroniser
- télécharger pour plus tard
- ouvrir sans images

## 11. CARTES

Cartes faible connexion :

- texte prioritaire
- image optionnelle
- placeholder élégant
- badge offline
- action claire

## 12. ICONOGRAPHIE

- nuage barré
- téléchargement
- synchronisation
- éclair doux
- onde faible
- sauvegarde
- mode léger

## 13. COMPORTEMENT SCROLL

Aucun saut au changement réseau.

Les contenus déjà affichés restent visibles.

Les nouveaux résultats se chargent progressivement.

## 14. ANIMATIONS

- changement réseau : transition douce
- skeleton non agressif
- synchro : rotation discrète
- retour réseau : confirmation courte

## 15. MICRO INTERACTIONS

- tap mode léger : état actif
- tap synchroniser : progression
- téléchargement : badge rempli
- erreur image : placeholder immédiat

## 16. GESTURES MOBILE

- pull-to-refresh
- long press sauvegarder offline
- swipe section cache
- tap badge réseau pour détails

## 17. ÉTATS LOADING

Trois niveaux :

- initial
- partiel
- silencieux

### Initial :

- skeleton complet court

### Partiel :

- sections disponibles affichées, autres skeleton

### Silencieux :

- petits indicateurs dans cartes, sans bloquer

## 18. ÉTATS ERREUR

Erreur doit proposer une action :

- réessayer
- mode léger
- sauvegardés
- historique

Ne jamais afficher "Erreur" seul.

## 19. ÉTATS OFFLINE

Offline complet :

- search locale
- historique
- téléchargés
- sauvegardés
- brouillons
- message "Tu es hors ligne" discret

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :

- bandeau compact

### Tablet :

- panneau offline repliable

### Desktop :

- état réseau dans header + panneau cache

## 21. ACCESSIBILITÉ

- états réseau annoncés
- pas d'animation obligatoire
- messages lisibles
- boutons explicites
- contrastes suffisants

## 22. PERFORMANCE UX

- cache prioritaire
- images lazy
- résultats texte
- éviter requêtes répétées
- fallback immédiat
- préserver état

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

C'est le cœur du système :

- ne jamais supposer 4G stable
- réduire médias
- proposer audio basse qualité
- garder navigation active
- éviter rechargements complets
- autoriser reprise

## 24. RÈGLES NON NÉGOCIABLES

- Offline n'est pas un écran mort
- Le mode léger doit être visible
- Le texte doit charger avant les médias
- Les erreurs doivent être utiles
- L'utilisateur doit toujours pouvoir continuer quelque chose

---

*Découverte faible connexion, loading, erreur et offline pour MAATFEED*
