# 9. COMPOSER DE RÉPONSE MULTIMÉDIA

## 1. OBJECTIF UX

Permettre à l'utilisateur de répondre facilement dans le format adapté : texte, audio, vidéo, photo/image, document ou lien.

## 2. ÉMOTION RECHERCHÉE

Liberté, simplicité, confiance. Répondre doit sembler naturel, pas technique.

## 3. STRUCTURE VISUELLE GLOBALE

Composer sticky compact en bas, qui s'ouvre en sheet ou page de composition complète. Il propose les formats clairement avec icônes.

## 4. LAYOUT EXACT

État compact : barre 48 à 56 px avec placeholder "Écrire une réponse..." + icônes média.
État ouvert : sheet 70 à 92 % hauteur ou page dédiée.
Sélecteur format : barre horizontale 44 à 52 px.
Zone édition : variable selon format.

## 5. HIERARCHIE VISUELLE

Champ réponse d'abord. Formats ensuite. CTA publier toujours clair en bas. Option anonymat ou visibilité secondaire.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Composer compact au-dessus safe area et bottom nav si visible. Dans sheet : titre haut, sélecteur format, zone édition, options, CTA bas.

## 7. DIMENSIONS & ESPACEMENTS

Composer compact marge : 12 à 16 px.
Radius : 18 à 24 px.
CTA publier : 48 à 52 px.
Icônes format : hitbox 44 px.

## 8. COULEURS

Surface élevée. Border graphite. Focus or. Format actif or. CTA doré.

## 9. TYPOGRAPHIE

Placeholder : 14 px gris.
Format labels : 12 à 13 px.
Texte réponse : 15 à 16 px.

## 10. BOUTONS

Publier, annuler, sauvegarder brouillon, choisir format, ajouter média, enregistrer audio, enregistrer vidéo, joindre document.

## 11. CARTES

Les médias ajoutés apparaissent en cartes internes : audio waveform, vidéo poster, image preview, document file card.

## 12. ICONOGRAPHIE

Texte, micro, vidéo, image, document, lien, citation, anonymat, envoyer.

## 13. COMPORTEMENT SCROLL

Quand sheet ouverte, fond débat ne scrolle pas. Zone édition interne scrolle si longue. Clavier ne masque jamais CTA.

## 14. ANIMATIONS

Composer compact vers sheet : slide up. Changement format : transition courte. Ajout média : fade/slide.

## 15. MICRO INTERACTIONS

Autosave : petit indicateur. Format actif : icône or + underline. Enregistrement audio : onde en direct.

## 16. GESTURES MOBILE

Swipe down ferme la sheet avec confirmation si brouillon non vide. Tap hors clavier ferme clavier. Long press citation insérée : options.

## 17. ÉTATS LOADING

Publication : bouton loading. Upload média : progress par fichier. Transcodage audio/vidéo : message clair.

## 18. ÉTATS ERREUR

Erreur validation près du champ. Erreur upload dans la carte média. Erreur publication garde brouillon.

## 19. ÉTATS OFFLINE

Composer doit sauvegarder localement. Réponse texte/audio peut rester brouillon. Publication en attente si autorisée. L'utilisateur ne doit jamais perdre son contenu.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Desktop : composer peut être panneau fixe à droite ou bas du thread. Barre de formats plus complète. Raccourcis clavier.

## 21. ACCESSIBILITÉ

Labels sur tous les formats. État enregistrement annoncé. Erreurs accessibles. Focus dans sheet.

## 22. PERFORMANCE UX

Autosave léger. Upload différé. Compression média avant envoi. Pas de preview lourde inutile.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Brouillon local prioritaire. Audio compressé. Vidéo avertit taille. Documents upload en file d'attente.

## 24. RÈGLES NON NÉGOCIABLES

Ne jamais perdre une réponse. Ne jamais masquer publier sous le clavier. Ne jamais forcer un format. Ne jamais envoyer sans feedback clair.

---

*Composer de réponse multimédia pour le débat MAATFEED*
