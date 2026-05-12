# 2. PROFIL UTILISATEUR SIMPLE

## 1. OBJECTIF UX

Le profil utilisateur simple est destiné aux membres qui consomment, sauvegardent, réagissent, répondent et participent sans forcément être créateurs professionnels.

Il doit permettre de :

- présenter son identité
- afficher ses centres d'intérêt
- voir ses activités
- retrouver ses sauvegardes
- gérer ses préférences
- suivre des créateurs
- participer aux débats

## 2. ÉMOTION RECHERCHÉE

Le profil simple doit donner une sensation d'appartenance.

L'utilisateur doit sentir :

- qu'il a une place
- que son parcours compte
- qu'il peut évoluer
- qu'il n'est pas obligé de performer
- qu'il peut apprendre et participer à son rythme

## 3. STRUCTURE VISUELLE GLOBALE

Blocs :

- avatar symbolique
- nom/pseudo
- archétype ou préférence culturelle
- bio courte
- centres d'intérêt
- activité récente
- sauvegardes
- abonnements
- paramètres rapides

## 4. LAYOUT EXACT

### Mobile :

- avatar en haut
- nom/pseudo
- phrase identitaire
- stats légères
- onglets : Activité, Sauvegardes, Débats, Séries
- bouton modifier profil

### Desktop :

- identité à gauche
- activité au centre
- recommandations personnelles à droite

## 5. HIERARCHIE VISUELLE

Priorité :

1. identité
2. centres d'intérêt
3. sauvegardes
4. activité
5. abonnements
6. paramètres

Un utilisateur simple ne doit pas être jugé par des métriques trop visibles.

## 6. POSITIONNEMENT DES ÉLÉMENTS

- avatar centré ou haut gauche
- nom sous avatar
- archétype sous pseudo
- bouton modifier sous bio
- centres d'intérêt sous stats
- onglets ensuite

## 7. DIMENSIONS & ESPACEMENTS

- avatar : 88 à 104 px
- bio : maximum 3 lignes avant expansion
- stats : hauteur 56 px
- chips intérêts : 32 à 36 px
- onglets : 48 px

## 8. COULEURS

- fond : noir charbon
- avatar : fond symbolique sombre
- archétype : ambre doux
- intérêts : surfaces sombres bordées
- activité : gris chaud

## 9. TYPOGRAPHIE

- nom : 22 à 26 px
- pseudo : 13 px
- archétype : 12 à 13 px
- bio : 14 à 15 px
- chips : 12 px

## 10. BOUTONS

Boutons :

- Modifier
- Voir sauvegardes
- Gérer intérêts
- Paramètres
- Partager profil si public

Pas de bouton "devenir créateur" trop agressif. Il peut apparaître comme invitation douce.

## 11. CARTES

Cartes :

- activité récente
- série suivie
- débat participé
- contenu sauvegardé
- recommandation personnelle

## 12. ICONOGRAPHIE

- utilisateur
- sauvegarde
- intérêt
- débat
- série
- historique
- paramètres

## 13. COMPORTEMENT SCROLL

Header compact au scroll.

Les onglets restent sticky.

Sauvegardes et activité se chargent progressivement.

## 14. ANIMATIONS

- intérêts apparaissent en chips
- changement onglet fluide
- sauvegarde retirée avec collapse
- avatar sélectionné avec glow discret

## 15. MICRO INTERACTIONS

- tap intérêt : ouvre feed filtré
- tap série : reprend lecture
- tap débat : retourne au fil
- tap archétype : explication courte

## 16. GESTURES MOBILE

- swipe entre onglets
- long press sauvegarde : options
- pull-to-refresh
- tap avatar : modifier

## 17. ÉTATS LOADING

- skeleton identité
- chips intérêts
- cartes activité
- sauvegardes lazy

## 18. ÉTATS ERREUR

- activité non chargée
- sauvegardes indisponibles
- profil privé
- réseau

Toujours garder identité visible.

## 19. ÉTATS OFFLINE

- profil cache
- sauvegardes locales
- historique local
- modifications gardées en attente

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

### Mobile :

- vertical simple

### Tablet :

- identité + contenu en 2 colonnes

### Desktop :

- profil calme, moins dense qu'un profil créateur

## 21. ACCESSIBILITÉ

- onglets lisibles
- intérêts accessibles
- focus visible
- labels boutons
- contraste fort

## 22. PERFORMANCE UX

- pas de stats lourdes
- charger seulement onglet actif
- cache sauvegardes
- avatar léger

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

- profil texte-first
- sauvegardes offline prioritaires
- pas de médias lourds au premier chargement
- activité paginée

## 24. RÈGLES NON NÉGOCIABLES

- Ne pas transformer un utilisateur simple en influenceur forcé
- Ne pas afficher des métriques humiliantes
- Les sauvegardes doivent être faciles à retrouver
- L'identité culturelle doit rester visible
- Le profil doit être utile même sans publication

---

*Profil utilisateur simple pour MAATFEED*
