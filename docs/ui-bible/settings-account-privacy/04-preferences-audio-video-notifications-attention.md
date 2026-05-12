# 4. PRÉFÉRENCES AUDIO, VIDÉO, NOTIFICATIONS & ATTENTION

## 1. OBJECTIF UX

Cette section permet à l'utilisateur de contrôler comment MAATFEED utilise son attention : lecture audio, autoplay vidéo, qualité média, notifications push, notifications email, rappels de séries, débats suivis et alertes créateurs.
L'objectif est d'éviter la fatigue et le bruit numérique.

## 2. ÉMOTION RECHERCHÉE

L'utilisateur doit ressentir :

- calme ;
- contrôle ;
- confort ;
- liberté d'écouter ;
- absence d'agression.

MAATFEED doit respecter le rythme de vie de l'utilisateur.

## 3. STRUCTURE VISUELLE GLOBALE

Sections :

- Audio ;
- Vidéo ;
- Qualité média ;
- Notifications ;
- Priorités ;
- Silence temporaire ;
- Emails ;
- Push ;
- Résumé quotidien ou hebdomadaire.

Chaque groupe doit être clair et actionnable.

## 4. LAYOUT EXACT

Mobile :

- bloc audio en haut ;
- bloc vidéo/autoplay ;
- bloc notifications ;
- bloc silence ;
- bloc email/push ;
- aperçu des réglages actifs.

Chaque ligne avec switch direct ou chevron vers détail.

## 5. HIERARCHIE VISUELLE

Priorité :

- audio ;
- autoplay ;
- data média ;
- notifications importantes ;
- notifications secondaires ;
- emails ;
- silence temporaire.

Les réglages qui touchent data et attention doivent être plus visibles.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Audio :

- première section ;
- options vitesse, reprise, téléchargement, lecture en arrière-plan.

Vidéo :

- autoplay ;
- qualité par défaut ;
- lecture seulement Wi-Fi.

Notifications :

- groupées par type ;
- push et email séparés ;
- priorité haute clairement indiquée.

## 7. DIMENSIONS & ESPACEMENTS

Lignes :

- hauteur 58 à 68 px ;
- switch à droite ;
- icône à gauche ;
- description sur une ligne ou deux.

Cartes notification :

- padding 16 px ;
- groupe avec séparateurs discrets ;
- pas de lignes trop serrées.

## 8. COULEURS

Audio actif :

- ambre doux ;
- icône casque or.

Notifications :

- priorité haute : ambre ;
- silencieux : gris chaud ;
- danger/sécurité : rouge argile discret ;
- désactivé : gris chaud.

## 9. TYPOGRAPHIE

Libellés audio :

- "Reprendre automatiquement l'écoute"
- "Télécharger sur Wi-Fi seulement"
- "Qualité audio légère"
- "Vitesse par défaut"

Libellés notifications :

- "Réponses à mes débats"
- "Nouveaux épisodes de séries"
- "Créateurs suivis"
- "Résumé quotidien"
- "Notifications email"

## 10. BOUTONS

Boutons :

- "Tout mettre en pause"
- "Réactiver"
- "Tester une notification"
- "Gérer les priorités"
- "Réinitialiser les réglages médias"

Les actions globales doivent demander confirmation douce.

## 11. CARTES

Carte audio :

- état mini-player ;
- préférence qualité ;
- téléchargements ;
- reprise.

Carte notifications :

- groupe type ;
- switch ;
- priorité ;
- canal push/email.

Carte silence :

- durée : 1 h, aujourd'hui, cette semaine ;
- exception : sécurité et compte.

## 12. ICONOGRAPHIE

Icônes :

- casque ;
- onde audio ;
- play ;
- cloche ;
- enveloppe ;
- lune ;
- éclair ;
- Wi-Fi ;
- signal faible.

## 13. COMPORTEMENT SCROLL

Les sections doivent rester rapides à parcourir.
Règles :

- pas de longues explications ouvertes par défaut ;
- détails en accordéons ;
- bouton silence visible rapidement ;
- recherche paramètres utile.

## 14. ANIMATIONS

Animations :

- switch fluide ;
- cloche qui s'illumine brièvement ;
- audio qualité change avec petit feedback ;
- mode silence avec fondu vers gris chaud.

Aucune animation sonore visuelle trop bruyante.

## 15. MICRO INTERACTIONS

Micro-interactions :

- test notification affiche preview ;
- changement autoplay affiche impact data ;
- activation silence montre durée restante ;
- téléchargement Wi-Fi seulement affiche badge.

## 16. GESTURES MOBILE

Gestes :

- tap switch ;
- tap ligne pour détail ;
- swipe dans options durée silence ;
- retour conserve changements.

## 17. ÉTATS LOADING

Loading :

- préférences locales immédiates ;
- canaux push/email chargés ensuite ;
- skeleton léger pour état permission système.

## 18. ÉTATS ERREUR

Erreurs :

- permission push refusée ;
- email non vérifié ;
- sauvegarde impossible ;
- média préférence non disponible.

Message clair :
"Les notifications sont bloquées par ton navigateur. Tu peux les réactiver dans les autorisations du site."

## 19. ÉTATS OFFLINE

Offline :

- réglages locaux modifiables ;
- push test indisponible ;
- changements sync plus tard ;
- audio local réglable.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Mobile :

- switches simples ;
- silence rapide.

Tablette :

- catégories en cartes.

Desktop :

- panneau preview notification ;
- réglages détaillés par canal.

## 21. ACCESSIBILITÉ

Notifications :

- switches labellisés ;
- état activé/désactivé annoncé ;
- durée silence annoncée ;
- pas de couleur seule pour priorité.

Audio :

- vitesse lisible ;
- contrôles clavier ;
- textes explicites.

## 22. PERFORMANCE UX

Ne pas interroger les permissions système à chaque ouverture.
Préférer :

- état cache ;
- vérification au besoin ;
- sauvegarde rapide ;
- sync différée.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Paramètres recommandés :

- autoplay vidéo désactivé ;
- téléchargement audio Wi-Fi ;
- notifications groupées ;
- emails digest plutôt que multiples ;
- audio léger.

## 24. RÈGLES NON NÉGOCIABLES

- Ne jamais activer autoplay lourd par défaut en faible réseau.
- Ne jamais envoyer trop de notifications.
- Ne jamais mélanger push et email sans distinction.
- Toujours permettre pause temporaire.
- Toujours préserver notifications sécurité.
- Toujours rendre audio prioritaire.
- Toujours respecter le calme utilisateur.

---

*Préférences audio, vidéo, notifications et attention pour MAATFEED*
