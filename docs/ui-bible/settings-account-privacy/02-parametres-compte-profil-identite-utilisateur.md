# 2. PARAMÈTRES COMPTE, PROFIL & IDENTITÉ UTILISATEUR

## 1. OBJECTIF UX

Cette sous-section permet à l'utilisateur de gérer son identité MAATFEED : nom, pseudo, avatar symbolique, bio, archétype, centres d'intérêt, statut créateur, email, téléphone éventuel et informations principales.
L'objectif est de permettre une personnalisation forte sans transformer le profil en formulaire administratif.

## 2. ÉMOTION RECHERCHÉE

L'utilisateur doit ressentir :

- appartenance ;
- expression personnelle ;
- contrôle ;
- dignité ;
- cohérence culturelle.

Modifier son profil doit ressembler à l'ajustement d'une présence dans une communauté de savoir, pas à une fiche client.

## 3. STRUCTURE VISUELLE GLOBALE

La page compte doit être structurée en blocs :

- identité visible ;
- avatar et archétype ;
- informations de connexion ;
- statut créateur ;
- préférences publiques ;
- informations privées ;
- actions compte.

Chaque bloc doit clairement distinguer ce qui est public et ce qui est privé.

## 4. LAYOUT EXACT

Mobile :

- header "Compte" ;
- avatar centré ou aligné gauche ;
- nom + handle ;
- bouton modifier avatar ;
- sections verticales ;
- champs en cartes.

Édition profil :

- champ nom ;
- champ pseudo ;
- champ bio ;
- choix avatar symbolique ;
- choix archétype ;
- preview profil en haut ou bas.

## 5. HIERARCHIE VISUELLE

Priorité :

- identité publique ;
- avatar symbolique ;
- bio ;
- archétype ;
- centres d'intérêt ;
- email/téléphone ;
- statut créateur ;
- actions sensibles.

L'email et les éléments privés ne doivent pas être mis en scène comme éléments sociaux.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Avatar :

- haut de page ;
- taille 72 à 96 px mobile ;
- bouton modifier superposé en bas à droite ;
- aucun visage humain imposé pour les identités IA ;
- pour utilisateurs, avatars selon système MAATFEED retenu.

Champs :

- label au-dessus ;
- contenu dans surface sombre ;
- aide courte sous le champ si nécessaire.

## 7. DIMENSIONS & ESPACEMENTS

Avatar :

- 80 px mobile ;
- 96 à 120 px tablette ;
- 128 px desktop profil avancé.

Champs :

- hauteur minimum : 52 px ;
- bio : 120 à 160 px ;
- padding : 14 à 16 px ;
- gap vertical : 14 px.

Sections :

- marge entre sections : 22 px ;
- padding carte : 18 px.

## 8. COULEURS

Identité :

- fond sombre ;
- accent or sur avatar actif ;
- badge archétype en ambre doux ;
- texte principal ivoire ;
- texte privé beige-gris ;
- indication public/privé en capsule subtile.

Les informations privées ne doivent jamais être visuellement confondues avec les badges publics.

## 9. TYPOGRAPHIE

Libellés :

- "Nom affiché"
- "Nom d'utilisateur"
- "Bio"
- "Avatar"
- "Archétype"
- "Visible publiquement"
- "Privé"
- "Statut créateur"

Le style doit rester direct et humain.

## 10. BOUTONS

Boutons :

- "Modifier le profil"
- "Changer d'avatar"
- "Choisir un archétype"
- "Voir mon profil public"
- "Passer en compte créateur"
- "Déconnecter"

Le bouton déconnexion doit être visible mais non agressif. La suppression compte reste dans zone critique séparée.

## 11. CARTES

Carte identité :

- avatar ;
- nom ;
- handle ;
- badge archétype ;
- bouton voir profil.

Carte informations privées :

- email ;
- téléphone ;
- méthode de connexion ;
- statut vérification.

Carte créateur :

- statut ;
- monétisation ;
- visibilité ;
- lien vers paramètres créateur.

## 12. ICONOGRAPHIE

Icônes :

- avatar ;
- plume ;
- badge ;
- œil pour public ;
- cadenas pour privé ;
- étoile créateur ;
- enveloppe ;
- téléphone ;
- porte pour déconnexion.

Toujours accompagner les icônes sensibles par du texte.

## 13. COMPORTEMENT SCROLL

La page compte peut être longue, mais doit rester légère.
Règles :

- preview profil sticky possible sur desktop ;
- mobile : tout en vertical ;
- retour depuis sélection avatar conserve les champs ;
- aucune perte si l'utilisateur quitte pendant édition.

## 14. ANIMATIONS

Animations :

- avatar change avec fondu ;
- badge archétype glisse doucement ;
- sauvegarde profil confirme par check ;
- preview se met à jour calmement.

Pas de transformation excessive.

## 15. MICRO INTERACTIONS

Micro-interactions :

- compteur bio ;
- vérification pseudo disponible ;
- badge "public" ou "privé" au focus ;
- sauvegarde automatique partielle ;
- avertissement doux si champ requis.

## 16. GESTURES MOBILE

Gestes :

- tap avatar pour changer ;
- swipe retour depuis galerie avatar ;
- scroll simple ;
- clavier ne doit pas cacher bouton sauvegarder ;
- bouton sauvegarder sticky en bas pendant édition longue.

## 17. ÉTATS LOADING

Loading :

- skeleton avatar ;
- skeleton lignes identité ;
- champs locaux affichés si disponibles ;
- bouton sauvegarder désactivé seulement pendant envoi.

## 18. ÉTATS ERREUR

Erreurs :

- pseudo déjà pris ;
- email invalide ;
- connexion absente ;
- image/avatar indisponible ;
- sauvegarde échouée.

Chaque erreur doit être proche du champ concerné.

## 19. ÉTATS OFFLINE

Offline :

- modification locale possible ;
- statut "sera synchronisé" ;
- changement email ou sécurité peut être bloqué ;
- brouillon profil conservé ;
- avatar déjà cache disponible.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Mobile :

- édition plein écran ;
- bouton sauvegarde sticky.

Tablette :

- profil aperçu à gauche ;
- formulaire à droite.

Desktop :

- aperçu public en panneau ;
- sections plus espacées.

## 21. ACCESSIBILITÉ

Compte :

- champs bien labellés ;
- erreurs annoncées ;
- avatar avec description ;
- badges public/privé lisibles ;
- navigation clavier complète.

## 22. PERFORMANCE UX

Ne pas charger tout le profil public pour éditer le compte.
Priorité :

- identité ;
- champs essentiels ;
- avatar ;
- options créateur ensuite.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Le compte doit rester modifiable avec prudence :

- texte local ;
- avatar léger ;
- synchronisation différée ;
- pas d'upload lourd obligatoire ;
- statut visible.

## 24. RÈGLES NON NÉGOCIABLES

- Ne jamais perdre une modification de profil en cours.
- Ne jamais rendre publiques des données privées.
- Ne jamais confondre avatar utilisateur et avatar IA.
- Toujours indiquer ce qui est public.
- Toujours isoler email, téléphone et sécurité.
- Toujours sauvegarder proprement.
- Toujours respecter l'identité visuelle MAATFEED.

---

*Paramètres compte, profil et identité utilisateur pour MAATFEED*
