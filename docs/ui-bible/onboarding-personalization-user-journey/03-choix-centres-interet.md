# 3. CHOIX DES CENTRES D'INTÉRÊT

## 1. OBJECTIF UX

Permettre à l'utilisateur de choisir rapidement les grands sujets qui vont orienter son premier feed.

Le choix doit être simple, plaisant et culturellement riche.

## 2. ÉMOTION RECHERCHÉE

Curiosité guidée.

L'utilisateur doit avoir envie de sélectionner des sujets, pas l'impression de remplir une base de données.

## 3. STRUCTURE VISUELLE GLOBALE

Écran composé de :

- titre court
- phrase d'aide
- grille de thèmes
- compteur de sélection
- bouton continuer
- option passer

Thèmes possibles :

- Kemet
- histoire africaine
- spiritualité africaine
- religions comparées
- débats de société
- philosophie
- diaspora
- langues africaines
- figures historiques
- culture contemporaine
- audio learning
- séries documentaires

## 4. LAYOUT EXACT

### Mobile :

- 2 colonnes
- cartes compactes
- sélection multiple
- bouton sticky en bas

### Desktop :

- grille 3 ou 4 colonnes
- panneau résumé des choix à droite

## 5. HIERARCHIE VISUELLE

1. titre
2. instruction
3. choix
4. compteur
5. action

Minimum recommandé :

- demander 3 choix
- autoriser continuer avec moins
- ne pas bloquer agressivement

## 6. POSITIONNEMENT DES ÉLÉMENTS

Le compteur doit être proche du bouton ou sous le titre.

Les cartes doivent occuper le centre.

Le bouton continuer reste en bas.

## 7. DIMENSIONS & ESPACEMENTS

### Mobile :

- carte intérêt : 110 à 150 px hauteur
- radius : 22 à 26 px
- padding : 14 px
- gap : 10 à 12 px
- bouton bas : 54 px

### Desktop :

- carte : 160 à 220 px
- gap : 16 à 20 px

## 8. COULEURS

### Carte inactive :

- graphite sombre
- bordure brun/or faible

### Carte active :

- bordure ambre
- fond brun noir éclairé
- halo doux
- coche or

## 9. TYPOGRAPHIE

- titre thème : 14 à 16 px mobile
- description : 11 à 13 px
- compteur : 12 à 13 px
- titre page : 24 à 30 px

## 10. BOUTONS

Boutons :

- Continuer
- Passer
- Sélectionner tout recommandé, seulement si pertinent
- Voir plus de thèmes

Ne pas afficher trop d'options secondaires.

## 11. CARTES

Carte intérêt :

- icône symbolique
- nom du thème
- phrase courte
- état sélectionné
- éventuellement nombre de contenus

Exemple :

"Kemet — Civilisation, symboles, histoire et héritage."

## 12. ICONOGRAPHIE

Chaque thème doit avoir un symbole abstrait :

- papyrus
- pyramide stylisée non touristique
- onde
- cercle débat
- plume
- constellation
- livre
- route diaspora

## 13. COMPORTEMENT SCROLL

Si plus de 12 thèmes :

- afficher d'abord les principaux
- "Voir plus"
- scroll fluide
- bouton continuer sticky

## 14. ANIMATIONS

- sélection avec halo
- coche qui apparaît
- compteur qui change doucement
- cartes apparaissent en grille progressive

## 15. MICRO INTERACTIONS

- tap carte sélectionne/désélectionne
- long press affiche détails
- compteur indique "3 choisis"
- bouton devient actif sans secousse

## 16. GESTURES MOBILE

- tap
- long press détail
- scroll vertical
- swipe non indispensable

## 17. ÉTATS LOADING

Si thèmes chargent :

- skeleton cartes
- titre déjà visible
- fallback thèmes populaires si réseau lent

## 18. ÉTATS ERREUR

Si chargement échoue :

- afficher thèmes par défaut locaux
- permettre continuer
- sauvegarder plus tard

## 19. ÉTATS OFFLINE

Offline :

- thèmes locaux
- choix enregistrés
- sync plus tard
- feed initial basé sur cache

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :

- 2 colonnes

### Tablet :

- 3 colonnes

### Desktop :

- 4 colonnes ou grille + résumé

## 21. ACCESSIBILITÉ

- cartes sélectionnables au clavier
- état sélectionné annoncé
- contraste
- pas de couleur seule
- zone tactile suffisante

## 22. PERFORMANCE UX

- thèmes locaux
- icônes légères
- pas d'images lourdes
- sauvegarde instantanée locale

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- thèmes embarqués
- pas besoin réseau
- pas de miniatures
- continuer possible

## 24. RÈGLES NON NÉGOCIABLES

- Ne pas demander trop de choix
- Ne pas bloquer l'utilisateur
- Les thèmes doivent être culturels et clairs
- Pas de tags froids
- Les choix doivent influencer le feed
- Offline doit être possible

---

*Choix des centres d'intérêt pour MAATFEED*
