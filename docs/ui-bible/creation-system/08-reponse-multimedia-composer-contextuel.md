# 8. RÉPONSE MULTIMÉDIA ET COMPOSER CONTEXTUEL

## 1. OBJECTIF UX

Permettre de répondre à un contenu ou débat avec le bon format :

- texte
- audio
- vidéo
- image
- document
- citation
- source

Le composer doit être contextuel : il sait à quoi l'utilisateur répond.

## 2. ÉMOTION RECHERCHÉE

L'utilisateur doit sentir qu'il intervient dans une conversation vivante, sans perdre le contexte.

## 3. STRUCTURE VISUELLE GLOBALE

Composer réponse :

- contexte parent
- choix format
- champ ou recorder
- source optionnelle
- preview
- publier réponse

## 4. LAYOUT EXACT

### Mobile :
- bottom sheet depuis le débat
- parent résumé en haut
- composer au centre
- toolbar format en bas
- publier à droite

### Desktop :
- composer inline ou panneau latéral
- parent visible
- preview immédiate

## 5. HIERARCHIE VISUELLE

Priorité :

1. contexte parent
2. contenu réponse
3. format
4. publier
5. source

## 6. POSITIONNEMENT DES ÉLÉMENTS

- parent en haut sous forme carte compacte
- champ réponse dessous
- formats en toolbar
- actions bas

## 7. DIMENSIONS & ESPACEMENTS

- parent card : 64 à 96 px
- composer texte : 120 à 200 px
- toolbar : 52 à 64 px
- bouton publier : 44 px

## 8. COULEURS

- parent : surface sombre
- réponse active : bordure ambre
- format actif : ambre
- texte : blanc cassé

## 9. TYPOGRAPHIE

- parent : 12 à 14 px
- réponse : 15 à 17 px
- format label : 11 à 12 px

## 10. BOUTONS

- texte
- audio
- vidéo
- image
- source
- aperçu
- publier
- annuler

## 11. CARTES

Cartes :

- parent
- preview réponse
- média joint
- source
- avertissement qualité

## 12. ICONOGRAPHIE

- répondre
- micro
- caméra
- image
- lien/source
- citation

## 13. COMPORTEMENT SCROLL

Le parent reste visible ou accessible.
Si réponse longue, parent se compacte.

## 14. ANIMATIONS

- ouverture sheet
- changement format
- insertion média
- publication réponse

## 15. MICRO INTERACTIONS

- tap format : transition
- parent tap : voir original
- source ajoutée : coche
- réponse publiée : retour thread avec highlight

## 16. GESTURES MOBILE

- swipe down composer
- long press média
- swipe formats horizontal si nombreux

## 17. ÉTATS LOADING

- publication
- upload
- transcription
- preview

## 18. ÉTATS ERREUR

- parent supprimé
- réseau
- média invalide
- modération
- réponse vide

Contenu conservé.

## 19. ÉTATS OFFLINE

- réponse en brouillon
- publication différée
- audio local
- parent cache

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :
- sheet

### Tablet :
- panneau

### Desktop :
- inline + preview

## 21. ACCESSIBILITÉ

- parent annoncé
- boutons format labellisés
- focus
- alternatives gestures

## 22. PERFORMANCE UX

- parent cache
- upload différé
- preview légère
- autosave réponse

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- réponse texte/audio prioritaire
- média lourd différé
- publication queue
- parent disponible hors ligne si déjà chargé

## 24. RÈGLES NON NÉGOCIABLES

- Ne jamais perdre le contexte parent
- Ne jamais perdre une réponse commencée
- Le changement de format ne doit pas effacer le contenu
- La réponse doit revenir au thread après publication
- Le débat doit rester lisible

---

*Réponse multimédia et composer contextuel pour MAATFEED*
