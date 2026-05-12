# 18. FEED OFFLINE & MODE LÉGER

## 1. OBJECTIF UX

Préserver une expérience utile et digne quand la connexion est lente, instable ou absente.

## 2. ÉMOTION RECHERCHÉE

Sécurité, respect, calme. L'utilisateur doit sentir que MAATFEED comprend son contexte réel.

## 3. STRUCTURE VISUELLE GLOBALE

Bandeau offline discret, feed cache, contenus téléchargés, brouillons, actions en attente, mode économie data.

## 4. LAYOUT EXACT

Bandeau offline : 36-44 px sous header ou au-dessus bottom nav.
Sections offline : cartes "À écouter", "Vus récemment", "Brouillons".
Badges sync : petits points ou labels sur actions en attente.

## 5. HIERARCHIE VISUELLE

Ne pas dramatiser. Montrer ce qui marche. Les contenus disponibles doivent primer sur l'erreur réseau.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Bandeau en haut si l'utilisateur navigue. Indicateur sync sur actions/cartes concernées. Mode léger accessible depuis paramètres et player.

## 7. DIMENSIONS & ESPACEMENTS

Bandeau : padding 12-16 px. Label offline : 12-13 px. Badges : 6-10 px ou pill 22 px.

## 8. COULEURS

Bandeau graphite sombre, accent ambre. Pas de rouge sauf perte critique.

## 9. TYPOGRAPHIE

Messages courts : "Hors ligne", "Contenus sauvegardés disponibles", "Actions en attente".

## 10. BOUTONS

"Réessayer", "Mode léger", "Voir téléchargements", "Synchroniser".

## 11. CARTES

Cartes offline marquées : téléchargé, vu récemment, brouillon, en attente. Les médias absents montrent poster ou icône.

## 12. ICONOGRAPHIE

Wifi off, téléchargement, cache, horloge sync, data saver.

## 13. COMPORTEMENT SCROLL

Le feed cache reste scrollable. Infinite scroll affiche fin offline proprement.

## 14. ANIMATIONS

Passage offline : slide/fade bandeau. Retour online : toast discret, sync badges disparaissent progressivement.

## 15. MICRO INTERACTIONS

Tap action offline : feedback "sera synchronisé". Tap téléchargement : état file d'attente.

## 16. GESTURES MOBILE

Aucun geste spécifique. Pull refresh réessaie réseau.

## 17. ÉTATS LOADING

Quand connexion revient : sync en arrière-plan, pas de blocage plein écran.

## 18. ÉTATS ERREUR

Si sync échoue : garder action en attente et proposer réessayer. Ne pas perdre données.

## 19. ÉTATS OFFLINE

État principal : feed cache + audio téléchargé + brouillons. Mode léger réduit vidéos et images lourdes.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Desktop : indicateur offline dans top bar/sidebar. Mobile : bandeau compact.

## 21. ACCESSIBILITÉ

État offline annoncé. Actions disponibles/indisponibles explicites.

## 22. PERFORMANCE UX

Mode léger désactive préchargements lourds, réduit animations, limite images haute résolution.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

C'est un mode central, pas secondaire. L'audio, le texte, les miniatures et les brouillons sont prioritaires.

## 24. RÈGLES NON NÉGOCIABLES

Pas de perte de brouillon. Pas d'écran bloqué. Pas de vidéo obligatoire. Pas de messages culpabilisants sur la connexion.

---

*Feed offline et mode léger pour MAATFEED*
