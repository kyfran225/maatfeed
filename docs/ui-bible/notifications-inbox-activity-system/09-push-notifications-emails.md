# 9. PUSH NOTIFICATIONS ET EMAILS

## 1. OBJECTIF UX

Permettre à MAATFEED de contacter l'utilisateur hors application uniquement quand cela apporte une vraie valeur.

## 2. ÉMOTION RECHERCHÉE

Respect.

L'utilisateur doit sentir que MAATFEED ne vole pas son attention.

## 3. STRUCTURE VISUELLE GLOBALE

Canaux :

- in-app
- push
- email
- résumé périodique
- alertes sécurité
- rappels audio/série

## 4. LAYOUT EXACT

Dans les paramètres notifications :

- catégories
- interrupteurs
- fréquence
- canal
- exemples
- bouton tout réduire
- mode calme

## 5. HIERARCHIE VISUELLE

### Priorité push :

1. sécurité
2. réponse directe
3. mention
4. nouvel épisode suivi
5. audio à reprendre si activé
6. résumé hebdo
7. recommandations rares

### Email :

1. sécurité
2. résumé
3. soutien/paiement
4. compte
5. créateur si important

## 6. POSITIONNEMENT DES ÉLÉMENTS

Les permissions push ne doivent pas être demandées brutalement à la première ouverture.

Demander après valeur démontrée :

- après suivi d'une série
- après participation à un débat
- après abonnement à un créateur
- après activation audio

## 7. DIMENSIONS & ESPACEMENTS

### Paramètres :

- ligne interrupteur : 56 à 72 px
- groupe : marge 24 px
- description : 12 à 13 px
- toggle confortable

## 8. COULEURS

### Toggle actif :

- ambre/or

### Inactif :

- graphite

### Canal critique :

- ocre doux

## 9. TYPOGRAPHIE

- titre catégorie : 15 à 17 px
- description : 12 à 14 px
- exemple notification : 12 à 13 px

## 10. BOUTONS

Actions :

- activer push
- désactiver
- recevoir résumé
- mode calme
- tester notification
- gérer emails

## 11. CARTES

Carte permission push :

- raison claire
- bénéfice
- boutons "Activer" et "Plus tard"
- pas de pression

## 12. ICONOGRAPHIE

- cloche
- email
- téléphone
- lune mode calme
- bouclier sécurité
- résumé

## 13. COMPORTEMENT SCROLL

Paramètres longs groupés.

Les catégories peuvent être repliables.

## 14. ANIMATIONS

- toggle doux
- permission card apparition légère
- confirmation courte

## 15. MICRO INTERACTIONS

- toggle : feedback immédiat
- exemple : preview
- mode calme : halo réduit
- désactivation : pas de culpabilisation

## 16. GESTURES MOBILE

- tap toggle
- swipe catégories non nécessaire
- long press notification système impossible à contrôler côté OS, donc fournir préférences app

## 17. ÉTATS LOADING

Chargement préférences :

- skeleton lignes
- pas de toggles faux

## 18. ÉTATS ERREUR

Si activation push échoue :

"Les notifications push n'ont pas pu être activées."
proposer vérifier navigateur/appareil ;
garder in-app active.

## 19. ÉTATS OFFLINE

Préférences modifiées offline :

- enregistrées localement
- synchronisées plus tard
- push dépend réseau donc message clair

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :

- paramètres simples

### Desktop :

- tableau de préférences visuel mais pas SaaS
- groupes en cartes

## 21. ACCESSIBILITÉ

- toggles nommés
- état activé/désactivé annoncé
- descriptions utiles
- pas de pression

## 22. PERFORMANCE UX

- préférences cache
- mise à jour optimiste
- emails groupés
- push résumées

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- éviter push trop fréquentes
- emails digest
- notifications légères
- ne pas charger média dans push
- messages courts

## 24. RÈGLES NON NÉGOCIABLES

- Pas de demande push au mauvais moment
- Pas de spam email
- Toujours offrir contrôle
- Sécurité prioritaire
- Recommandations push rares
- L'utilisateur peut tout réduire

---

*Push notifications et emails pour MAATFEED*
