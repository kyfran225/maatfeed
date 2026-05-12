# 3. DESIGN TOKENS CONCEPTUELS & COMPOSANTS À HARMONISER

## 1. OBJECTIF UX

Les design tokens conceptuels servent à garantir que l'implémentation reste cohérente sans dépendre d'improvisations visuelles.
Ici, il ne s'agit pas de produire du code, mais de définir les familles de décisions que l'agent codeur doit respecter.

## 2. ÉMOTION RECHERCHÉE

Les tokens doivent préserver :

- noblesse ;
- profondeur ;
- chaleur ;
- lisibilité ;
- fluidité ;
- cohérence.

Chaque token doit contribuer à l'univers MAATFEED, pas simplement remplir une case technique.

## 3. STRUCTURE VISUELLE GLOBALE

Familles de tokens conceptuels :

- couleurs ;
- typography ;
- spacing ;
- radius ;
- shadows ;
- borders ;
- motion ;
- z-layers ;
- media states ;
- offline states ;
- audio states ;
- premium states ;
- trust states ;
- IA states.

## 4. LAYOUT EXACT

Chaque layout doit utiliser :

- marges standard ;
- largeur max cohérente ;
- grilles souples ;
- cards normalisées ;
- safe areas ;
- espaces respirants ;
- zones tactiles suffisantes.

Aucun écran ne doit fixer des espacements "au feeling".

## 5. HIERARCHIE VISUELLE

Tokens de hiérarchie :

- Display : grands titres rares ;
- Title : titres de page ;
- Section : titres de section ;
- Body : texte principal ;
- Meta : informations secondaires ;
- Caption : microtexte non critique ;
- Label : champs et boutons.

Chaque niveau doit avoir une fonction claire.

## 6. POSITIONNEMENT DES ÉLÉMENTS

Tokens de placement :

- header top ;
- action bottom ;
- player above nav ;
- sheet bottom ;
- modal center/overlay ;
- badge inside card ;
- status near object ;
- danger isolated.

Ces règles évitent les écrans incohérents.

## 7. DIMENSIONS & ESPACEMENTS

Tokens conceptuels :

- spacing très petit : micro-alignements ;
- spacing petit : éléments proches ;
- spacing moyen : groupes ;
- spacing grand : sections ;
- spacing très grand : transitions de blocs.

Radius :

- petit : tags ;
- moyen : champs ;
- grand : cartes ;
- très grand : sheets ;
- full : capsules.

## 8. COULEURS

Tokens couleur :

- background-primary ;
- background-secondary ;
- surface-card ;
- surface-sheet ;
- surface-modal ;
- text-primary ;
- text-secondary ;
- text-muted ;
- accent-gold ;
- accent-amber ;
- status-success ;
- status-warning ;
- status-danger ;
- status-offline ;
- status-premium ;
- status-ai.

Chaque token doit avoir une fonction, pas seulement une valeur esthétique.

## 9. TYPOGRAPHIE

Tokens typographiques :

- page title ;
- card title ;
- content title ;
- body regular ;
- body comfortable ;
- meta ;
- caption ;
- button ;
- input ;
- quote ;
- debate reply.

Les débats et documents peuvent nécessiter un texte plus confortable que les cartes feed.

## 10. BOUTONS

Composants à harmoniser :

- primary button ;
- secondary button ;
- ghost button ;
- danger button ;
- icon button ;
- media button ;
- offline action ;
- premium CTA ;
- sync action ;
- follow/support button.

Chaque bouton doit avoir :

- default ;
- pressed ;
- loading ;
- disabled ;
- success ;
- error si applicable.

## 11. CARTES

Composants cartes prioritaires :

- FeedVideoCard ;
- FeedAudioCard ;
- DebateCard ;
- DebateReplyCard ;
- SeriesCard ;
- CreatorCard ;
- NotificationCard ;
- PremiumCard ;
- OfflineContentCard ;
- DraftCard ;
- SourceCard ;
- AIInsightCard.

Chaque carte doit avoir :

- loading ;
- empty ;
- error ;
- offline ;
- selected/focused ;
- low data ;
- premium si applicable.

## 12. ICONOGRAPHIE

Tokens iconographiques :

- size small ;
- size medium ;
- size large ;
- stroke normal ;
- stroke emphasized ;
- accent icon ;
- muted icon ;
- danger icon ;
- status icon.

