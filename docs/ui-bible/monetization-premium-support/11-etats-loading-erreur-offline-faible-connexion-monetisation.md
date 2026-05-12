# 11. ÉTATS LOADING, ERREUR, OFFLINE ET FAIBLE CONNEXION MONÉTISATION

## 1. OBJECTIF UX

Garantir que l'expérience monétisée reste fiable même lorsque le réseau est instable, que le paiement prend du temps ou que l'accès se synchronise lentement.

## 2. ÉMOTION RECHERCHÉE

Sérénité.
L'utilisateur ne doit jamais se demander : "Est-ce que j'ai payé pour rien ?"

## 3. STRUCTURE VISUELLE GLOBALE

États à couvrir :

- offre en chargement
- prix indisponible
- paiement en préparation
- paiement en attente
- paiement réussi
- paiement échoué
- paiement annulé
- accès en synchronisation
- accès débloqué
- offline
- contenu premium indisponible

## 4. LAYOUT EXACT

Chaque état doit apparaître dans le contexte :

- carte
- paywall
- écran paiement
- page accès
- toast
- notification

Ne pas changer brutalement de page si ce n'est pas nécessaire.

## 5. HIERARCHIE VISUELLE

1. statut
2. conséquence
3. action
4. détails

Exemple :
"Paiement en vérification"
"Ton accès sera débloqué dès confirmation."
"Vérifier maintenant"

## 6. POSITIONNEMENT DES ÉLÉMENTS

### Statut paiement :

- au centre de l'écran paiement
- ou dans une carte dédiée si retour au contenu

### Statut accès :

- près du CTA ou contenu concerné

## 7. DIMENSIONS & ESPACEMENTS

### Carte état :

- hauteur 100 à 180 px
- icône 40 à 56 px
- CTA 44 à 52 px
- padding 16 à 20 px

## 8. COULEURS

### Succès :

- or doux + touche verte très discrète si besoin

### Erreur :

- ocre/cuivre

### En attente :

- ambre sombre

### Offline :

- brun/or mat

## 9. TYPOGRAPHIE

- titre état : 16 à 22 px
- description : 13 à 15 px
- action : 14 à 16 px
- détails : 11 à 13 px

## 10. BOUTONS

Actions :

- Réessayer
- Vérifier paiement
- Retour au contenu
- Restaurer accès
- Contacter support
- Voir mes accès
- Continuer gratuitement

## 11. CARTES

### Carte paiement en attente :

- statut
- montant
- contenu
- action vérifier
- message anti double-paiement

### Carte erreur :

- message
- cause simple
- action

## 12. ICONOGRAPHIE

- synchronisation
- coche
- alerte ocre
- reçu
- bouclier
- offline
- clé

## 13. COMPORTEMENT SCROLL

Les états critiques ne doivent pas être cachés sous le scroll.
Sur mobile, afficher en zone visible.

## 14. ANIMATIONS

- vérification : rotation douce
- succès : coche sobre
- erreur : apparition stable
- offline : aucun effet dramatique

## 15. MICRO INTERACTIONS

- tap vérifier
- tap support
- tap retour
- accès débloqué : bouton change en "Ouvrir"

## 16. GESTURES MOBILE

- éviter gestes dangereux pendant paiement
- confirmation si fermeture pendant vérification
- swipe down possible après état final

## 17. ÉTATS LOADING

Toujours expliciter :

- ce qui charge
- pourquoi
- quoi faire si long

Pas de spinner muet.

## 18. ÉTATS ERREUR

Messages :

- "Le paiement n'a pas abouti."
- "La connexion a été interrompue."
- "Ton paiement est en vérification."
- "Ton accès n'est pas encore synchronisé."

## 19. ÉTATS OFFLINE

Offline après paiement :

- conserver statut
- permettre vérification plus tard
- ne pas relancer paiement directement
- afficher reçu local si disponible

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :

- carte visible

### Tablet :

- panneau état

### Desktop :

- état + détails

## 21. ACCESSIBILITÉ

- statut annoncé
- actions claires
- pas de couleur seule
- focus sur action utile
- messages compréhensibles

## 22. PERFORMANCE UX

- persister transaction
- éviter double paiement
- retry contrôlé
- cache accès
- polling raisonnable
- fallback support

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- réseau instable prévu
- statut en attente robuste
- pas de perte transaction
- messages simples
- support visible
- vérification manuelle

## 24. RÈGLES NON NÉGOCIABLES

- Ne jamais perdre l'état paiement
- Ne jamais encourager double paiement
- Toujours expliquer attente
- Toujours donner une action
- Offline respecté
- Accès payé restaurable
- Erreurs non culpabilisantes

---

*États loading, erreur, offline et faible connexion monétisation pour MAATFEED*
