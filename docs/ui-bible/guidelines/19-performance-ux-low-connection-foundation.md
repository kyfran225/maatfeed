# 19. PERFORMANCE UX & LOW-CONNECTION FOUNDATION

## 1. OBJECTIF UX

Adapter MAATFEED aux réalités d'usage en Afrique : connexions variables, données mobiles limitées, téléphones modestes, navigation rapide entre contenus.

## 2. ÉMOTION RECHERCHÉE

Fiabilité, légèreté, respect du forfait data. L'utilisateur doit sentir que l'app est intelligente et ne gaspille pas ses ressources.

## 3. STRUCTURE VISUELLE GLOBALE

Priorité de chargement : shell, texte, miniatures légères, audio, vidéo, images haute qualité, animations secondaires.

## 4. LAYOUT EXACT

Mode léger accessible dans paramètres. Indicateur qualité média dans player. Option télécharger audio/vidéo/document. Fallback audio pour contenus vidéo quand disponible.

## 5. HIERARCHIE VISUELLE

Le texte et l'audio sont les piliers de continuité. La vidéo enrichit, mais ne doit pas bloquer l'accès au savoir.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Les options "économiser les données", "télécharger", "écouter seulement" doivent être visibles dans player et paramètres, pas cachées trop profond.

## 7. DIMENSIONS & ESPACEMENTS

Les placeholders doivent réserver l'espace pour éviter les sauts. Les médias doivent indiquer taille/durée quand utile.

## 8. COULEURS

Indicateurs réseau : gris/ambre. Ne pas utiliser rouge sauf panne réelle. Offline n'est pas une catastrophe, c'est un mode.

## 9. TYPOGRAPHIE

Messages courts : "Mode léger activé", "Vidéo chargée en qualité réduite", "Audio disponible hors ligne".

## 10. BOUTONS

Boutons utiles : "Écouter l'audio", "Télécharger", "Réessayer", "Voir en basse qualité", "Lire la transcription".

## 11. CARTES

Cartes feed doivent rester interactives sans vidéo chargée. Poster + titre + actions + audio si possible.

## 12. ICONOGRAPHIE

Icônes data, téléchargement, offline, qualité, cache. Toujours sobres.

## 13. COMPORTEMENT SCROLL

Ne pas précharger trop de vidéos. Précharger léger uniquement prochain contenu probable. Pause médias hors viewport.

## 14. ANIMATIONS

Mode low-power réduit animations non essentielles. Désactiver parallax, blur fort, shimmer excessif.

## 15. MICRO INTERACTIONS

Feedback immédiat local pour actions. Synchronisation plus tard visible par petit badge.

## 16. GESTURES MOBILE

Gestures restent fluides même si média charge. Drag/scroll jamais bloqués par réseau.

## 17. ÉTATS LOADING

Chargement par étapes. Après délai court, afficher option mode léger ou réessayer.

## 18. ÉTATS ERREUR

Erreur réseau : proposer alternatives. Ne pas juste dire "échec".

## 19. ÉTATS OFFLINE

Cache feed récent, audios téléchargés, brouillons, messages non envoyés, favoris, historique. Synchronisation automatique au retour réseau.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Mobile data prioritaire. Desktop peut charger plus, mais respecter mode économie si activé.

## 21. ACCESSIBILITÉ

Le mode léger aide aussi l'accessibilité. Transcriptions et textes courts doivent rester disponibles.

## 22. PERFORMANCE UX

Images adaptatives. Lazy-load. Réserver ratios. Préférer audio compressé. Différer scripts lourds. Minimiser re-renders visuels.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Comportement par défaut : prudent sur data. Ne jamais autoplay vidéo lourde sans contexte. L'audio doit rester la voie royale de consommation longue.

## 24. RÈGLES NON NÉGOCIABLES

- Pas d'écran bloqué à cause d'une vidéo
- Pas d'autoplay agressif sur réseau faible
- Pas de perte de brouillon
- Pas de rechargement complet inutile

---

*Fondation performance pour les connexions modestes*
