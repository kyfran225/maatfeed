# 6. BROUILLONS OFFLINE, PUBLICATION DIFFÉRÉE, FILE DE SYNCHRONISATION & ACTIONS EN ATTENTE

## 1. OBJECTIF UX

L'utilisateur doit pouvoir écrire une réponse, enregistrer un audio, préparer un débat, commenter, sauvegarder, liker ou publier sans perdre son effort quand la connexion tombe.
La file de synchronisation doit rendre les actions offline visibles, compréhensibles et récupérables.

## 2. ÉMOTION RECHERCHÉE

L'émotion principale : sécurité.
L'utilisateur doit penser :

- "Mon texte est gardé."
- "Mon audio n'est pas perdu."
- "Je peux continuer."
- "L'app enverra quand ce sera possible."

## 3. STRUCTURE VISUELLE GLOBALE

Le système se compose de :

- brouillons locaux ;
- actions sociales en attente ;
- publications différées ;
- uploads médias en attente ;
- sync queue ;
- centre de résolution d'erreurs.

L'UI doit être claire sans devenir technique.

## 4. LAYOUT EXACT

Entrées visibles :

- badge dans composer ;
- section "Brouillons" dans profil ;
- section "Actions en attente" dans page offline ;
- capsule réseau "3 actions à synchroniser".

Dans composer :

- statut sous la zone de saisie ;
- sauvegarde automatique discrète ;
- bouton publication adapté : "Publier au retour du réseau".

## 5. HIERARCHIE VISUELLE

Priorité :

- contenu utilisateur non envoyé ;
- médias enregistrés ;
- réponses à publier ;
- likes/sauvegardes ;
- logs secondaires invisibles.

Les créations longues doivent être protégées plus fortement que les micro-actions.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Composer offline :

- statut sous champ ;
- bouton principal en bas ;
- badge offline près du titre ;
- option annuler dans menu.

File sync :

- page dédiée accessible depuis bandeau réseau ;
- cartes action empilées ;
- statut à droite ;
- action retry/annuler en menu.

## 7. DIMENSIONS & ESPACEMENTS

Carte action en attente :

- hauteur : 72 à 110 px ;
- padding : 14 à 16 px ;
- icône type action : 20 px ;
- statut : capsule 24 px ;
- menu : zone 44 px.

Composer status :

- hauteur 24 à 32 px ;
- texte 12 à 13 px ;
- icône 14 px.

## 8. COULEURS

Statuts sync :

- brouillon sauvegardé : or doux ;
- en attente : ambre ;
- synchronisation : ambre animé ;
- envoyé : vert discret ;
- erreur : rouge argile ;
- conflit : violet/brun sobre.

Aucune couleur ne doit donner l'impression d'un bug catastrophique.

## 9. TYPOGRAPHIE

Libellés :

- "Brouillon sauvegardé"
- "Sera publié au retour du réseau"
- "En attente d'envoi"
- "Synchronisation…"
- "Envoyé"
- "Action à revoir"

Toujours préférer des verbes humains à des statuts techniques.

## 10. BOUTONS

Boutons :

- "Publier plus tard"
- "Envoyer maintenant"
- "Modifier"
- "Annuler"
- "Réessayer"
- "Garder en brouillon"

Action destructive :

- "Supprimer le brouillon" avec confirmation claire.

## 11. CARTES

Carte brouillon :

- type : débat, réponse, audio, vidéo, document ;
- titre ou extrait ;
- date ;
- statut ;
- destination ;
- action continuer.

Carte action sociale :

- action courte ;
- contenu concerné ;
- état ;
- retry si erreur.

## 12. ICONOGRAPHIE

Icônes :

- plume ;
- micro ;
- bulle ;
- horloge ;
- sync ;
- check ;
- alerte douce ;
- archive brouillon.

L'icône doit aider à comprendre le type d'action en une seconde.

## 13. COMPORTEMENT SCROLL

Liste des actions :

- groupée par statut ;
- actions récentes en haut ;
- erreurs à résoudre visibles ;
- actions envoyées peuvent se réduire automatiquement.

Composer :

- ne jamais réinitialiser au scroll ;
- garder contenu en mémoire même en navigation interne.

## 14. ANIMATIONS

Sync :

- flèche circulaire lente ;
- transition attente → envoi → envoyé ;
- carte envoyée se compacte ;
- erreur tremblement très léger, pas alarmiste.

Sauvegarde brouillon :

- petit check près du texte ;
- disparition après quelques secondes.

## 15. MICRO INTERACTIONS

Micro-interactions :

- chaque saisie longue déclenche sauvegarde locale silencieuse ;
- retour réseau déclenche sync visible ;
- tap statut ouvre détails ;
- retry montre progression ;
- annulation demande confirmation si contenu long.

## 16. GESTURES MOBILE

Gestes :

- swipe brouillon pour supprimer ;
- swipe action pour annuler si possible ;
- long press pour options ;
- pull-to-refresh sync ;
- back button ferme composer seulement après sauvegarde.

## 17. ÉTATS LOADING

Pendant publication différée :

- bouton indique "Mise en attente…" ;
- statut devient "En attente" ;
- retour au feed avec confirmation ;
- carte brouillon reste accessible.

Pendant retour réseau :

- sync progressive ;
- ne pas bloquer l'app ;
- erreurs isolées.

## 18. ÉTATS ERREUR

Erreurs :

- média trop lourd ;
- contenu refusé par modération ;
- destination supprimée ;
- conflit de version ;
- session expirée.

L'UI doit expliquer :

- ce qui s'est passé ;
- ce qui est gardé ;
- ce que l'utilisateur peut faire.

## 19. ÉTATS OFFLINE

Offline :

- publier devient "Publier plus tard" ;
- likes deviennent "en attente" ;
- sauvegardes locales immédiates ;
- réponses visibles localement comme brouillon ;
- uploads médias suspendus.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Mobile :

- sync queue en bottom sheet ou page simple ;
- composer ultra sécurisé.

Tablette :

- brouillons à gauche ;
- aperçu à droite.

Desktop :

- centre de synchronisation plus détaillé ;
- édition brouillon confortable.

## 21. ACCESSIBILITÉ

Le système doit annoncer :

- sauvegarde réussie ;
- action en attente ;
- erreur nécessitant attention ;
- publication réussie.

Les boutons d'annulation et suppression doivent être clairement distingués.

## 22. PERFORMANCE UX

Les brouillons doivent être sauvegardés vite, sans bloquer :

- texte immédiatement ;
- médias par fragments ;
- thumbnails légers ;
- compression avant sync si nécessaire ;
- reprise upload.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Ce système est critique parce que l'utilisateur peut perdre le réseau en plein débat. L'app doit protéger la parole.
Priorités :

- sauvegarde locale immédiate ;
- audio reply conservée ;
- upload différé ;
- compression automatique ;
- publication sur réseau stable.

## 24. RÈGLES NON NÉGOCIABLES

- Ne jamais perdre un texte saisi.
- Ne jamais perdre un audio enregistré.
- Ne jamais afficher "publié" si ce n'est pas envoyé.
- Toujours distinguer brouillon local et publication réelle.
- Toujours permettre modification avant sync si non envoyé.
- Toujours informer l'utilisateur après retour réseau.
- Toujours protéger les créations longues avant les micro-actions.

---

*Brouillons offline, publication différée, file de synchronisation et actions en attente pour MAATFEED*
