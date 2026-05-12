# 16. LOADER & SKELETON SYSTEM

## 1. OBJECTIF UX

Faire patienter sans frustration, en montrant immédiatement la structure de l'interface et en donnant une impression de vitesse.

## 2. ÉMOTION RECHERCHÉE

Confiance, continuité, calme. L'utilisateur ne doit jamais voir un écran vide ou paniquer.

## 3. STRUCTURE VISUELLE GLOBALE

Skeletons sombres, shimmer subtil, placeholders média, progression upload/download, waveform placeholder, feed shell instantané.

## 4. LAYOUT EXACT

### Skeleton carte feed
Avatar rond 36 à 44 px, lignes titre 60 à 90 % largeur, bloc média ratio réservé, actions.

### Skeleton audio
Carré cover 56 px + lignes + waveform.

### Skeleton débat
Question + stats + 2 réponses courtes.

### Skeleton profil
Avatar 88 à 112 px + stats + tabs.

## 5. HIERARCHIE VISUELLE

Charger d'abord shell, puis texte, puis miniatures, puis médias lourds. Les éléments critiques apparaissent avant les éléments décoratifs.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Skeletons exactement là où le contenu final apparaîtra. Pas de loader au milieu si une structure peut être affichée.

## 7. DIMENSIONS & ESPACEMENTS

Les skeletons respectent les radius et spacing finaux. Shimmer lent, cycle 1.4 à 2 s.

## 8. COULEURS

- **Base skeleton** : graphite sombre
- **Highlight** : gris chaud légèrement plus clair
- Pas de blanc

## 9. TYPOGRAPHIE

Les lignes skeleton imitent les longueurs de texte. Pas de lignes toutes identiques.

## 10. BOUTONS

Boutons loading gardent leur taille. Les actions indisponibles peuvent être skeleton ou disabled selon contexte.

## 11. CARTES

Les cartes skeleton ont la même hauteur anticipée. Réserver les ratios média.

## 12. ICONOGRAPHIE

Icônes skeleton rares. Pour audio, waveform placeholder plus parlant qu'un simple rectangle.

## 13. COMPORTEMENT SCROLL

Infinite scroll : skeletons en bas de liste. Ne pas bloquer scroll existant pendant chargement suivant.

## 14. ANIMATIONS

Shimmer doux. Progress upload réel quand disponible. Pas de spinner permanent sans message.

## 15. MICRO INTERACTIONS

Pendant loading, les actions non prêtes peuvent afficher tooltip/toast court : "chargement du média".

## 16. GESTURES MOBILE

Pull to refresh montre un indicateur doré discret. Le feed reste scrollable.

## 17. ÉTATS LOADING

Types : initial loading, partial loading, action loading, upload loading, offline sync loading, background refresh.

## 18. ÉTATS ERREUR

Si loading échoue, remplacer skeleton par carte erreur avec action. Ne pas laisser skeleton infini.

## 19. ÉTATS OFFLINE

Skeleton initial sans réseau doit rapidement basculer vers cache/offline, pas rester en attente.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Desktop : skeletons par panel. Mobile : skeletons plein flux. Tablet : selon layout.

## 21. ACCESSIBILITÉ

Éviter shimmer trop intense. Annoncer états de chargement importants aux lecteurs d'écran.

## 22. PERFORMANCE UX

Skeletons CSS légers, pas d'animation lourde sur grand nombre d'éléments. Désactiver shimmer en mode économie.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Priorité à la structure et au texte. Les médias lourds peuvent afficher état "chargement léger" avec option audio ou lecture plus tard.

## 24. RÈGLES NON NÉGOCIABLES

- Pas d'écran blanc
- Pas de spinner solitaire sur feed
- Pas de layout shift après chargement

---

*Système de chargement pour une expérience fluide*
