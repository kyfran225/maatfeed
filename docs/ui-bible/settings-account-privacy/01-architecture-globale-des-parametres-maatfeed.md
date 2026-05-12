# 1. ARCHITECTURE GLOBALE DES PARAMÈTRES MAATFEED

## 1. OBJECTIF UX

L'objectif des paramètres est de donner à l'utilisateur un contrôle complet sans l'écraser sous des menus techniques.
Les paramètres doivent être organisés comme un espace personnel clair, découpé en grandes familles compréhensibles :

- Compte ;
- Profil ;
- Feed ;
- Audio ;
- Notifications ;
- Confidentialité ;
- Sécurité ;
- Données & cache ;
- Accessibilité ;
- Langue ;
- Apparence ;
- Connexion faible ;
- Aide.

L'utilisateur doit pouvoir trouver une option en moins de quelques secondes, même sur téléphone, même fatigué, même avec une connexion instable.

## 2. ÉMOTION RECHERCHÉE

L'émotion recherchée est la maîtrise calme.
L'utilisateur doit ressentir :

- "Je comprends ce que je peux régler."
- "Je garde le contrôle sur mes données."
- "L'app respecte mon téléphone, ma data et mon attention."
- "Rien n'est caché."

Les paramètres doivent être sobres, presque cérémoniels, avec une sensation de coffre personnel plutôt que de panneau d'administration.

## 3. STRUCTURE VISUELLE GLOBALE

La page paramètres doit avoir une structure verticale simple :

- header fixe ou semi-sticky ;
- résumé du compte en haut ;
- blocs de réglages groupés ;
- sections critiques en bas ;
- aide et version tout en bas.

Chaque bloc doit être une carte sombre, douce, lisible, avec titre, description courte et icônes symboliques.
Aucune surcharge. Aucun tableau. Aucun style dashboard SaaS.

## 4. LAYOUT EXACT

Mobile :

- header de 56 à 64 px ;
- marge latérale 16 px ;
- liste verticale ;
- cartes groupées avec radius 22 à 26 px ;
- espacement entre sections 18 à 24 px ;
- bottom nav toujours respectée ;
- mini-player audio au-dessus de la bottom nav si actif.

La page doit scroller naturellement. Les réglages ne doivent jamais être compressés dans des petits textes difficiles à toucher.

Desktop :

- colonne gauche avec navigation paramètres ;
- zone centrale avec contenu ;
- colonne droite optionnelle pour aide, résumé sécurité ou stockage ;
- largeur maximale du contenu principal : 720 à 860 px.

## 5. HIERARCHIE VISUELLE

Ordre recommandé :

- carte compte utilisateur ;
- préférences principales ;
- contrôle du feed ;
- audio et médias ;
- notifications ;
- confidentialité ;
- sécurité ;
- données, cache et offline ;
- accessibilité ;
- langue et thème ;
- suppression compte ;
- aide et version.

Les actions dangereuses doivent rester en bas, isolées visuellement.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Header :

- titre "Paramètres" ;
- bouton retour à gauche ;
- icône recherche paramètres à droite ;
- option profil rapide éventuellement.

Carte compte :

- en haut de page ;
- avatar symbolique ;
- nom ;
- @handle ;
- statut compte ;
- bouton "Modifier".

Sections :

- chaque section dans une carte ;
- titre au-dessus ou dans la carte ;
- lignes de réglage empilées ;
- chevron à droite pour sous-pages ;
- switches à droite pour bascules immédiates.

## 7. DIMENSIONS & ESPACEMENTS

Dimensions recommandées :

- marge page mobile : 16 px ;
- padding carte : 16 à 20 px ;
- hauteur ligne réglage : 56 à 64 px ;
- icône section : 22 à 24 px ;
- icône ligne : 18 à 20 px ;
- titre section : 15 à 17 px ;
- description : 13 à 14 px ;
- gap entre lignes : 0 à 4 px ;
- gap entre cartes : 16 à 20 px.

Les lignes doivent avoir une zone tactile confortable, jamais inférieure à 44 px.

## 8. COULEURS

Palette :

- fond général : noir charbon profond ;
- cartes : noir brun légèrement élevé ;
- séparateurs : brun/or à très faible opacité ;
- texte principal : ivoire ;
- texte secondaire : beige-gris ;
- accents actifs : ambre/or ;
- désactivé : gris chaud ;
- danger : rouge argile sombre ;
- succès : vert discret.

Les paramètres ne doivent jamais basculer vers une esthétique blanche système ou gris Android générique.

## 9. TYPOGRAPHIE

Typographie :

- titre page : 22 à 26 px ;
- titre section : 15 à 17 px, semi-bold ;
- libellé ligne : 15 à 16 px ;
- description ligne : 12 à 14 px ;
- microtexte légal : 11 à 12 px.

Les libellés doivent être simples :

- "Mode économie de data"
- "Téléchargements hors connexion"
- "Préférences audio"
- "Confidentialité du profil"
- "Supprimer mon compte"

Éviter le vocabulaire technique type "cache invalidation", "session token", "payload média".

## 10. BOUTONS

Types de boutons :

- bouton principal ambre pour actions positives ;
- bouton secondaire sombre bordé ;
- bouton texte pour actions légères ;
- bouton danger rouge argile pour suppression ou déconnexion globale.

