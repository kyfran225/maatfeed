# 2. RECHERCHE GLOBALE MOBILE

## 1. OBJECTIF UX

Permettre à l'utilisateur mobile de chercher rapidement sans quitter l'univers immersif de MAATFEED. La recherche mobile doit être immédiate, douce, accessible au pouce et pensée pour les utilisateurs qui alternent entre navigation, écoute audio et lecture de débats.

Elle doit fonctionner même avec une frappe approximative, une connexion lente ou une intention mal formulée.

## 2. ÉMOTION RECHERCHÉE

L'utilisateur doit ressentir :

- contrôle
- simplicité
- précision
- fluidité
- confiance

La search bar doit avoir le calme d'un instrument bien accordé : on touche, elle répond.

## 3. STRUCTURE VISUELLE GLOBALE

La recherche mobile se compose de :

- header Discovery
- search bar principale
- suggestions instantanées
- filtres rapides
- historique
- résultats groupés
- bouton mode léger
- accès vocal ou audio si activé
- état vide éditorialisé

La search bar doit pouvoir passer de mode compact à mode concentré.

## 4. LAYOUT EXACT

### État initial :

- titre "Découvrir" en haut
- sous-texte court
- search bar pleine largeur
- chips horizontaux juste dessous
- blocs d'exploration

### État focus :

- le header se réduit
- la search bar monte légèrement
- le clavier apparaît
- suggestions et historique remplacent les blocs Discovery
- bouton fermer ou retour visible à gauche
- bouton effacer visible si texte saisi

### État résultats :

- search bar sticky
- onglets de catégories sous la barre
- résultats groupés verticalement

## 5. HIERARCHIE VISUELLE

Priorité visuelle :

1. champ de recherche
2. suggestions IA
3. filtres catégories
4. meilleurs résultats
5. résultats secondaires
6. historique

En état focus, l'écran doit réduire le bruit visuel. Les grandes cartes exploratoires disparaissent temporairement.

## 6. POSITIONNEMENT DES ÉLÉMENTS

La search bar est placée entre 12 et 20 px sous le titre.

Le bouton retour est à gauche dans le champ ou juste à gauche du champ.

Le bouton effacer est à droite dans le champ.

Les filtres rapides sont sous la barre avec un scroll horizontal.

Les suggestions apparaissent sous les filtres, jamais au-dessus de la barre.

## 7. DIMENSIONS & ESPACEMENTS

- search bar hauteur : 52 px
- radius : 22 à 28 px
- padding interne horizontal : 16 px
- icône recherche : 18 à 20 px
- espace entre icône et texte : 10 px
- chips : 36 px de haut
- gap chips : 8 px
- marge entre search bar et chips : 12 px
- marge entre chips et résultats : 18 à 22 px
- zone tactile minimale : 44 px

## 8. COULEURS

### Search bar :

- fond : graphite chaud très sombre
- bordure inactive : or/brun à faible opacité
- bordure focus : ambre doux
- placeholder : beige grisé
- texte : blanc chaud
- icône : ambre désaturé
- bouton effacer : gris chaud

### État actif :

- léger halo ambre
- fond un peu plus lumineux
- pas de flash blanc

## 9. TYPOGRAPHIE

### Placeholder :

15 ou 16 px
phrase humaine
exemples :
- "Chercher un débat, une voix, une série…"
- "Explorer Kemet, spiritualité, histoire…"
- "Que veux-tu comprendre aujourd'hui ?"

### Texte saisi :

16 px
poids moyen
hauteur confortable

### Suggestions :

14 à 15 px
métadonnées 12 px

## 10. BOUTONS

Boutons présents :

- retour
- effacer
- filtre
- mode léger
- recherche vocale si disponible
- lancer recherche si clavier ne suffit pas
- sauvegarder recherche

Le bouton filtre peut être un chip avec icône sliders. Il doit être visible sans monopoliser l'espace.

## 11. CARTES

Les résultats mobiles utilisent des cartes compactes :

