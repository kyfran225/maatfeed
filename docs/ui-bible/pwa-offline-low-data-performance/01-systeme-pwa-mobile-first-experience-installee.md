# 1. SYSTÈME PWA MOBILE-FIRST & EXPÉRIENCE INSTALLÉE

## 1. OBJECTIF UX

Le système PWA doit faire ressentir MAATFEED comme une vraie application mobile installée, pas comme un site web posé dans un navigateur. L'utilisateur doit pouvoir ouvrir MAATFEED depuis son écran d'accueil, retrouver son feed rapidement, écouter un audio, reprendre un débat, consulter une série ou accéder à ses contenus sauvegardés sans friction.

L'objectif est de créer une expérience légère, fiable, rapide et rassurante, surtout pour les utilisateurs qui ne veulent pas télécharger une application lourde depuis un store.

## 2. ÉMOTION RECHERCHÉE

L'utilisateur doit ressentir :

- confiance ;
- rapidité ;
- possession personnelle de l'application ;
- proximité ;
- stabilité ;
- élégance silencieuse.

L'installation doit donner l'impression que MAATFEED devient un espace personnel de savoir, posé sur le téléphone comme un carnet sacré moderne, pas comme un raccourci web banal.

## 3. STRUCTURE VISUELLE GLOBALE

L'expérience PWA repose sur trois couches :

- couche navigateur : première visite, détection installation possible ;
- couche invitation : prompt élégant, discret, contextualisé ;
- couche installée : interface plein écran, sans chrome navigateur visible, avec transitions plus natives.

L'UI doit toujours conserver le fond noir charbon, les accents or/ambre, les cartes profondes, les icônes symboliques et les micro-signaux de statut.

## 4. LAYOUT EXACT

### Sur mobile :

- largeur fluide de 100% ;
- contenu principal entre 16 px et 20 px de marge latérale ;
- header compact de 56 à 64 px ;
- bottom nav entre 68 et 76 px ;
- respect strict des safe areas haut/bas ;
- aucun élément critique collé au bord inférieur.

### En mode installé :

- le header devient plus app-like ;
- le logo MAATFEED peut être légèrement plus présent ;
- les contrôles navigateur disparaissent ;
- le contenu gagne une sensation immersive.

## 5. HIERARCHIE VISUELLE

La hiérarchie doit être :

- contenu principal ;
- statut réseau ou PWA ;
- actions essentielles ;
- invitation installation ;
- détails secondaires.

Le prompt d'installation ne doit jamais dominer le contenu. Il doit accompagner, pas interrompre. MAATFEED ne doit pas hurler "installe-moi", mais murmurer : "garde-moi avec toi".

## 6. POSITIONNEMENT DES ÉLÉMENTS

Le prompt d'installation doit apparaître :

- en bottom sheet légère sur mobile ;
- en petite carte flottante sur tablette ;
- en panneau discret côté droit sur desktop.

Position mobile recommandée :

- bottom sheet au-dessus de la bottom nav ;
- marge latérale 16 px ;
- radius 24 px ;
- hauteur entre 180 et 260 px ;
- bouton principal en bas de la sheet.

Dans le feed, un petit badge "Installable" peut apparaître temporairement dans le header ou dans le menu profil, jamais en plein milieu du scroll.

## 7. DIMENSIONS & ESPACEMENTS

### Prompt mobile :

- padding interne : 18 à 22 px ;
- icône app : 52 à 64 px ;
- titre : 20 à 22 px ;
- description : 14 à 15 px ;
- bouton principal : hauteur 48 à 52 px ;
- bouton secondaire : hauteur 40 à 44 px ;
- écart entre blocs : 12 à 16 px.

### Icône PWA :

- version écran d'accueil : lisible à petite taille ;
- fond sombre ;
- symbole MAAT ou marque MAATFEED en ambre/or ;
- aucun détail trop fin.

## 8. COULEURS

### Palette PWA :

- fond principal : noir charbon profond ;
- surface sheet : noir brun premium ;
- bordure : ambre très faible opacité ;
- texte principal : ivoire doux ;
- texte secondaire : beige-gris ;
- bouton principal : ambre/or ;
- texte bouton principal : noir profond ;
- bouton secondaire : surface sombre bordée ;
- badge installé : vert discret ou or doux, jamais flashy.

L'installation doit s'intégrer dans l'identité MAATFEED, pas utiliser un bleu système générique.

## 9. TYPOGRAPHIE

Le prompt d'installation utilise une typographie claire, courte, humaine :

- titre fort : "Installer MAATFEED" ;
- sous-texte : "Accède plus vite à tes débats, audios et séries, même avec une connexion instable." ;
- micro-texte : "Application légère. Pas besoin de store."

Le ton doit être rassurant, direct, africain-concret, sans jargon technique.

## 10. BOUTONS

### Bouton principal :

- libellé : "Installer l'app" ;
- plein, ambre/or ;
- radius 999 px ou 18 px selon système global ;
- icône discrète de téléchargement ou téléphone.

### Bouton secondaire :

- libellé : "Plus tard" ;
- transparent ;
- texte beige-gris ;
- jamais culpabilisant.

### Option menu :

- "Pourquoi installer ?" peut ouvrir une micro-explication en accordéon.

## 11. CARTES

La carte d'installation doit ressembler à une carte MAATFEED :

