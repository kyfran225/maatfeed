# 4. CACHE INTELLIGENT : FEED, AUDIO, SÉRIES, DÉBATS, SOURCES & DOCUMENTS

## 1. OBJECTIF UX

Le cache intelligent doit permettre à MAATFEED de rester vivant entre deux connexions. Il ne s'agit pas seulement de stocker des fichiers, mais de préserver l'expérience : contexte, progression, écoute, lecture, débats, séries, sources et actions.
L'utilisateur doit retrouver ce qu'il consultait sans ressentir la mécanique technique derrière.

## 2. ÉMOTION RECHERCHÉE

L'émotion recherchée :

- continuité ;
- mémoire ;
- confort ;
- confiance ;
- impression que l'application "se souvient".

Le cache doit agir comme une bibliothèque personnelle invisible.

## 3. STRUCTURE VISUELLE GLOBALE

Le cache est visible dans trois endroits :

- badges sur contenus ;
- bibliothèque offline ;
- paramètres de stockage.

Il agit sur :

- feed récent ;
- audios écoutés ;
- audios téléchargés ;
- séries suivies ;
- débats ouverts ;
- sources consultées ;
- documents sauvegardés.

## 4. LAYOUT EXACT

Bibliothèque offline :

- header "Hors connexion" ;
- filtres horizontaux : Tous, Audios, Séries, Débats, Sources, Brouillons ;
- liste verticale de cartes ;
- jauge stockage en haut ou bas ;
- action "Gérer".

Sur contenu :

- badge discret "Disponible offline" ;
- bouton téléchargement ;
- statut progression ;
- option supprimer.

## 5. HIERARCHIE VISUELLE

Priorité cache :

- contenus explicitement téléchargés ;
- contenus en cours ;
- contenus récemment consultés ;
- contenus recommandés à sauvegarder ;
- cache temporaire invisible.

L'utilisateur doit distinguer ce qu'il a choisi de garder et ce que l'app a gardé temporairement.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Badge local :

- bas gauche ou haut droit de la carte ;
- proche du type média ;
- jamais sur le titre principal.

Bouton téléchargement :

- près des actions secondaires ;
- dans menu "plus" pour ne pas saturer ;
- visible dans lecteur audio et série.

Jauge stockage :

- page paramètres offline ;
- bibliothèque offline ;
- jamais dans le feed principal sauf alerte.

## 7. DIMENSIONS & ESPACEMENTS

Badge :

- hauteur : 24 à 28 px ;
- padding : 8 à 10 px ;
- radius : 999 px ;
- texte : 12 px.

Carte cache :

- hauteur : 84 à 120 px selon média ;
- thumbnail : 56 à 72 px ;
- padding : 14 à 16 px ;
- gap : 12 px.

Jauge stockage :

- hauteur : 6 à 8 px ;
- radius plein ;
- légende courte en dessous.

## 8. COULEURS

Statuts cache :

- téléchargé : or doux ;
- en cours : ambre animé léger ;
- temporaire : gris chaud ;
- erreur : rouge argile ;
- supprimable : beige-gris.

Le cache ne doit pas ressembler à un gestionnaire de fichiers Android. Il doit rester éditorial et culturel.

## 9. TYPOGRAPHIE

Libellés :

- "Téléchargé"
- "Disponible hors connexion"
- "Cache temporaire"
- "À garder"
- "Supprimer du téléphone"
- "Téléchargement en attente"
- "Audio complet disponible"

Le vocabulaire doit être humain. Éviter "asset", "storage quota", "cache invalidé".

## 10. BOUTONS

Actions :

- "Télécharger"
- "Garder hors connexion"
- "Supprimer localement"
- "Télécharger la série"
- "Audio seulement"
- "Voir hors connexion"

Les actions destructives doivent être secondaires et confirmées si elles suppriment plusieurs éléments.

## 11. CARTES

Carte audio cache :

- artwork réduit ;
- titre ;
- créateur ;
- durée ;
- progression ;
- statut local.

Carte série cache :

- couverture ;
- nombre d'épisodes disponibles ;
- prochain épisode ;
- bouton continuer.

Carte débat cache :

- titre ;
- nombre de réponses sauvegardées ;
- dernière ouverture ;
- statut sources.

