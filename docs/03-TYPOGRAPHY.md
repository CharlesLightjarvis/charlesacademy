# CharlesAcademy — Typography System

> **Document canonique** · Design System · Version 1.0  
> Stack : Laravel + Inertia.js + React + Tailwind CSS v4 + shadcn/ui  
> Langue principale : français · Contenus pédagogiques : français et allemand

## 1. Intentions

L'identité typographique de **CharlesAcademy** doit être chaleureuse, lisible, actuelle et crédible. Le style ne doit être ni infantilisant ni institutionnel. **Aucune mascotte n'est prévue.** La typographie est donc un élément central de la personnalité de marque.

Principes :

- Lecture d'abord : priorité à la compréhension des cours, exercices et messages d'interface.
- Contraste typographique net entre titres et texte courant, sans multiplication des polices.
- Hiérarchie cohérente sur landing page, application et espace pédagogique.
- Mise en page responsive, compatible français et allemand.
- Respect des réglages d'accessibilité, du zoom et des préférences utilisateur.

## 2. Familles retenues

| Rôle                | Police                                              | Graisses admises   | Usage                                                         |
| ------------------- | --------------------------------------------------- | ------------------ | ------------------------------------------------------------- |
| Display / titres    | **Fredoka**                                         | 500, 600, 700      | H1–H4, accroches, nombres expressifs, titres de modules       |
| Lecture / interface | **DM Sans**                                         | 400, 500, 600, 700 | Body, navigation, formulaires, boutons, tableaux, quiz, aides |
| Technique           | `ui-monospace, SFMono-Regular, Consolas, monospace` | 400–600            | Code, identifiants, contenus techniques uniquement            |

**Interdictions :** ne pas réintroduire Instrument Sans dans `--font-sans` ; ne pas utiliser Fredoka pour de longs paragraphes ou les contenus de lecture dense ; ne pas appliquer artificiellement des graisses inexistantes.

### Chargement des polices

Si les polices sont déjà chargées via Bunny Fonts dans Laravel/Vite, **ne pas les charger une seconde fois** via Google Fonts. Choisir **un seul fournisseur**.

Exemple Bunny Fonts (dans la configuration déjà utilisée par le projet) :

```ts
fonts: [
    bunny('Fredoka', { weights: [400, 500, 600, 700] }),
    bunny('DM Sans', { weights: [400, 500, 600, 700] }),
],
```

Alternativement, pour un chargement CSS via Google Fonts seulement :

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fredoka:wght@400;500;600;700&display=swap');
```

Pour les performances, privilégier une stratégie cohérente de chargement, `font-display: swap` lorsque configuré localement, et contrôler le CLS.

## 3. Tokens Tailwind CSS v4

À conserver dans `resources/css/app.css` :

```css
@theme inline {
    --font-sans: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
    --font-display: 'Fredoka', ui-sans-serif, system-ui, sans-serif;
    --font-reading: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
}

:root {
    --font-heading: 'Fredoka', ui-sans-serif, system-ui, sans-serif;
    --font-body: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
}

