# Leçons MDX : saisie admin, stockage en BD et rendu formaté

Comment stocker des leçons écrites en **MDX** (markdown + JSX) dans la base de
données, les saisir librement côté admin, et les afficher **déjà formatées**
côté étudiant — exactement comme l'actuelle leçon « alphabet », mais en MDX.

Snippets de ce guide testés avec `@mdx-js/mdx@3`, `react@19`
(<https://github.com/mdx-js/mdx/>).

---

## 1. Le principe en une image

```
Admin (textarea MDX)
        │  saisie libre, chaque leçon individuellement
        ▼
MySQL "lesson_content.content"  ←── texte MDX brut (TEXT/LONGTEXT)
        │  string récupérée par Inertia
        ▼
Front React : evaluate(mdx, runtime) ──► composant React
        │
        ▼
<MDXContent /> rendu, formaté (markdown + JSX exécuté)
```

La BD ne stocke **que du texte**. Le "formatage" est recalculé au rendu par
MDX : aucune duplication HTML en base, la leçon reste éditable indéfiniment.

### Markdown supporté

MDX n'implémente que **CommonMark** (le standard) + JSX — les tableaux, le
barré, les listes de tâches et les autolinks sont des extensions **GFM** et
doivent être ajoutées explicitement via `remark-gfm` :

```ts
evaluate(source, { ...runtime, remarkPlugins: [remarkGfm] });
```

C'est fait aux deux points de compilation (`hooks/use-mdx-preview.ts` pour
l'aperçu admin, `components/learner/mdx-content.tsx` pour l'étudiant), et les
`table/th/td/tr` sont stylés dans `components/mdx-components.tsx`.

