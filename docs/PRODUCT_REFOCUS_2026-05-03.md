# MAATFEED - Recentrage Produit

Date : 2026-05-03

## Direction

MAATFEED doit rester un feed simple en surface. L'utilisateur ne doit pas avoir l'impression d'entrer dans une plateforme scolaire, de lire un mode d'emploi ou de suivre un tunnel pédagogique.

La valeur doit venir de l'intelligence cachée :

- repérer ce que l'utilisateur a vu, compris, oublié ou laissé de côté ;
- faire revenir le bon contenu au bon moment ;
- corriger une réponse quand il participe ;
- transformer un contenu en prochaine action utile ;
- proposer l'audio comme format court, contextualisé et reprenable ;
- garder la communauté comme lieu d'échange, pas comme salle de classe.

Phrase cible :

> Les gens reviennent sur MAATFEED parce qu'ils apprennent mieux ici qu'ailleurs.

## Règles d'interface

- Ne pas expliquer ce que l'utilisateur voit déjà.
- Éviter les titres génériques comme "contenus à regarder", "produire une idée", "choisir une difficulté".
- Préférer des libellés courts : "Vu", "Plus tard", "Ouvrir", "Corriger", "Tendances".
- Laisser l'IA travailler derrière les actions naturelles.
- Garder les pages lisibles rapidement, surtout sur mobile.

## Ce qui a changé

- Accueil : feed en cartes, progression discrète, actions rapides.
- Découvrir : recherche plus directe, moins de texte d'accompagnement.
- Audio : mise en avant des pistes, moments clés et section "Plus tard".
- Échanges : correction IA au moment où l'utilisateur répond.
- SEO et navigation : vocabulaire plus sobre, moins scolaire.
- API : ajout de `/api/learning/progress` et `/api/learning/coach`.
- Feed ranking : influencé par la progression d'apprentissage (boost pour révision).
- Audio bookmarks : "Plus tard" persisté côté serveur pour utilisateurs connectés.
- Quiz discrets : modale légère générée depuis le contenu, sans pédagogie visible.

## Architecture ajoutée

Backend :

- `LearningProgress` stocke l'état d'un contenu par utilisateur.
- `learningProgressService` calcule la prochaine révision et appelle l'IA coach.
- `learningProgressRoutes` expose la progression et le coach IA.
- `SavedAudioTrack` modèle pour persister les bookmarks audio.
- `quizService` génère des questions IA depuis le contenu.
- `audioBookmarkController` gère les bookmarks côté API.

Frontend :

- `learningProgressService` consomme l'API learning.
- `FeedPage` synchronise la progression pour les comptes connectés et garde un fallback local.
- `CommunityPage` appelle le coach IA pour corriger une réponse.
- `AudioPage` garde localement les pistes à reprendre.
- `QuizModal` modale discrète pour vérification compréhension.
- `audioBookmarkService` persiste les "Plus tard" côté serveur.

## Prochain dur nécessaire

- Mesurer : retour à J7, contenu repris, correction utilisée, audio terminé.
- Affiner le ranking learning-based selon les retours réels.
- Étendre le suivi audio avec position d'écoute persistée.
