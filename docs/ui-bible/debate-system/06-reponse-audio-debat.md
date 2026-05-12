# 6. RÉPONSE AUDIO DANS UN DÉBAT

## 1. OBJECTIF UX

Permettre aux utilisateurs de répondre par la voix et de consommer les arguments audio directement dans le débat.

## 2. ÉMOTION RECHERCHÉE

Présence humaine, intimité, oralité africaine moderne. L'audio doit donner une chaleur que le texte ne peut pas toujours transmettre.

## 3. STRUCTURE VISUELLE GLOBALE

Carte réponse avec auteur, court résumé ou transcription, waveform, durée, bouton play, actions. L'audio peut être écouté inline ou via mini-player.

## 4. LAYOUT EXACT

En-tête auteur : 40 à 48 px.
Bloc audio : hauteur 64 à 96 px.
Waveform : hauteur 28 à 40 px.
Bouton play : 40 à 48 px.
Durée : à droite de la waveform ou sous elle.

## 5. HIERARCHIE VISUELLE

Play et waveform dominent. Résumé/transcription courte rassure. Auteur reste visible.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Play à gauche ou droite du bloc audio selon style choisi. Waveform au centre. Durée à droite. Transcription sous bloc audio, repliée par défaut si longue.

## 7. DIMENSIONS & ESPACEMENTS

Padding bloc audio : 12 px.
Radius bloc audio : 14 à 18 px.
Écart bloc/transcription : 10 px.
Écart actions : 8 à 12 px.

## 8. COULEURS

Waveform inactive gris chaud. Progression or. Bloc audio noir élevé avec halo faible si lecture active. Bouton play or ou sombre avec icône or.

## 9. TYPOGRAPHIE

Titre/résumé : 14 à 15 px.
Transcription : 13 à 14 px.
Durée : 12 px.
Auteur : 13 px.

## 10. BOUTONS

Play/pause, vitesse, transcription, répondre, citer audio, sauvegarder. Le bouton vitesse peut rester dans menu si manque d'espace.

## 11. CARTES

Réponse audio active : bordure or faible, waveform animée, mini indicateur "En lecture".

## 12. ICONOGRAPHIE

Micro, play, pause, onde, transcription, citation audio, vitesse.

## 13. COMPORTEMENT SCROLL

L'audio peut continuer quand la carte sort du viewport. Mini-player affiche la réponse audio active. La carte active reste marquée si visible.

## 14. ANIMATIONS

Waveform animée pendant lecture. Progression fluide. Passage inline vers mini-player doux.

## 15. MICRO INTERACTIONS

Tap waveform : seek. Tap transcription : développer. Tap citer : ajoute référence audio au composer.

## 16. GESTURES MOBILE

Swipe up mini-player pour full player. Long press audio : options. Tap long sur transcription : citer texte.

## 17. ÉTATS LOADING

Waveform placeholder. Bouton play loading si buffering. Transcription peut charger après audio.

## 18. ÉTATS ERREUR

Audio indisponible : afficher transcription ou résumé si disponible. Bouton réessayer. Ne pas supprimer la réponse.

## 19. ÉTATS OFFLINE

Audio téléchargé lisible. Audio non téléchargé : transcription visible si cache. Réponse audio enregistrée offline reste brouillon.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Desktop : audio peut s'ajouter au player global avec queue de réponses. Waveform plus large.

## 21. ACCESSIBILITÉ

Durée, bouton play, transcription. Ne jamais rendre l'audio seul indispensable.

## 22. PERFORMANCE UX

Audio léger, streaming progressif. Waveform simplifiée si nécessaire. Pas de préchargement massif de toutes les réponses audio.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Audio prioritaire sur vidéo. Précharger petit segment. Proposer téléchargement en Wi-Fi. Transcription comme fallback.

## 24. RÈGLES NON NÉGOCIABLES

Pas de réponse audio sans durée. Pas d'audio qui coupe la navigation. Pas d'absence de fallback texte quand transcription existe.

---

*Réponse audio pour le débat MAATFEED*
