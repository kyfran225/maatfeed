# 1. GRILLE & STRUCTURE SPATIALE

## 1. OBJECTIF UX

Créer une structure invisible qui rend chaque écran stable, premium et facile à comprendre. La grille doit permettre aux agents codeurs d'aligner tous les composants sans improvisation.

## 2. ÉMOTION RECHERCHÉE

Ordre silencieux, maîtrise, respiration, sérieux. L'utilisateur ne doit jamais sentir une interface bricolée. Tout doit sembler posé avec intention.

## 3. STRUCTURE VISUELLE GLOBALE

- **Mobile** : une colonne principale
- **Tablet** : deux zones
- **Desktop** : trois à quatre panneaux selon le contexte

Les contenus importants sont toujours centrés dans une zone lisible.

## 4. LAYOUT EXACT

### Mobile (référence)
- **Largeur** : 390 px
- **Marge externe** : 16 px
- **Largeur utile** : 358 px
- **Gouttière interne** : 12 à 16 px entre éléments empilés
- **Header** : 56 px minimum
- **Bottom navigation** : 64 à 76 px selon safe area
- **Zone média feed** : variable, mais doit conserver une présence dominante

### Tablet
- **Contenu centré** : largeur max 680 à 820 px pour pages simples
- **Deux panneaux** : panneau gauche 320 à 380 px, panneau principal fluide

### Desktop
- **Largeur max immersive** : 1440 px
- **Sidebar gauche** : 240 à 280 px
- **Colonne feed** : 420 à 560 px
- **Panneau détail** : 520 à 680 px
- **Player ou panneau contexte** : 300 à 360 px

## 5. HIERARCHIE VISUELLE

La grille doit guider l'œil du haut vers le centre, puis vers le bas.
- **Mobile** : un seul élément dominant par écran
- **Desktop** : un élément principal + deux contextes secondaires maximum

## 6. POSITIONNEMENT DES ÉLÉMENTS

- Tout élément principal s'aligne à 16 px du bord mobile
- Les icônes de header s'alignent verticalement au centre du header
- Les cartes s'empilent avec 12 px d'écart minimum
- Les CTA bas sont placés à 16 px des bords et à 12 px au-dessus de la safe area

## 7. DIMENSIONS & ESPACEMENTS

**Base spacing : 4 px**
- Micro spacing : 4 px
- Petit spacing : 8 px
- Standard : 12 ou 16 px
- Section : 24 px
- Grand séparateur : 32 à 40 px
- Écart entre groupes majeurs : 48 px

## 8. COULEURS

La grille est invisible. Les séparateurs de structure utilisent des lignes graphite à opacité faible. Les zones actives peuvent avoir une bordure ambre très subtile.

## 9. TYPOGRAPHIE

Les espacements doivent tenir compte des hauteurs de ligne :
- Titres courts : line-height serré
- Corps de texte : line-height confortable
- Labels : respiration suffisante

## 10. BOUTONS

- Les boutons pleine largeur respectent la largeur utile mobile : 358 px sur écran 390 px
- Les boutons dans cartes respectent le padding interne de la carte
- Les boutons flottants ne doivent jamais masquer une action critique

## 11. CARTES

- **Carte standard mobile** : largeur 100% de la zone utile, radius 16 à 22 px, padding 12 à 16 px
- **Carte média** : peut toucher presque toute la largeur utile
- **Carte immersive** : image en haut, contenu en bas, actions alignées

## 12. ICONOGRAPHIE

Les icônes doivent s'aligner sur une grille de 24 px :
- Icône standard : 20 à 22 px
- Icône navigation : 22 à 24 px
- Icône action primaire circulaire : 24 px dans conteneur 44 à 52 px

## 13. COMPORTEMENT SCROLL

- Les éléments fixes doivent respecter la grille : header sticky en haut, bottom nav sticky en bas, mini-player au-dessus de la bottom nav
- Les contenus scrollables doivent avoir un padding bottom suffisant pour éviter d'être cachés

## 14. ANIMATIONS

Les transitions de layout doivent éviter les sauts :
- Lorsqu'un header se réduit, il perd 8 à 12 px de hauteur maximum
- Les panels desktop doivent apparaître avec un léger slide de 12 à 20 px

## 15. MICRO INTERACTIONS

- Au tap sur carte, la carte peut réduire très légèrement son échelle pendant 80 à 120 ms
- Au changement d'onglet, l'indicateur doré glisse sous le libellé actif

## 16. GESTURES MOBILE

- Les gestes de swipe ne doivent pas perturber la grille
- Les bottom sheets montent depuis le bas avec largeur pleine mobile
- Les swipes horizontaux ne doivent être disponibles que sur les onglets ou carrousels clairement indiqués

## 17. ÉTATS LOADING

Les skeletons doivent respecter exactement les mêmes dimensions que les futurs contenus : blocs image, lignes de texte, avatars, boutons. Aucun skeleton ne doit casser la grille.

## 18. ÉTATS ERREUR

Les cartes d'erreur doivent occuper la largeur utile, centrées dans le flux, avec padding 16 px et CTA aligné en bas.

## 19. ÉTATS OFFLINE

Le bandeau offline doit s'insérer sous le header ou au-dessus de la bottom nav selon le contexte, sans pousser brutalement le contenu. Hauteur recommandée : 36 à 44 px.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

- **Mobile** : 1 colonne
- **Tablet portrait** : 1 colonne large ou 2 colonnes légères
- **Tablet paysage** : feed + détail
- **Desktop** : multi-panels
- **Grand desktop** : contenu centré, jamais étiré jusqu'à devenir illisible

## 21. ACCESSIBILITÉ

- La grille doit permettre le zoom texte sans chevauchement
- Les éléments tactiles doivent rester à 44 px minimum
- Les contenus ne doivent pas dépendre uniquement de la position visuelle

## 22. PERFORMANCE UX

Une grille simple réduit les recalculs visuels. Les dimensions récurrentes doivent limiter les sauts de layout pendant le chargement des images et vidéos.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Réserver l'espace média avant chargement pour éviter les secousses. Afficher rapidement les titres, créateurs et actions même si la miniature arrive après.

## 24. RÈGLES NON NÉGOCIABLES

- Aucun écran ne doit être désaligné
- Aucun composant ne doit avoir un spacing arbitraire
- Toute interface doit donner l'impression d'appartenir au même système

---

*Structure spatiale fondamentale pour MAATFEED*
