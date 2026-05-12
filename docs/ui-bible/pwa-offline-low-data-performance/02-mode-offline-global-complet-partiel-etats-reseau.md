# 2. MODE OFFLINE GLOBAL : COMPLET, PARTIEL & ÉTATS RÉSEAU

## 1. OBJECTIF UX

Le mode offline doit transformer une panne de connexion en situation maîtrisée. L'utilisateur doit comprendre immédiatement :

- ce qui reste accessible ;
- ce qui est temporairement indisponible ;
- quelles actions seront envoyées plus tard ;
- quels contenus sont déjà sauvegardés.

L'objectif n'est pas de faire semblant que tout fonctionne. L'objectif est de garder MAATFEED utile, honnête et calme.

## 2. ÉMOTION RECHERCHÉE

Le ressenti recherché :

- "Je ne suis pas perdu."
- "L'app a prévu mon contexte."
- "Je peux continuer à apprendre."
- "Mes actions ne vont pas disparaître."

L'offline doit être traité comme une continuité, pas comme une rupture brutale.

## 3. STRUCTURE VISUELLE GLOBALE

Le système offline repose sur quatre niveaux :

- connecté : expérience normale ;
- connexion faible : réduction intelligente ;
- offline partiel : contenus cache disponibles, actions différées ;
- offline complet : mode bibliothèque locale, brouillons, audios téléchargés, pages minimales.

Visuellement, chaque niveau doit être identifiable mais discret.

## 4. LAYOUT EXACT

### Indicateur réseau global :

- bandeau mince en haut ou capsule sous header ;
- hauteur 28 à 36 px ;
- jamais plus grand qu'un message système ;
- texte court ;
- icône réseau.

### En offline complet :

- page dédiée "Disponible hors connexion" ;
- sections verticales ;
- accès rapide aux audios, séries, débats sauvegardés, brouillons ;
- bouton "Réessayer" discret.

## 5. HIERARCHIE VISUELLE

Ordre de priorité :

- contenus disponibles offline ;
- actions en attente ;
- état réseau ;
- options d'économie de data ;
- contenus indisponibles.

Le message offline ne doit pas être plus important que le contenu réellement accessible.

## 6. POSITIONNEMENT DES ÉLÉMENTS

### Bandeau réseau :

- sous le header principal ;
- au-dessus des tabs ;
- sticky pendant quelques secondes ;
- rétractable en petite puce.

### Page offline :

- header : "Hors connexion" ;
- sous-texte rassurant ;
- cartes de contenu local ;
- file d'actions ;
- bouton retry en bas ou dans header.

## 7. DIMENSIONS & ESPACEMENTS

### Bandeau :

- padding horizontal : 12 à 16 px ;
- radius : 999 px si capsule ;
- marge : 12 à 16 px ;
- icône : 16 px ;
- texte : 13 à 14 px.

### Cartes offline :

- hauteur minimale : 76 à 96 px ;
- padding : 14 à 18 px ;
- radius : 18 à 22 px ;
- espacement entre cartes : 10 à 12 px.

## 8. COULEURS

### États réseau :

- connecté : vert très discret, presque neutre ;
- faible connexion : ambre doux ;
- offline : brun/or sombre ;
- erreur sync : rouge argile sobre ;
- action en attente : bleu nuit ou ambre grisé.

Aucune couleur ne doit devenir criarde. Même l'erreur doit rester MAATFEED, pas panneau de danger de dashboard.

## 9. TYPOGRAPHIE

Messages courts :

- "Connexion instable"
- "Mode hors connexion"
- "3 actions en attente"
- "Ce débat sera envoyé au retour du réseau"
- "Audio disponible hors connexion"

Le ton doit être informatif, jamais dramatique.

## 10. BOUTONS

Boutons offline :

- "Réessayer"
- "Voir mes contenus hors connexion"
- "Activer le mode économie"
- "Gérer les téléchargements"
- "Envoyer maintenant"

Les boutons doivent être courts, tactiles, lisibles, avec hiérarchie claire entre action principale et secondaire.

## 11. CARTES

Cartes offline recommandées :

- carte audio téléchargé ;
- carte série sauvegardée ;
- carte débat consulté récemment ;
- carte brouillon ;
- carte action en attente.

Chaque carte affiche :

- icône format ;
- titre ;
- statut offline ;
- taille approximative si média ;
- dernière disponibilité ;
- action rapide.

## 12. ICONOGRAPHIE

Icônes réseau :

