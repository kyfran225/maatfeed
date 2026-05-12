# 6. GESTION CACHE, OFFLINE, STOCKAGE, LANGUE, THÈME & ACCESSIBILITÉ

## 1. OBJECTIF UX

Cette section permet à l'utilisateur d'adapter MAATFEED à son téléphone, sa connexion, sa langue, ses capacités visuelles et son confort.
Elle regroupe :

- cache ;
- téléchargements offline ;
- stockage ;
- low data ;
- langue ;
- thème ;
- taille du texte ;
- réduction motion ;
- contraste ;
- préférences lecture.

## 2. ÉMOTION RECHERCHÉE

L'utilisateur doit ressentir :

- confort ;
- contrôle matériel ;
- inclusion ;
- respect de sa data ;
- adaptation personnelle.

MAATFEED doit sembler souple, pas imposée.

## 3. STRUCTURE VISUELLE GLOBALE

Sections :

- Connexion & data ;
- Téléchargements ;
- Stockage ;
- Apparence ;
- Langue ;
- Accessibilité ;
- Lecture.

Chaque section doit avoir un résumé d'état.

## 4. LAYOUT EXACT

Mobile :

- carte "Mode économie" en haut ;
- jauge stockage ;
- liste téléchargements ;
- thème/langue ;
- accessibilité ;
- bouton nettoyage.

Le cache/offline doit être très accessible, surtout après la Phase UI 13.

## 5. HIERARCHIE VISUELLE

Priorité :

- mode économie ;
- téléchargements offline ;
- stockage ;
- qualité médias ;
- langue ;
- thème ;
- accessibilité ;
- nettoyage avancé.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Mode économie :

- première carte ;
- switch visible ;
- description courte.

Stockage :

- jauge ;
- catégories : audio, vidéo, images, documents, cache temporaire ;
- bouton gérer.

Accessibilité :

- section claire ;
- options avec preview immédiate.

## 7. DIMENSIONS & ESPACEMENTS

Jauge stockage :

- hauteur 8 px ;
- radius complet ;
- marge verticale 12 px ;
- légendes en 12 à 13 px.

Options accessibilité :

- lignes 60 à 70 px ;
- preview texte dans carte ;
- boutons taille texte larges.

## 8. COULEURS

Mode économie :

- ambre doux.

Stockage :

- audio : or ;
- vidéo : brun/ambre ;
- documents : beige ;
- cache temporaire : gris chaud ;
- alerte stockage : rouge argile.

Thème :

- dark premium par défaut ;
- éventuel mode noir profond ;
- éventuel mode contraste élevé.

## 9. TYPOGRAPHIE

Libellés :

- "Mode économie de data"
- "Télécharger sur Wi-Fi seulement"
- "Stockage utilisé"
- "Cache temporaire"
- "Supprimer les fichiers locaux"
- "Langue de l'application"
- "Taille du texte"
- "Réduire les animations"
- "Contraste renforcé"

## 10. BOUTONS

Boutons :

- "Gérer les téléchargements"
- "Nettoyer le cache temporaire"
- "Supprimer les vidéos locales"
- "Changer la langue"
- "Tester l'affichage"
- "Réinitialiser accessibilité"

Les suppressions locales doivent préciser qu'elles ne suppriment pas le compte.

## 11. CARTES

Carte data :

- état mode économie ;
- qualité média ;
- Wi-Fi seulement ;
- autoplay.

Carte stockage :

- jauge ;
- catégories ;
- action nettoyage.

Carte accessibilité :

- taille texte ;
- contraste ;
- motion ;
- captions/transcriptions.

## 12. ICONOGRAPHIE

Icônes :

- signal ;
- Wi-Fi ;
- disque ;
- balai ;
- casque ;
- vidéo ;
- document ;
- globe ;
- lune ;
- œil ;
- texte.

## 13. COMPORTEMENT SCROLL

La page doit rester simple :

- sections courtes ;
- détails en sous-pages ;
- stockage détaillé sur demande ;
- accessibilité visible sans chercher.

## 14. ANIMATIONS

Animations :

- jauge stockage se remplit doucement ;
- switch data change avec feedback ;
- thème change par fondu court ;
- taille texte preview instantanée.

Respect strict de "réduire animations".

## 15. MICRO INTERACTIONS

Micro-interactions :

- nettoyage cache affiche libération estimée ;
- changement texte montre preview ;
- thème affiche aperçu ;
- langue demande confirmation ;
- suppression locale propose annuler quelques secondes.

## 16. GESTURES MOBILE

Gestes :

- tap options ;
- swipe sur fichier local pour supprimer ;
- long press téléchargement pour détails ;
- aucun geste destructif sans confirmation.

## 17. ÉTATS LOADING

Loading :

- jauge stockage skeleton ;
- téléchargements locaux rapides ;
- langue/thème disponibles immédiatement ;
- cache calculé progressivement.

## 18. ÉTATS ERREUR

Erreurs :

- impossible de calculer stockage ;
- suppression locale échouée ;
- langue indisponible ;
- thème non appliqué ;
- préférence non sauvegardée.

Toujours garder les réglages actuels stables.

## 19. ÉTATS OFFLINE

Offline :

- cache et téléchargements gérables ;
- langue/thème/accessibilité modifiables ;
- certaines sync préférences différées ;
- nettoyage local disponible.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Mobile :

- priorité data/cache ;
- actions simples.

Tablette :

- stockage en cartes ;
- accessibilité avec preview.

Desktop :

- gestion détaillée ;
- tableau léger possible uniquement pour stockage, mais stylisé MAATFEED.

## 21. ACCESSIBILITÉ

Cette section doit elle-même être parfaitement accessible :

- taille texte modifiable ;
- contraste renforcé ;
- motion réduite ;
- captions ;
- transcriptions ;
- navigation clavier ;
- labels complets.

## 22. PERFORMANCE UX

Ne pas recalculer tout le stockage à chaque ouverture.
Préférer :

- estimation rapide ;
- détail sur demande ;
- nettoyage progressif ;
- feedback immédiat.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Cette section doit être l'un des piliers de l'application :

- mode économie visible ;
- Wi-Fi seulement ;
- audio léger ;
- suppression médias lourds ;
- cache maîtrisé ;
- offline encouragé.

## 24. RÈGLES NON NÉGOCIABLES

- Ne jamais supprimer un téléchargement volontaire sans confirmation.
- Ne jamais confondre cache temporaire et contenus sauvegardés.
- Ne jamais cacher le mode économie.
- Toujours permettre de réduire animations.
- Toujours préserver le thème dark premium.
- Toujours rendre langue et accessibilité faciles à trouver.
- Toujours expliquer l'impact data et stockage.

---

*Gestion cache, offline, stockage, langue, thème et accessibilité pour MAATFEED*