- surface sombre ;
- halo ambre subtil ;
- icône app à gauche ou centrée selon espace ;
- mini-liste de bénéfices ;
- aucune illustration lourde ;
- aucun visuel générique type smartphone cartoon.

Sur desktop, la carte peut apparaître dans la colonne droite sous "Continuer l'écoute".

## 12. ICONOGRAPHIE

Icônes recommandées :

- téléphone avec étoile ;
- éclair doux pour rapidité ;
- nuage barré pour offline ;
- casque pour audio ;
- marque-page pour sauvegarde ;
- symbole MAAT abstrait pour identité.

Toutes les icônes doivent être linéaires, fines, arrondies, avec accents ambre. Éviter les icônes système trop froides.

## 13. COMPORTEMENT SCROLL

Le prompt d'installation ne doit pas casser le scroll.
Règles :

- apparition après engagement, pas au premier pixel ;
- éviter l'affichage dès l'arrivée ;
- déclencher après quelques interactions utiles ;
- disparaître au scroll vers le bas ;
- rester accessible dans les paramètres.

En feed, si l'utilisateur scrolle rapidement, aucune invitation ne doit apparaître au milieu de l'élan.

## 14. ANIMATIONS

### Animation d'apparition :

- montée douce depuis le bas ;
- fondu très léger ;
- durée courte ;
- aucun rebond enfantin.

### Animation d'installation acceptée :

- le logo MAATFEED se contracte légèrement ;
- petit halo or ;
- feedback "App prête" ;
- retour immédiat au contenu.

L'effet doit être premium, pas "pop-up marketing".

## 15. MICRO INTERACTIONS

Micro-interactions :

- bouton principal réagit avec un léger press ;
- icône app peut pulser une seule fois ;
- bénéfices apparaissent ligne par ligne ;
- fermeture garde une trace : ne pas reproposer trop vite ;
- après installation, afficher une confirmation sobre.

Message post-installation :
"MAATFEED est prêt sur ton écran d'accueil."

## 16. GESTURES MOBILE

Gestes :

- swipe down pour fermer la sheet ;
- tap extérieur pour fermer, sauf pendant action ;
- bouton retour système ferme d'abord le prompt ;
- aucune gesture conflictuelle avec le feed vidéo/audio.

La bottom sheet doit respecter la logique mobile naturelle : elle monte, elle se baisse, elle ne piège pas.

## 17. ÉTATS LOADING

Pendant détection d'installation :

- ne pas afficher de loader global ;
- utiliser un état silencieux ;
- afficher le prompt seulement quand l'installation est réellement disponible.

Pendant installation :

- bouton passe en état "Préparation…" ;
- spinner discret intégré au bouton ;
- pas d'écran bloquant.

## 18. ÉTATS ERREUR

Erreur installation :

- message court ;
- ton calme ;
- pas de jargon.

Exemple :
"L'installation n'a pas pu se lancer. Tu peux toujours ajouter MAATFEED depuis le menu de ton navigateur."

Ne jamais afficher une erreur technique brute.

## 19. ÉTATS OFFLINE

Si l'utilisateur est offline au moment du prompt :

- ne pas proposer l'installation active ;
- afficher plutôt : "MAATFEED peut fonctionner plus vite une fois installé."
- garder l'action désactivée ou reportée.

En mode installé et offline, l'app doit ouvrir une vraie page utile, pas une page navigateur morte.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :

- bottom sheet compacte ;
- une action principale ;
- texte très court.

### Tablette :

- carte centrée ou latérale ;
- illustration symbolique possible ;
- deux colonnes légères.

### Desktop :

- panneau latéral ;
- invitation moins prioritaire ;
- peut se placer dans profil ou paramètres.

## 21. ACCESSIBILITÉ

Le prompt doit :

- être lisible au lecteur d'écran ;
- avoir un titre clair ;
- proposer une fermeture accessible ;
- supporter navigation clavier sur desktop ;
- respecter les contrastes ;
- ne pas dépendre uniquement de la couleur.

Les états "installable", "installé", "offline" doivent être annoncés par texte, pas seulement par icône.

## 22. PERFORMANCE UX

La PWA doit donner une sensation d'ouverture instantanée :

- shell app chargé vite ;
- dernier écran restauré ;
- feed visible rapidement ;
- skeletons courts ;
- audio mini-player disponible tôt ;
- assets critiques légers.

L'utilisateur ne doit jamais attendre une grosse animation de lancement.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Priorités Afrique :

- installer sans store ;
- relancer vite ;
- consommer peu de data ;
- permettre audio et lecture sauvegardée ;
- éviter les rechargements inutiles ;
- informer clairement quand quelque chose est disponible offline.

Les mots doivent être simples : "mode économie", "disponible hors connexion", "à synchroniser", "reprendre plus tard".

## 24. RÈGLES NON NÉGOCIABLES

- Ne jamais afficher un prompt intrusif dès la première seconde.
- Ne jamais bloquer le feed pour demander l'installation.
- Ne jamais utiliser une esthétique navigateur générique.
- Ne jamais confondre PWA installée et simple raccourci visuel.
- Toujours préserver bottom nav, mini-player et safe areas.
- Toujours permettre de retrouver l'installation dans les paramètres.
- Toujours traiter l'installation comme un bénéfice utilisateur, pas comme une conversion forcée.

---

*Système PWA mobile-first et expérience installée pour MAATFEED*
