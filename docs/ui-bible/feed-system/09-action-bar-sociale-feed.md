# 9. ACTION BAR SOCIALE DU FEED

## 1. OBJECTIF UX

Permettre à l'utilisateur d'aimer, répondre, débattre, partager, sauvegarder et ouvrir les détails sans effort.

## 2. ÉMOTION RECHERCHÉE

Fluidité, engagement, contrôle. Les actions doivent être évidentes mais pas bruyantes.

## 3. STRUCTURE VISUELLE GLOBALE

Barre horizontale sous le média/contenu : icônes fines, chiffres courts, sauvegarde à droite ou alignée avec autres actions selon carte.

## 4. LAYOUT EXACT

Hauteur action bar : 36-44 px.
Icône : 20-22 px.
Hitbox : 36-44 px.
Écart entre actions : 12-20 px.
Bookmark souvent à droite si espace.

## 5. HIERARCHIE VISUELLE

Actions principales selon format :
Vidéo : like, commenter/débattre, partager, sauvegarder.
Audio : play déjà principal, puis save, partager, répondre.
Débat : répondre, suivre, partager, sauvegarder.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Sous le média ou sous la question. Aligner à gauche pour actions sociales, sauvegarde à droite si carte large.

## 7. DIMENSIONS & ESPACEMENTS

Chiffres à 4-6 px de l'icône. Les groupes d'actions doivent garder espace pour éviter taps accidentels.

## 8. COULEURS

Inactif : gris clair. Actif : or. Danger/report : rouge uniquement dans menu. Chiffres : gris secondaire.

## 9. TYPOGRAPHIE

Chiffres : 12-13 px medium. Labels optionnels : 11-12 px si affichés.

## 10. BOUTONS

Chaque action est un bouton. Actions secondaires dans menu si manque d'espace.

## 11. CARTES

L'action bar doit s'adapter à la carte. Les cartes débat peuvent mettre "Répondre" en bouton texte plus explicite.

## 12. ICONOGRAPHIE

Coeur ou réaction, bulle commentaire, icône débat, partage, bookmark, plus. Icônes cohérentes avec tout le système.

## 13. COMPORTEMENT SCROLL

Les états d'action restent quand la carte quitte/revient. Pas de reset visuel.

## 14. ANIMATIONS

Like/save : remplissage 120-180 ms. Partage : feedback toast. Réponse : ouverture sheet/page en 220-320 ms.

## 15. MICRO INTERACTIONS

Tap like : optimiste. Tap save : icône or + toast "Sauvegardé". Tap partager : sheet partage. Tap réponse : choix format si contenu débat.

## 16. GESTURES MOBILE

Double tap like réservé aux médias, pas aux cartes débat/document. Long press action peut ouvrir détails sur desktop/mobile avancé.

## 17. ÉTATS LOADING

Action réseau : feedback local immédiat, sync en arrière-plan. Pour partage externe, sheet peut charger options.

## 18. ÉTATS ERREUR

Si action échoue : rollback doux ou message "Action enregistrée, synchronisation plus tard" selon cas.

## 19. ÉTATS OFFLINE

Like/save/réponse brouillon en file d'attente. Partage externe dépend OS, mais l'app ne doit pas planter.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Desktop : labels peuvent apparaître au hover. Mobile : icônes + chiffres. Tablet : selon largeur.

## 21. ACCESSIBILITÉ

Chaque bouton a un label : "Aimer", "Sauvegarder", "Partager". État actif annoncé.

## 22. PERFORMANCE UX

Actions optimistes. Pas de rechargement complet de carte après action.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Les actions sociales non critiques doivent fonctionner offline avec synchronisation. L'utilisateur doit voir l'état en attente.

## 24. RÈGLES NON NÉGOCIABLES

Pas d'actions trop petites. Pas de chiffres illisibles. Pas de réaction sans feedback. Pas d'action critique cachée uniquement dans un geste.

---

*Barre d'action sociale pour le feed MAATFEED*
