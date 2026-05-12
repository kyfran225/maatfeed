# 1. VISION GLOBALE DU NOTIFICATIONS, INBOX & ACTIVITY SYSTEM

## 1. OBJECTIF UX

Créer un système complet qui centralise toutes les activités importantes de l'utilisateur sans provoquer de fatigue cognitive.

Le système doit permettre à l'utilisateur de comprendre rapidement :

- ce qui demande une action
- ce qui est simplement informatif
- ce qui est prioritaire
- ce qui peut attendre
- ce qui appartient aux débats
- ce qui appartient aux audios
- ce qui appartient aux séries
- ce qui appartient aux créateurs
- ce qui concerne la sécurité ou la modération

La notification MAATFEED doit être un fil d'Ariane, pas une sirène.

## 2. ÉMOTION RECHERCHÉE

L'utilisateur doit ressentir :

- contrôle
- clarté
- calme
- importance
- continuité
- respect de son attention

L'inbox ne doit pas donner l'impression d'un tas de messages en retard. Elle doit ressembler à une table de lecture organisée, où chaque signal a sa place.

## 3. STRUCTURE VISUELLE GLOBALE

Le système se divise en quatre couches :

- badge global dans la navigation
- centre de notifications
- inbox intelligente
- centre d'activité détaillé

Sur mobile, l'accès principal se fait par une icône dans la bottom nav ou dans le header selon la structure finale de l'application.

Sur desktop, un panneau latéral ou une page dédiée peut afficher les notifications, avec un espace plus riche pour l'activité.

## 4. LAYOUT EXACT

### Sur mobile :

- icône notification dans le header ou la bottom nav
- badge discret sur l'icône
- écran Notifications en une colonne
- onglets en haut : "Tout", "Débats", "Audios", "Créateurs", "Séries", "Système"
- liste verticale groupée
- actions rapides sur chaque notification
- zone de filtres courte
- bouton "Tout marquer comme lu" discret

### Sur desktop :

- colonne gauche : catégories
- centre : liste notifications
- droite : détail ou résumé activité
- possibilité de preview sans quitter l'écran
- actions au hover
- raccourcis clavier possibles

## 5. HIERARCHIE VISUELLE

La hiérarchie doit être :

1. notifications critiques ou action requise
2. mentions et réponses directes
3. débats suivis
4. séries et créateurs suivis
5. audios à reprendre
6. recommandations contextuelles
7. informations système
8. notifications anciennes

Le système doit éviter de mettre une simple recommandation au même niveau qu'une réponse directe à l'utilisateur.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Le badge doit être visible mais non agressif.

L'écran Notifications doit commencer par :

- titre
- résumé rapide
- filtres
- notifications prioritaires
- notifications groupées

Les actions secondaires doivent être cachées derrière un menu discret ou révélées au long press/hover.

## 7. DIMENSIONS & ESPACEMENTS

### Mobile :

- header : 56 à 64 px
- onglets : 38 à 44 px
- carte notification compacte : 72 à 96 px
- notification riche : 108 à 148 px
- padding horizontal : 16 px
- gap entre notifications : 10 à 12 px
- radius carte : 18 à 24 px
- badge : 16 à 20 px

### Desktop :

- colonne gauche : 220 à 260 px
- colonne centrale : 520 à 720 px
- colonne droite : 300 à 360 px
- notification : 80 à 140 px
- espace entre colonnes : 24 à 32 px

## 8. COULEURS

Palette :

- fond principal : noir charbon
- cartes : graphite chaud
- non lu : surface légèrement plus lumineuse avec liseré ambre
- lu : surface plus mate
- critique : cuivre profond, jamais rouge criard
- système : gris chaud
- premium/soutien : or doux
- débat : ambre profond
- audio : cuivre/or ondulé
- sécurité : ocre contrôlé

Le non-lu ne doit pas être flashy. Il doit être évident sans crier.

## 9. TYPOGRAPHIE

### Mobile :

- titre page : 22 à 26 px
- notification titre : 14 à 16 px
- extrait : 13 à 14 px
- métadonnées : 11 à 12 px
- badge catégorie : 11 à 12 px

### Desktop :

- titre page : 28 à 34 px
- notification titre : 15 à 17 px
- extrait : 13 à 15 px

Les textes de notification doivent être courts, humains et actionnables.

## 10. BOUTONS

Boutons principaux :

- ouvrir
- répondre
- écouter
- reprendre
- voir débat
- voir série
- suivre
- marquer comme lu
- masquer
- désactiver ce type
- gérer préférences

Les boutons ne doivent pas surcharger la carte. Sur mobile, l'action principale peut être la carte entière, avec actions secondaires dans un menu.

