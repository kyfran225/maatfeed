# 12. INPUTS, FORMS & EDITOR SURFACES

## 1. OBJECTIF UX

Permettre la création de débats, réponses, publications, commentaires, messages et recherches avec une interface claire, rapide et rassurante.

## 2. ÉMOTION RECHERCHÉE

Simplicité, contrôle, sécurité. L'utilisateur doit oser écrire, enregistrer, poster, même avec une connexion instable.

## 3. STRUCTURE VISUELLE GLOBALE

Inputs sombres, bordures fines, labels discrets, focus doré, aides contextuelles. Les éditeurs de création doivent être puissants mais pas intimidants.

## 4. LAYOUT EXACT

- **Input simple** : hauteur 44 à 48 px
- **Textarea court** : 96 à 140 px
- **Éditeur réponse texte** : 180 à 320 px selon page
- **Search input** : 40 à 44 px, icône gauche
- **Input chat** : barre basse 44 à 52 px + icônes média

## 5. HIERARCHIE VISUELLE

Le champ actif reçoit une bordure ambre. Le label reste discret. Les erreurs apparaissent sous le champ.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Labels au-dessus ou placeholders internes selon densité. Dans les flows de création, chaque champ a un titre clair. Les actions restent en bas.

## 7. DIMENSIONS & ESPACEMENTS

- **Padding input** : 12 à 14 px horizontal
- **Radius** : 12 à 14 px
- **Écart label/input** : 6 px
- **Écart input/message aide** : 6 px
- **Écart entre champs** : 14 à 18 px

## 8. COULEURS

- **Fond input** : noir élevé
- **Bordure** : graphite
- **Focus** : ambre
- **Placeholder** : gris tertiaire
- **Texte** : blanc chaud
- **Erreur** : rouge doux

## 9. TYPOGRAPHIE

- **Texte input** : 14 à 16 px
- **Placeholder** : 14 px
- **Label** : 12 à 13 px medium
- **Compteur** : 11 à 12 px

## 10. BOUTONS

Boutons dans éditeur : barre de formatage compacte. Bouton publier/enregistrer : bas fixe ou sous formulaire.

## 11. CARTES

Les formulaires longs sont dans des cartes/surfaces avec padding 16 px. Les blocs média ajoutés apparaissent comme cartes internes.

## 12. ICONOGRAPHIE

Icônes input : 18 à 20 px. Recherche, micro, image, document, lien, emoji/réaction, envoyer.

## 13. COMPORTEMENT SCROLL

Quand le clavier apparaît, le champ actif doit rester visible. Les CTA doivent remonter au-dessus du clavier si nécessaire.

## 14. ANIMATIONS

- **Focus** : transition bordure 120 ms
- **Erreur** : apparition douce
- **Ajout média** : slide/fade

## 15. MICRO INTERACTIONS

Compteur caractères change subtilement à l'approche de la limite. Enregistrement brouillon : petit indicateur "brouillon enregistré".

## 16. GESTURES MOBILE

Tap hors champ ferme le clavier quand logique. Swipe down peut fermer le clavier. Long press texte conserve comportements natifs.

## 17. ÉTATS LOADING

- Envoi : bouton loading
- Upload : progression par média
- Draft save : indicateur discret

## 18. ÉTATS ERREUR

- Erreur validation près du champ
- Erreur upload sur carte média
- Erreur réseau avec option réessayer

## 19. ÉTATS OFFLINE

Texte, audio et réponses doivent être sauvegardés en brouillon. Publication offline : "sera publié quand la connexion revient" si autorisé.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

- Desktop : éditeur plus large, barre d'outils complète, raccourcis clavier
- Mobile : outils cachés sous icônes compactes

## 21. ACCESSIBILITÉ

- Labels accessibles
- Focus visible
- Messages d'erreur associés au champ
- Support clavier desktop

## 22. PERFORMANCE UX

Inputs doivent rester fluides même avec long texte. Éviter recalculs lourds pendant frappe.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Autosave local obligatoire pour créations importantes. Upload différé possible. Compression média avant envoi.

## 24. RÈGLES NON NÉGOCIABLES

- Ne jamais perdre une réponse écrite
- Ne jamais bloquer un utilisateur sans explication
- Ne jamais cacher le bouton publier sous le clavier

---

*Système d'inputs et formulaires pour la création de contenu*
