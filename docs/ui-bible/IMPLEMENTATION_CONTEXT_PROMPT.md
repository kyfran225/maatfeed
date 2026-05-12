# 🚀 MAATFEED IMPLEMENTATION CONTEXT PROMPT

## 📋 CONTEXTE GLOBAL

Tu es un agent codeur expert chargé d'implémenter la MAATFEED UI BIBLE complète (15 phases, 100+ fichiers de documentation) en une application web mobile-first, Africa-ready, premium dark theme, audio-first, debate-aware, offline-résiliente et culturellement enracinée.

**Durée totale : 8 semaines**
**Approche : Progressive, itérative, qualité-first**
**Référence absolue : MAATFEED UI BIBLE dans `docs/ui-bible/`**

---

## 🎯 OBJECTIF IMMÉDIAT

Commencer **Semaine 1 : Foundation System** avec la première tâche :
**[P1-D1] Setup projet React/Next.js + Vite**

---

## 📁 STRUCTURE PROJET À CRÉER

```
maatfeed-app/
├── src/
│   ├── tokens/          # Design tokens MAATFEED
│   ├── components/      # Composants réutilisables
│   │   ├── ui/         # Base : Button, Card, Input...
│   │   ├── layout/     # Header, BottomNav, MiniPlayer...
│   │   ├── features/   # Feed, Audio, Debate...
│   │   └── forms/      # Création, profil...
│   ├── pages/          # Écrans complets
│   ├── hooks/          # Hooks personnalisés
│   ├── utils/          # Fonctions utilitaires
│   └── styles/         # Styles globaux
├── public/
├── package.json
├── vite.config.js
└── README.md
```

---

## 🎨 DESIGN TOKENS À IMPLÉMENTER (Référence : `foundation-system/02-tokens-couleurs-typographie-espacements.md`)

### Couleurs MAATFEED
```css
:root {
  /* Fond */
  --color-bg-primary: #0a0a0a;           /* noir charbon profond */
  --color-bg-secondary: #1a1a1a;         /* brun noir premium */
  --color-surface-card: #2a2a2a;         /* noir chaud légèrement élevé */
  --color-surface-modal: #1f1f1f;         /* noir brun plus dense */
  
  /* Texte */
  --color-text-primary: #f8f5f0;          /* ivoire doux */
  --color-text-secondary: #d4d0c8;        /* beige-gris */
  --color-text-muted: #a8a29e;            /* gris chaud */
  
  /* Accents */
  --color-accent-gold: #d4af37;           /* ambre/or */
  --color-accent-premium: #ffd700;         /* or profond */
  
  /* Statuts */
  --color-success: #4a7c59;               /* vert discret */
  --color-danger: #8b4513;               /* rouge argile */
  --color-warning: #cd853f;               /* ambre sombre */
  --color-offline: #8b7355;              /* brun/or doux */
}
```

### Typography
```css
:root {
  --font-display: 2.5rem;                /* grands titres rares */
  --font-title: 1.875rem;                /* titres de page */
  --font-section: 1.5rem;                /* titres de section */
  --font-body: 1rem;                      /* texte principal */
  --font-meta: 0.875rem;                 /* informations secondaires */
  --font-caption: 0.75rem;               /* microtexte non critique */
  --font-label: 0.875rem;                /* champs et boutons */
}
```

### Spacing
```css
:root {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}
```

### Radius
```css
:root {
  --radius-sm: 4px;                       /* tags */
  --radius-md: 8px;                       /* champs */
  --radius-lg: 16px;                      /* cartes */
  --radius-xl: 24px;                      /* sheets */
  --radius-full: 9999px;                  /* capsules */
}
```

---

## 📱 APPROCHE MOBILE-FIRST

**Breakpoints :**
- Mobile : 320px - 768px (priorité absolue)
- Tablette : 768px - 1024px
- Desktop : 1024px+

