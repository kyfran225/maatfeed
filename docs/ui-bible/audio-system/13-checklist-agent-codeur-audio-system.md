# 13. CHECKLIST AGENT CODEUR — AUDIO SYSTEM

## Vision générale

L'agent codeur doit implémenter un Audio System MAATFEED cohérent, permanent et transversal.

À respecter :

- audio intégré au feed
- audio intégré aux débats
- mini-player global
- full-player immersif
- queue
- playlists
- continue listening
- offline
- faible connexion
- reprise fiable
- desktop sticky
- accessibilité

## Mini-player

À valider :

- apparaît après lancement audio
- reste au-dessus de la bottom nav
- affiche titre, source, progression, play/pause
- ouvre le full-player
- ne masque pas les actions principales
- garde l'audio pendant navigation interne

## Full-player

À valider :

- ouverture fluide depuis mini-player
- fermeture vers mini-player
- waveform visible
- contrôles principaux accessibles
- vitesse
- timer
- téléchargement
- queue
- transcription
- source/contexte
- état offline

## Feed audio

À valider :

- cartes audio distinctes
- play immédiat
- durée visible
- waveform ou barre visible
- état actif
- mini-player déclenché
- pas d'autoplay sonore sauvage

## Débats audio

À valider :

- audio replies lisibles
- transcription accessible
- retour à la réponse depuis player
- thread non cassé
- actions visibles
- modération disponible

## Queue et playlists

À valider :

- queue persistante
- piste active visible
- ajout/retrait clair
- continue listening fiable
- playlists sauvegardées
- téléchargements visibles

## Offline et faible connexion

À valider :

- audio téléchargé lisible sans réseau
- progression locale
- reprise locale
- mode léger
- cache transcription
- messages réseau non agressifs

## Performance

À valider :

- pas de chargement de tous les audios du feed
- waveform légère
- thumbnails compressées
- player isolé
- re-render minimal
- desktop stable

## Accessibilité

À valider :

- boutons 44 px minimum
- labels
- focus
- clavier desktop
- transcription
- contraste
- alternatives aux gestures

## Règles finales

L'audio MAATFEED ne doit jamais être traité comme une fonctionnalité secondaire.
Il est une colonne vertébrale de l'expérience : feed, débat, apprentissage, séries, créateurs, IA et monétisation.

---

*Checklist de validation pour l'implémentation Audio System*
