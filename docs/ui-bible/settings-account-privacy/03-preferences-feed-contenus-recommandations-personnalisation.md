# 3. PRÉFÉRENCES FEED, CONTENUS, RECOMMANDATIONS & PERSONNALISATION

## 1. OBJECTIF UX

Cette section permet à l'utilisateur de contrôler son expérience de découverte : thèmes, formats préférés, langues de contenu, intensité des débats, audio/vidéo, créateurs suivis, recommandations IA, sujets sensibles et diversité du feed.
L'objectif est de rendre le feed plus intelligent sans donner l'impression d'une machine opaque.

## 2. ÉMOTION RECHERCHÉE

L'utilisateur doit ressentir :

- contrôle éditorial ;
- curiosité ;
- respect de ses goûts ;
- liberté d'explorer ;
- absence d'enfermement algorithmique.

MAATFEED doit donner le sentiment d'un guide intelligent, pas d'un piège à attention.

## 3. STRUCTURE VISUELLE GLOBALE

Préférences feed :

- thèmes favoris ;
- formats préférés ;
- niveau de débat ;
- personnalisation IA ;
- contenus sensibles ;
- diversité culturelle ;
- recommandations sponsorisées ;
- réinitialisation du feed.

Chaque groupe doit être visuel, tactile, facile à comprendre.

## 4. LAYOUT EXACT

Mobile :

- chips horizontaux pour thèmes ;
- cartes format ;
- sliders simples pour intensité ;
- switches pour IA et recommandations ;
- bouton "Réinitialiser mes préférences" en bas.

Les préférences doivent ressembler à un réglage éditorial, pas à un formulaire long.

## 5. HIERARCHIE VISUELLE

Priorité :

- thèmes ;
- formats ;
- audio/vidéo/débat ;
- recommandations IA ;
- diversité ;
- contenus sensibles ;
- réinitialisation.

La réinitialisation doit être visible mais séparée.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Thèmes :

- grille de chips ;
- 2 colonnes ou wrap fluide ;
- sélection ambre.

Formats :

- cartes compactes : Vidéo, Audio, Débat, Série, Article, Document ;
- chaque carte avec icône et description courte.

Intensité débat :

- curseur ou choix simple : Calme, Équilibré, Intense.

## 7. DIMENSIONS & ESPACEMENTS

Chips :

- hauteur 34 à 40 px ;
- radius 999 px ;
- padding 12 à 14 px ;
- gap 8 px.

Cartes format :

- hauteur 72 à 92 px ;
- padding 14 px ;
- icône 22 px.

Sliders :

- hauteur tactile 44 px ;
- labels clairs.

## 8. COULEURS

États :

- sélection : ambre/or ;
- non sélectionné : surface sombre ;
- bordure : brun doux ;
- désactivé : gris chaud ;
- avertissement contenu sensible : rouge argile très discret.

## 9. TYPOGRAPHIE

Libellés :

- "Thèmes que tu veux voir plus souvent"
- "Formats préférés"
- "Niveau de débat"
- "Personnalisation IA"
- "Diversifier mon feed"
- "Moins de contenus similaires"

Le langage doit rester clair, pas algorithmique.

## 10. BOUTONS

Boutons :

- "Enregistrer"
- "Voir l'effet sur mon feed"
- "Réinitialiser le feed"
- "Masquer moins ce sujet"
- "Afficher plus de diversité"

Éviter "optimiser l'algorithme".

## 11. CARTES

Cartes format :

- Audio : casque ;
- Vidéo : play ;
- Débat : bulles ;
- Série : pile ;
- Article : document ;
- Source : parchemin/document.

Chaque carte peut afficher un niveau : Favori, Normal, Moins souvent.

## 12. ICONOGRAPHIE

Icônes :

- thème : étoile ou cercle ;
- feed : flux ;
- débat : bulles ;
- audio : casque ;
- vidéo : play ;
- diversité : branches ;
- IA : symbole abstrait non humain.

## 13. COMPORTEMENT SCROLL

Les préférences peuvent être longues :

- sections repliables possibles ;
- garder bouton enregistrer sticky ;
- éviter trop de sous-pages ;
- restaurer position après sélection thèmes.

## 14. ANIMATIONS

Animations :

- chip sélectionnée pulse très légèrement ;
- carte format change d'état par transition douce ;
- slider suit le doigt ;
- confirmation sobre.

## 15. MICRO INTERACTIONS

Micro-interactions :

- tap thème ajoute/retire ;
- long press thème explique ;
- "voir moins" confirme discrètement ;
- changement format affiche mini-feedback ;
- réinitialisation demande confirmation.

## 16. GESTURES MOBILE

Gestes :

- scroll horizontal chips si nécessaire ;
- tap simple ;
- swipe entre catégories possible ;
- aucune gesture cachée essentielle.

## 17. ÉTATS LOADING

Loading :

- préférences locales d'abord ;
- skeleton chips ;
- formats visibles rapidement ;
- recommandations actuelles chargées ensuite.

## 18. ÉTATS ERREUR

Erreur :

- "Impossible de charger toutes les préférences."
- garder modifications locales ;
- proposer réessayer ;
- ne pas bloquer toute la page.

## 19. ÉTATS OFFLINE

Offline :

- préférences modifiables localement ;
- sync au retour réseau ;
- feed local peut appliquer certains filtres ;
- personnalisation IA distante indisponible.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Mobile :

- chips et cartes verticales.

Tablette :

- thèmes en grille ;
- formats en deux colonnes.

Desktop :

- navigation préférences à gauche ;
- preview feed à droite.

## 21. ACCESSIBILITÉ

Préférences :

- chips sélectionnables annoncées ;
- sliders avec labels ;
- cartes formats accessibles clavier ;
- contrastes suffisants ;
- pas de couleur seule pour sélection.

## 22. PERFORMANCE UX

Ne pas recalculer le feed lourdement à chaque tap.
Préférer :

- sauvegarde locale rapide ;
- application progressive ;
- preview légère ;
- recalcul serveur différé.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

En faible connexion, privilégier les réglages :

- moins de vidéo ;
- plus d'audio ;
- plus de texte ;
- moins d'autoplay ;
- contenus sauvegardables ;
- recommandations légères.

## 24. RÈGLES NON NÉGOCIABLES

- Ne jamais rendre l'algorithme totalement opaque.
- Ne jamais enfermer l'utilisateur dans ses choix.
- Toujours permettre plus de diversité.
- Toujours respecter le mode économie.
- Toujours permettre de réinitialiser.
- Toujours distinguer préférences et restrictions.
- Toujours garder une UX simple et tactile.

---

*Préférences feed, contenus, recommandations et personnalisation pour MAATFEED*
