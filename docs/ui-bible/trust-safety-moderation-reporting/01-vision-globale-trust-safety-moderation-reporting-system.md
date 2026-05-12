# 1. VISION GLOBALE DU TRUST, SAFETY, MODERATION & REPORTING SYSTEM

## 1. OBJECTIF UX

Créer un système global de confiance capable de protéger les utilisateurs, les créateurs, les débats, les sources, les séries, les audios, les réponses multimédias et les contenus sensibles.
L'objectif est de permettre une conversation forte, profonde et contradictoire, mais dans un cadre lisible.
L'utilisateur doit pouvoir comprendre :

- ce qui est autorisé ;
- ce qui est déconseillé ;
- ce qui est modéré ;
- pourquoi un contenu est signalé ;
- comment signaler ;
- comment contester ;
- comment bloquer ou masquer ;
- comment reconnaître une source fiable ;
- comment distinguer opinion, croyance, interprétation et fait sourcé.

## 2. ÉMOTION RECHERCHÉE

L'émotion recherchée est la confiance calme.
L'utilisateur doit sentir :

- sécurité ;
- justice ;
- clarté ;
- respect ;
- liberté responsable ;
- protection ;
- nuance ;
- sérieux.

Il ne doit pas sentir :

- censure arbitraire ;
- surveillance oppressante ;
- humiliation publique ;
- confusion ;
- peur de participer ;
- chaos toxique.

## 3. STRUCTURE VISUELLE GLOBALE

Le système est composé de plusieurs couches :

- règles communautaires visibles ;
- signaux préventifs dans le composer ;
- signalement utilisateur ;
- badges de fiabilité ;
- avertissements contextuels ;
- modération IA assistée ;
- modération humaine ou revue si prévue ;
- gestion des contenus sensibles ;
- blocage/masquage utilisateur ;
- historique des décisions ;
- appels à la nuance ;
- états d'erreur, offline et faible connexion.

Le système doit être visible quand il est utile, invisible quand il n'est pas nécessaire.

## 4. LAYOUT EXACT

### Mobile :

- actions de sécurité accessibles via menu contextuel ;
- bottom sheets pour signalement ;
- alertes inline dans le composer ;
- badges discrets sur contenus ;
- panneaux courts pour règles ;
- modales uniquement pour cas critiques ;
- aucun écran administratif lourd.

### Desktop :

- menus contextuels au hover/focus ;
- panneaux latéraux pour détails de modération ;
- centre de signalement plus confortable ;
- badges et sources visibles dans les cartes ;
- historique modération dans paramètres ou profil si nécessaire.

## 5. HIERARCHIE VISUELLE

Priorité :

- sécurité immédiate ;
- protection des personnes ;
- contexte et nuance ;
- fiabilité des sources ;
- liberté de débat ;
- information utilisateur ;
- action de recours.

Un désaccord fort ne doit pas être traité comme une attaque.
Une attaque personnelle ne doit pas être protégée sous prétexte de débat.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Les éléments de trust doivent apparaître :

- dans les débats ;
- dans les réponses ;
- dans les sources ;
- dans les profils ;
- dans les commentaires/réponses multimédias ;
- dans les contenus sensibles ;
- dans les notifications de modération ;
- dans les paramètres sécurité.

Les labels critiques doivent être visibles près du contenu concerné, pas cachés dans un menu.

## 7. DIMENSIONS & ESPACEMENTS

### Mobile :

- badge fiabilité : 22 à 28 px de haut ;
- alerte inline : 56 à 110 px ;
- bottom sheet signalement : 65 à 90 % hauteur ;
- bouton action : 44 à 56 px ;
- carte modération : 96 à 160 px ;
- padding : 16 à 20 px.

### Desktop :

- panneau détail : 320 à 420 px ;
- carte signalement : 420 à 560 px ;
- badges : 24 à 30 px ;
- alertes : 80 à 140 px.

## 8. COULEURS

Palette sécurité :

- fond : noir charbon ;
- surface : graphite chaud ;
- confiance : or doux ;
- prudence : ocre/cuivre ;
- danger réel : rouge très sombre et rare ;
- source fiable : beige/or ;
- source douteuse : ocre mat ;
- blocage : graphite + bordure cuivre ;
- modération : bouclier ambre.

Ne jamais transformer l'interface en panneau rouge. Le rouge doit être réservé aux situations réellement graves.

## 9. TYPOGRAPHIE

Messages de sécurité :

- courts ;
- précis ;
- non accusateurs ;
- orientés action.

Tailles :

- titre alerte : 15 à 18 px ;
- texte : 13 à 15 px ;
- détails : 12 à 13 px ;
- badge : 11 à 12 px.

Ton :

- ferme ;
- respectueux ;
- pédagogique ;
- jamais humiliant.

## 10. BOUTONS

Boutons principaux :

- Signaler ;
- Masquer ;
- Bloquer ;
- Voir pourquoi ;
- Modifier ;
- Reformuler ;
- Publier quand même si autorisé ;
- Demander révision ;
- Voir règles ;
- Ajouter une source ;
- Continuer avec prudence.