- nuage barré ;
- signal faible ;
- flèche sync ;
- horloge attente ;
- check local ;
- casque offline ;
- document sauvegardé.

Ne jamais utiliser une icône seule sans texte explicatif.

## 13. COMPORTEMENT SCROLL

En offline :

- le feed ne doit pas charger infiniment ;
- afficher seulement contenus disponibles ;
- éviter skeletons interminables ;
- fin de liste claire : "Fin des contenus disponibles hors connexion".

En retour réseau :

- ne pas repositionner brutalement l'utilisateur ;
- synchroniser en arrière-plan ;
- afficher une capsule de retour réseau.

## 14. ANIMATIONS

Transitions réseau :

- connecté vers faible : capsule glisse doucement ;
- faible vers offline : fondu + changement texte ;
- retour réseau : check discret ;
- sync terminée : micro-halo autour des actions envoyées.

Éviter les animations longues qui consomment batterie et GPU.

## 15. MICRO INTERACTIONS

Micro-interactions :

- appui sur bandeau ouvre détails réseau ;
- appui sur action en attente montre statut ;
- contenu offline affiche un petit check local ;
- retour réseau affiche "Synchronisation en cours" puis disparaît ;
- action envoyée passe de "en attente" à "envoyée".

## 16. GESTURES MOBILE

Gestes :

- pull-to-refresh en offline déclenche "Recherche de connexion…" ;
- swipe sur action en attente pour annuler, seulement si action annulable ;
- long press sur contenu local pour gérer téléchargement ;
- swipe down sur panneau réseau pour fermer.

Aucune gesture offline ne doit supprimer une donnée sans confirmation.

## 17. ÉTATS LOADING

En connexion faible :

- skeletons courts ;
- chargement progressif ;
- priorité texte avant médias ;
- audio avant vidéo ;
- mini-player avant recommandations.

En offline :

- pas de skeleton infini ;
- afficher immédiatement le contenu local ;
- remplacer les zones non disponibles par placeholders explicatifs.

## 18. ÉTATS ERREUR

Erreur réseau :

- message contextualisé ;
- action claire ;
- pas de code technique.

Exemples :

- "Ce contenu n'est pas encore disponible hors connexion."
- "La réponse sera publiée dès que la connexion revient."
- "Impossible de charger la vidéo maintenant. Version audio disponible."

## 19. ÉTATS OFFLINE

### Offline complet :

- feed local ;
- bibliothèque téléchargée ;
- brouillons ;
- actions en attente ;
- recherche légère ;
- paramètres offline.

### Offline partiel :

- contenus récents accessibles ;
- médias lourds réduits ;
- actions sociales différées ;
- publication mise en file.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :

- offline centré sur action rapide ;
- bandeau compact ;
- bottom sheet de détails.

### Tablette :

- page offline en deux colonnes ;
- contenu local à gauche ;
- actions en attente à droite.

### Desktop :

- barre réseau en haut ;
- panneau latéral "Sync & offline" ;
- bibliothèque locale plus détaillée.

## 21. ACCESSIBILITÉ

Les changements réseau doivent :

- être annoncés sans spam ;
- avoir des textes lisibles ;
- ne pas dépendre de l'animation ;
- fonctionner clavier ;
- rester compréhensibles pour lecteurs d'écran.

Les badges "offline" doivent avoir des labels textuels.

## 22. PERFORMANCE UX

Offline doit réduire :

- requêtes inutiles ;
- rechargements ;
- autoplay ;
- images lourdes ;
- vidéos non prioritaires.

MAATFEED doit préférer afficher une carte partielle utile plutôt qu'un écran vide parfait.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Dans beaucoup de contextes, la connexion peut être :

- intermittente ;
- chère ;
- lente le soir ;
- instable selon zone ;
- différente entre Wi-Fi et data mobile.

L'UI doit donc être humble : elle anticipe les coupures et garde l'utilisateur en contrôle.

## 24. RÈGLES NON NÉGOCIABLES

- Ne jamais perdre une réponse rédigée.
- Ne jamais effacer un brouillon offline.
- Ne jamais afficher un feed vide sans explication.
- Ne jamais lancer une vidéo lourde en connexion faible sans intention utilisateur.
- Toujours montrer ce qui est disponible.
- Toujours expliquer ce qui attend le réseau.
- Toujours restaurer l'utilisateur à son contexte après retour connexion.

---

*Mode offline global : complet, partiel et états réseau pour MAATFEED*
