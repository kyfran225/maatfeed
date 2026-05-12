# 11. ÉTATS LOADING, ERREUR, VIDE, OFFLINE ET FAIBLE CONNEXION

## 1. OBJECTIF UX

Garantir que le système Notifications/InBox reste utilisable même quand les données ne sont pas encore chargées, partiellement indisponibles ou hors ligne.

## 2. ÉMOTION RECHERCHÉE

Stabilité.

Même avec une connexion capricieuse, l'utilisateur doit sentir que l'application garde son sang-froid.

## 3. STRUCTURE VISUELLE GLOBALE

États :

- loading initial
- loading partiel
- erreur partielle
- erreur globale
- vide
- offline
- faible connexion
- synchronisation en attente

## 4. LAYOUT EXACT

### Loading :

- conserver header
- afficher skeletons
- garder onglets

### Erreur :

- garder structure
- message au centre de la liste
- actions

### Vide :

- illustration symbolique sobre
- message éditorial
- suggestions

### Offline :

- bandeau discret
- liste cache
- actions en attente

## 5. HIERARCHIE VISUELLE

Toujours afficher :

- structure
- état
- action possible
- contenu disponible

Ne jamais afficher écran noir vide.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Bandeau réseau sous header.

Message vide au centre visible de la liste.

Actions sous message.

## 7. DIMENSIONS & ESPACEMENTS

### Bandeau :

- hauteur : 36 à 44 px
- radius : 16 à 20 px
- padding : 10 à 14 px
- texte : 12 à 13 px

### État vide :

- icône : 56 à 72 px
- titre : 18 à 22 px
- texte : 13 à 15 px

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
- ouvrir sans images

## 11. CARTES

Skeletons doivent reprendre la forme réelle des notifications.

Offline cards avec badge "local".

## 12. ICONOGRAPHIE

- cloche calme
- nuage offline
- synchronisation
- lune
- boîte vide
- bouclier

## 13. COMPORTEMENT SCROLL

Pas de saut entre skeleton et contenu.

Les éléments cache restent en place quand réseau revient.

## 14. ANIMATIONS

- skeleton shimmer doux
- retour réseau fade
- synchronisation discrète
- aucune animation d'erreur dramatique

## 15. MICRO INTERACTIONS

- bouton réessayer feedback
- mode léger actif
- synchronisation en file
- undo action offline

## 16. GESTURES MOBILE

- pull-to-refresh
- tap bandeau réseau pour détails
- long press action en attente

## 17. ÉTATS LOADING

Trois niveaux :

- initial
- section
- action

### Action loading :

uniquement sur bouton concerné
ne pas bloquer la page

## 18. ÉTATS ERREUR

Erreur globale rare.

Erreur partielle dans section uniquement.

Erreur action toast sobre + retry.

## 19. ÉTATS OFFLINE

Offline complet :

- notifications cache
- actions locales
- synchronisation différée
- pas d'image obligatoire

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :

- bandeau compact

### Tablet :

- panneau offline repliable

### Desktop :

- état réseau dans header + panneau cache

## 21. ACCESSIBILITÉ

- états réseau annoncés
- bouton retry accessible
- pas d'information uniquement par couleur
- skeleton non lu comme contenu réel par lecteur d'écran

## 22. PERFORMANCE UX

- cache-first
- pagination
- skeleton léger
- pas de médias
- debounce refresh

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- texte d'abord
- ne pas vider l'écran
- synchroniser quand possible
- réduire données
- éviter reload complet

## 24. RÈGLES NON NÉGOCIABLES

- Aucun écran mort
- Aucun spinner solitaire
- Aucune perte d'actions offline
- Les erreurs doivent aider
- Le cache est essentiel
- Le mode faible connexion est natif

---

*États loading, erreur, vide, offline et faible connexion pour MAATFEED*