Carte document :

- icône document ;
- taille ;
- disponibilité ;
- date de sauvegarde.

## 12. ICONOGRAPHIE

Icônes :

- flèche bas ;
- check local ;
- disque discret ;
- casque ;
- pile de cartes série ;
- bulle débat ;
- document ;
- balai pour nettoyage cache.

Icônes toujours cohérentes avec l'épaisseur du design system.

## 13. COMPORTEMENT SCROLL

Bibliothèque offline :

- scroll vertical simple ;
- filtres sticky sous header ;
- pas d'infinite scroll inutile ;
- groupes par type ou récence ;
- fin de liste claire.

Feed :

- le cache ne doit pas provoquer de rechargement visible ;
- contenus déjà cache doivent apparaître instantanément.

## 14. ANIMATIONS

Téléchargement :

- anneau de progression discret ;
- barre fine sous carte ;
- transformation vers check une fois terminé.

Suppression :

- carte s'efface doucement ;
- option annuler pendant quelques secondes.

Cache automatique :

- aucune animation visible sauf badge léger.

## 15. MICRO INTERACTIONS

Micro-interactions :

- tap badge ouvre détails disponibilité ;
- long press carte ouvre options offline ;
- swipe carte offline propose supprimer ;
- téléchargement terminé vibre légèrement si autorisé ;
- erreur téléchargement propose retry.

## 16. GESTURES MOBILE

Gestes :

- swipe gauche pour options ;
- long press pour menu ;
- pull-to-refresh pour vérifier mises à jour ;
- drag sur mini-player conservé même offline.

Le cache ne doit jamais perturber la lecture audio.

## 17. ÉTATS LOADING

Chargement bibliothèque offline :

- skeletons de cartes locales très courts ;
- accès immédiat aux derniers contenus ;
- pas de spinner plein écran.

Téléchargement :

- état "en attente Wi-Fi" ;
- état "en cours" ;
- état "interrompu" ;
- état "terminé".

## 18. ÉTATS ERREUR

Erreurs :

- stockage insuffisant ;
- média indisponible ;
- téléchargement interrompu ;
- document non sauvegardé ;
- série partielle.

Chaque erreur doit proposer :

- retry ;
- supprimer anciens éléments ;
- télécharger audio seulement ;
- attendre Wi-Fi.

## 19. ÉTATS OFFLINE

En offline :

- contenus téléchargés pleinement actifs ;
- contenus temporaires accessibles selon disponibilité ;
- documents sauvegardés lisibles ;
- débats avec réponses cache consultables ;
- actions nouvelles mises en attente.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Mobile :

- bibliothèque compacte ;
- actions dans menus ;
- jauge simple.

Tablette :

- grille légère ;
- panneau détail à droite.

Desktop :

- vue plus documentaire ;
- colonnes par type ;
- gestion stockage plus explicite.

## 21. ACCESSIBILITÉ

Chaque statut doit être textuel :

- "Téléchargé"
- "En cours de téléchargement"
- "Disponible hors connexion"
- "Non disponible hors connexion"

Les barres de progression doivent avoir une alternative textuelle.

## 22. PERFORMANCE UX

Le cache doit :

- accélérer le premier affichage ;
- éviter rechargement répétitif ;
- limiter data ;
- préserver progression ;
- nettoyer intelligemment sans surprendre.

Le nettoyage automatique ne doit jamais supprimer un contenu explicitement téléchargé sans consentement clair.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Le cache doit favoriser :

- audios ;
- séries éducatives ;
- débats importants ;
- sources légères ;
- textes longs ;
- reprises d'écoute.

Les vidéos doivent proposer "audio seulement" ou "qualité légère" avant téléchargement lourd.

## 24. RÈGLES NON NÉGOCIABLES

- Ne jamais supprimer automatiquement un téléchargement volontaire.
- Ne jamais mélanger cache temporaire et sauvegarde utilisateur.
- Ne jamais cacher la taille des médias lourds.
- Toujours indiquer les contenus disponibles offline.
- Toujours permettre nettoyage contrôlé.
- Toujours prioriser audio et texte en connexion faible.
- Toujours préserver progression et contexte.

---

*Cache intelligent : feed, audio, séries, débats, sources et documents pour MAATFEED*
