# 8. PERFORMANCE PERÇUE : SKELETONS, PLACEHOLDERS, MÉDIAS & AUTOPLAY RÉDUIT

## 1. OBJECTIF UX

La performance perçue doit faire sentir que MAATFEED répond immédiatement, même quand tout n'est pas encore chargé. L'utilisateur doit voir une structure claire avant les contenus lourds.
Le but n'est pas de tout charger vite à tout prix, mais de donner vite quelque chose d'utile, stable et beau.

## 2. ÉMOTION RECHERCHÉE

L'utilisateur doit ressentir :

- fluidité ;
- stabilité ;
- confiance ;
- absence d'attente pénible ;
- sensation premium.

La lenteur doit être transformée en rythme, pas en frustration.

## 3. STRUCTURE VISUELLE GLOBALE

Performance perçue :

- app shell immédiat ;
- skeletons éditoriaux ;
- placeholders média ;
- chargement progressif ;
- priorisation audio/texte ;
- autoplay conditionnel ;
- compression média ;
- stabilisation layout.

## 4. LAYOUT EXACT

Skeleton feed :

- reprend exactement la forme des vraies cartes ;
- avatar/symbole ;
- titre ;
- lignes texte ;
- zone média ;
- action bar.

Skeleton audio :

- artwork sombre ;
- ligne titre ;
- waveform simplifiée ;
- boutons fantômes.

Skeleton débat :

- titre ;
- contexte ;
- premières réponses ;
- composer fantôme.

## 5. HIERARCHIE VISUELLE

Priorité d'affichage :

- shell ;
- header ;
- navigation ;
- cartes skeleton ;
- texte ;
- audio ;
- images ;
- vidéo ;
- recommandations secondaires.

Ne jamais bloquer l'interface pour attendre une vidéo.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Placeholders :

- même emplacement que contenu final ;
- hauteur réservée ;
- pas de saut de layout ;
- shimmer discret uniquement dans la zone concernée.

Autoplay :

- activé seulement si connexion bonne et intention probable ;
- désactivé en Low Data ;
- limité en batterie faible.

## 7. DIMENSIONS & ESPACEMENTS

Skeletons :

- radius identique aux cartes ;
- padding identique ;
- hauteur proche du contenu final ;
- shimmer fin ;
- lignes texte 12 à 16 px de haut ;
- gap 8 à 12 px.

Placeholder vidéo :

- ratio stable ;
- bouton play visible ;
- thumbnail compressée.

## 8. COULEURS

Skeleton :

- base noir brun ;
- highlight gris chaud très subtil ;
- bordure sombre ;
- aucun blanc violent ;
- shimmer à faible contraste.

Placeholder média :

- overlay charbon ;
- icône ambre ;
- texte beige-gris.

## 9. TYPOGRAPHIE

Messages performance :

- "Chargement léger…"
- "Préparation de l'audio…"
- "Vidéo prête à charger"
- "Image optimisée"
- "Connexion lente détectée"

Éviter "loading assets", "fetching", "request timeout".

## 10. BOUTONS

Boutons média :

- "Lire"
- "Charger"
- "Audio seulement"
- "Réessayer"
- "Continuer sans vidéo"

Les boutons doivent donner une alternative utile, pas seulement relancer le même échec.

## 11. CARTES

Carte vidéo optimisée :

- thumbnail légère ;
- bouton manuel ;
- résumé visible ;
- audio alternatif si disponible.

Carte image :

- image basse qualité d'abord ;
- image complète ensuite ;
- transition douce.

Carte document :

- titre et extrait d'abord ;
- preview ensuite.

## 12. ICONOGRAPHIE

Icônes :

- play ;
- casque ;
- image ;
- document ;
- éclair ;
- data ;
- pause autoplay ;
- compression.

Icônes toujours fines, jamais cartoon.

## 13. COMPORTEMENT SCROLL

Le scroll doit rester :

- stable ;
- fluide ;
- sans sauts ;
- sans cartes qui changent brutalement de hauteur ;
- sans lecture automatique agressive.

Pendant scroll rapide :

- suspendre médias lourds ;
- charger seulement structure ;
- reprendre enrichissement au repos.

## 14. ANIMATIONS

Animations :

- shimmer lent ;
- fondu image basse → haute qualité ;
- apparition progressive texte ;
- réduction motion si préférence utilisateur ;
- aucune animation surchargée en listes longues.

## 15. MICRO INTERACTIONS

Micro-interactions :

- tap placeholder charge média ;
- tap audio lance version légère ;
- appui sur "connexion lente" ouvre option Low Data ;
- autoplay désactivé montre une petite explication ;
- retry garde le contexte.

## 16. GESTURES MOBILE

Gestes :

- tap play manuel ;
- swipe feed sans médias parasites ;
- long press média pour options qualité ;
- pull-to-refresh intelligent ;
- double tap social action différée si réseau faible.

## 17. ÉTATS LOADING

Loading doit être contextuel :

- feed : cartes skeleton ;
- audio : mini-player préparé ;
- débat : titre + réponses skeleton ;
- recherche : lignes résultat ;
- profil : header skeleton + tabs ;
- série : couverture + épisodes skeleton.

Pas de loader plein écran sauf première ouverture critique.

## 18. ÉTATS ERREUR

Erreur performance :

- média non chargé ;
- timeout ;
- image trop lourde ;
- vidéo indisponible ;
- audio alternatif disponible.

Message :
"Ce média prend trop de temps. Tu peux continuer en audio ou réessayer plus tard."

## 19. ÉTATS OFFLINE

Offline :

- remplacer skeletons réseau par contenus locaux ;
- ne pas afficher chargement infini ;
- montrer placeholders "non disponible hors connexion" ;
- proposer téléchargement futur.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Mobile :

- performance stricte ;
- peu d'animations ;
- média manuel si faible réseau.

Tablette :

- chargement progressif par colonne ;
- placeholders plus grands.

Desktop :

- multi-panel possible ;
- mais éviter surcharge initiale ;
- charger colonne principale avant secondaires.

## 21. ACCESSIBILITÉ

Skeletons :

- ne doivent pas être lus comme contenu réel ;
- doivent annoncer chargement si nécessaire ;
- respecter réduction mouvement ;
- ne pas clignoter ;
- garder contraste confortable.

## 22. PERFORMANCE UX

Principes :

- texte avant média ;
- média léger avant média lourd ;
- audio avant vidéo ;
- interactions avant décor ;
- stabilité avant animation ;
- contenu avant recommandation.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Optimisation Afrique :

- miniatures compressées ;
- audio léger ;
- pas d'autoplay par défaut sur réseau faible ;
- préchargement court ;
- cache stratégique ;
- reprise de session.

L'utilisateur doit pouvoir explorer MAATFEED sans brûler son forfait.

## 24. RÈGLES NON NÉGOCIABLES

- Ne jamais afficher de spinner plein écran pour un feed déjà connu.
- Ne jamais laisser un skeleton tourner sans limite.
- Ne jamais provoquer de saut visuel majeur.
- Ne jamais autoplay en Low Data.
- Toujours charger texte avant vidéo.
- Toujours proposer audio ou résumé quand vidéo échoue.
- Toujours privilégier stabilité et lisibilité.

---

*Performance perçue : skeletons, placeholders, médias et autoplay réduit pour MAATFEED*