Boutons destructifs :

- doivent demander confirmation ;
- doivent expliquer l'effet ;
- ne doivent pas être accidentels.

## 11. CARTES

Types de cartes :

- carte avertissement ;
- carte signalement ;
- carte contenu masqué ;
- carte source douteuse ;
- carte source fiable ;
- carte modération ;
- carte blocage ;
- carte appel à la nuance ;
- carte règle communautaire ;
- carte décision.

Chaque carte doit avoir :

- contexte ;
- raison ;
- action ;
- possibilité de détail.

## 12. ICONOGRAPHIE

Icônes :

- bouclier ;
- balance ;
- papyrus ;
- source ;
- alerte ocre ;
- œil masqué ;
- blocage ;
- signalement ;
- information ;
- plume nuance ;
- poignée de main abstraite ;
- sceau de fiabilité.

Iconographie fine, jamais policière de façon brutale.

## 13. COMPORTEMENT SCROLL

Les alertes ne doivent pas casser le scroll.
Si un contenu est masqué, garder son emplacement sous forme de carte réduite avec option "Voir quand même" si autorisé.
Dans un thread, les avertissements doivent rester contextuels et ne pas noyer la discussion.

## 14. ANIMATIONS

Animations sobres :

- apparition douce d'une alerte ;
- contenu masqué qui se replie ;
- signalement confirmé avec coche sobre ;
- blocage appliqué avec transition calme ;
- badge source qui s'affiche sans clignoter.

Aucune animation punitive, aucune secousse dramatique.

## 15. MICRO INTERACTIONS

- tap badge : explication ;
- tap signaler : choix de motif ;
- long press contenu : menu sécurité ;
- tap "voir pourquoi" : détail ;
- tap "ajouter source" : ouverture source composer ;
- tap "reformuler" : aide IA ou suggestion ;
- tap "masquer" : carte disparaît avec undo.

## 16. GESTURES MOBILE

Gestes :

- long press sur contenu pour signaler/masquer ;
- swipe pour masquer un contenu ;
- swipe down pour fermer sheet ;
- tap hors sheet pour fermer si pas d'action critique ;
- pull-to-refresh dans centre sécurité si nécessaire.

Toutes les actions sensibles doivent avoir une alternative visible.

## 17. ÉTATS LOADING

Loading modération :

- skeleton court ;
- message "Analyse en cours…" uniquement dans contexte ;
- ne jamais bloquer tout l'écran pour une action non critique.

Signalement en cours :

- bouton en état loading ;
- carte stable ;
- aucune perte du motif sélectionné.

## 18. ÉTATS ERREUR

Erreurs possibles :

- signalement non envoyé ;
- action de blocage échouée ;
- contenu déjà supprimé ;
- modération indisponible ;
- réseau instable ;
- source impossible à vérifier.

Chaque erreur doit proposer :

- réessayer ;
- sauvegarder l'action localement ;
- revenir ;
- contacter support si nécessaire.

## 19. ÉTATS OFFLINE

Offline :

- signalement peut être mis en file d'attente ;
- blocage local appliqué immédiatement si possible ;
- masquage local disponible ;
- vérification source indisponible ;
- règles communautaires disponibles localement ;
- synchronisation au retour réseau.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Mobile :

- sheets ;
- actions compactes ;
- long press utile.

Tablet :

- sheet large ou panneau latéral ;
- lecture plus confortable.

Desktop :

- menus au hover/focus ;
- panneau modération ;
- historique plus lisible.

## 21. ACCESSIBILITÉ

Obligatoire :

- badges textuels ;
- pas d'information uniquement par couleur ;
- focus visible ;
- navigation clavier ;
- lecteur d'écran ;
- descriptions des avertissements ;
- boutons explicites ;
- confirmation actions critiques ;
- réduction motion.

## 22. PERFORMANCE UX

Principes :

- règles locales ;
- modération IA à la demande ou légère ;
- pas d'analyse lourde à chaque frappe ;
- signalement rapide ;
- cache règles ;
- actions optimistes prudentes ;
- synchronisation fiable.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Le système doit fonctionner même avec réseau fragile :

- signalement en attente ;
- blocage local ;
- règles offline ;
- textes prioritaires ;
- pas de dépendance média ;
- modération complète différée ;
- messages simples.

## 24. RÈGLES NON NÉGOCIABLES

- Protéger les personnes sans tuer le débat.
- Expliquer les décisions.
- Permettre le signalement.
- Permettre le blocage.
- Permettre la nuance.
- Ne jamais humilier publiquement.
- Ne jamais déguiser la modération.
- Ne jamais promouvoir une source douteuse sans contexte.
- Ne jamais bloquer toute l'app parce que la modération échoue.
- Toujours garder l'utilisateur en contrôle.

---

*Vision globale du Trust, Safety, Moderation & Reporting System*
