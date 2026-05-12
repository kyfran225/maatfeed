# 5. RADIUS, SHADOWS & DEPTH SYSTEM

## 1. OBJECTIF UX

Créer une profondeur élégante qui différencie contenus, actions, overlays, sheets et players sans alourdir l'interface.

## 2. ÉMOTION RECHERCHÉE

Premium, tactile, feutré, cinématographique. Les surfaces doivent sembler matérielles sans devenir brillantes ou kitsch.

## 3. STRUCTURE VISUELLE GLOBALE

La profondeur MAATFEED vient de trois éléments : radius généreux, bordures fines, ombres sombres + halos chauds rares. Les composants doivent paraître posés sur une scène noire.

## 4. LAYOUT EXACT

- **Radius petits éléments** : 8 à 10 px
- **Inputs** : 12 à 14 px
- **Cartes compactes** : 14 à 16 px
- **Cartes média** : 16 à 22 px
- **Modales** : 20 à 28 px
- **Bottom sheets** : 24 à 32 px en haut
- **Boutons pill** : 999 px ou radius très rond selon cas

## 5. HIERARCHIE VISUELLE

Plus un élément est important et isolé, plus son radius peut être généreux. Les contenus denses utilisent un radius plus sobre. Les boutons primaires peuvent être pill pour renforcer la facilité tactile.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Les ombres doivent respecter l'élévation : carte sur fond, sheet au-dessus carte, modal au-dessus sheet, player flottant au-dessus navigation.

## 7. DIMENSIONS & ESPACEMENTS

- **Ombre carte standard** : légère diffusion 8 à 16 px, opacité faible
- **Ombre sheet** : diffusion 24 à 48 px
- **Halo actif** : diffusion 12 à 24 px maximum
- **Bordure** : 1 px

## 8. COULEURS

- Ombres noires profondes
- Halos ambre très subtils
- Bordures graphite ou or faible selon état

## 9. TYPOGRAPHIE

La profondeur ne doit pas réduire la lisibilité du texte. Les textes sur cartes élevées gardent un contraste fort.

## 10. BOUTONS

- **Boutons primaires** : radius 14 à 999 selon largeur
- Pour CTA pleine largeur : radius 14 à 18 px
- Pour action circulaire : conteneur rond 44 à 56 px

## 11. CARTES

- **Carte feed** : radius 18 à 22 px sur média
- **Carte débat** : radius 16 px, moins spectaculaire, plus lisible
- **Carte audio** : radius 18 px + progression interne

## 12. ICONOGRAPHIE

Les icônes dans conteneurs ronds ou carrés arrondis doivent avoir une marge interne régulière. Ne jamais coller une icône à la bordure.

## 13. COMPORTEMENT SCROLL

Les ombres doivent rester légères en liste pour éviter un effet sale. Au scroll rapide, les cartes ne doivent pas créer de scintillement.

## 14. ANIMATIONS

À l'ouverture, une carte peut augmenter très légèrement son élévation. Une sheet apparaît avec ombre progressive.

## 15. MICRO INTERACTIONS

- **Hover desktop** : bordure légèrement plus claire, halo faible, translation verticale de 1 à 2 px maximum
- **Press mobile** : échelle 0.98 à 0.99

## 16. GESTURES MOBILE

Pendant drag d'une sheet, l'ombre augmente légèrement quand elle devient active. Pendant swipe de carte, la carte peut révéler une action latérale.

## 17. ÉTATS LOADING

Skeletons doivent hériter des radius finaux, surtout pour médias et cartes.

## 18. ÉTATS ERREUR

Cartes d'erreur : radius 16 px, bordure graphite/rouge faible, pas de halo dramatique.

## 19. ÉTATS OFFLINE

Bandeau offline : radius 12 à 16 px s'il est flottant, ou aucun radius s'il est plein écran sous header.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Desktop peut utiliser plus de profondeur entre panels, mais avec sobriété. Les panels fixes ont radius 20 à 28 px selon largeur.

## 21. ACCESSIBILITÉ

Ne pas dépendre de l'ombre seule pour indiquer la sélection. Ajouter bordure, icône ou label.

## 22. PERFORMANCE UX

Limiter les blurs lourds et grosses ombres dynamiques. Les halos doivent rester rares pour préserver les performances.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Les effets de profondeur doivent fonctionner sans images. Les surfaces restent élégantes même en mode léger.

## 24. RÈGLES NON NÉGOCIABLES

- Pas d'ombres bleutées SaaS
- Pas de neumorphism
- Pas de surfaces plates sans bordure sur fond noir
- Pas de cartes carrées brutalistes

---

*Système de profondeur pour une expérience premium et tactile*