Dans les paramètres, les boutons doivent être calmes, pas publicitaires.
Exemples :

- "Modifier le profil"
- "Gérer le cache"
- "Exporter mes données"
- "Changer le mot de passe"
- "Supprimer le compte"

## 11. CARTES

Types de cartes :

- carte compte ;
- carte groupe de réglages ;
- carte alerte sécurité ;
- carte stockage ;
- carte accessibilité ;
- carte suppression compte.

Chaque carte doit avoir :

- fond sombre ;
- bordure subtile ;
- radius premium ;
- ombre très douce ;
- lisibilité parfaite ;
- aucune décoration gratuite.

## 12. ICONOGRAPHIE

Icônes de sections :

- compte : cercle avatar ou empreinte ;
- feed : flux stylisé ;
- audio : casque ;
- notifications : cloche ;
- confidentialité : bouclier ;
- sécurité : clé ;
- données : disque local ;
- accessibilité : cercle humain abstrait ou réglage ;
- langue : globe ;
- thème : lune/soleil stylisés ;
- aide : point d'interrogation.

Les icônes doivent être fines, cohérentes, non enfantines.

## 13. COMPORTEMENT SCROLL

Le scroll doit être fluide, vertical, sans effets lourds.
Règles :

- header peut rester sticky ;
- les sections défilent naturellement ;
- aucune animation complexe sur chaque ligne ;
- la position doit être restaurée après retour depuis une sous-page ;
- les actions critiques en bas ne doivent pas être atteintes par accident via un geste rapide.

## 14. ANIMATIONS

Animations :

- apparition douce des cartes ;
- transition sous-page depuis la droite sur mobile ;
- fade léger au retour ;
- switch avec mouvement court ;
- confirmation avec micro-check.

Aucune animation spectaculaire. Les paramètres doivent respirer, pas danser.

## 15. MICRO INTERACTIONS

Micro-interactions :

- press state sur chaque ligne ;
- switch avec retour tactile visuel ;
- sauvegarde automatique affichée par "Enregistré" ;
- capsule temporaire après changement ;
- icône qui se colore légèrement quand option active.

Les micro-interactions doivent rassurer : chaque changement doit sembler pris en compte.

## 16. GESTURES MOBILE

Gestes :

- swipe retour depuis sous-page ;
- tap ligne pour ouvrir détail ;
- switch direct pour option simple ;
- long press inutile à éviter ;
- pull-to-refresh non nécessaire sauf données compte.

Les paramètres ne doivent pas dépendre de gestes cachés.

## 17. ÉTATS LOADING

Chargement paramètres :

- skeleton court pour carte compte ;
- lignes fantômes pour sections ;
- aucun spinner plein écran prolongé ;
- préférences locales affichées immédiatement si disponibles.

L'utilisateur doit voir rapidement la structure, même si certaines données arrivent ensuite.

## 18. ÉTATS ERREUR

Erreur :

- message dans la section concernée ;
- jamais écran entier bloqué sauf panne totale ;
- bouton "Réessayer" ;
- indication que les réglages locaux restent disponibles.

Exemple :
"Impossible de charger certaines informations du compte. Tes préférences locales restent accessibles."

## 19. ÉTATS OFFLINE

Offline :

- paramètres locaux accessibles ;
- préférences data/audio/thème/accessibilité modifiables ;
- modifications compte mises en attente ;
- sécurité sensible limitée si besoin ;
- badge "sera synchronisé au retour du réseau".

Les paramètres doivent être utiles hors connexion, surtout pour cache, offline, thème et accessibilité.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Mobile :

- une colonne ;
- grandes zones tactiles ;
- sous-pages plein écran.

Tablette :

- navigation paramètres en panneau gauche ;
- contenu à droite.

Desktop :

- sidebar persistante ;
- contenu central ;
- panneau aide contextuelle possible.

## 21. ACCESSIBILITÉ

Les paramètres doivent être exemplaires :

- labels explicites ;
- switches annoncés correctement ;
- contrastes élevés ;
- navigation clavier ;
- tailles tactiles ;
- texte adaptable ;
- réduction motion respectée.

Les options critiques doivent avoir des explications accessibles, pas seulement des icônes.

## 22. PERFORMANCE UX

Les paramètres doivent charger vite :

- préférences locales d'abord ;
- données compte ensuite ;
- sections lourdes différées ;
- pas d'images inutiles ;
- pas d'animation coûteuse ;
- sauvegarde optimiste claire.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Les paramètres doivent mettre en avant :

- mode économie de data ;
- téléchargements hors connexion ;
- qualité audio/vidéo ;
- cache ;
- stockage ;
- synchronisation différée ;
- notifications moins lourdes.

L'utilisateur doit pouvoir adapter MAATFEED à son forfait, son téléphone et son réseau.

## 24. RÈGLES NON NÉGOCIABLES

- Ne jamais cacher les options importantes dans des menus profonds.
- Ne jamais utiliser un style système générique.
- Ne jamais rendre les paramètres dépendants d'une connexion stable.
- Ne jamais placer suppression compte près d'actions ordinaires.
- Toujours expliquer les options sensibles.
- Toujours respecter la lisibilité mobile.
- Toujours permettre à l'utilisateur de contrôler data, confidentialité et notifications.

---

*Architecture globale des paramètres MAATFEED*
