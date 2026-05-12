# 4. NOTIFICATIONS AUDIO

## 1. OBJECTIF UX

Ramener l'utilisateur vers ses écoutes importantes : audio commencé, nouvel audio d'un créateur suivi, réponse audio dans un débat, playlist mise à jour, téléchargement terminé, audio premium disponible.

## 2. ÉMOTION RECHERCHÉE

Continuité d'écoute.

L'utilisateur doit sentir que MAATFEED garde le fil sonore de son apprentissage.

## 3. STRUCTURE VISUELLE GLOBALE

Types :

- continuer l'écoute
- nouvel audio
- réponse audio à ton débat
- playlist mise à jour
- audio téléchargé
- audio indisponible
- recommandation audio
- audio premium
- résumé audio généré

## 4. LAYOUT EXACT

Carte audio :

- bouton play à gauche
- titre audio
- créateur ou débat lié
- durée
- progression si commencé
- mini-waveform
- action reprendre

Si mini-player actif, notification audio doit pouvoir s'y connecter sans conflit.

## 5. HIERARCHIE VISUELLE

Priorité :

1. audio en cours ou interrompu
2. réponse audio directe
3. nouvel audio suivi
4. téléchargement terminé
5. recommandation
6. premium

## 6. POSITIONNEMENT DES ÉLÉMENTS

Le bouton play doit être immédiatement visible.

La progression doit être sous le titre ou en bas de carte.

Le contexte doit être visible : débat, série ou créateur.

## 7. DIMENSIONS & ESPACEMENTS

- carte audio : 96 à 132 px
- bouton play : 42 à 48 px
- waveform : hauteur 22 à 30 px
- progression : 4 px
- padding : 14 à 16 px

## 8. COULEURS

### Audio :

- onde cuivre/or
- fond noir chaud
- progression ambre
- téléchargé : badge beige/or
- indisponible : gris chaud

## 9. TYPOGRAPHIE

- titre : 14 à 16 px
- contexte : 12 à 13 px
- durée : 11 à 12 px
- progression texte : 11 px

## 10. BOUTONS

Actions :

- reprendre
- écouter
- télécharger
- retirer téléchargement
- ouvrir débat lié
- ouvrir série
- ajouter à queue
- masquer recommandation

## 11. CARTES

La carte audio doit être reconnaissable sans image.

Éléments obligatoires :

- play
- titre
- contexte
- durée ou progression
- état réseau/offline si applicable

## 12. ICONOGRAPHIE

- play
- pause si preview active
- onde
- casque
- téléchargement
- horloge
- queue
- série audio

## 13. COMPORTEMENT SCROLL

Si une notification audio est jouée depuis la liste, elle ne doit pas faire quitter l'écran automatiquement.

Le mini-player global prend le relais.

## 14. ANIMATIONS

- waveform animée seulement si lecture active
- progression fluide
- transition vers mini-player
- téléchargement avec progression discrète

## 15. MICRO INTERACTIONS

- tap play : lecture immédiate
- tap titre : détail audio
- long press : ajouter à queue
- téléchargement terminé : coche douce
- audio indisponible : explication courte

## 16. GESTURES MOBILE

- swipe pour sauvegarder
- long press queue
- tap play large
- pull-to-refresh

## 17. ÉTATS LOADING

Skeleton audio :

- bouton rond
- lignes titre
- waveform fantôme
- durée fantôme

## 18. ÉTATS ERREUR

Cas :

- audio supprimé
- audio indisponible
- lecture impossible
- téléchargement échoué

Actions :

- réessayer
- ouvrir version texte si disponible
- retirer de la liste
- mode faible données

## 19. ÉTATS OFFLINE

Offline :

- audio téléchargé lisible
- audio non téléchargé grisé
- queue offline disponible
- progression synchronisée plus tard

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :

- carte compacte

### Tablet :

- carte plus large avec waveform

### Desktop :

- preview audio dans panneau droit
- actions au hover

## 21. ACCESSIBILITÉ

- bouton play nommé
- durée annoncée
- progression lisible
- contrôle clavier
- pas de waveform comme seule info

## 22. PERFORMANCE UX

- ne pas charger waveform réelle avant besoin
- metadata d'abord
- audio streaming adaptatif
- téléchargement contrôlé
- pas d'autoplay notification

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- proposer basse qualité
- téléchargement Wi-Fi si possible
- preview courte
- texte avant audio
- reprise fiable

## 24. RÈGLES NON NÉGOCIABLES

- L'audio est un contenu majeur
- Le play doit être visible
- Pas d'autoplay
- Le mini-player ne doit jamais être cassé
- Offline audio prioritaire
- Progression toujours respectée

---

*Notifications audio pour MAATFEED*