@layer base {
    body {
        @apply font-sans;
    }
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        @apply font-display;
    }
}
```

**Classes utilitaires :** `font-display`, `font-sans`, `font-reading`.

Les polices ne changent **pas** avec le thème : seules les couleurs typographiques évoluent.

## 4. Échelle typographique responsive

Les tailles ci-dessous sont des valeurs de référence ; privilégier `clamp()` ou les utilitaires responsive de Tailwind selon le contexte.

| Token        | Famille / graisse | Mobile | Desktop | Interligne | Usage                     |
| ------------ | ----------------- | -----: | ------: | ---------: | ------------------------- |
| `display-xl` | Fredoka 600       |  44 px |   80 px |  1.02–1.08 | Hero principal            |
| `display-lg` | Fredoka 600       |  36 px |   64 px |  1.06–1.12 | Grande accroche           |
| `heading-1`  | Fredoka 600       |  32 px |   52 px |  1.10–1.16 | Titres de section majeurs |
| `heading-2`  | Fredoka 600       |  28 px |   40 px |  1.14–1.20 | Sections                  |
| `heading-3`  | Fredoka 500/600   |  23 px |   30 px |  1.20–1.28 | Blocs importants          |
| `heading-4`  | Fredoka 500/600   |  20 px |   24 px |  1.25–1.32 | Cartes et modules         |
| `body-lg`    | DM Sans 400       |  17 px |   19 px |  1.55–1.70 | Introduction              |
| `body-md`    | DM Sans 400       |  16 px |   16 px |  1.55–1.70 | Texte normal              |
| `body-sm`    | DM Sans 400/500   |  14 px |   14 px |  1.45–1.60 | Descriptions courtes      |
| `label`      | DM Sans 600       |  14 px |   14 px |   1.25–1.4 | Libellés, champs          |
| `caption`    | DM Sans 500       |  12 px |   12 px |    1.4–1.5 | Métadonnées secondaires   |

**Accessibilité :** ne pas utiliser `caption` comme seule source d'une information essentielle ; 16 px reste la taille de référence pour les champs et textes de lecture sur mobile.

### CSS recommandé pour les accroches

```css
@layer components {
    .type-display-xl {
        font-family: var(--font-heading);
        font-size: clamp(2.75rem, 6vw, 5rem);
        font-weight: 600;
        line-height: 1.06;
        letter-spacing: -0.035em;
    }

    .type-heading-1 {
        font-family: var(--font-heading);
        font-size: clamp(2rem, 4vw, 3.25rem);
        font-weight: 600;
        line-height: 1.12;
        letter-spacing: -0.025em;
    }

    .type-body-lg {
        font-family: var(--font-body);
        font-size: clamp(1.0625rem, 1.4vw, 1.1875rem);
        font-weight: 400;
        line-height: 1.65;
    }
}
```

## 5. Hiérarchie par surface

### Landing page

- Un seul `h1` principal par page, avec Fredoka 600.
- Titres de sections en `h2`, puis `h3` pour les sous-parties : respecter la structure sémantique.
- Maximum recommandé : 10–14 mots pour un titre héro, si cela reste naturel.
- Texte d'accompagnement en DM Sans, largeur de ligne autour de 55–75 caractères.
- CTA : DM Sans 600, 14–16 px ; libellés orientés action.

### Application et tableau de bord

- Fredoka sur les intitulés de pages et modules, sans en abuser.
- DM Sans pour navigation, champs, tableaux, exercices, menus, alertes et feedbacks.
- Dans les tableaux, favoriser la stabilité visuelle des chiffres avec `font-variant-numeric: tabular-nums` / `tabular-nums`.

### Contenu pédagogique français / allemand

- Texte de cours : DM Sans 16–18 px, interligne 1.6 ou davantage si nécessaire.
- Exemples allemands : DM Sans 500, visuellement différenciés par le contexte, pas seulement la couleur.
- Conserver les signes `ä`, `ö`, `ü`, `Ä`, `Ö`, `Ü`, `ß` et `ẞ` correctement ; ne pas les remplacer.
- Privilégier une mise en valeur par poids, encadré ou soulignement plutôt que les majuscules constantes.

## 6. Graisses, espacements, casse

| Élément     |           Poids | Tracking           | Casse                             |
| ----------- | --------------: | ------------------ | --------------------------------- |
| Hero        |     Fredoka 600 | -0.035em à -0.02em | Phrase normale                    |
| Sections    |     Fredoka 600 | -0.025em           | Phrase normale                    |
| Cartes      | Fredoka 500/600 | -0.015em           | Phrase normale                    |
| Paragraphes |     DM Sans 400 | normal             | Phrase normale                    |
| Boutons     |     DM Sans 600 | 0 à 0.01em         | Phrase normale                    |
| Navigation  | DM Sans 500/600 | normal             | Phrase normale                    |
| Eyebrow     |     DM Sans 700 | 0.06em             | Majuscules ponctuelles uniquement |

Éviter le texte centré sur de longs paragraphes. Ne jamais justifier les textes courants.

## 7. Couleurs et contrastes

**Light mode :**

- Titres et texte : `text-foreground` (base `#1F2937`).
- Secondaire : `text-muted-foreground` (base `#52635C`).
- Accent : `text-primary` (base `#038259`) sur fond clair.

