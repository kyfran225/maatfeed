# Guide d'ajout des Sponsors MAATFEED

## Option 1 : Script Automatique (Recommandé)

Exécutez le script qui crée automatiquement un admin + 6 sponsors réels :

```bash
cd infra/scripts
npx tsx seed-sponsors-with-admin.ts
```

Pour utiliser un email admin existant :
```bash
npx tsx seed-sponsors-with-admin.ts votre-email@exemple.com
```

**Ce que fait le script :**
- Crée un admin `admin@maatfeed.com` / `Admin123!` (si inexistant)
- Ajoute 6 sponsors réels (Wave, Paystack, Andela, etc.)
- Vérifie les doublons avant insertion

---

## Option 2 : Manuellement via l'Admin

### Étape 1 : Créer un compte Admin

```bash
cd infra/scripts
npx tsx make-admin.ts votre-email@exemple.com
```

Ou créez un compte via `/auth` puis promouvez-le admin.

### Étape 2 : Accéder au Dashboard Sponsors

1. Connectez-vous : `/auth`
2. Allez sur : `/admin/sponsors`
3. Cliquez sur **"Nouveau Sponsor"**

### Étape 3 : Formulaire de Création

| Champ | Description | Exemple |
|-------|-------------|---------|
| **Nom** | Nom de l'entreprise | "Wave" |
| **Logo** | URL de l'image (400x400px) | `https://example.com/logo.png` |
| **Description** | Texte promo (max 500 car.) | "Mobile Money simplifié..." |
| **Site web** | URL complète | `https://wave.com` |
| **Texte CTA** | Bouton d'action | "Télécharger l'app" |
| **Priorité** | Ordre d'affichage (0-100) | 100 = en premier |
| **Date de fin** | Optionnel - expiration | Laisser vide = permanent |

### Étape 4 : Activer/Désactiver

- **Activer** : Le sponsor apparaît dans le feed
- **Désactiver** : Reste en base mais invisible

---

## Sponsors Suggérés (Pour Démarrer)

| Entreprise | Description | CTA |
|------------|-------------|-----|
| **Wave** | Mobile Money sans frais pour l'Afrique | Télécharger l'app |
| **Paystack** | Paiements en ligne simplifiés | Intégrer Paystack |
| **Andela** | Formation développeurs premium | Postuler |
| **Orange Digital** | Formations tech gratuites | S'inscrire |
| **Afrique Innovation** | Incubateur startups | Candidater |

---

## Stats de Performance

Les métriques suivantes sont trackées automatiquement :

- **Impressions** : Nombre d'affichages dans le feed
- **Clics** : Nombre de clics sur la carte
- **CTR** : Taux de conversion (clics/impressions)

Visible dans le dashboard : `/admin/sponsors`

---

## Positionnement dans le Feed

Les sponsors sont insérés automatiquement :
- 1 sponsor tous les **4 contenus**
- Ordre par **priorité décroissante**
- Seuls les **actifs** et **non-expirés** apparaissent

---

## Dépannage

### Les sponsors n'apparaissent pas ?

1. Vérifier qu'ils sont **actifs**
2. Vérifier que `startDate` ≤ aujourd'hui
3. Vérifier que `endDate` > aujourd'hui (ou vide)
4. Rafraîchir le feed (cache 5 min)

### Erreur "Accès refusé" ?

L'utilisateur doit avoir `role: "admin"` en base.
Vérifier : `db.users.findOne({ email: "xxx" }).role`

### Modifier un sponsor existant ?

Dashboard → Cliquer **"Modifier"** sur la carte du sponsor.
