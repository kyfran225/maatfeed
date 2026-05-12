# 0. INTENTION GÉNÉRALE DU DESIGN MAATFEED

## 1. OBJECTIF UX

Créer une interface sociale culturelle immersive, premium, mobile-first, audio-first et débat-first, capable de faire ressentir à l'utilisateur qu'il entre dans un espace vivant de savoir africain, de débat intelligent, de musique, de voix, de spiritualité, de culture et de découverte continue. L'interface doit soutenir trois usages majeurs : consommer rapidement, écouter longtemps, répondre intelligemment.

## 2. ÉMOTION RECHERCHÉE

L'utilisateur doit ressentir : profondeur, prestige, calme, curiosité, respect, intelligence, appartenance et envie de rester. MAATFEED ne doit pas ressembler à une application utilitaire froide. L'expérience doit avoir une présence presque cinématographique : une scène sombre, des cartes lumineuses, des voix qui émergent, des débats qui respirent, des contenus qui semblent précieux.

## 3. STRUCTURE VISUELLE GLOBALE

L'interface repose sur une base dark premium : noir charbon profond, surfaces gris-noir, reflets ambre/or, bordures fines et gradients subtils. Les contenus principaux apparaissent comme des cartes immersives posées sur un fond sombre. Les zones importantes sont éclairées par l'ambre. Les actions primaires sont toujours dorées. Les textes restent très lisibles, jamais trop décoratifs.

## 4. LAYOUT EXACT

Le layout canonique mobile est un écran vertical 390 × 844 px comme référence de design. Les éléments doivent respecter une marge horizontale principale de 16 px, une zone de contenu centrale, une navigation basse persistante et une hiérarchie claire entre le contenu, les actions, les métadonnées et les interactions communautaires. Sur desktop, l'interface devient multi-panel, mais la logique visuelle mobile reste la source de vérité.

## 5. HIERARCHIE VISUELLE

- **Priorité 1** : média principal, audio actif, question de débat ou titre de contenu
- **Priorité 2** : créateur, catégorie, durée, statistiques principales
- **Priorité 3** : actions sociales, réponses, citations, sauvegardes
- **Priorité 4** : informations secondaires, paramètres, détails longs

L'or est réservé à ce qui guide, engage ou confirme. Le blanc pur est utilisé avec parcimonie pour les titres. Le gris adoucit la lecture.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Les éléments ne doivent jamais flotter au hasard. Les zones supérieures servent à l'orientation : retour, titre, recherche, onglets. Le centre sert au contenu. Le bas sert à l'action : navigation, CTA, input de réponse, mini-player ou sheet. Les composants importants doivent être alignés sur une grille invisible de 4 px.

## 7. DIMENSIONS & ESPACEMENTS

Un rythme de spacing basé sur 4 px doit structurer toute l'application : 4, 8, 12, 16, 20, 24, 32, 40, 48. La marge latérale mobile standard est 16 px. Les cartes pleine largeur utilisent 16 px de marge externe. Les cartes compactes utilisent 12 px de padding interne. Les surfaces premium utilisent 16 à 20 px de padding. Aucun écran ne doit sembler comprimé.

## 8. COULEURS

La palette principale : noir charbon profond, noir absolu contrôlé, gris graphite, gris fumée, blanc cassé, ambre doré, or profond, rouge discret pour danger, vert discret pour validation. Le fond ne doit jamais être plat : il doit contenir une très légère profondeur, mais sans bruit visuel excessif.

## 9. TYPOGRAPHIE

La typographie doit être moderne, nette, très lisible sur mobile. Les titres sont semi-bold ou bold. Les corps de texte sont regular ou medium. Les labels sont petits, précis et respirants. Les nombres et statistiques doivent être très lisibles. Les textes longs doivent être fractionnés, jamais en blocs intimidants.

## 10. BOUTONS

Les boutons primaires sont dorés avec texte noir ou charbon. Les boutons secondaires sont sombres avec bordure graphite. Les boutons destructifs sont rouges discrets, jamais criards. Les boutons doivent être hauts, tactiles et faciles à atteindre. Minimum recommandé : 44 px de hauteur pour un bouton d'action mobile.

## 11. CARTES

Les cartes sont le langage central de MAATFEED. Elles doivent avoir des coins arrondis généreux, des bordures fines, une ombre subtile et parfois un léger halo doré quand elles sont actives ou sélectionnées. Les cartes média doivent être immersives. Les cartes débat doivent privilégier la lisibilité. Les cartes audio doivent faire sentir la présence du son.