**Dark mode :**

- Titres et texte : `text-foreground` (base `#EDF7F1`).
- Secondaire : `text-muted-foreground` (base `#B3C8BB`).
- Accent : `text-primary` (base `#22C58B`) sur fond sombre.

Respecter les paires de tokens shadcn : `bg-primary text-primary-foreground`, `bg-secondary text-secondary-foreground`, etc. Ne jamais utiliser un vert lumineux avec du texte blanc sans vérifier le contraste.

Cibles WCAG AA : au moins **4.5:1** pour le texte courant ; **3:1** pour les grands textes (minimum 24 px normal ou environ 18.7 px gras). Vérifier aussi les états hover, focus, disabled et les arrière-plans réels.

## 8. Règles de responsive

- Aucun titre ne doit déborder horizontalement à 320 px.
- Autoriser les retours à la ligne naturels ; ne pas forcer `whitespace-nowrap` sur des titres.
- Limiter `text-wrap: balance` aux titres courts ; `text-wrap: pretty` peut améliorer les paragraphes si pris en charge.
- Respecter l'agrandissement texte à 200 % et le zoom jusqu'à 400 % sans perte de contenu.
- Tester les mots longs allemands, accents, traductions et libellés de boutons.
- Éviter de réduire la taille typographique pour résoudre des problèmes structurels de layout.

## 9. Exemples React / Tailwind

```tsx
export function LandingHeading() {
    return (
        <header className="max-w-4xl space-y-6">
            <p className="font-sans text-sm font-bold uppercase tracking-wider text-primary">
                Apprendre l’allemand autrement
            </p>
            <h1 className="type-display-xl text-foreground text-balance">
                L’allemand, enfin à ta portée.
            </h1>
            <p className="type-body-lg max-w-2xl text-muted-foreground">
                Avance à ton rythme avec des cours clairs et des exercices
                interactifs.
            </p>
        </header>
    );
}
```

Les classes `.type-display-xl` et `.type-body-lg` nécessitent les définitions de la section 4.

## 10. Checklist QA typographie

- [ ] Fredoka et DM Sans s'affichent sur navigateur et mobile.
- [ ] Une seule stratégie de chargement est active (Bunny **ou** Google Fonts).
- [ ] `font-sans` = DM Sans ; `font-display` = Fredoka.
- [ ] Aucun reliquat d'Instrument Sans.
- [ ] Les `h1`–`h6` respectent une hiérarchie HTML logique.
- [ ] Les paragraphes de cours restent confortables sur mobile.
- [ ] Les boutons et formulaires restent lisibles en Light et Dark Mode.
- [ ] Les caractères spéciaux allemands sont corrects.
- [ ] Les pages supportent le zoom et les retours à la ligne.
- [ ] Les chiffres de progression et tableaux sont alignés si nécessaire.
- [ ] Les contrastes ont été mesurés sur les fonds finaux.

## 11. Règles pour l'agent IA

1. Lire ce fichier avant toute modification de composants visuels.
2. Ne pas inventer une troisième police pour des effets décoratifs.
3. Utiliser les tokens et utilitaires existants au lieu de disperser des valeurs arbitraires.
4. Vérifier le chargement Bunny déjà configuré avant toute modification de `app.css`.
5. Préserver l'identité CharlesAcademy : **Fredoka pour la voix visuelle, DM Sans pour la clarté**.
6. Ne pas intégrer de mascotte ni renommer la marque « Grammatik Lab ».
7. Vérifier les deux thèmes et les tailles mobiles avant livraison.

---

**Propriétaire du système :** CharlesAcademy  
**Statut :** spécification de référence à adapter aux composants réellement présents dans le dépôt.
