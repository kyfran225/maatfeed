# 9. TÉLÉCHARGEMENTS HORS LIGNE ET AUDIO FAIBLE CONNEXION

## 1. OBJECTIF UX

Permettre une consommation audio réaliste dans les contextes africains :

- connexion instable
- coût data
- réseau faible
- déplacements
- coupures
- usage mobile

## 2. ÉMOTION RECHERCHÉE

L'utilisateur doit sentir que MAATFEED respecte sa réalité.

Émotion cible :

- confiance
- économie
- contrôle
- sérénité
- continuité

## 3. STRUCTURE VISUELLE GLOBALE

Modules :

- bouton téléchargement
- état téléchargement
- bibliothèque offline
- mode léger
- qualité audio adaptative
- reprise locale

## 4. LAYOUT EXACT

### Dans player :
- bouton télécharger dans actions secondaires
- progression circulaire ou linéaire
- badge offline si disponible

### Dans bibliothèque :
- section "Disponible hors ligne"
- filtres par séries, débats, créateurs
- indication taille

## 5. HIERARCHIE VISUELLE

Priorité :

1. disponible offline
2. progression téléchargement
3. taille
4. qualité
5. date d'expiration si applicable

## 6. POSITIONNEMENT DES ÉLÉMENTS

- téléchargement près de sauvegarde
- badge offline sur carte
- section offline accessible depuis profil/bibliothèque
- alerte réseau dans player, non intrusive

## 7. DIMENSIONS & ESPACEMENTS

- icône download : 40 à 44 px
- badge offline : 20 à 28 px hauteur
- item offline : 64 à 80 px
- barre progression : 3 à 5 px

## 8. COULEURS

- téléchargement actif : ambre
- terminé : ambre + coche
- offline : ocre doux
- erreur : rouge discret
- data saver : gris/ambre

## 9. TYPOGRAPHIE

- taille fichier : 11 à 12 px
- état : 12 à 13 px
- titre offline : 14 à 15 px

## 10. BOUTONS

- télécharger
- annuler
- supprimer local
- télécharger playlist
- mode léger
- reprendre téléchargement

## 11. CARTES

### Carte offline :
- titre
- source
- durée
- taille
- progression
- bouton play
- bouton supprimer

## 12. ICONOGRAPHIE

- téléchargement
- coche
- téléphone
- nuage barré
- mode léger
- stockage

## 13. COMPORTEMENT SCROLL

### Téléchargements longs :
- progression continue même si carte sort de l'écran
- notification interne possible
- section téléchargements sticky dans bibliothèque

## 14. ANIMATIONS

- cercle download progressif
- coche finale
- suppression locale avec collapse
- retour réseau : badge animé discret

## 15. MICRO INTERACTIONS

- tap download : confirmation immédiate
- long press : choisir qualité
- stockage faible : message préventif
- offline ready : mini toast

## 16. GESTURES MOBILE

- swipe item offline : supprimer
- long press download : options
- pull refresh offline library

## 17. ÉTATS LOADING

- estimation taille
- préparation téléchargement
- barre indéterminée si taille inconnue

## 18. ÉTATS ERREUR

- téléchargement échoué
- stockage insuffisant
- réseau interrompu
- fichier expiré
- source indisponible

Messages :

- courts
- humains
- action immédiate

## 19. ÉTATS OFFLINE

Cœur de cette section.

### Offline :
- player fonctionne pour fichiers locaux
- queue offline
- recherche offline minimale
- transcription cache si disponible
- sync plus tard

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :
- offline prioritaire

### Tablet :
- bibliothèque offline en grille

### Desktop :
- téléchargements moins centraux
- cache temporaire plutôt que download permanent

## 21. ACCESSIBILITÉ

- état download annoncé
- progression textuelle
- actions claires
- pas uniquement couleur

## 22. PERFORMANCE UX

- compression audio
- qualité adaptative
- limitation stockage
- nettoyage cache
- téléchargements en file

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Règles spécifiques :

- proposer téléchargement quand Wi-Fi détecté
- mode léger visible
- éviter images lourdes
- audio basse qualité acceptable mais propre
- reprise après coupure
- ne jamais perdre progression

## 24. RÈGLES NON NÉGOCIABLES

- Le téléchargement doit être compréhensible
- L'utilisateur doit savoir ce qui est disponible hors ligne
- Le mode faible connexion doit préserver l'écoute
- La progression locale ne doit jamais être perdue
- Les erreurs réseau doivent être calmes, pas dramatiques

---

*Téléchargements hors ligne et audio faible connexion pour MAATFEED*
