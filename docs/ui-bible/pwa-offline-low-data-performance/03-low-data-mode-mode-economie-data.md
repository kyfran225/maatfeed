# 3. LOW DATA MODE : MODE ÉCONOMIE DE DATA

## 1. OBJECTIF UX

Le Low Data Mode permet à l'utilisateur de réduire sa consommation sans dégrader l'identité MAATFEED. Le but est de rendre le savoir accessible quand chaque mégaoctet compte.
Ce mode doit être visible, simple, activable, compréhensible et réversible.

## 2. ÉMOTION RECHERCHÉE

L'utilisateur doit ressentir :

- soulagement ;
- contrôle ;
- respect de son budget data ;
- intelligence de l'app ;
- absence de culpabilité.

L'app doit dire implicitement : "Je comprends ton contexte."

## 3. STRUCTURE VISUELLE GLOBALE

Le Low Data Mode agit sur :

- médias vidéo ;
- audio ;
- images ;
- feed ;
- autoplay ;
- préchargement ;
- recommandations ;
- téléchargements ;
- synchronisation.

Visuellement, il est représenté par une capsule "Mode économie" et des états médias allégés.

## 4. LAYOUT EXACT

Entrées d'activation :

- prompt automatique quand connexion faible détectée ;
- bouton dans paramètres ;
- raccourci dans menu profil ;
- option dans lecteur vidéo/audio ;
- option dans page offline.

Sur le feed :

- les cartes vidéo affichent une image fixe optimisée ;
- les cartes audio restent prioritaires ;
- les documents montrent aperçu léger ;
- les débats chargent texte d'abord.

## 5. HIERARCHIE VISUELLE

En Low Data Mode :

- texte ;
- audio compressé ;
- images légères ;
- vidéo manuelle ;
- animations réduites ;
- recommandations secondaires différées.

Les éléments lourds doivent attendre une intention claire.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Capsule Low Data :

- en haut du feed pendant activation ;
- dans le menu profil en état persistant ;
- dans les lecteurs média comme petit badge ;
- dans les paramètres offline.

Sur carte média :

- badge "Économie" en haut à droite ;
- bouton "Charger la vidéo" au centre ;
- indication taille estimée si pertinente.

## 7. DIMENSIONS & ESPACEMENTS

Capsule :

- hauteur : 30 à 34 px ;
- radius : 999 px ;
- padding horizontal : 12 px ;
- icône : 14 à 16 px ;
- texte : 13 px.

Bouton média manuel :

- hauteur : 44 à 48 px ;
- largeur adaptable ;
- minimum tactile 44 px ;
- placé sur overlay sombre.

## 8. COULEURS

Low Data :

- badge ambre doux ;
- fond brun très sombre ;
- bordure or à faible opacité ;
- texte ivoire ;
- icône éclair ou feuille stylisée en or doux.

Éviter le vert écologique générique qui casserait l'univers MAATFEED.

## 9. TYPOGRAPHIE

Libellés :

- "Mode économie activé"
- "Vidéo non chargée pour économiser la data"
- "Charger quand même"
- "Audio léger disponible"
- "Images réduites"

Ton direct, sans explication technique excessive.

## 10. BOUTONS

Actions principales :

- "Activer"
- "Désactiver"
- "Charger ce média"
- "Toujours charger sur Wi-Fi"
- "Télécharger en audio seulement"

Boutons de carte média :

- plein ambre pour action volontaire ;
- contour sombre pour option secondaire ;
- jamais trop nombreux.

## 11. CARTES

Carte vidéo en Low Data :

- thumbnail compressée ;
- overlay sombre ;
- bouton lecture manuel ;
- badge taille ou qualité ;
- option audio seule si disponible.

Carte audio :

- waveform simplifiée ;
- pas de gros artwork ;
- bouton play immédiat ;
- qualité réduite indiquée discrètement.

Carte débat :

- texte complet prioritaire ;
- réponses vidéo réduites ;
- réponses audio disponibles si légères.

