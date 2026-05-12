# 2. NOTIFICATIONS GLOBALES

## 1. OBJECTIF UX

Informer l'utilisateur de toutes les activités importantes de son compte, de ses contenus, de ses débats, de ses suivis et de son expérience MAATFEED.

La notification globale sert de porte d'entrée rapide vers les événements qui comptent.

## 2. ÉMOTION RECHERCHÉE

L'utilisateur doit sentir que MAATFEED veille sur son parcours sans le harceler.

L'émotion recherchée est une vigilance douce, une petite lampe sur le chemin, pas une alarme de marché.

## 3. STRUCTURE VISUELLE GLOBALE

Les notifications globales se présentent sous forme de liste groupée :

- aujourd'hui
- hier
- cette semaine
- plus ancien

Chaque groupe peut contenir :

- notifications directes
- notifications suivies
- notifications système
- notifications de recommandation
- notifications sécurité

## 4. LAYOUT EXACT

### Mobile :

- titre "Notifications"
- compteur non-lu
- onglets
- liste groupée par date
- bouton préférences en haut droit
- bouton marquer tout comme lu dans menu

### Desktop :

- titre + résumé
- liste centrale
- panneau droit "Résumé de ton activité"

## 5. HIERARCHIE VISUELLE

Dans la liste globale :

1. alertes sécurité
2. réponses directes
3. mentions
4. débats suivis
5. créateurs suivis
6. séries
7. audios
8. recommandations
9. infos système

## 6. POSITIONNEMENT DES ÉLÉMENTS

Le compteur non-lu doit être proche du titre.

Les filtres doivent être sous le titre.

Les notifications critiques doivent apparaître en haut, même si légèrement plus anciennes, avec mention claire de leur date.

## 7. DIMENSIONS & ESPACEMENTS

- section date : marge haute 24 px
- label date : 12 à 13 px
- carte : 76 à 112 px
- gap : 10 px
- padding carte : 14 à 16 px
- avatar/icône : 40 à 46 px
- badge non-lu : 8 à 10 px

## 8. COULEURS

### Non-lu :

- liseré gauche ambre
- fond légèrement éclairé
- point discret

### Lu :

- fond mat
- texte secondaire plus doux

### Critique :

- ocre/cuivre
- icône bouclier
- pas de rouge agressif sauf danger réel

## 9. TYPOGRAPHIE

### Titre carte :

- 14 à 16 px
- semi-bold

### Description :

- 13 à 14 px
- deux lignes maximum

### Temps :

- 11 à 12 px

## 10. BOUTONS

Actions globales :

- Tout marquer comme lu
- Préférences
- Filtrer
- Réessayer
- Effacer certaines notifications si autorisé

### Sur carte :

- Ouvrir
- Marquer lu
- Masquer
- Désactiver ce type

## 11. CARTES

Carte notification globale :

- icône catégorie
- titre
- description
- temps
- état
- action implicite

Exemple :

"Nouvelle réponse dans ton débat sur MAAT et justice sociale."

Description :

"Une réponse audio a été ajoutée par une voix suivie."

## 12. ICONOGRAPHIE

Utiliser une famille cohérente :

- cloche pour global
- point ambre pour non-lu
- bouclier pour sécurité
- onde pour audio
- bulle pour débat
- papyrus pour source
- sceau pour créateur

## 13. COMPORTEMENT SCROLL

Groupes par date.

Quand l'utilisateur marque plusieurs notifications comme lues, la liste ne doit pas sauter brutalement.

## 14. ANIMATIONS

- nouvelle notification : liseré ambre temporaire
- marquer lu : fade du point
- groupement : expansion douce
- suppression : glissement contrôlé

## 15. MICRO INTERACTIONS

- tap carte : ouvre contenu
- tap point non-lu : marque lu
- long press : menu
- hover : actions
- badge global se met à jour instantanément

## 16. GESTURES MOBILE

- swipe gauche : marquer lu
- swipe droite : garder pour plus tard
- long press : actions
- pull-to-refresh

## 17. ÉTATS LOADING

Skeleton :

- 5 notifications
- groupe date fantôme
- icônes rondes
- lignes texte

## 18. ÉTATS ERREUR

Erreur globale :

"Impossible de charger les notifications récentes."

Actions :

- réessayer
- voir notifications en cache
- mode léger

## 19. ÉTATS OFFLINE

Afficher :

- dernières notifications synchronisées
- statut "hors ligne"
- actions en attente
- contenus déjà disponibles

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :

- liste simple

### Tablet :

- liste + aperçu

### Desktop :

- liste + panneau détail/résumé

## 21. ACCESSIBILITÉ

- état non-lu annoncé
- date lisible
- bouton action nommé
- navigation clavier
- focus visible

## 22. PERFORMANCE UX

- récupérer d'abord le compteur
- charger ensuite les 20 dernières
- pagination
- cache
- pas de préchargement média lourd

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- cache-first
- texte d'abord
- icônes locales
- pas de miniatures lourdes
- synchronisation différée

## 24. RÈGLES NON NÉGOCIABLES

- Les notifications globales doivent être lisibles en moins de 5 secondes
- Le non-lu doit être clair
- Les actions doivent être rapides
- Les notifications inutiles doivent être groupées
- L'utilisateur doit pouvoir réduire le bruit

---

*Notifications globales pour MAATFEED*