Donc : **tout le CommonMark + tout le GFM + le JSX** (composants `Callout`,
`LetterGrid` et n'importe quel élément/attribut JSX) fonctionne dans les
leçons. Rappel MDX : une **ligne vide** sépare un bloc JSX du markdown qui
suit, sinon le markdown est avalé par le bloc.

---

## 2. Côté admin : un vrai éditeur, pas un simple textarea

L'admin saisit chaque leçon **individuellement** dans un composant dédié
`<MdxEditor>` : **deux panneaux côte à côte** — la saisie MDX à gauche, le
**rendu live** à droite — exactement comme le playground officiel de MDX
(<https://mdxjs.com/playground/>) :

```
┌─────────────────────────┬─────────────────────────┐   desktop ≥ lg
│  MDX (source)           │  Rendu (live preview)   │   grid-cols-2
│                         │                         │
│ # L'alphabet allemand   │  L'alphabet allemand    │
│                         │                         │
│ <Callout tone="tip">    │  ┌───────────────────┐  │
│   Ä, Ö, Ü...            │  │ Ä, Ö, Ü...        │  │  ← JSX exécuté
│ </Callout>              │  └───────────────────┘  │
└─────────────────────────┴─────────────────────────┘
        (mobile : panneau unique avec onglets Éditer | Aperçu)
```

La saisie est un vrai éditeur **CodeMirror 6** (`@uiw/react-codemirror` +
`@codemirror/lang-markdown`, comme le playground officiel — il n'existe pas
de paquet `lang-mdx` officiel, les tags JSX sont colorés par le parseur HTML
intégré au langage Markdown) : coloration syntaxique (titres, emphasis, tags,
attributs, chaînes), fermeture automatique des délimiteurs et autocompletion
des composants de leçon (`<Callout>`, `<LetterGrid>`) avec les tons du
`Callout`. Le thème est calé sur les variables CSS du design system : il suit
le mode clair/sombre sans rechargement.

Les deux panneaux ont exactement la même hauteur (pilotée par la saisie,
bornée par `minHeight`/`maxHeight` : 38vh → 60vh par défaut) et scrollent en
interne au-delà.

Exemple de MDX saisi (markdown + JSX mélangés, comme demandé) :

```mdx
# L'alphabet allemand

Repère les lettres et les signes propres à l'allemand.

## Les 26 lettres de base

Leurs noms et leurs sons ne sont pas toujours les mêmes qu'en français.

<div style={{ backgroundColor: 'violet', padding: '1rem' }}>
  Essaie de changer la couleur de fond en « tomato ».
</div>

## Trois groupes utiles

- **ei** se prononce « aï » comme dans *mein*
- **sch** se prononce « ch » comme dans *Schule*
```

### 2.1 Le hook de preview — même logique que le playground

Le playground compile le MDX **à chaque frappe** — nous faisons pareil, avec
un **debounce 300 ms** pour ne pas compiler à chaque touche :

```tsx
// resources/js/hooks/use-mdx-preview.ts
import { evaluate, type MDXModule } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import { useEffect, useState } from 'react';

export type MdxPreviewState = {
    Content: MDXModule['default'] | null;
    error: string | null;
    compiling: boolean;
};

/** Compile le MDX avec debounce — au relief du playground mdxjs.com. */
export function useMdxPreview(source: string, delay = 300): MdxPreviewState {
    const [state, setState] = useState<MdxPreviewState>({
        Content: null,
        error: null,
        compiling: false,
    });

    useEffect(() => {
        let cancelled = false;

        setState((s) => ({ ...s, compiling: true }));

        const timer = window.setTimeout(() => {
            evaluate(source, { ...runtime })
                .then((mod) => {
                    if (cancelled) return;
                    setState({ Content: () => mod.default, error: null, compiling: false });
                })
                .catch((err: unknown) => {
                    if (cancelled) return;
                    // Erreur de syntaxe MDX : affichée sous le preview, comme le playground.
                    setState({
                        Content: null,
                        error: err instanceof Error ? err.message : String(err),
                        compiling: false,
                    });
                });
        }, delay);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [source, delay]);

    return state;
}
```

> 💡 La fonction retournée dans `Content` est recréée à chaque compilation : on
> l'assigne via une **fonction fléchée** (`Content: () => mod.default`) pour que
> React la re-diffuse bien à chaque frappe — c'est la note perf officielle de MDX.

### 2.2 Le composant `<MdxEditor>` — split-pane type playground

```tsx
// resources/js/components/admin/mdx-editor.tsx
import { useMdxPreview } from '@/hooks/use-mdx-preview';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

type Props = {
    value: string;
    onChange: (next: string) => void;
    minHeight?: string;
};

export function MdxEditor({ value, onChange, minHeight = '32vh' }: Props) {
    const { Content, error, compiling } = useMdxPreview(value);

    return (
        <div
            className="grid gap-4 lg:grid-cols-2 lg:gap-6"
            aria-label="Éditeur MDX avec aperçu"
        >
            {/* Panneau gauche : saisie (desktop) / onglet Éditer (mobile) */}
            <div className="min-w-0">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    MDX {' '}
                    {compiling && <span className="text-primary">· compilation…</span>}
                </p>
                <Textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{ minHeight }}
                    className="h-auto resize-y font-mono text-sm leading-relaxed"
                    placeholder={'# Titre de la leçon\n\nMarkdown et <Composant /> mélangés…'}
                    spellCheck={false}
                />
            </div>

            {/* Panneau droit : rendu live (desktop) */}
            <div className="min-w-0 hidden lg:block">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Rendu
                </p>
                <MdxEditorPreview Content={Content} error={error} minHeight={minHeight} />
            </div>

            {/* Mobile : bascule Éditer / Aperçu au même endroit, comme le playground en téléphonie */}
            <div className="lg:hidden">
                <Tabs defaultValue="edit">
                    <TabsList className="w-full">
                        <TabsTrigger value="edit" className="flex-1">Éditer</TabsTrigger>
                        <TabsTrigger value="preview" className="flex-1">Aperçu</TabsTrigger>
                    </TabsList>
                    <TabsContent value="edit" className="sr-only" />
                    <TabsContent value="preview" className="mt-2">
                        <MdxEditorPreview Content={Content} error={error} minHeight={minHeight} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

function MdxEditorPreview({
    Content,
    error,
    minHeight,
}: {
    Content: (() => React.JSX.Element) | null;
    error: string | null;
    minHeight: string;
}) {
    return (
        <div
            className={cn(
                'overflow-y-auto overscroll-contain rounded-xl border bg-card p-5',
                error && 'border-destructive/50',
            )}
            style={{ minHeight }}
            aria-live="polite"
        >
            {error ? (
                <p role="alert" className="text-sm text-destructive">
                    Erreur MDX : {error}
                </p>
            ) : Content ? (
                <article className="prose prose-sm md:prose-base max-w-none">
                    <Content />
                </article>
            ) : (
                <p className="text-sm text-muted-foreground">Aperçu en cours…</p>
            )}
        </div>
    );
}
```

> 💡 Le MDX saisi est compilé **dans le navigateur admin** : aucun aller-retour
> serveur à chaque frappe. Le preview vit dans l'admin ; ce que voit l'étudiant,
> c'est le même composant `MdxContent` (§ 4.2) sur la leçon rendue depuis la BD.

### 2.3 La page admin — enregistrer avec Inertia

```tsx
// resources/js/pages/admin/lessons/edit.tsx
import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import { MdxEditor } from '@/components/admin/mdx-editor';
import { Button } from '@/components/ui/button';

type Props = { lesson: { id: string; lessonKey: string; content: string } };

export default function LessonEdit({ lesson }: Props) {
    const [content, setContent] = useState(lesson.content);

    return (
        <>
            <Head title={`Éditer · ${lesson.lessonKey}`} />

            <Form
                action={`/admin/lessons/${lesson.id}`}
                method="put"
                className="space-y-4"
            >
                {({ processing }) => (
                    <>
                        {/* La source MDX part avec le formulaire : un champ caché. */}
                        <input type="hidden" name="content" value={content} />

                        <MdxEditor value={content} onChange={setContent} />

                        <div className="flex items-center gap-3">
                            <Button type="submit" disabled={processing || !content.trim()}>
                                {processing ? 'Enregistrement…' : 'Enregistrer la leçon'}
                            </Button>
                            <span className="text-xs text-muted-foreground">
                                Markdown + JSX — le rendu à droite est exactement ce que
                                l'étudiant verra.
                            </span>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}
```

### Côté serveur : validation et stockage

```php
// app/Http/Controllers/Admin/LessonContentController.php (extrait)
public function update(Request $request, Lesson $lesson): RedirectResponse
{
    $validated = $request->validate([
        // Mini-garde-fou : on refuse <script> et les attributs d'événement.
        'content' => ['required', 'string', 'max:100_000'],
    ]);

    $lesson->forceFill(['content' => $validated['content']])->save();

    return back()->with('status', 'Leçon enregistrée.');
}
```

> ⚠️ **Sécurité MDX** : le MDX est du JS exécuté par le navigateur de
> l'étudiant. Éditeur = admin de confiance ; ne donne JAMAIS ce formulaire à
> un contributeur non vérifié. \`evaluate\` exécute tout ce que la chaîne
> contient — c'est assumé ici, pour un back-office admin.

---

## 3. Migration et modèle

```php
// database/migrations/xxxx_create_lesson_contents_table.php
Schema::create('lesson_contents', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('lesson_key')->unique();   // ex : 'a1.alphabet'
    $table->longText('content');              // MDX brut
    $table->timestamps();
});
```

```php
// app/Models/LessonContent.php
class LessonContent extends Model
{
    use HasUuids;

    protected $fillable = ['lesson_key', 'content'];
}
```

Le seeder de la leçon alphabet devient :

```php
LessonContent::query()->updateOrCreate(
    ['lesson_key' => 'a1.alphabet'],
    ['content' => <<<'MDX'
        # L'alphabet allemand

        Repère les lettres et les signes propres à l'allemand.

        <Callout tone="tip">
          Ä, Ö, Ü et ß n'existent pas en français : ce sont eux qu'on travaille.
        </Callout>
        MDX],
);
```

---

## 4. Côté étudiant : affichage formaté

### 4.1 Passer le MDX brut à la page

```php
// Dans LearnController::show() (générique, par module + leçon) :
$lesson = Lesson::query()->where('slug', $slug)->firstOrFail();

return Inertia::render('learner/learn/show', [
    // 'module', 'lesson', 'questions', 'modules', 'isRead', 'flash.quizResult' — déjà en place
    'mdx' => $lesson->content,
]);
```

### 4.2 Composant de rendu — option recommandée \`evaluate\`

Compile et exécute directement dans le navigateur. Aucun serveur Node dédié,
pas de nouveaux endpoints, tout part du texte stocké en BD.

```bash
npm install @mdx-js/mdx@3
```

```tsx
// resources/js/components/learner/mdx-content.tsx
import { evaluate, type MDXModule } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import { useEffect, useState, type ComponentProps } from 'react';

type Props = { source: string; components?: ComponentProps<'div'> };

export function MdxContent({ source, components }: Props) {
    const [Content, setContent] = useState<MDXModule['default'] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        evaluate(source, {
            ...runtime,
            // Optional but useful : restrict component APIs available in the code.
           Development: false,
        })
            .then((mod) => { if (!cancelled) setContent(() => mod.default); })
            .catch((err: unknown) => {
                if (!cancelled) setError(err instanceof Error ? err.message : String(err));
            });

        return () => { cancelled = true; };
    }, [source]);

    if (error) {
        return <p className="text-sm text-destructive">Erreur MDX : {error}</p>;
    }

    if (!Content) {
        return <p className="text-sm text-muted-foreground">Chargement de la leçon…</p>;
    }

    // MDXComponents : mapping depuis des noms de composants globaux
    return (
        <div className="mdx-lesson">
            <Content components={components} />
        </div>
    );
}
```

> ⚠️ \`evaluate\` est du \`eval\` assumé : il est réservé au contenu **admin de
> confiance**. Pour un contenu non fiable, préférer \`compile\` côté serveur
> (voir § 5) et n'exposer que le résultat en sécurité.

**Usage dans la page leçon :**

```tsx
// resources/js/pages/learner/learn/alphabet.tsx — dans le tab "Leçon"
import { MdxContent } from '@/components/learner/mdx-content';

