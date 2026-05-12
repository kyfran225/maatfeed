# 2. SIGNALEMENT UTILISATEUR

## 1. OBJECTIF UX

Permettre à l'utilisateur de signaler facilement un contenu, une réponse, un profil, une source, un audio, une vidéo, un débat ou une action abusive.
Le signalement doit être rapide, clair et rassurant, sans transformer l'utilisateur en enquêteur.

## 2. ÉMOTION RECHERCHÉE

L'utilisateur doit ressentir :

- sécurité ;
- écoute ;
- contrôle ;
- simplicité ;
- confiance dans le traitement.

Le signalement ne doit pas ressembler à une procédure judiciaire lourde.

## 3. STRUCTURE VISUELLE GLOBALE

Le flux de signalement contient :

- point d'entrée ;
- choix du motif ;
- détails optionnels ;
- résumé ;
- confirmation ;
- suivi éventuel.

Motifs principaux :

- attaque personnelle ;
- haine ou discrimination ;
- harcèlement ;
- désinformation ou source douteuse ;
- contenu violent ou choquant ;
- contenu sexuel inapproprié ;
- spam ou publicité ;
- usurpation ;
- atteinte à la vie privée ;
- problème religieux/culturel sensible ;
- autre.

## 4. LAYOUT EXACT

### Mobile :

- menu contextuel depuis contenu ;
- bottom sheet signalement ;
- liste de motifs en cartes ;
- champ détail optionnel ;
- bouton envoyer sticky ;
- confirmation finale.

### Desktop :

- popover menu ;
- modal/panneau central ;
- liste motifs à gauche ;
- détail à droite si nécessaire.

## 5. HIERARCHIE VISUELLE

- question : "Pourquoi veux-tu signaler ?"
- motifs ;
- détail optionnel ;
- action envoyer ;
- confidentialité du signalement.

Le motif doit être plus visible que le champ libre.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Point d'entrée :

- menu "…" sur carte ;
- long press mobile ;
- bouton signaler dans détail ;
- option dans profil.

Le bouton signaler ne doit pas être caché derrière trop d'étapes pour les contenus sensibles.

## 7. DIMENSIONS & ESPACEMENTS

### Mobile :

- sheet : 70 à 90 % hauteur ;
- motif : 56 à 78 px ;
- icône motif : 22 px ;
- champ détail : 96 à 140 px ;
- bouton envoyer : 52 à 56 px.

### Desktop :

- modal : 520 à 720 px large ;
- motif : 60 à 84 px.

## 8. COULEURS

Signalement :

- fond noir charbon ;
- cartes graphite ;
- motif sélectionné : bordure ocre/ambre ;
- bouton envoyer : ambre ;
- action critique : ocre ;
- aucun rouge agressif sauf danger immédiat.

## 9. TYPOGRAPHIE

- titre : 20 à 24 px mobile ;
- motif : 14 à 16 px ;
- description motif : 12 à 13 px ;
- confidentialité : 11 à 12 px.

## 10. BOUTONS

Boutons :

- Envoyer le signalement ;
- Annuler ;
- Ajouter un détail ;
- Bloquer aussi cet utilisateur ;
- Masquer ce contenu ;
- Voir règles.

Après confirmation :

- Retour ;
- Voir mes signalements si prévu ;
- Bloquer l'utilisateur ;
- Masquer le contenu.

## 11. CARTES

Carte motif :

- icône ;
- nom ;
- phrase courte ;
- état sélectionné.

Exemple :
"Harcèlement — attaques répétées, intimidation ou pression ciblée."

## 12. ICONOGRAPHIE

- drapeau ;
- bouclier ;
- alerte ;
- œil masqué ;
- source ;
- spam ;
- utilisateur ;
- verrou vie privée.

## 13. COMPORTEMENT SCROLL

La liste de motifs peut scroller.
Le bouton envoyer reste visible en bas.
Le champ détail ne doit pas pousser le bouton hors écran sans compensation clavier.

## 14. ANIMATIONS

- sheet monte doucement ;
- motif sélectionné halo ;
- confirmation avec coche sobre ;
- fermeture fluide.

## 15. MICRO INTERACTIONS

- tap motif ;
- sélection multiple si nécessaire mais à éviter par défaut ;
- champ détail auto-grandit ;
- bouton envoyer actif après motif ;
- confirmation non intrusive.

## 16. GESTURES MOBILE

- swipe down fermer ;
- long press contenu pour ouvrir ;
- tap motif ;
- clavier aware.

Si l'utilisateur a commencé à remplir, fermeture demande confirmation légère.

## 17. ÉTATS LOADING

Signalement en cours :

- bouton loading ;
- conserver motif ;
- ne pas fermer trop vite sans confirmation ;
- afficher succès après envoi.

## 18. ÉTATS ERREUR

Si échec :

- "Le signalement n'a pas pu être envoyé."
- conserver formulaire ;
- proposer réessayer ;
- proposer mettre en attente si offline.

## 19. ÉTATS OFFLINE

Offline :

- signalement sauvegardé localement ;
- statut "en attente d'envoi" ;
- possibilité annuler avant synchronisation ;
- contenu peut être masqué localement immédiatement.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Mobile :

- bottom sheet.

Tablet :

- modal large.

Desktop :

- modal/panneau.

## 21. ACCESSIBILITÉ

- motifs lisibles ;
- sélection annoncée ;
- bouton envoyer accessible ;
- champ détail étiqueté ;
- focus trap dans modal ;
- fermeture accessible.

## 22. PERFORMANCE UX

- motifs locaux ;
- envoi léger ;
- pas de média ;
- contexte envoyé en arrière-plan sans bloquer l'utilisateur.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- signalement en file ;
- message simple ;
- masquage local ;
- pas d'obligation d'uploader capture lourde.

## 24. RÈGLES NON NÉGOCIABLES

- Signalement accessible partout où nécessaire.
- Motifs clairs.
- Pas de procédure lourde.
- Détail optionnel.
- Confirmation obligatoire.
- Offline supporté.
- Confidentialité expliquée.
- Aucune humiliation publique.

---

*Signalement utilisateur pour MAATFEED*
