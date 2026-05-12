# 4. MODÉRATION IA

## 1. OBJECTIF UX

Utiliser l'IA pour assister la détection, la reformulation et la contextualisation des contenus problématiques, tout en gardant une transparence et un contrôle humains dans les cas sensibles.

## 2. ÉMOTION RECHERCHÉE

Sécurité intelligente.
L'utilisateur doit sentir que l'IA aide à améliorer le débat, pas qu'elle juge arbitrairement.

## 3. STRUCTURE VISUELLE GLOBALE

La modération IA intervient dans :

- composer ;
- réponses publiées ;
- signalements ;
- vérification source ;
- détection toxicité ;
- appels à la nuance ;
- tri de priorité des signalements ;
- aide aux modérateurs.

## 4. LAYOUT EXACT

### Côté utilisateur :

- alerte inline ;
- suggestion de reformulation ;
- bouton voir pourquoi ;
- possibilité ignorer si autorisé.

### Côté modération interne si prévu :

- carte analyse ;
- score ou niveau non exposé publiquement ;
- motifs ;
- actions recommandées ;
- revue humaine.

## 5. HIERARCHIE VISUELLE

- décision visible ;
- raison compréhensible ;
- action utilisateur ;
- détails IA ;
- recours.

Le score IA ne doit jamais être l'élément visible principal pour l'utilisateur.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Dans composer :

- alerte sous texte.

Dans signalement :

- analyse IA dans un bloc "Aide à l'analyse", pas verdict final.

Dans contenu modéré :

- badge "modération appliquée" avec "voir pourquoi".

## 7. DIMENSIONS & ESPACEMENTS

Carte suggestion IA :

- 80 à 140 px ;
- bouton reformuler : 40 à 48 px ;
- badge IA : 22 à 26 px.

## 8. COULEURS

IA modération :

- ocre pour prudence ;
- or pour conseil ;
- graphite pour neutre ;
- jamais rouge sauf danger réel.

## 9. TYPOGRAPHIE

Ton :

- non accusateur ;
- précis ;
- court.

Exemple :
"Ce passage peut être interprété comme une attaque personnelle. Tu peux reformuler pour viser l'idée."

## 10. BOUTONS

Actions :

- Reformuler ;
- Voir pourquoi ;
- Ignorer ;
- Modifier ;
- Annuler publication ;
- Demander révision ;
- Signaler erreur IA.

## 11. CARTES

Carte IA pré-publication :

- problème détecté ;
- phrase concernée si possible ;
- suggestion ;
- action.

Carte revue :

- motif ;
- contexte ;
- historique ;
- recommandation ;
- décision finale.

## 12. ICONOGRAPHIE

- étoile IA ;
- bouclier ;
- balance ;
- plume ;
- info ;
- alerte ocre.

## 13. COMPORTEMENT SCROLL

L'alerte doit rester proche du contenu concerné.
Si plusieurs problèmes, afficher résumé puis détail repliable.

## 14. ANIMATIONS

- alerte fade ;
- suggestion de reformulation reveal ;
- insertion highlight ;
- aucun effet de jugement brutal.

## 15. MICRO INTERACTIONS

- tap phrase signalée ;
- tap reformuler ;
- tap ignorer ;
- tap voir règle ;
- feedback utile/pas utile.

## 16. GESTURES MOBILE

- swipe down fermer détails ;
- long press copier suggestion ;
- tap action.

## 17. ÉTATS LOADING

Analyse IA :

- rapide ;
- non bloquante par défaut ;
- message "Vérification du ton…" si visible.

## 18. ÉTATS ERREUR

Si IA indisponible :

- ne pas bloquer sauf règles locales critiques ;
- afficher règle locale si nécessaire ;
- permettre continuer.

## 19. ÉTATS OFFLINE

Offline :

- IA distante indisponible ;
- règles locales simples ;
- analyse complète plus tard ;
- publication peut rester en attente selon risque.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Mobile :

- inline + sheet.

Tablet :

- inline + panneau.

Desktop :

- panneau latéral.

## 21. ACCESSIBILITÉ

- IA identifiée ;
- alertes annoncées ;
- suggestion lisible ;
- boutons accessibles ;
- pas de couleur seule.

## 22. PERFORMANCE UX

- pas d'appel IA à chaque caractère ;
- analyse au moment opportun ;
- cache des règles ;
- réponse courte ;
- annulation possible.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- règles locales ;
- analyse différée ;
- messages courts ;
- pas de blocage prolongé.

## 24. RÈGLES NON NÉGOCIABLES

- IA assistante, pas juge final opaque.
- IA toujours identifiée.
- Cas sensibles avec recours.
- Pas de sanction invisible.
- Pas de blocage global en cas d'erreur IA.
- L'utilisateur doit comprendre l'alerte.

---

*Modération IA pour MAATFEED*