## 12. ICONOGRAPHIE

Icônes :

- signal faible ;
- éclair doux ;
- data réduite ;
- casque ;
- image compressée ;
- vidéo verrouillée par intention ;
- nuage local.

Chaque icône doit rester fine, élégante, symbolique.

## 13. COMPORTEMENT SCROLL

Le scroll devient plus fluide :

- moins d'autoplay ;
- moins de chargement progressif lourd ;
- images chargées tard ;
- cartes texte et audio priorisées ;
- pas de saut de hauteur après chargement.

Les placeholders doivent réserver l'espace pour éviter les secousses visuelles.

## 14. ANIMATIONS

Animations réduites :

- pas de grands effets de parallaxe ;
- transitions courtes ;
- shimmer skeleton très léger ;
- désactivation des animations non essentielles ;
- micro-feedback conservé.

Le mode économie doit économiser aussi l'attention et la batterie.

## 15. MICRO INTERACTIONS

Micro-interactions :

- bascule Low Data avec feedback "activé" ;
- média chargé manuellement conserve ce choix pour la session ;
- appui long sur vidéo propose "charger audio seulement" ;
- badge explique le mode au tap ;
- désactivation demande confirmation seulement si data faible détectée.

## 16. GESTURES MOBILE

Gestes :

- tap pour charger média ;
- long press pour options data ;
- swipe sur capsule pour masquer ;
- pull-to-refresh plus prudent, avec message "chargement léger".

Le scroll vertical doit rester prioritaire.

## 17. ÉTATS LOADING

Loading Low Data :

- texte d'abord ;
- média ensuite ;
- pas de spinner central long ;
- skeletons minimalistes ;
- affichage progressif par priorité.

Un contenu textuel doit pouvoir apparaître même si les médias ne sont pas encore prêts.

## 18. ÉTATS ERREUR

Erreur média :

- "Média trop lourd pour la connexion actuelle."
- "Lecture audio légère disponible."
- "Réessaie sur Wi-Fi ou charge manuellement."

L'erreur doit proposer une alternative, pas une impasse.

## 19. ÉTATS OFFLINE

En offline + Low Data :

- afficher contenus téléchargés ;
- masquer contenus non disponibles ;
- proposer nettoyage cache ;
- empêcher lancement de médias non locaux ;
- montrer "Disponible localement".

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Mobile :

- priorité absolue ;
- activation visible ;
- contrôles simples.

Tablette :

- panneau de préférences rapides ;
- aperçu des économies.

Desktop :

- mode toujours disponible mais moins intrusif ;
- option par connexion ;
- gestion avancée cache.

## 21. ACCESSIBILITÉ

Low Data doit être :

- activable clavier ;
- compréhensible sans couleur ;
- annoncé par texte ;
- compatible lecteur d'écran ;
- non dépendant d'animations.

Les boutons "charger quand même" doivent être clairement nommés.

## 22. PERFORMANCE UX

Le mode doit réduire :

- autoplay ;
- préchargement vidéo ;
- images haute résolution ;
- animations ;
- requêtes secondaires ;
- scripts non critiques.

La performance perçue doit augmenter dès l'activation.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Ce mode doit être pensé comme un usage quotidien, pas comme une option cachée.
Priorités :

- audio plutôt que vidéo ;
- texte plutôt que image ;
- préchargement intelligent sur Wi-Fi ;
- contrôle par l'utilisateur ;
- transparence sur ce qui consomme.

## 24. RÈGLES NON NÉGOCIABLES

- Ne jamais autoplay une vidéo lourde en Low Data.
- Ne jamais cacher le mode dans un sous-menu profond.
- Ne jamais réduire la lisibilité du contenu.
- Ne jamais supprimer l'audio important.
- Toujours proposer une alternative légère.
- Toujours garder l'utilisateur maître du chargement.
- Toujours préserver l'esthétique premium même en mode allégé.

---

*Low Data Mode : mode économie de data pour MAATFEED*
