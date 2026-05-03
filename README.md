# MAAT FEED

Monorepo MAATFEED : feed culturel simple en surface, avec une intelligence d'apprentissage discrète derrière.

## Espaces de travail

- `apps/api`: API Express, jobs, orchestration IA, cache et services de données
- `apps/web`: Client React/Vite pour le feed, découvrir, échanges, audio et profils
- `packages/shared`: Types partagés, constantes, schémas et utilitaires de scoring
- `infra`: Scripts d'exécution locale et opérationnels

## Statut actuel

- Feed web actif avec progression discrète
- Audio, échanges, découvrir et profil actifs
- API learning ajoutée pour progression et coach IA
- IA utilisée pour aider au moment du blocage, pas comme gadget conversationnel

## Prochaines étapes

- brancher la progression sur le ranking du feed
- persister les marques audio côté API
- ajouter des quiz courts générés depuis les contenus
- mesurer les reprises, corrections et retours utilisateur
