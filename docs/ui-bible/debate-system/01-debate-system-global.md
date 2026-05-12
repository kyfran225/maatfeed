# 1. DEBATE SYSTEM GLOBAL

## 1. OBJECTIF UX

Créer un système de débat premium où l'utilisateur peut lire rapidement une question, comprendre les positions, écouter des réponses audio, regarder des réponses vidéo, consulter des documents, citer des arguments et répondre sans friction. Le débat doit être au cœur de la rétention MAATFEED.

## 2. ÉMOTION RECHERCHÉE

Respect, curiosité, intensité calme, intelligence collective. L'utilisateur doit sentir qu'il entre dans une salle de discussion culturelle sérieuse, mais vivante, accessible et moderne.

## 3. STRUCTURE VISUELLE GLOBALE

Le débat repose sur quatre couches : sujet principal, statistiques et contexte, réponses hiérarchisées, zone de contribution. Les réponses peuvent être texte, audio, vidéo, image/photo, document ou lien. L'IA contextuelle peut intervenir comme guide, pas comme bruit.

## 4. LAYOUT EXACT

Mobile : une colonne verticale.
Header : 52 à 60 px.
Bloc sujet : 160 à 280 px selon richesse.
Tabs réponses : 44 à 48 px.
Liste réponses : cartes empilées avec 12 à 16 px d'écart.
Composer sticky : 48 à 64 px en bas si l'utilisateur peut répondre.
Bottom nav cachée ou secondaire selon profondeur de page.

Desktop : workspace débat multi-panel avec liste des débats à gauche, détail au centre, réponses/contexte/IA à droite.

## 5. HIERARCHIE VISUELLE

Priorité 1 : question ou thèse du débat.
Priorité 2 : règles, catégorie, auteur/modérateur, stats.
Priorité 3 : réponses les plus pertinentes.
Priorité 4 : réactions, citations, réponses secondaires.
Priorité 5 : actions avancées et filtres.

## 6. POSITIONNEMENT DES ÉLÉMENTS

La question occupe le haut de l'écran. Les stats sont sous la question. Les onglets de tri se placent juste avant les réponses. Les actions de réponse sont proches du bas pour usage au pouce. Les options avancées restent dans menus ou sheets.

## 7. DIMENSIONS & ESPACEMENTS

Marge mobile : 16 px.
Bloc sujet padding : 16 à 20 px.
Carte réponse padding : 14 à 16 px.
Avatar réponse : 32 à 40 px.
Bouton répondre sticky : hauteur 48 à 56 px.
Écart entre réponses : 12 à 16 px.

## 8. COULEURS

Fond noir charbon. Bloc sujet avec gradient ambre très subtil si débat important. Réponses sur surfaces sombres. Réponse IA avec badge or/bleu très discret. Réponse sélectionnée ou citée avec bordure or faible.

## 9. TYPOGRAPHIE

Question : 20 à 24 px mobile, semibold.
Description débat : 14 à 15 px.
Réponse texte : 14 à 16 px, line-height confortable.
Auteur : 13 à 14 px medium.
Stats : 12 à 13 px.

## 10. BOUTONS

Boutons principaux : "Répondre", "Réponse audio", "Réponse vidéo", "Citer", "Partager", "Suivre le débat". Le CTA principal doit être clair, mais ne doit pas transformer le débat en arène agressive.

## 11. CARTES

Les réponses sont des cartes légères, pas de gros blocs fermés. Les réponses riches ont des sous-surfaces média. Les réponses IA ou modérateur sont identifiables sans être écrasantes.

## 12. ICONOGRAPHIE

Icônes : réponse, micro, vidéo, image, document, citation, réaction, tri, modération, IA, épingle. Style fin, cohérent, premium.

## 13. COMPORTEMENT SCROLL

Le bloc sujet peut se compacter au scroll. Les tabs de tri peuvent devenir sticky. Le composer peut rester en bas. Le retour depuis une réponse détaillée restaure la position exacte dans le fil.

## 14. ANIMATIONS

Ouverture débat : transition depuis carte feed vers page détail. Réponses : apparition douce. Composer : slide up. Réaction : micro-feedback. Citation : surlignage doré temporaire.

## 15. MICRO INTERACTIONS

Tap réponse : détail. Tap auteur : profil. Tap audio : lecture inline ou mini-player. Tap citer : ouvre composer avec citation. Tap IA : expansion de l'explication.

## 16. GESTURES MOBILE

Swipe down pour revenir si page ouverte en sheet profonde. Long press réponse : options. Swipe léger sur réponse : sauvegarder ou citer si introduit. Tap long sur texte : sélectionner/citer.

## 17. ÉTATS LOADING

Afficher d'abord le sujet, puis skeleton réponses. Les réponses média chargent après le texte. Les audios affichent waveform placeholder. Les vidéos affichent poster.

## 18. ÉTATS ERREUR

Si les réponses échouent, le sujet reste visible avec CTA "Réessayer". Si le sujet échoue, afficher carte erreur complète + retour au feed. Ne jamais perdre une réponse en cours.

## 19. ÉTATS OFFLINE

Débats consultés restent lisibles. Réponses rédigées deviennent brouillons. Likes, sauvegardes, citations et réponses peuvent être mis en attente selon criticité.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Mobile : une colonne.
Tablet : sujet + réponses avec panneau IA ou contexte.
Desktop : workspace multi-panel.
Le desktop doit enrichir le débat, pas le transformer en tableau froid.

## 21. ACCESSIBILITÉ

Question annoncée comme titre principal. Réponses structurées. Boutons labellisés. Audio avec durée et transcription quand disponible. Vidéo avec sous-titres quand disponibles.

## 22. PERFORMANCE UX

Charger d'abord texte et structure. Médias à la demande. Réponses longues virtualisées si nécessaire. Aucune vidéo ne doit bloquer la lecture du débat.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Le débat texte doit fonctionner même en réseau faible. Audio prioritaire sur vidéo. Documents lourds différés. Brouillons locaux obligatoires.

## 24. RÈGLES NON NÉGOCIABLES

Un débat MAATFEED ne doit jamais ressembler à une zone commentaire brouillonne. Il doit être lisible, hiérarchisé, respectueux, multimédia, sauvegardable, accessible et robuste hors ligne.

---

*Système de débat global pour MAATFEED*
