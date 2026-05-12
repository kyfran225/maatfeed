# 4. ANTI-PATTERNS INTERDITS & ERREURS À ÉVITER

## 1. OBJECTIF UX

Cette section liste ce qui doit être explicitement évité. Elle protège MAATFEED contre les mauvaises décisions fréquentes : interface générique, surcharge, imitation TikTok, dashboard froid, effets inutiles, performance négligée.

## 2. ÉMOTION RECHERCHÉE

L'utilisateur ne doit jamais ressentir :

- confusion ;
- fatigue ;
- manipulation ;
- froideur ;
- pauvreté visuelle ;
- surcharge ;
- perte de contrôle ;
- impression d'app copiée.

## 3. STRUCTURE VISUELLE GLOBALE

Anti-patterns globaux :

- écran blanc générique ;
- cartes grises plates ;
- boutons bleus SaaS ;
- sidebar dashboard ;
- feed clone TikTok ;
- popups agressifs ;
- texte minuscule ;
- animations gadgets ;
- modales non fermables ;
- offline mort.

## 4. LAYOUT EXACT

Interdits layout :

- marges incohérentes ;
- éléments collés aux bords ;
- bottom nav qui cache le contenu ;
- mini-player qui bloque les boutons ;
- desktop trop large sans max-width ;
- cartes sans respiration ;
- formulaires interminables sans groupement.

## 5. HIERARCHIE VISUELLE

Interdits hiérarchie :

- sponsor plus visible que contenu ;
- bouton premium plus fort que lecture ;
- badges partout ;
- actions sociales plus visibles que débat ;
- erreur qui écrase toute la page ;
- média qui masque titre et contexte.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Interdits placement :

- bouton danger près d'un bouton ordinaire ;
- prompt installation au centre dès ouverture ;
- notification flottante permanente ;
- bouton création qui cache player ;
- action critique cachée dans menu ambigu ;
- badge offline loin du contenu concerné.

## 7. DIMENSIONS & ESPACEMENTS

Interdits dimensions :

- boutons sous 44 px ;
- texte critique sous 12 px ;
- cartes trop serrées ;
- icônes microscopiques ;
- capsules illisibles ;
- modales plein écran sans raison ;
- scroll horizontal accidentel.

## 8. COULEURS

Interdits couleurs :

- bleu corporate par défaut ;
- rouge vif omniprésent ;
- blanc pur dominant ;
- gris froid dashboard ;
- or utilisé partout sans hiérarchie ;
- couleurs de statut contradictoires ;
- gradient criard.

## 9. TYPOGRAPHIE

Interdits typo :

- paragraphes énormes dans feed ;
- labels techniques ;
- textes tronqués sans raison ;
- microtexte important ;
- mélange de styles ;
- capitale partout ;
- faible contraste.

## 10. BOUTONS

Interdits boutons :

- trop de CTA ;
- bouton principal ambigu ;
- bouton danger trop proche ;
- bouton icône seul pour action critique ;
- disabled sans explication ;
- loading sans retour ;
- libellés vagues comme "OK" partout.

## 11. CARTES

Interdits cartes :

- cartes plates sans hiérarchie ;
- cartes avec trop d'actions visibles ;
- cartes média sans fallback ;
- cartes offline sans statut ;
- cartes débat sans contexte ;
- cartes audio traitées comme simples fichiers.

## 12. ICONOGRAPHIE

Interdits icônes :

- mélange d'icônes non harmonisées ;
- icônes emoji comme système principal ;
- icônes trop épaisses ;
- icônes sans texte pour fonctions sensibles ;
- icônes IA humanoïdes pour personas IA ;
- pictogrammes génériques sans âme.

## 13. COMPORTEMENT SCROLL

Interdits scroll :

- retour en haut inattendu ;
- jumps layout ;
- infinite scroll sans fin claire ;
- chargement média agressif ;
- thread débat qui perd la position ;
- pull refresh qui efface un brouillon.

## 14. ANIMATIONS

Interdits motion :

- rebond cartoon ;
- glow permanent ;
- transitions trop longues ;
- parallaxe coûteuse ;
- shimmer trop fort ;
- animations non désactivables ;
- motion différente par page sans logique.

## 15. MICRO INTERACTIONS

Interdits feedback :

- aucune confirmation après action ;
- like qui ne répond pas ;
- téléchargement sans progression ;
- publication sans statut ;
- sync invisible ;
- erreur brutale ;
- suppression sans annulation.

## 16. GESTURES MOBILE

Interdits gestures :

- action destructive par swipe direct ;
- gesture cachée obligatoire ;
- conflit swipe horizontal/vertical ;
- long press nécessaire pour action principale ;
- sheet impossible à fermer ;
- player difficile à réduire.

## 17. ÉTATS LOADING

Interdits loading :

- spinner plein écran partout ;
- skeleton sans fin ;
- loading qui bloque lecture audio ;
- médias qui empêchent texte ;
- boutons bloqués sans message ;
- absence de loading sur action lente.

## 18. ÉTATS ERREUR

Interdits erreur :

- code technique brut ;
- écran vide ;
- message culpabilisant ;
- erreur sans action ;
- couleur rouge agressive ;
- perte de contenu utilisateur ;
- "Réessayer" comme seule réponse partout.

## 19. ÉTATS OFFLINE

Interdits offline :

- page "No Internet" générique ;
- feed vide sans explication ;
- brouillons perdus ;
- actions sociales oubliées ;
- téléchargement sans statut ;
- recherche qui prétend être globale ;
- sync non visible.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Interdits responsive :

- desktop conçu avant mobile ;
- mobile compressé depuis desktop ;
- tablette ignorée ;
- bottom nav mal adaptée ;
- modale desktop sur mobile ;
- zones tactiles trop petites ;
- overflow horizontal.

## 21. ACCESSIBILITÉ

Interdits accessibilité :

- contraste faible ;
- couleur seule pour statut ;
- labels absents ;
- boutons non nommés ;
- focus invisible ;
- motion imposée ;
- audio sans alternative quand nécessaire ;
- erreur non annoncée.

## 22. PERFORMANCE UX

Interdits performance :

- vidéo prioritaire sur texte ;
- autoplay systématique ;
- images énormes ;
- scripts inutiles ;
- cache non maîtrisé ;
- app shell lent ;
- animations coûteuses ;
- absence de Low Data.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Interdits Afrique réelle :

- supposer Wi-Fi stable ;
- supposer téléphone puissant ;
- supposer data illimitée ;
- supposer vidéo toujours possible ;
- ignorer offline ;
- masquer qualité légère ;
- forcer médias lourds ;
- culpabiliser l'utilisateur.

## 24. RÈGLES NON NÉGOCIABLES

- Tout anti-pattern détecté doit être corrigé avant validation.
- Toute page générique doit être retravaillée.
- Toute action sans feedback est incomplète.
- Tout média sans fallback est incomplet.
- Tout écran sans offline est incomplet.
- Tout composant non accessible est incomplet.
- Tout design non mobile-first est non MAATFEED-ready.

---

*Anti-patterns interdits et erreurs à éviter pour MAATFEED*
