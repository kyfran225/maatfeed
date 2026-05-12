# 5. AUDIO OFFLINE, TÉLÉCHARGEMENT AUDIO & TÉLÉCHARGEMENT DE SÉRIES

## 1. OBJECTIF UX

L'audio offline est un pilier MAATFEED. L'utilisateur doit pouvoir télécharger un audio, une réponse audio, un épisode ou une série entière pour écouter plus tard, dans le transport, pendant une coupure ou avec data limitée.
L'audio doit être le média de résistance de MAATFEED.

## 2. ÉMOTION RECHERCHÉE

L'audio offline doit donner :

- liberté ;
- intimité ;
- autonomie ;
- continuité ;
- sensation de bibliothèque personnelle.

L'utilisateur doit sentir que le savoir peut l'accompagner même sans écran actif.

## 3. STRUCTURE VISUELLE GLOBALE

Zones audio offline :

- carte audio dans feed ;
- full audio player ;
- page série ;
- bibliothèque personnelle ;
- page offline ;
- paramètres stockage.

Le téléchargement doit être visible mais jamais envahissant.

## 4. LAYOUT EXACT

Dans le lecteur audio complet :

- titre en haut ;
- artwork/symbole au centre ;
- waveform ;
- contrôles lecture ;
- bouton télécharger proche des actions ;
- statut local sous le titre ou près du bouton.

Dans une page série :

- bouton "Télécharger la série" ;
- liste épisodes avec statut individuel ;
- option "audio seulement" ;
- progression globale.

## 5. HIERARCHIE VISUELLE

Priorité :

- lecture ;
- progression ;
- téléchargement ;
- queue ;
- options secondaires.

Le bouton télécharger ne doit jamais remplacer le bouton play.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Bouton téléchargement audio :

- dans l'action row ;
- à droite des favoris ou sauvegarde ;
- icône flèche bas ;
- statut check après succès.

Progression téléchargement :

- barre fine sous titre ou sous carte ;
- pour série, barre globale en haut de liste.

## 7. DIMENSIONS & ESPACEMENTS

Bouton icône :

- zone tactile : 44 px ;
- icône : 20 à 22 px ;
- radius : cercle ou capsule.

Barre progression :

- hauteur : 4 à 6 px ;
- radius complet ;
- largeur carte complète moins padding.

Carte épisode :

- hauteur : 64 à 84 px ;
- bouton statut à droite ;
- texte sur deux lignes maximum.

## 8. COULEURS

Audio offline :

- bouton téléchargement : contour ambre ;
- état téléchargé : fond ambre doux ou check or ;
- état en cours : ambre animé ;
- état erreur : rouge argile ;
- état Wi-Fi attente : beige-gris.

Le player doit garder son ambiance nocturne, intime, presque radiophonique.

## 9. TYPOGRAPHIE

Libellés :

- "Télécharger"
- "Téléchargé"
- "En attente de Wi-Fi"
- "Série disponible hors connexion"
- "3 épisodes sur 8"
- "Audio léger"

Texte clair, très court, orienté bénéfice.

## 10. BOUTONS

Boutons spécifiques :

- "Télécharger l'audio"
- "Télécharger la série"
- "Télécharger les nouveaux épisodes"
- "Audio seulement"
- "Supprimer les audios locaux"
- "Reprendre l'écoute"

Les boutons importants doivent être accessibles à une main.

## 11. CARTES

Carte audio offline :

- titre ;
- source/créateur ;
- durée ;
- progression d'écoute ;
- statut téléchargement ;
- action rapide.

Carte série offline :

- couverture sombre ;
- nombre d'épisodes ;
- progression ;
- taille estimée ;
- statut global.

## 12. ICONOGRAPHIE

Icônes :

- casque ;
- flèche bas ;
- check ;
- pause téléchargement ;
- file d'attente ;
- Wi-Fi ;
- stockage ;
- horloge.

Ne jamais utiliser une icône "cloud" seule sans précision, car elle peut créer confusion avec sauvegarde distante.