Ne jamais mélanger plusieurs bibliothèques visuelles sans harmonisation.

## 13. COMPORTEMENT SCROLL

Composants scroll à harmoniser :

- feed infinite scroll ;
- debate thread scroll ;
- profile tabs scroll ;
- search filters horizontal scroll ;
- bottom sheet internal scroll ;
- player queue scroll ;
- settings scroll ;
- offline library scroll.

Chaque scroll doit avoir une fin, un état vide et une mémoire si nécessaire.

## 14. ANIMATIONS

Tokens motion :

- fast feedback ;
- normal transition ;
- slow reveal ;
- sheet motion ;
- modal fade ;
- card entrance ;
- skeleton shimmer ;
- network state transition ;
- audio player transition.

Aucun composant ne doit inventer une durée incohérente.

## 15. MICRO INTERACTIONS

Tokens de feedback :

- saved ;
- queued ;
- synced ;
- downloaded ;
- liked ;
- followed ;
- premium unlocked ;
- copied ;
- reported ;
- muted ;
- error repaired.

Chaque feedback doit être bref, lisible et non intrusif.

## 16. GESTURES MOBILE

Gestures standardisées :

- tap ;
- long press ;
- swipe back ;
- swipe down close ;
- swipe horizontal filters ;
- pull refresh ;
- drag player ;
- scroll lock modal.

Toute gesture doit être documentée et prévisible.

## 17. ÉTATS LOADING

Composants loading :

- CardSkeleton ;
- ThreadSkeleton ;
- AudioSkeleton ;
- ProfileSkeleton ;
- SearchSkeleton ;
- SettingsSkeleton ;
- DocumentSkeleton ;
- PaymentStepLoading ;
- AIThinkingState.

Chaque loading doit imiter la forme du contenu final.

## 18. ÉTATS ERREUR

Composants erreur :

- InlineError ;
- CardError ;
- MediaError ;
- NetworkErrorBanner ;
- PaymentErrorState ;
- SyncErrorState ;
- PermissionErrorState ;
- ModerationNotice.

Chaque erreur doit proposer une prochaine action.

## 19. ÉTATS OFFLINE

Composants offline :

- OfflineBanner ;
- OfflineLibrary ;
- OfflineBadge ;
- PendingActionCard ;
- DraftOfflineState ;
- DownloadStatus ;
- LocalSearchState.

Ces éléments doivent être utilisés partout où nécessaire, pas réinventés.

## 20. RESPONSIVE MOBILE/TABLET/DESKTOP

Tokens responsive :

- mobile single column ;
- mobile safe bottom ;
- tablet split ;
- desktop panel ;
- desktop max width ;
- compact cards ;
- expanded cards.

Desktop doit agrandir la clarté, pas augmenter le bruit.

## 21. ACCESSIBILITÉ

Tokens accessibilité :

- focus ring ;
- reduced motion ;
- high contrast ;
- readable text ;
- screen reader label ;
- error description ;
- media transcript ;
- caption availability.

Ces tokens doivent être prévus dès le départ.

## 22. PERFORMANCE UX

Composants performance :

- lazy media shell ;
- lightweight thumbnail ;
- audio-first fallback ;
- low-data media placeholder ;
- cached content indicator ;
- progressive loading.

Chaque composant média doit avoir une version légère.

## 23. COMPORTEMENT FAIBLE CONNEXION AFRIQUE

Tokens low data :

- no autoplay ;
- lightweight audio ;
- compressed image ;
- manual video ;
- offline available ;
- pending sync ;
- Wi-Fi only ;
- storage warning.

Ces tokens doivent apparaître comme des citoyens de première classe dans le design system.

## 24. RÈGLES NON NÉGOCIABLES

- Ne jamais ajouter un composant sans états loading, erreur, offline.
- Ne jamais ajouter un média sans version low data.
- Ne jamais ajouter une action sans feedback.
- Ne jamais ajouter une page sans version mobile.
- Ne jamais ajouter un pattern sans vérifier s'il existe déjà.
- Toujours harmoniser boutons, cartes, badges et sheets.
- Toujours maintenir la grammaire visuelle MAATFEED.

---

*Design tokens conceptuels et composants à harmoniser pour MAATFEED*
