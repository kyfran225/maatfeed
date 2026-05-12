# 9. PAIEMENT ET ÉTATS DE PAIEMENT

## 1. OBJECTIF UX

Permettre un paiement simple, sûr, compréhensible et résilient, particulièrement adapté aux réalités mobile et réseau instable.

## 2. ÉMOTION RECHERCHÉE

Sécurité.
L'utilisateur doit sentir que son argent ne disparaîtra pas dans le brouillard numérique.

## 3. STRUCTURE VISUELLE GLOBALE

Flux paiement :

- résumé achat
- choix méthode
- confirmation
- redirection ou traitement
- vérification
- succès
- accès débloqué
- reçu ou historique

## 4. LAYOUT EXACT

### Mobile :

- écran ou sheet de paiement
- résumé en haut
- méthode au centre
- CTA en bas
- état de vérification après retour

### Desktop :

- panneau paiement centré
- résumé à droite ou en haut
- méthode claire

## 5. HIERARCHIE VISUELLE

1. ce que l'utilisateur achète
2. montant
3. méthode
4. sécurité
5. bouton payer
6. conditions

## 6. POSITIONNEMENT DES ÉLÉMENTS

Résumé achat toujours visible avant paiement.
Montant proche du CTA.
Aucune méthode ne doit être sélectionnée de façon confuse.

## 7. DIMENSIONS & ESPACEMENTS

### Mobile :

- résumé : 100 à 160 px
- méthode : 56 à 72 px
- CTA : 54 px
- padding : 16 à 20 px

### Desktop :

- panneau : 420 à 560 px
- résumé : 120 à 180 px

## 8. COULEURS

### Paiement :

- fond graphite
- sécurité : bouclier or/beige
- CTA : ambre
- succès : or/vert très discret
- erreur : ocre

## 9. TYPOGRAPHIE

- titre achat : 16 à 20 px
- montant : 24 à 34 px
- méthode : 14 à 16 px
- sécurité : 12 à 13 px
- erreur : 13 à 14 px

## 10. BOUTONS

Actions :

- Payer
- Confirmer
- Annuler
- Réessayer
- Vérifier paiement
- Retour au contenu
- Restaurer accès
- Contacter support

## 11. CARTES

### Carte résumé achat :

- titre
- type
- montant
- accès
- créateur ou série
- conditions

### Carte méthode :

- logo ou icône
- nom
- description courte
- état disponible/indisponible

## 12. ICONOGRAPHIE

- bouclier
- reçu
- carte/moyen paiement abstrait
- synchronisation
- coche
- alerte
- cadenas discret

## 13. COMPORTEMENT SCROLL

Paiement doit éviter le scroll long.
Si conditions longues, les replier.
CTA toujours accessible.

## 14. ANIMATIONS

- méthode sélectionnée halo
- paiement en cours avec progression calme
- succès avec coche sobre
- erreur avec carte stable

## 15. MICRO INTERACTIONS

- tap méthode
- tap payer
- retour paiement
- vérification automatique
- retry
- accès débloqué

## 16. GESTURES MOBILE

- éviter gestes complexes
- empêcher fermeture accidentelle pendant traitement
- bouton retour avec confirmation si paiement en cours

## 17. ÉTATS LOADING

États :

- préparation
- redirection
- attente retour
- vérification
- déblocage

Messages clairs :

- "Préparation du paiement…"
- "Vérification de ton paiement…"
- "Déblocage de ton accès…"

## 18. ÉTATS ERREUR

Cas :

- paiement annulé
- paiement échoué
- réseau interrompu
- statut inconnu
- accès non débloqué
- méthode indisponible

Réponses UX :

- ne pas paniquer
- expliquer
- proposer vérifier
- éviter double paiement
- support si débité confirmé

## 19. ÉTATS OFFLINE

Paiement offline impossible.
Si connexion tombe après paiement :

- afficher statut "vérification en attente"
- conserver achat en attente
- réessayer vérification au retour

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :

- flux court

### Tablet :

- panneau centré

### Desktop :

- résumé + paiement

## 21. ACCESSIBILITÉ

- montant annoncé
- méthode sélectionnée annoncée
- erreurs annoncées
- focus conservé
- bouton paiement clair
- pas de timeout invisible

## 22. PERFORMANCE UX

- éviter rechargement complet
- garder état local
- vérifier côté serveur
- empêcher double clic
- persister transaction en attente

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- résilience réseau
- statut clair
- pas de double paiement
- vérification manuelle
- paiement en attente affiché
- retour contenu possible

## 24. RÈGLES NON NÉGOCIABLES

- Montant clair avant paiement
- Pas de double paiement
- Statut paiement visible
- Accès débloqué après succès
- Paiement en attente conservé
- Erreur récupérable
- Support accessible si problème

---

*Paiement et états de paiement pour MAATFEED*