// remplacer lesson.sections.map(...) par :
<TabsContent value="lesson" className="mt-8">
    <MdxContent source={mdx} components={componentsMap} />
</TabsContent>
```

### 4.3 Styliser le markdown produit

Le HTML généré reste markup natif (h1, ul, strong…). Deux approches :

- **CSS de portée** (simple, aucune dépendance) :

```css
/* resources/css/mdx-lesson.css */
.mdx-lesson h2 { margin-top: 2rem; font-size: 1.5rem; font-weight: 600; }
.mdx-lesson ul { list-style: disc; padding-left: 1.25rem; }
.mdx-lesson strong { color: hsl(var(--primary)) }
```

- **@tailwindcss/typography** (plugins Tailwind officiel) :
  \`npm i @tailwindcss/typography\` puis dans un \`@plugin\` Tailwind v4 :

```css
@plugin "@tailwindcss/typography";
/* …et sur le conteneur : class="prose prose-sm md:prose-base" */
```

---

## 5. Option B : \`compile\` côté serveur (réponse plus sûre)

Si tu veux exécuter le MDX **sur le serveur** (Node) et n'envoyer que du
markup sûr, ou si tu préfères précalculer :

```js
// server/mdx-compile.mjs (service Node séparé, ex: Express mini-router)
import { compile } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';

