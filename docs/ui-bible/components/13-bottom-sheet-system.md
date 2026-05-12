# 13. BOTTOM SHEET SYSTEM

## 1. OBJECTIF UX

Utiliser les bottom sheets comme couche mobile principale pour choix rapides, paramètres, création, options média, partage, réactions, tri, filtres et menus contextuels.

## 2. ÉMOTION RECHERCHÉE

Proximité, contrôle, rapidité. La sheet doit surgir comme un panneau natif et élégant, pas comme une popup web.

## 3. STRUCTURE VISUELLE GLOBALE

Sheet sombre, coins supérieurs arrondis, poignée centrale, titre court, options en cartes ou lignes, CTA en bas si nécessaire.

## 4. LAYOUT EXACT

- **Largeur** : 100 % mobile
- **Radius haut** : 24 à 32 px
- **Hauteur compacte** : 28 à 45 % écran
- **Hauteur moyenne** : 50 à 70 %
- **Hauteur grande** : 85 à 92 %
- **Padding** : 16 px latéral
- **Grab handle** : 36 à 48 px largeur, 4 à 5 px hauteur

## 5. HIERARCHIE VISUELLE

Titre en haut, options ensuite, CTA en bas. Une sheet ne doit pas contenir trop de niveaux. Si contenu complexe, passer en page dédiée.

## 6. POSITIONNEMENT DES ÉLÉMENTS

- Poignée centrée à 8 px du haut
- Titre à 16 px ou 20 px sous poignée
- Options empilées avec 8 à 10 px d'écart
- CTA sticky en bas si flow

## 7. DIMENSIONS & ESPACEMENTS

- **Option ligne** : 48 à 56 px hauteur
- **Option média** : 64 à 76 px
- **Écart sections** : 20 à 24 px
- **Padding bottom** : safe area + 16 px

## 8. COULEURS

- **Fond sheet** : noir charbon/surface élevée
- **Overlay arrière** : noir 50 à 70 %
- **Bordure supérieure** : graphite
- **Accent or** : pour option active

## 9. TYPOGRAPHIE

- **Titre sheet** : 16 à 18 px semibold
- **Option** : 14 à 15 px
- **Description option** : 12 à 13 px gris

## 10. BOUTONS

CTA en bas pleine largeur. Actions secondaires peuvent être en ghost. Fermer explicite si sheet critique.

## 11. CARTES

Options importantes peuvent être cartes internes avec radius 12 à 14 px. Sélections actives : bordure or + fond chaud léger.

## 12. ICONOGRAPHIE

Chaque option de type média a une icône : vidéo, audio, photo, document, lien, texte. Icône 20 à 22 px dans conteneur 36 à 40 px.

## 13. COMPORTEMENT SCROLL

Sheet longue : header interne sticky, contenu scrollable, CTA sticky. Le fond arrière ne scrolle pas.

## 14. ANIMATIONS

- **Ouverture** : slide up 280 à 360 ms
- **Fermeture** : slide down 220 à 300 ms
- **Overlay fade** : synchronisé

## 15. MICRO INTERACTIONS

- Tap option : fond se réchauffe, icône devient or, check discret
- Drag handle répond au toucher

## 16. GESTURES MOBILE

- Drag down ferme si non critique
- Drag up étend si sheet a plusieurs positions
- Tap overlay ferme seulement pour actions non critiques

## 17. ÉTATS LOADING

Options réseau peuvent afficher skeleton interne. CTA loading conserve taille.

## 18. ÉTATS ERREUR

Erreur dans sheet : message compact sous titre ou carte dédiée. Ne pas fermer automatiquement après erreur.

## 19. ÉTATS OFFLINE

Sheet de création doit proposer brouillon/offline. Sheet partage peut indiquer options indisponibles.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Tablet/desktop : bottom sheet peut devenir modal centrée ou side panel selon contexte. Garder même structure visuelle.

## 21. ACCESSIBILITÉ

- Focus trap
- Fermeture par escape desktop
- Labels accessibles
- Drag non obligatoire pour fermer

## 22. PERFORMANCE UX

Limiter blur arrière. Sheet doit monter sans lag. Contenu lourd chargé après ouverture si nécessaire.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Afficher d'abord les options locales. Charger les éléments réseau progressivement. Ne jamais bloquer l'ouverture d'une sheet pour une donnée distante.

## 24. RÈGLES NON NÉGOCIABLES

- Pas de sheet blanche
- Pas de sheet sans poignée
- Pas de menu contextuel minuscule
- Pas de sheet qui cache un flow critique sans sauvegarde

---

*Système de bottom sheets pour les actions mobiles*
