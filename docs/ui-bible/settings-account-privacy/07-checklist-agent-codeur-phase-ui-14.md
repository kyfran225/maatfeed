# 7. CHECKLIST AGENT CODEUR - PHASE UI 14

L'agent codeur doit vérifier que la Phase UI 14 respecte les points suivants :

## SYSTÈME DE PARAMÈTRES

- Les paramètres sont accessibles depuis le profil, le menu principal et les zones contextuelles utiles.
- La page paramètres respecte l'identité dark premium MAATFEED.
- Les sections sont groupées clairement : compte, feed, audio, notifications, confidentialité, sécurité, données, cache, langue, thème, accessibilité.
- La structure mobile est prioritaire.
- Les zones tactiles font au minimum 44 px.
- Les switches sont lisibles, nommés et accessibles.
- Les sous-pages reviennent à la bonne position après retour.
- Les couleurs restent cohérentes avec l'univers MAATFEED.
- Les animations sont réduites et respectent les préférences utilisateur.
- Les états loading sont localisés et jamais bloquants inutilement.

## COMPTE & PROFIL

- Le compte distingue clairement données publiques et données privées.
- Le profil peut être modifié sans perte en cas de sortie accidentelle.
- Les avatars, archétypes et badges restent cohérents avec l'univers MAATFEED.
- L'email et les informations de connexion sont isolés visuellement.
- Les modifications locales sont sauvegardées et synchronisées au retour réseau.
- Les champs obligatoires sont clairement indiqués.
- Les erreurs de validation sont proches des champs concernés.
- La prévisualisation du profil public est disponible.

## PRÉFÉRENCES FEED & CONTENUS

- Les préférences feed permettent de contrôler thèmes, formats, diversité et recommandations.
- L'utilisateur peut réduire la personnalisation ou la réinitialiser.
- Les thèmes et formats sont sélectionnables avec des chips ou cartes tactiles.
- Les recommandations IA peuvent être désactivées ou limitées.
- La diversité du feed est une option explicite.
- Les contenus sensibles peuvent être filtrés ou limités.
- Les changements de préférences sont sauvegardés localement.
- L'impact sur le feed est expliqué simplement.

## PRÉFÉRENCES AUDIO & VIDÉO

- Les préférences audio donnent priorité à la reprise, au téléchargement et à la qualité légère.
- L'autoplay vidéo est contrôlable et désactivé en faible connexion.
- La qualité média par défaut est adaptée au réseau et aux préférences.
- Les téléchargements peuvent être limités au Wi-Fi.
- La vitesse de lecture par défaut est configurable.
- Les options de lecture en arrière-plan sont disponibles.
- Les changements sont appliqués immédiatement au player.

## NOTIFICATIONS & ATTENTION

- Les notifications sont séparées par canaux : push, email, in-app.
- L'utilisateur peut mettre les notifications en pause temporaire.
- Les notifications critiques de sécurité restent protégées.
- Les priorités de notification sont clairement indiquées.
- Les résumés quotidiens/hebdomadaires sont optionnels.
- Le test de notification fonctionne correctement.
- Les permissions système sont gérées proprement.
- Les notifications respectent le mode économie de data.

## CONFIDENTIALITÉ & SÉCURITÉ

- La confidentialité indique clairement ce qui est public, privé ou limité.
- La sécurité affiche email, mot de passe, sessions et actions recommandées.
- Les données personnelles peuvent être exportées selon le modèle produit.
- La suppression compte est visible, claire, isolée et protégée par confirmation forte.
- Les sessions actives sont listées avec possibilité de déconnexion.
- La vérification email est clairement indiquée.
- Les changements de mot de passe sont sécurisés.
- L'historique des activités est accessible.

## DONNÉES & CACHE

- La gestion cache distingue cache temporaire, téléchargements volontaires, audios, vidéos et documents.
- Le mode économie de data est visible et facile à activer.
- La jauge de stockage affiche les catégories clairement.
- Le nettoyage cache ne supprime jamais les contenus explicitement téléchargés sans confirmation.
- Les téléchargements peuvent être gérés individuellement.
- L'impact data des actions est expliqué.
- Les données IA peuvent être supprimées ou limitées.
- L'export des données est disponible et traçable.

## LANGUE, THÈME & ACCESSIBILITÉ

- Les réglages langue, thème et accessibilité sont faciles à trouver.
- Les options d'accessibilité incluent taille texte, contraste, réduction motion et aides médias.
- Le thème conserve la direction dark premium noir/or.
- Les changements de thème sont appliqués immédiatement avec preview.
- Les changements de langue sont confirmés avant application.
- Les préférences d'accessibilité sont respectées dans toute l'application.
- Les captions et transcriptions sont activables si disponibles.
- La réduction motion est strictement respectée.

## COMPORTEMENT OFFLINE & FAIBLE CONNEXION

- Les paramètres restent partiellement utilisables offline.
- Les modifications non critiques peuvent être mises en attente de synchronisation.
- Les actions critiques ne prétendent jamais être appliquées sans réseau si validation serveur nécessaire.
- Le mode économie est particulièrement visible en faible connexion.
- Les réglages locaux sont sauvegardés immédiatement.
- Les changements offline sont clairement indiqués comme "à synchroniser".
- Les paramètres critiques nécessitant validation serveur sont bloqués offline.

## PERFORMANCE & ERREURS

- Les états loading sont rapides et informatifs.
- Les erreurs sont humaines, proches de la section concernée et orientées action.
- Les couleurs d'erreur restent sobres et cohérentes.
- Les actions destructives ne sont jamais déclenchées par swipe seul.
- Le chargement des préférences est optimisé.
- Les sauvegardes sont optimistes avec feedback clair.
- Les erreurs réseau ne bloquent pas l'accès aux réglages locaux.
- Les performances sont maintenues même avec de nombreuses préférences.

## DESIGN & UX

- La page desktop enrichit l'expérience sans transformer les paramètres en dashboard froid.
- L'architecture verticale mobile est préservée.
- Les cartes ont un radius premium et des ombres douces.
- Les icônes sont fines, cohérentes et non enfantines.
- La typographie reste lisible même avec les tailles réduites.
- Les espacements respectent les guidelines MAATFEED.
- Les transitions sont douces et rapides.
- L'ensemble respire le calme et le contrôle.

## RÈGLES FONDAMENTALES

- Ne jamais cacher les options importantes dans des menus profonds.
- Ne jamais utiliser un style système générique.
- Ne jamais rendre les paramètres dépendants d'une connexion stable.
- Ne jamais placer suppression compte près d'actions ordinaires.
- Toujours expliquer les options sensibles.
- Toujours respecter la lisibilité mobile.
- Toujours permettre à l'utilisateur de contrôler data, confidentialité et notifications.
- Toujours maintenir l'identité visuelle MAATFEED.
- Toujours prioriser l'expérience mobile Afrique.
- Toujours garder les paramètres comme un espace de contrôle personnel, pas technique.

---

*Checklist de validation pour l'implémentation Settings, Account & Privacy System*