- miniature à gauche ou icône symbolique
- titre
- type
- extrait
- signaux
- action principale

Hauteur :

- résultat texte : 88 à 112 px
- audio : 96 à 128 px
- débat : 112 à 148 px
- série : 120 à 160 px

## 12. ICONOGRAPHIE

Icônes utiles :

- loupe
- flèche retour
- croix
- sliders
- micro
- onde audio
- bulle débat
- papyrus
- série
- créateur
- flamme tendance

Les icônes restent fines et jamais enfantines.

## 13. COMPORTEMENT SCROLL

### En focus :

- scroll vertical des suggestions
- search bar sticky
- clavier respecté
- pas de scroll caché derrière bottom nav

### En résultats :

- onglets catégories sticky sous search bar
- sections résultats scrollables
- retour au top quand nouvelle recherche lancée

## 14. ANIMATIONS

- focus search bar : expansion douce
- apparition clavier : l'écran s'ajuste sans saut
- suggestions : fade + léger slide
- effacement texte : transition immédiate
- changement catégorie : déplacement fluide
- skeletons : shimmer faible

## 15. MICRO INTERACTIONS

- tap search bar : halo ambre
- saisie : suggestions mises à jour progressivement
- tap chip : vibration visuelle légère
- tap résultat : carte se contracte à 98 % pendant une fraction
- sauvegarder recherche : petite confirmation non intrusive
- suppression historique : swipe avec fond ambre sombre

## 16. GESTURES MOBILE

- swipe horizontal entre catégories
- swipe sur historique pour supprimer
- pull-to-refresh résultats
- long press sur résultat pour actions rapides
- swipe down pour quitter recherche focus
- tap extérieur pour fermer clavier

## 17. ÉTATS LOADING

### Pendant la frappe :

- suggestions skeleton courtes
- pas de spinner bruyant

### Pendant recherche complète :

- 3 à 5 skeleton cards
- chips catégories déjà visibles
- texte "Recherche dans les débats, audios et séries…" optionnel

## 18. ÉTATS ERREUR

Cas :

- connexion absente
- serveur lent
- recherche trop vague
- aucun résultat
- médias non chargés

L'interface propose :

- réessayer
- élargir recherche
- voir tendances
- passer en mode léger
- consulter historique

## 19. ÉTATS OFFLINE

En offline, le champ reste actif mais indique :

- "Recherche locale disponible"
- "Résultats limités aux contenus déjà consultés"

Les résultats offline incluent :

- historiques
- sauvegardes
- audios téléchargés
- séries commencées
- débats ouverts récemment

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :

- search bar au centre de l'expérience

### Tablet :

- search bar plus large
- suggestions en deux colonnes si espace suffisant

### Desktop :

- comportement transféré vers recherche desktop dédiée

## 21. ACCESSIBILITÉ

- placeholder non utilisé comme seul label
- bouton effacer annoncé
- focus clavier visible
- taille tactile suffisante
- suggestions lisibles par lecteur d'écran
- ordre de tabulation logique
- prise en charge dictée vocale du système

## 22. PERFORMANCE UX

- debounce perceptible
- suggestions locales avant requête distante
- affichage progressif
- cache historique
- pas de requête lourde à chaque lettre sur connexion faible
- miniatures chargées après texte

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- recherche textuelle prioritaire
- thumbnails différées
- bouton "mode léger" visible
- suggestions populaires mises en cache
- recherche audio par métadonnées avant chargement waveform
- aucun blocage du clavier

## 24. RÈGLES NON NÉGOCIABLES

- La recherche mobile doit être rapide même sur réseau faible
- Le focus ne doit jamais créer une page blanche froide
- Les suggestions doivent être utiles et culturelles
- Les résultats doivent être groupés par sens, pas seulement listés
- Le mini-player audio ne doit jamais être cassé
- La bottom nav doit rester cohérente
- Aucun clone de recherche TikTok ou YouTube

---

*Recherche globale mobile pour MAATFEED*
