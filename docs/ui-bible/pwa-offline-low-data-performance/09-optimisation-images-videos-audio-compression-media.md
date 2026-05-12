# 9. OPTIMISATION IMAGES, VIDÉOS, AUDIO & COMPRESSION MÉDIA

## 1. OBJECTIF UX

Les médias doivent rester beaux sans devenir coûteux. MAATFEED doit afficher des images, vidéos et audios de façon intelligente, adaptée au réseau, à l'appareil et aux préférences utilisateur.
L'objectif est de préserver la sensation premium avec une charge data minimale.

## 2. ÉMOTION RECHERCHÉE

L'utilisateur doit ressentir :

- beauté ;
- fluidité ;
- respect de sa data ;
- maîtrise ;
- absence de lourdeur.

L'application doit rester élégante même quand elle réduit la qualité technique.

## 3. STRUCTURE VISUELLE GLOBALE

Chaque média possède plusieurs états :

- aperçu léger ;
- version standard ;
- version haute qualité ;
- version offline ;
- version audio seulement ;
- état indisponible.

L'UI doit rendre ces états compréhensibles sans jargon.

## 4. LAYOUT EXACT

Images :

- ratio fixe ;
- placeholder dominant ;
- chargement progressif.

Vidéos :

- thumbnail ;
- bouton play ;
- badge qualité ;
- option audio seulement ;
- autoplay conditionnel.

Audio :

- waveform légère ;
- qualité indiquée seulement si utile ;
- téléchargement accessible.

## 5. HIERARCHIE VISUELLE

Priorité :

- compréhension du contenu ;
- action play/ouvrir ;
- statut data ;
- qualité ;
- options avancées.

La qualité média ne doit jamais écraser le sens éditorial.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Badge qualité :

- coin inférieur droit ;
- petit ;
- non intrusif.

Option audio seulement :

- sous bouton play ou dans menu ;
- visible en Low Data ;
- visible en erreur vidéo.

Compression :

- jamais affichée comme terme principal ;
- traduite en "léger", "standard", "haute qualité".

## 7. DIMENSIONS & ESPACEMENTS

Badge qualité :

- hauteur 22 à 26 px ;
- texte 11 à 12 px ;
- radius 999 px.

Bouton play :

- 52 à 64 px sur vidéo principale ;
- 40 à 48 px sur carte compacte.

Waveform :

- hauteur 36 à 56 px ;
- simplifiée en mode économie.

## 8. COULEURS

Qualité :

- léger : ambre doux ;
- standard : beige ;
- haute qualité : or ;
- indisponible : gris chaud ;
- erreur : rouge argile.

Tous les badges doivent rester sobres.

## 9. TYPOGRAPHIE

Libellés :

- "Léger"
- "Standard"
- "Haute qualité"
- "Audio seulement"
- "Charger la vidéo"
- "Image réduite"
- "Version offline"

Éviter "720p", "bitrate", "codec" dans l'UI principale.

## 10. BOUTONS

Boutons :

- "Lire en léger"
- "Charger en standard"
- "Audio seulement"
- "Télécharger"
- "Changer qualité"
- "Toujours utiliser léger"

Les options avancées restent dans un menu.

## 11. CARTES

Carte vidéo :

- aperçu compressé ;
- titre visible ;
- play manuel ;
- option audio ;
- statut data.

Carte image :

- image basse résolution d'abord ;
- transition vers qualité normale ;
- fallback élégant.

Carte audio :

- durée ;
- qualité ;
- téléchargement ;
- reprise.

## 12. ICONOGRAPHIE

Icônes :

- image ;
- vidéo ;
- casque ;
- éclair ;
- compression légère ;
- qualité ;
- téléchargement ;
- signal.

Aucune icône trop technique.

## 13. COMPORTEMENT SCROLL

Pendant scroll :

- ne pas charger haute qualité ;
- suspendre vidéo ;
- garder audio stable ;
- charger images visibles seulement ;
- conserver hauteurs.

## 14. ANIMATIONS

Transitions :

- blur léger vers image nette ;
- fade-in média ;
- play overlay qui disparaît doucement ;
- qualité changée avec feedback discret.

Pas d'effet spectaculaire sur médias lourds.

## 15. MICRO INTERACTIONS

Micro-interactions :

- tap badge qualité ouvre options ;
- long press média ouvre "économiser data" ;
- échec vidéo propose audio ;
- téléchargement montre taille estimée ;
- changement qualité appliqué immédiatement au média courant.

## 16. GESTURES MOBILE

Gestes :

- tap play ;
- double tap social si média actif ;
- long press qualité ;
- swipe feed ;
- pinch non prioritaire sauf documents/images.

## 17. ÉTATS LOADING

Média loading :

- image : placeholder ratio ;
- vidéo : thumbnail + play disabled temporaire ;
- audio : waveform fantôme ;
- document : extrait textuel d'abord.

## 18. ÉTATS ERREUR

Erreur image :

- placeholder esthétique ;
- titre conservé.

Erreur vidéo :

- proposer audio ;
- proposer retry ;
- proposer ouvrir plus tard.

Erreur audio :

- proposer texte/transcription si disponible.

## 19. ÉTATS OFFLINE

Offline :

- médias locaux seulement ;
- badges clairs ;
- non-local remplacé par placeholder ;
- possibilité de marquer "à télécharger plus tard".

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Mobile :

- qualité adaptative stricte ;
- vidéo manuelle en faible réseau ;
- audio privilégié.

Tablette :

- meilleure qualité si réseau stable ;
- option split content.

Desktop :

- qualité plus élevée possible ;
- mais pas au détriment du chargement initial.

## 21. ACCESSIBILITÉ

Médias :

- alt text images ;
- captions vidéo si disponibles ;
- transcription audio si disponible ;
- boutons nommés ;
- état qualité textuel.

## 22. PERFORMANCE UX

Optimisation :

- formats légers ;
- thumbnails ;
- lazy loading ;
- compression ;
- limitation autoplay ;
- préchargement court ;
- cache média utile.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Par défaut en réseau faible :

- images légères ;
- vidéo manuelle ;
- audio compressé ;
- documents textuels ;
- pas de preview lourde ;
- téléchargement sur Wi-Fi proposé.

## 24. RÈGLES NON NÉGOCIABLES

- Ne jamais charger haute qualité sans nécessité.
- Ne jamais masquer le titre si média échoue.
- Ne jamais rendre le feed dépendant des vidéos.
- Toujours proposer audio quand possible.
- Toujours réserver l'espace média.
- Toujours respecter Low Data.
- Toujours rendre les médias compréhensibles sans jargon.

---

*Optimisation images, vidéos, audio et compression média pour MAATFEED*
