# MAAT FEED

Monorepo MAATFEED : feed culturel simple en surface, avec une intelligence d'apprentissage discrète derrière.

## Espaces de travail

- `apps/api`: API Express, jobs, orchestration IA, cache et services de données
- `apps/web`: Client React/Vite pour le feed, découvrir, échanges, audio et profils
- `packages/shared`: Types partagés, constantes, schémas et utilitaires de scoring
- `infra`: Scripts d'exécution locale et opérationnels

## Statut actuel

- Feed web actif avec progression discrète et score feed influencé par l'historique d'apprentissage
- Audio, échanges, découvrir et profil actifs
- API learning ajoutée pour progression, quiz discrets et coach IA
- Audio "Plus tard" persisté côté API pour les utilisateurs connectés
- IA utilisée pour aider au moment du blocage, pas comme gadget conversationnel

## Prochaines étapes

- mesurer les reprises, corrections et retours utilisateur
- affiner le ranking learning-based en fonction des retours réels
- étendre le suivi audio côté utilisateur avec position d'écoute
