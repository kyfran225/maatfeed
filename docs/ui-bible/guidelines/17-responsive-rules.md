# 17. RESPONSIVE RULES — MOBILE, TABLET, DESKTOP

## 1. OBJECTIF UX

Garantir que MAATFEED reste premium sur téléphone, tablette et desktop, sans perdre son ADN mobile-first.

## 2. ÉMOTION RECHERCHÉE

Continuité et puissance. L'utilisateur doit reconnaître la même app, avec plus d'espace et de contrôle sur grand écran.

## 3. STRUCTURE VISUELLE GLOBALE

- **Mobile** : immersion verticale
- **Tablet** : exploration confortable
- **Desktop** : workspace culturel premium multi-panels

## 4. LAYOUT EXACT

### Mobile 360-430 px
1 colonne, bottom nav, header compact.

### Large mobile 431-600 px
1 colonne centrée, largeur max 430-480 px pour certains écrans.

### Tablet 601-900 px
1 ou 2 colonnes, navigation rail possible.

### Desktop 901-1280 px
sidebar + feed + détail.

### Large desktop 1281+ px
sidebar + feed + détail + player/contexte.

## 5. HIERARCHIE VISUELLE

- **Mobile** : un focus à la fois
- **Desktop** : focus principal au centre, contexte autour
- Ne jamais noyer l'utilisateur dans trop de panneaux

## 6. POSITIONNEMENT DES ÉLÉMENTS

- **Mobile** : bottom nav
- **Tablet** : bottom nav ou rail selon largeur
- **Desktop** : sidebar gauche, player sticky droite/bas, détail au centre/droite

## 7. DIMENSIONS & ESPACEMENTS

- **Mobile marge** : 16 px
- **Tablet marge** : 24 px
- **Desktop panels padding** : 20 à 28 px
- **Largeur texte max** : 680 px

## 8. COULEURS

Palette identique. Desktop peut utiliser plus de nuances de surfaces pour séparer panels.

## 9. TYPOGRAPHIE

Desktop peut augmenter les titres de 1 à 3 px. Corps reste 15 à 16 px pour lisibilité.

## 10. BOUTONS

- **Mobile** : pleine largeur fréquente
- **Desktop** : boutons inline ou toolbar, mais CTA principal toujours évident

## 11. CARTES

- **Mobile** : cartes empilées
- **Tablet** : cartes en grille uniquement pour bibliothèques/séries
- **Desktop feed** : colonne dédiée, détail séparé

## 12. ICONOGRAPHIE

Desktop peut ajouter labels permanents dans sidebar. Mobile icônes compactes avec labels bottom nav.

## 13. COMPORTEMENT SCROLL

- **Mobile** : page/flux
- **Desktop** : panels scroll indépendants si utile
- Le player sticky ne doit pas disparaître

## 14. ANIMATIONS

- **Desktop** : transitions panels plus fines
- **Mobile** : transitions sheet/player dominantes

## 15. MICRO INTERACTIONS

- **Desktop** : hover, focus, tooltips
- **Mobile** : press, drag, vibration légère

## 16. GESTURES MOBILE

Gestures mobiles maintenus sur tablet tactile. Desktop ajoute raccourcis clavier.

## 17. ÉTATS LOADING

Skeleton par colonne/panel. Desktop ne doit pas bloquer tous les panels si un seul charge.

## 18. ÉTATS ERREUR

Erreur localisée au panel concerné. Mobile peut afficher page ou carte selon gravité.

## 19. ÉTATS OFFLINE

- **Mobile** : bandeau + cache
- **Desktop** : badge offline dans sidebar/header + sections cache

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Règle principale : ne jamais étirer une UI mobile jusqu'à 1440 px. Créer des panels intentionnels.

## 21. ACCESSIBILITÉ

- Desktop complet au clavier
- Mobile zones tactiles
- Tablet orientation portrait/paysage gérée

## 22. PERFORMANCE UX

Ne pas charger tous les panels lourds au desktop dès l'ouverture. Prioriser visible.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Même sur desktop, supposer réseau instable. Préserver shell, cache, audio, texte.

## 24. RÈGLES NON NÉGOCIABLES

- Desktop ne doit pas devenir un dashboard SaaS
- Mobile reste source de vérité
- Les panels desktop doivent enrichir, pas diluer

---

*Règles responsive pour une expérience cohérente*
