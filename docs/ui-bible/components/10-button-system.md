# 10. BUTTON SYSTEM

## 1. OBJECTIF UX

Créer un système de boutons cohérent pour guider l'utilisateur vers les actions clés : écouter, répondre, publier, soutenir, s'abonner, partager, sauvegarder.

## 2. ÉMOTION RECHERCHÉE

Confiance, précision, désir d'action. Le bouton primaire doit donner envie sans hurler.

## 3. STRUCTURE VISUELLE GLOBALE

Quatre niveaux : primaire doré, secondaire sombre, ghost discret, danger contrôlé. Les boutons doivent être tactiles et lisibles.

## 4. LAYOUT EXACT

- **Hauteur primaire mobile** : 48 à 52 px
- **Hauteur secondaire** : 44 à 48 px
- **Bouton compact** : 36 à 40 px
- **Bouton icône** : 40 à 48 px hitbox
- **Bouton rond créer/play** : 48 à 60 px

## 5. HIERARCHIE VISUELLE

Un seul bouton primaire principal par écran ou section. Les boutons secondaires ne doivent pas concurrencer l'action principale.

## 6. POSITIONNEMENT DES ÉLÉMENTS

- CTA bas pleine largeur sur flows : 16 px latéral, 16 px bas + safe area
- Boutons dans cartes : en bas de la carte, alignement cohérent

## 7. DIMENSIONS & ESPACEMENTS

- **Padding horizontal** : 16 à 20 px
- **Icône + texte** : 8 px
- **Deux boutons côte à côte** : 8 à 12 px entre eux

## 8. COULEURS

- **Primaire** : or
- **Texte primaire** : noir charbon
- **Secondaire** : surface sombre + texte clair
- **Ghost** : transparent + texte gris/blanc
- **Danger** : rouge discret
- **Disabled** : gris sombre + texte gris faible

## 9. TYPOGRAPHIE

Texte bouton : 14 à 15 px, medium ou semibold. Libellés courts, actionnels, humains.

## 10. BOUTONS

### Types officiels
- **CTA principal** : "Publier", "Continuer", "Soutenir", "Choisir ce plan"
- **Action média** : play/pause, télécharger, ajouter
- **Action sociale** : aimer, commenter, débattre, partager, sauvegarder
- **Action sécurité** : signaler, bloquer, supprimer
- **Action IA** : expliquer, résumer, demander au coach

## 11. CARTES

Dans les cartes sponsor/premium, le bouton doré doit être visible mais intégré. Pas de style publicitaire agressif.

## 12. ICONOGRAPHIE

Icônes facultatives sur CTA, obligatoires pour actions compactes. Icône jamais seule si l'action peut être ambiguë.

## 13. COMPORTEMENT SCROLL

Les CTA sticky restent accessibles dans les flows longs. Dans les pages de détail, le bouton répondre peut rester dans une barre basse.

## 14. ANIMATIONS

- **Press** : 0.98 scale
- **Loading** : spinner discret ou progress interne
- **Success** : validation courte
- **Disabled** : pas d'animation

## 15. MICRO INTERACTIONS

- Au hover desktop : légère hausse luminosité, bordure plus chaude
- Au tap : retour immédiat
- Pour paiement/soutien : état sécurisé visible

## 16. GESTURES MOBILE

Les boutons doivent être atteignables au pouce. Éviter boutons primaires en haut sauf header action simple.

## 17. ÉTATS LOADING

Pendant action : texte peut devenir "Publication…", "Envoi…", "Connexion…". Le bouton garde sa taille.

## 18. ÉTATS ERREUR

Après erreur, bouton revient actif avec message proche. Ne pas laisser bouton bloqué.

## 19. ÉTATS OFFLINE

- Si action possible offline : bouton reste actif avec confirmation "sera envoyé"
- Si impossible : bouton désactivé + explication courte

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Desktop : boutons peuvent être moins hauts mais jamais minuscules. Les actions fréquentes peuvent devenir toolbar.

## 21. ACCESSIBILITÉ

- Contraste fort, focus visible, labels accessibles, hitbox 44 px
- Ne jamais indiquer état uniquement par couleur

## 22. PERFORMANCE UX

Feedback immédiat au tap. Ne pas attendre la réponse réseau pour changer l'état visuel.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Les actions doivent être optimistes quand c'est sûr : like, save, brouillon, réaction. Publication/paiement doivent montrer progression fiable.

## 24. RÈGLES NON NÉGOCIABLES

- Pas de bouton plat générique
- Pas de CTA rouge sauf danger
- Pas de multiples primaires concurrents sur un même écran

---

*Système de boutons pour guider l'action utilisateur*