app.post('/api/mdx/compile', async (req, res) => {
    const code = String(
        await compile(req.body.source, { outputFormat: 'function-body' }),
    );
    res.json({ code });
});
```

Puis côté client :

```tsx
import { run } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';

const { default: Content } = await run(codeFromServer, {
    ...runtime,
    baseUrl: import.meta.url,
});
```

> 💡 \`outputFormat: 'function-body'\` est obligatoire si le code doit passer
> par \`run\` (et non par un import/bundler). C'est le mode documenté pour
> "compiler au serveur, exécuter au navigateur".

Quand choisir quoi ?

| Critère | \`evaluate\` (client) | \`compile\` (serveur) + \`run\` |
|---|---|---|
| Nouvelle infra | aucune | service Node à déployer |
| Sécurité | admin de confiance uniquement | plus contrôlable (sandbox côté serveur) |
| Latence premier rendu | compile au premier affichage (~50-150 ms) | code prêt, plus rapide |
| Contenu arbitraire | non recommandé | OK |

Pour un back-office admin uniquement, **\`evaluate\` est le bon choix** :
simple, sans nouvelle pièce d'architecture, et sa véracité est testée.

---

## 6. Vérifier l'installation

Le test Node suivant reproduit exactement l'exemple de ta demande
(markdown + \`<div style={...}>\` JSX) :

```js
// test-mdx.mjs  →  node test-mdx.mjs
import { evaluate, compile } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';

const lesson = `# Hello, world!

Below is an example of markdown in JSX.

<div style={{backgroundColor: 'violet', padding: '1rem'}}>
  Try and change the background color to \`tomato\`.
</div>
`;

const { default: MDXContent } = await evaluate(lesson, { ...runtime });
console.log(renderToStaticMarkup(MDXContent({})));
// → <h1>Hello, world!</h1><p>…</p><div style="background-color:violet;…">…
```

Sortie vérifiée le 2026-10-10 avec \`@mdx-js/mdx@3\` + \`react@19\`.

## 7. Checklist de mise en route

1. \`npm install @mdx-js/mdx@3\`
2. Migration \`lesson_contents\` + modèle \`LessonContent\`
3. \`useMdxPreview\` + \`<MdxEditor>\` (split-pane admin) + validation serveur (refus \`<script>\`)
4. Controller : passer \`mdx\` à la page leçon via Inertia
5. \`<MdxContent source={mdx} />\` dans le tab "Leçon"
6. Styles : CSS de portée ou \`@tailwindcss/typography\`