## 11. CARTES

Chaque notification est une carte vivante mais sobre.

Elle contient :

- icône ou avatar symbolique
- titre court
- contexte
- temps relatif
- état lu/non lu
- catégorie
- action principale
- éventuel aperçu média

Les cartes ne doivent pas toutes avoir la même densité. Une notification critique ou directe peut être plus riche qu'une simple info.

## 12. ICONOGRAPHIE

Icônes possibles :

- cloche
- bulle débat
- onde audio
- série/chapitre
- sceau créateur
- étoile IA
- bouclier modération
- papyrus/source
- soutien/premium
- réponse
- mention
- téléchargement/offline

Les icônes doivent rester fines, or désaturé ou beige, jamais façon application générique multicolore.

## 13. COMPORTEMENT SCROLL

La liste doit scroller verticalement.

### Sur mobile :

- header peut rester sticky
- filtres peuvent rester sticky sous le header
- bouton "Tout marquer comme lu" ne doit pas coller lourdement
- mini-player audio doit rester respecté

### Sur desktop :

- catégories sticky
- liste centrale scrollable
- détail droit sticky

## 14. ANIMATIONS

Animations recommandées :

- apparition progressive des nouvelles notifications
- passage lu vers lu avec fade doux
- suppression avec glissement horizontal
- groupement qui se déploie verticalement
- badge qui se met à jour sans rebond excessif
- ouverture détail avec transition calme

Aucune animation ne doit créer un effet de réseau social nerveux.

## 15. MICRO INTERACTIONS

- tap notification : ouverture immédiate
- long press : actions rapides
- swipe : marquer lu ou masquer
- hover desktop : actions secondaires
- badge lu : disparition douce
- notification nouvelle : liseré ambre temporaire
- notification audio : mini-waveform subtile

## 16. GESTURES MOBILE

Gestes recommandés :

- swipe gauche : marquer comme lu
- swipe droite : sauvegarder ou garder pour plus tard
- long press : menu actions
- pull-to-refresh
- tap catégorie : filtrer
- swipe entre onglets
- tap badge global : ouvrir Notifications

Chaque geste doit avoir une alternative visible.

## 17. ÉTATS LOADING

Loading :

- skeleton header
- skeleton onglets
- skeleton notifications
- skeleton badge
- placeholders par type : audio, débat, série, créateur

Ne jamais afficher un grand spinner vide.

## 18. ÉTATS ERREUR

Erreurs possibles :

- notifications indisponibles
- impossible de marquer lu
- connexion instable
- notification supprimée
- contenu lié introuvable

Messages calmes :

- "Impossible de charger toutes les notifications."
- "Certaines activités ne sont pas disponibles."
- "Le contenu lié n'existe plus ou a été retiré."

Toujours proposer une action : réessayer, voir activité locale, passer en mode léger.

## 19. ÉTATS OFFLINE

Offline :

- afficher notifications déjà synchronisées
- indiquer qu'elles ne sont peut-être pas à jour
- permettre lecture des éléments déjà chargés
- garder les actions en attente
- marquer localement comme lu puis synchroniser plus tard

L'offline doit être traité comme un mode normal de MAATFEED.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :

- une colonne
- onglets horizontaux
- actions compactes

### Tablet :

- deux colonnes possibles
- liste + détail

### Desktop :

- trois zones
- filtres visibles
- preview riche
- hover complet

## 21. ACCESSIBILITÉ

Obligatoire :

- état lu/non lu lisible sans couleur seule
- labels pour icônes
- focus visible
- navigation clavier
- annonces lecteur d'écran pour nouvelles notifications
- réduction motion
- contraste fort
- actions destructives confirmées

## 22. PERFORMANCE UX

Priorités :

- badge chargé rapidement
- liste récente en cache
- pagination
- groupement côté données
- lazy-load previews média
- pas de miniature lourde par défaut
- notifications push résumées
- éviter recalculs inutiles

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- afficher cache d'abord
- limiter images
- texte prioritaire
- synchronisation différée
- actions offline en file
- push léger
- pas de média autoplay
- possibilité mode faible données

## 24. RÈGLES NON NÉGOCIABLES

- Les notifications ne doivent pas devenir du bruit
- La priorité doit être claire
- Les débats directs passent avant les recommandations
- Les audios à reprendre doivent être visibles
- Le badge doit rester discret
- L'offline doit rester utile
- Aucun design SaaS froid
- Aucun rouge agressif pour tout
- Aucune notification sponsorisée déguisée
- L'utilisateur doit garder le contrôle

---

*Vision globale du Notifications, Inbox & Activity System pour MAATFEED*