## 13. COMPORTEMENT SCROLL

Dans série :

- header série peut rester sticky ;
- progression téléchargement visible ;
- épisodes scrollables ;
- statut de chaque épisode stable.

Dans bibliothèque :

- audios récents en haut ;
- séries ensuite ;
- filtre "non écouté" utile.

## 14. ANIMATIONS

Téléchargement :

- progression douce ;
- pas de spinner agressif ;
- check final ;
- micro-pulse sur "disponible offline".

Passage mini-player/full-player :

- conserver le statut offline visible ;
- aucune rupture de lecture.

## 15. MICRO INTERACTIONS

Micro-interactions :

- tap téléchargement démarre ;
- second tap ouvre options ;
- long press propose qualité ;
- fin téléchargement affiche petite confirmation ;
- erreur propose reprise.

Pour série :

- téléchargement épisode par épisode visible ;
- annulation possible ;
- pause automatique si batterie faible ou data faible selon préférence.

## 16. GESTURES MOBILE

Gestes :

- swipe épisode pour télécharger/supprimer ;
- long press sur série pour options offline ;
- swipe up mini-player vers full-player ;
- swipe down retour player compact.

Gestures toujours cohérentes avec le système audio global.

## 17. ÉTATS LOADING

Chargement audio :

- metadata d'abord ;
- waveform simplifiée ensuite ;
- audio buffer affiché discrètement ;
- statut offline disponible immédiatement si connu.

Téléchargement :

- "préparation" très court ;
- "en cours" avec pourcentage ou progression ;
- "terminé" clair.

## 18. ÉTATS ERREUR

Erreurs possibles :

- espace insuffisant ;
- fichier indisponible ;
- connexion interrompue ;
- épisode retiré ;
- téléchargement partiel.

Messages :

- "Téléchargement interrompu. Il reprendra au retour du réseau."
- "Espace insuffisant. Libère du stockage ou choisis audio léger."

## 19. ÉTATS OFFLINE

En offline :

- play immédiat pour audios locaux ;
- player complet utilisable ;
- queue locale disponible ;
- progression d'écoute sauvegardée localement ;
- sync de progression au retour réseau.

Si un audio non téléchargé est ouvert :

- afficher alternative ;
- proposer contenus similaires disponibles offline.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Mobile :

- audio offline prioritaire ;
- contrôles larges ;
- download simple.

Tablette :

- player + liste épisodes côte à côte ;
- statut série visible.

Desktop :

- panneau queue ;
- bibliothèque offline détaillée ;
- téléchargement moins central mais présent.

## 21. ACCESSIBILITÉ

Audio offline doit supporter :

- labels de boutons ;
- durée lisible ;
- statut téléchargement annoncé ;
- contrôles clavier ;
- vitesse de lecture accessible ;
- captions/transcriptions si disponibles.

## 22. PERFORMANCE UX

L'audio doit :

- précharger intelligemment ;
- éviter fichiers trop lourds ;
- proposer qualité légère ;
- reprendre sans délai ;
- ne pas bloquer le feed.

Le player doit rester stable même quand le feed recharge.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Prioriser :

- audio compressé ;
- téléchargement sur Wi-Fi ;
- reprise automatique ;
- séries en lots ;
- lecture écran éteint quand possible ;
- économie batterie.

Le système doit reconnaître que l'audio est souvent plus réaliste que la vidéo.

## 24. RÈGLES NON NÉGOCIABLES

- Ne jamais interrompre une lecture audio pour une sync.
- Ne jamais supprimer un audio téléchargé sans action claire.
- Ne jamais cacher l'état de téléchargement.
- Toujours proposer audio léger quand vidéo lourde.
- Toujours sauvegarder progression localement.
- Toujours permettre reprise après coupure.
- Toujours traiter l'audio comme média prioritaire MAATFEED.

---

*Audio offline, téléchargement audio et téléchargement de séries pour MAATFEED*
