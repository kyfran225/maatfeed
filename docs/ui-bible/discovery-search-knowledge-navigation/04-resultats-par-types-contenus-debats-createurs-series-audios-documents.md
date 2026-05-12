# 4. RÉSULTATS PAR TYPES : CONTENUS, DÉBATS, CRÉATEURS, SÉRIES, AUDIOS, DOCUMENTS

## 1. OBJECTIF UX

Permettre à l'utilisateur de comprendre immédiatement la nature de chaque résultat et d'agir selon son intention : regarder, écouter, lire, débattre, suivre, sauvegarder ou vérifier.

## 2. ÉMOTION RECHERCHÉE

Clarté.
L'utilisateur doit sentir qu'il ne se perd pas dans un sac de contenus mélangés. Chaque résultat doit porter son identité.

## 3. STRUCTURE VISUELLE GLOBALE

Les résultats sont organisés par familles :

- Top résultats
- Débats
- Audios
- Vidéos
- Articles/Documents
- Séries
- Créateurs
- Sources
- Premium/Sponsorisé si pertinent

Chaque famille possède un style reconnaissable.

## 4. LAYOUT EXACT

### Mobile :

- onglets horizontaux sous search bar
- résultats en liste verticale
- sections séparées si onglet "Tout"

### Desktop :

- tabs ou filtres gauche
- centre adaptatif
- possibilité de groupement par type
- panneau détail rapide possible

## 5. HIERARCHIE VISUELLE

Dans chaque carte :

- type de contenu
- titre
- créateur/source
- extrait
- signaux de pertinence
- action principale

Pour audio, le bouton lecture peut passer avant l'extrait.

Pour débat, l'intensité et le nombre de réponses sont importants.

Pour document, fiabilité et source sont importants.

## 6. POSITIONNEMENT DES ÉLÉMENTS

### Carte standard :

- gauche : miniature ou symbole
- centre : texte
- droite : action ou indicateur

### Mobile compact :

- miniature en haut ou gauche selon type
- action principale en bas de carte si nécessaire

### Audio :

- bouton play à gauche
- waveform courte au centre
- durée à droite

### Débat :

- icône débat
- titre
- compteur réponses
- badge "actif", "nuancé", "controversé" si modéré

## 7. DIMENSIONS & ESPACEMENTS

- carte résultat compacte : 88 à 112 px
- carte débat : 112 à 148 px
- carte série : 130 à 170 px
- carte créateur : 96 à 128 px
- carte document : 100 à 140 px
- miniature : 56 à 88 px
- radius carte : 20 à 24 px
- padding : 14 à 18 px
- gap interne : 10 à 14 px

## 8. COULEURS

Chaque type peut avoir une nuance secondaire :

- débat : ambre profond
- audio : cuivre/onde dorée
- série : or doux
- document : beige/papyrus
- créateur : violet brun très discret ou ambre symbolique
- premium : or plus net
- sponsorisé : label neutre

Ne jamais créer une palette arc-en-ciel. Les nuances restent dans l'univers noir/or/brun.

## 9. TYPOGRAPHIE

### Titre :

- 15 à 18 px
- semi-bold
- maximum 2 lignes mobile

### Extrait :

- 13 à 14 px
- maximum 2 lignes

### Métadonnées :

- 12 px
- couleur secondaire

### Badges :

- 11 à 12 px
- uppercase évité sauf labels très courts

## 10. BOUTONS

Action principale selon type :

- contenu vidéo : regarder
- audio : écouter
- débat : ouvrir débat
- créateur : suivre ou voir profil
- série : commencer ou continuer
- document : consulter
- source : vérifier
- premium : voir aperçu

Les boutons doivent être courts. L'action peut être iconifiée sur mobile.

## 11. CARTES

Chaque carte doit être autonome :

- lisible sans ouvrir
- type identifiable
- action claire
- métadonnées utiles
- état sauvegardé visible
- chargement image non bloquant

## 12. ICONOGRAPHIE

Icônes par type :

- vidéo : rectangle lecture
- audio : onde
- débat : bulles circulaires
- série : pile/chapitres
- créateur : sceau/avatar symbolique
- document : papyrus
- source : marque fiable
- premium : éclat or discret

## 13. COMPORTEMENT SCROLL

En "Tout", les sections apparaissent avec "Voir plus".

Dans un onglet spécifique, liste infinie progressive.

La position doit être conservée quand l'utilisateur ouvre un résultat puis revient.

## 14. ANIMATIONS

- cards apparaissent par vague
- changement onglet fluide
- play audio transforme la carte en mini état actif
- sauvegarde anime un petit sceau
- ouverture résultat avec transition douce

## 15. MICRO INTERACTIONS

- carte active légèrement éclairée
- audio en lecture montre mini waveform animée
- débat actif affiche pulsation très subtile
- créateur suivi confirme sans modal lourde
- source fiable révèle explication courte au tap

## 16. GESTURES MOBILE

- swipe horizontal onglets
- long press résultat pour sauvegarder/masquer
- swipe léger carte pour action secondaire, seulement si non conflictuel
- tap thumbnail ouvre
- tap bouton agit directement

## 17. ÉTATS LOADING

Skeleton par type :

- audio : ligne waveform grisée
- vidéo : bloc miniature sombre
- débat : lignes texte + compteur fantôme
- créateur : cercle avatar
- document : rectangle papyrus
- série : barre progression

## 18. ÉTATS ERREUR

Si un type échoue :

- afficher les autres types
- montrer message local dans la section
- ne jamais vider toute la page

Exemple :

"Les audios ne se chargent pas pour l'instant. Les débats et séries restent accessibles."

## 19. ÉTATS OFFLINE

Résultats offline par type :

- audios téléchargés
- séries commencées
- débats récemment ouverts
- documents consultés
- créateurs suivis
- recherches enregistrées

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :

- liste verticale

### Tablet :

- grille mixte 2 colonnes possible

### Desktop :

- liste riche ou grille selon type
- preview latérale possible pour documents et créateurs

## 21. ACCESSIBILITÉ

- type annoncé dans chaque résultat
- bouton action nommé
- durée audio lisible
- badges non uniquement colorés
- cartes navigables au clavier
- ordre logique miniature, titre, action

## 22. PERFORMANCE UX

- limiter les médias visibles
- charger texte avant image
- précharger seulement premier écran
- différer waveform réelle
- réduire badges inutiles
- garder DOM léger

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- privilégier texte
- images optionnelles
- audio basse qualité
- documents avec résumé avant fichier lourd
- vidéos non autoplay
- bouton "ouvrir léger" pour contenu lourd

## 24. RÈGLES NON NÉGOCIABLES

- Chaque type doit être reconnaissable
- Aucun résultat ne doit ressembler à une ligne générique
- Les audios doivent être traités comme contenu majeur
- Les débats doivent montrer activité et qualité
- Les sources doivent montrer fiabilité
- Les médias lourds ne doivent pas bloquer la recherche

---

*Résultats par types : contenus, débats, créateurs, séries, audios, documents pour MAATFEED*
