# 2. COHÉRENCE UI, UX, MOTION & RESPONSIVE

## 1. OBJECTIF UX

Cette section définit comment maintenir une cohérence parfaite entre tous les écrans. L'utilisateur doit pouvoir passer du feed à un débat, d'un débat à un audio, d'un audio à une série, d'une série à un profil, d'un profil aux paramètres, sans sentir de rupture.
Chaque partie de MAATFEED doit parler la même langue visuelle.

## 2. ÉMOTION RECHERCHÉE

L'émotion recherchée est la continuité.
L'app doit donner l'impression d'un seul univers, pas d'un assemblage de modules fabriqués séparément.

## 3. STRUCTURE VISUELLE GLOBALE

Les mêmes patterns doivent revenir :

- headers ;
- bottom nav ;
- mini-player ;
- cards ;
- sheets ;
- modales ;
- badges ;
- loaders ;
- boutons ;
- menus ;
- empty states ;
- offline states ;
- confirmations.

Chaque pattern peut s'adapter au contexte, mais ne doit pas changer de nature.

## 4. LAYOUT EXACT

Règles :

- header mobile homogène ;
- bottom nav persistante ;
- padding horizontal constant ;
- cartes alignées ;
- sheets avec même radius ;
- modales centrées ou bottom selon mobile ;
- desktop avec max-widths cohérents.

Un écran ne doit pas inventer son propre système d'espacement.

## 5. HIERARCHIE VISUELLE

La hiérarchie doit rester reconnaissable :

- titre principal ;
- contexte ;
- contenu ;
- action ;
- méta ;
- secondaire.

Les pages de création, débat et profil peuvent être riches, mais elles doivent garder une lecture immédiate.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Règles de positionnement :

- action principale en bas ou proche du contenu actif ;
- statut proche du composant concerné ;
- menu plus à droite ;
- retour à gauche ;
- badges sur cartes, pas flottants au hasard ;
- notifications dans centre dédié.

## 7. DIMENSIONS & ESPACEMENTS

Standardisation :

- mêmes hauteurs de boutons ;
- mêmes radius ;
- mêmes marges ;
- mêmes espacements de cartes ;
- mêmes tailles d'icônes ;
- mêmes hauteurs de capsules.

Les différences doivent être justifiées par l'usage, jamais par hasard.

## 8. COULEURS

La cohérence couleur repose sur la fonction :

- or = action/valeur/premium ;
- ivoire = texte fort ;
- beige-gris = texte secondaire ;
- rouge argile = danger ;
- ambre = attention/data/sync ;
- vert discret = succès ;
- gris chaud = désactivé.

Ne jamais utiliser une couleur différente pour la même fonction.

## 9. TYPOGRAPHIE

Règles :

- mêmes styles de titres ;
- mêmes tailles de corps ;
- mêmes captions ;
- mêmes labels de boutons ;
- pas de mélange typographique sauvage ;
- pas d'écrans avec microtexte critique.

## 10. BOUTONS

Boutons cohérents :

- même forme ;
- même hauteur ;
- même pression ;
- même état disabled ;
- même loading ;
- même danger.

Un bouton principal MAATFEED doit être reconnaissable partout.

## 11. CARTES

Cartes cohérentes :

- radius similaire ;
- padding similaire ;
- fond similaire ;
- bordure subtile ;
- hiérarchie interne stable.

Une carte débat peut être plus textuelle, une carte audio plus rythmée, mais les deux doivent appartenir à la même famille.

## 12. ICONOGRAPHIE

Règles :

- même épaisseur ;
- même style ;
- même taille ;
- même logique d'accent ;
- pas d'icônes remplies mélangées avec des icônes outline sans raison.

## 13. COMPORTEMENT SCROLL

Le scroll doit :

- garder le contexte ;
- éviter les retours en haut non demandés ;
- préserver le player ;
- préserver les brouillons ;
- charger progressivement ;
- respecter la mémoire de navigation.

## 14. ANIMATIONS

Motion cohérente :

- sheets montent ;
- modales fondent ;
- cartes apparaissent ;
- boutons pressent ;
- badges pulsent rarement ;
- erreurs glissent doucement.

Aucune page ne doit avoir sa propre chorégraphie étrangère.

## 15. MICRO INTERACTIONS

Micro-interactions globales :

- "enregistré" ;
- "envoyé" ;
- "en attente" ;
- "offline" ;
- "téléchargé" ;
- "premium débloqué".

Ces états doivent être représentés de façon constante.

## 16. GESTURES MOBILE

Les gestures doivent rester constantes :

- swipe down ferme sheet ;
- swipe back revient ;
- pull refresh rafraîchit ;
- long press ouvre options ;
- tap ouvre ;
- tap extérieur ferme modal non critique.

## 17. ÉTATS LOADING

Les loaders doivent être familiaux :

- skeletons éditoriaux ;
- shimmer discret ;
- progress bars médias ;
- loading bouton ;
- jamais spinner brut isolé sans contexte.

## 18. ÉTATS ERREUR

Erreurs cohérentes :

- titre court ;
- explication ;
- action ;
- alternative ;
- aucun code technique.

Même structure partout.

## 19. ÉTATS OFFLINE

Offline cohérent :

- badge ;
- contenu local ;
- action en attente ;
- bouton réessayer ;
- message doux.

Le vocabulaire offline doit rester identique partout.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Breakpoints conceptuels :

- mobile compact : une colonne, actions tactiles ;
- mobile large : respiration accrue ;
- tablette : deux zones possibles ;
- desktop : multi-panel contrôlé.

Ne jamais densifier simplement parce que l'écran est grand.

## 21. ACCESSIBILITÉ

Cohérence accessibilité :

- mêmes labels ;
- mêmes focus states ;
- mêmes contrastes ;
- mêmes tailles tactiles ;
- mêmes comportements clavier ;
- mêmes alternatives média.

## 22. PERFORMANCE UX

La cohérence ne doit pas alourdir.
Réutiliser mentalement les patterns :

- moins d'apprentissage ;
- moins d'hésitation ;
- moins de fatigue ;
- plus de vitesse perçue.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

La cohérence doit aussi exister en low data :

- mêmes badges ;
- mêmes alternatives ;
- mêmes boutons ;
- mêmes règles autoplay ;
- mêmes messages sync.

## 24. RÈGLES NON NÉGOCIABLES

- Ne jamais créer un nouveau pattern si un pattern existant suffit.
- Ne jamais changer les couleurs fonctionnelles.
- Ne jamais changer les gestures d'un écran à l'autre.
- Ne jamais laisser une page sans état offline.
- Ne jamais utiliser un loader générique par paresse.
- Toujours respecter les composants maîtres.
- Toujours tester mobile avant desktop.

---

*Cohérence UI, UX, Motion & Responsive pour MAATFEED*