## 12. ICONOGRAPHIE

Les icônes doivent être fines, élégantes, modernes, non cartoon. L'iconographie doit combiner des symboles universels avec une sensibilité MAAT/Kemet discrète : triangle, disque, onde, parchemin, voix, débat, cercle solaire. Les icônes ne doivent pas surcharger l'interface.

## 13. COMPORTEMENT SCROLL

Le scroll doit être fluide, stable et prévisible. Le feed vertical doit donner une sensation de continuité. Les listes longues doivent charger par blocs. Les headers peuvent se réduire légèrement au scroll. Les onglets doivent rester accessibles quand l'écran contient beaucoup de contenu. Le scroll ne doit pas casser l'audio actif.

## 14. ANIMATIONS

Les animations doivent être fluides, courtes, précises. Elles doivent servir la compréhension, pas faire spectacle. Les transitions principales doivent durer entre 180 et 320 ms. Les sheets peuvent monter en 260 à 360 ms avec un mouvement doux. Les micro-interactions doivent être rapides : 100 à 180 ms.

## 15. MICRO INTERACTIONS

Chaque action importante doit répondre : pression, like, sauvegarde, lecture audio, publication, changement d'onglet, ouverture de sheet. Les réponses doivent être tactiles et visuelles : légère réduction d'échelle, halo doré, vibration optionnelle sur mobile, changement d'opacité, feedback sonore désactivable.

## 16. GESTURES MOBILE

MAATFEED doit accepter les gestes naturels : swipe vertical dans le feed, swipe horizontal entre onglets proches, drag du mini-player vers le full player, drag des bottom sheets, tap long pour options, double tap contrôlé pour aimer ou réagir, swipe down pour fermer certains overlays.

## 17. ÉTATS LOADING

Les chargements doivent préserver l'illusion d'un produit vivant. Utiliser skeletons sombres, shimmer très subtil, placeholders média, progress bars fines, loaders dorés discrets. Éviter les spinners agressifs isolés. Pour le feed, afficher d'abord la structure, puis les médias, puis les détails.

## 18. ÉTATS ERREUR

Les erreurs doivent être calmes, humaines, courtes et utiles. Elles apparaissent dans des cartes sombres avec icône fine, titre clair, message simple et bouton d'action. Ne jamais afficher des erreurs techniques brutes. Les erreurs réseau doivent proposer réessayer, sauvegarder hors ligne ou continuer en mode léger.

## 19. ÉTATS OFFLINE

Le mode offline doit être traité comme une expérience prévue, pas comme une panne. Les contenus déjà consultés, audios téléchargés, brouillons et playlists sauvegardées doivent rester visibles. Un bandeau discret indique l'absence de connexion. Les actions non envoyées sont mises en file d'attente visuelle.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

- **Mobile** : priorité feed, audio, débat, action rapide
- **Tablet** : deux colonnes possibles, feed + détails ou liste + lecteur
- **Desktop** : workspace premium multi-panels avec feed, détail, débat, player sticky et sidebar

La version desktop ne doit pas devenir un dashboard SaaS. Elle doit rester immersive.

## 21. ACCESSIBILITÉ

Contrastes forts, zones tactiles généreuses, textes lisibles, labels explicites, focus visible, navigation clavier desktop, réduction des animations possible, alternatives textuelles pour médias, transcription audio quand disponible, indications claires pour contenu sponsorisé.

## 22. PERFORMANCE UX

L'interface doit sembler rapide même quand la connexion est lente. Priorité : shell instantané, skeletons propres, chargement progressif des médias, compression visuelle, préchargement léger du contenu suivant, audio en priorité quand pertinent, images adaptatives.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

MAATFEED doit fonctionner dignement sur réseau instable. Les vidéos ne doivent pas bloquer l'expérience. L'audio doit être privilégié comme fallback noble. Les miniatures doivent charger avant les vidéos. Les débats texte doivent rester accessibles même si les médias sont différés. Les actions utilisateur doivent être sauvegardées localement avant synchronisation.

## 24. RÈGLES NON NÉGOCIABLES

- Ne jamais produire une UI générique
- Ne jamais copier TikTok directement
- Ne jamais transformer MAATFEED en dashboard SaaS
- Toujours préserver la profondeur noire/or, la lisibilité, la fluidité mobile, l'importance de l'audio, la place centrale du débat et la sensation d'un produit culturel premium africain futuriste

---

*Document fondamental du système de design MAATFEED*