**Règles :**
- Marges latérales mobiles : 16-20px
- Zones tactiles minimum : 44px
- Bottom navigation persistante
- Mini-player au-dessus de la bottom nav
- Safe areas respectées

---

## 🎧 PRIORITÉ AUDIO-FIRST

L'audio est central, pas secondaire :
- Mini-player global persistant
- Full-player avec waveform
- Reprise automatique lecture
- Téléchargements offline
- Queue de lecture
- Background playback (PWA)

---

## 🌍 AFRICA-READY

**Faible connexion obligatoire :**
- Mode économie de data visible
- Audio léger prioritaire
- Vidéos manuelles
- Cache intelligent
- Brouillons offline
- Sync différée
- Messages simples

---

## 📚 RÉFÉRENCES UI-BIBLE À CONSULTER

### Pour Foundation System (Semaine 1) :
1. `foundation-system/01-vision-globale-foundation-system.md`
2. `foundation-system/02-tokens-couleurs-typographie-espacements.md`
3. `foundation-system/03-grille-layout-system-mobile-first.md`
4. `foundation-system/04-composants-base-button-card-input.md`
5. `foundation-system/05-patterns-interactions-gestures.md`
6. `foundation-system/06-etats-loading-erreur-empty-offline.md`

### Governance :
- `final-design-system-governance/01-gouvernance-globale-du-design-system-maatfeed.md`
- `final-design-system-governance/03-design-tokens-conceptuels-composants-harmoniser.md`
- `final-design-system-governance/05-checklist-finale-agent-codeur.md`

---

## 🛠️ OUTILS RECOMMANDÉS

**Framework :** Next.js 14+ avec App Router
**Build :** Vite
**Styling :** CSS-in-JS (styled-components) ou Tailwind avec tokens personnalisés
**State :** Zustand ou Pinia
**Testing :** Vitest + Testing Library
**Storybook :** Pour documentation composants
**Linting :** ESLint + Prettier
**Git hooks :** Husky pour qualité

---

## 📋 PROGRESSION IMMÉDIATE

### Tâches à exécuter dans l'ordre :

1. **[P1-D1]** Setup projet React/Next.js + Vite
2. **[P1-D1]** Structure dossier selon architecture MAATFEED
3. **[P1-D1]** Implémenter tous les design tokens CSS
4. **[P1-D1]** Créer Storybook avec tokens
5. **[P1-D1]** Tests visuels tokens avec Chromatic

Puis passer à [P1-D2] Grid System & Layout Components.

---

## 🎯 CRITÈRES DE VALIDATION

Chaque tâche doit valider :
- **Fonctionnalité** 100% des spécifications UI-BIBLE
- **Performance** Lighthouse 90+ mobile
- **Accessibilité** WCAG 2.1 AA
- **Responsive** Mobile/tablet/desktop
- **MAATFEED-ready** Checklist finale

---

## 🔄 MISE À JOUR PROGRESSION

Après chaque tâche complétée :
1. Mettre à jour `IMPLEMENTATION_TODO.md`
2. Cocher la tâche correspondante
3. Mettre à jour les métriques de progression
4. Passer à la tâche suivante

---

## 🚀 GO IMMÉDIAT

**Commencer maintenant avec [P1-D1] Setup projet React/Next.js + Vite**

Références à consulter :
- `foundation-system/01-vision-globale-foundation-system.md`
- `final-design-system-governance/03-design-tokens-conceptuels-composants-harmoniser.md`

**Règles non négociables :**
- Mobile-first absolu
- Noir/or non négociable
- Audio prioritaire sur vidéo
- Africa-ready obligatoire
- Accessibility-first
- Performance-first
- MAATFEED-ready avant chaque livraison

---

**FEU ! Commence l'implémentation MAATFEED ! 🔥**

---

*Contexte d'implémentation MAATFEED - Utiliser ce prompt pour démarrer dans une nouvelle session*
