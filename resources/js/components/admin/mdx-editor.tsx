import CodeMirror from '@uiw/react-codemirror';
import { autocompletion, snippetCompletion } from '@codemirror/autocomplete';
import type {
    CompletionContext,
    CompletionResult,
} from '@codemirror/autocomplete';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
// Pas de lang-mdx officiel : le playground MDX s'appuie sur le langage
// Markdown, dont le parseur intégré color les tags JSX/HTML du MDX.
import { markdown } from '@codemirror/lang-markdown';
import { EditorView } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';
import { BookOpen, Code2, Loader2 } from 'lucide-react';
import type { CSSProperties } from 'react';
import { MdxErrorBoundary } from '@/components/mdx-error-boundary';
import { mdxComponents } from '@/components/mdx-components';
import {
    useMdxPreview,
    type MdxContentComponent,
} from '@/hooks/use-mdx-preview';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/* =========================================================
   CODEMIRROR — ÉDITEUR MDX
   Même approche que le playground officiel mdxjs.com : un
   vrai éditeur (coloration, fermeture des tags, autocomplete)
   plutôt qu'un <textarea> — impossible à colorer syntaxiquement.
   ========================================================= */

/** Thème calé sur les tokens du design system : suit le mode clair/sombre sans JS. */
const mdxEditorTheme = EditorView.theme(
    {
        '&': {
            color: 'var(--foreground)',
            backgroundColor: 'transparent',
            fontSize: '0.875rem',
        },
        '.cm-content': {
            caretColor: 'var(--primary)',
            padding: '0.75rem 0',
            fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        },
        '.cm-line': { padding: '0 0.75rem' },
        '.cm-placeholder': { color: 'var(--muted-foreground)' },
        '.cm-cursor, .cm-dropCursor': {
            borderLeftColor: 'var(--primary)',
            borderLeftWidth: '2px',
        },
        '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
            {
                backgroundColor:
                    'color-mix(in srgb, var(--primary) 22%, transparent)',
            },
        '.cm-activeLine': {
            backgroundColor:
                'color-mix(in srgb, var(--primary) 4%, transparent)',
        },
        '.cm-gutters': {
            backgroundColor: 'var(--card)',
            color: 'var(--muted-foreground)',
            border: 'none',
            borderRight: '1px solid var(--border)',
        },
        '.cm-activeLineGutter': {
            backgroundColor: 'var(--muted)',
            color: 'var(--foreground)',
        },
        '.cm-matchingBracket, &.cm-focused .cm-matchingBracket': {
            backgroundColor:
                'color-mix(in srgb, var(--primary) 16%, transparent)',
            outline: 'none',
        },
        '.cm-nonmatchingBracket': { color: 'var(--destructive)' },
        '.cm-selectionMatch': {
            backgroundColor:
                'color-mix(in srgb, var(--accent) 45%, transparent)',
        },
        '.cm-tooltip': {
            backgroundColor: 'var(--popover)',
            color: 'var(--popover-foreground)',
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        },
        '.cm-tooltip-autocomplete > ul': {
            fontFamily: 'inherit',
            fontSize: '0.8125rem',
        },
        '.cm-tooltip-autocomplete > ul > li[aria-selected]': {
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-foreground)',
        },
        '.cm-completionIcon': { color: 'var(--muted-foreground)' },
        '.cm-completionDetail': {
            color: 'var(--muted-foreground)',
            fontStyle: 'normal',
            marginLeft: '0.5rem',
        },
        '.cm-searchMatch': {
            backgroundColor:
                'color-mix(in srgb, var(--warning) 35%, transparent)',
        },
    },
    { dark: false },
);

/** Coloration syntaxique MDX : titres, emphasis, tags JSX, attributs, chaînes… */
const mdxHighlightStyle = HighlightStyle.define([
    { tag: t.heading1, fontSize: '1.25rem', fontWeight: '700' },
    { tag: t.heading2, fontSize: '1.1rem', fontWeight: '700' },
    { tag: t.heading3, fontWeight: '600' },
    { tag: t.strong, fontWeight: '700' },
    { tag: t.emphasis, fontStyle: 'italic' },
    { tag: t.strikethrough, textDecoration: 'line-through' },
    { tag: t.link, color: 'var(--primary)' },
    { tag: t.url, color: 'var(--muted-foreground)' },
    {
        tag: [t.comment, t.lineComment, t.quote],
        color: 'var(--muted-foreground)',
    },
    { tag: [t.tagName, t.angleBracket], color: 'var(--brand)' },
    { tag: t.attributeName, color: 'var(--info)' },
    {
        tag: [t.attributeValue, t.string, t.special(t.string)],
        color: 'var(--success)',
    },
    { tag: [t.number, t.bool, t.null], color: 'var(--warning)' },
    { tag: t.keyword, color: 'var(--brand)' },
    { tag: t.invalid, color: 'var(--destructive)' },
    { tag: t.list, color: 'var(--brand)' },
    {
        tag: t.monospace,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    },
]);

/* ---------- Autocompletion des composants de leçon ---------- */

const LESSON_TAG_COMPLETIONS = [
    snippetCompletion('Callout>\n\t${children}\n</Callout', {
        label: 'Callout',
        type: 'function',
        detail: 'Encadré tip | info | warn',
        info: 'Encadré mise en avant : <Callout tone="tip">…</Callout>',
    }),
    snippetCompletion('LetterGrid />', {
        label: 'LetterGrid',
        type: 'function',
        detail: 'Alphabet allemand avec prononciation',
        info: 'Affiche les 30 lettres et leur nom : <LetterGrid />. Pour une sélection : <LetterGrid letters="ABC" />',
    }),
];

const CALLOUT_TONE_COMPLETIONS = (['tip', 'info', 'warn'] as const).map(
    (tone) => ({
        label: tone,
        type: 'enum',
        detail: 'ton du Callout',
    }),
);

/**
 * Source d'autocompletion MDX : les composants exposés par
 * `mdxComponents` (à garder synchro) + les tons du `<Callout>`.
 */
function completeLessonMdx(
    context: CompletionContext,
): CompletionResult | null {
    // Valeur de l'attribut tone="…" sur <Callout>.
    const tone = context.matchBefore(/tone=["'][\w-]*$/);
    if (tone) {
        const typed = /[\w-]*$/.exec(tone.text)?.[0] ?? '';
        return {
            from: tone.to - typed.length,
            options: CALLOUT_TONE_COMPLETIONS,
            validFor: /^[\w-]*$/,
        };
    }

    // Nom de composant juste après « < ».
    const tag = context.matchBefore(/<[\w-]*$/);
    if (tag && (tag.from === tag.to || context.explicit)) {
        return {
            from: tag.from + 1,
            options: LESSON_TAG_COMPLETIONS,
            validFor: /^[\w-]*$/,
        };
    }

    return null;
}

const MDX_EDITOR_EXTENSIONS = [
    markdown(),
    // basicSetup désactive son autocompletion par défaut : on la remplace.
    autocompletion({ override: [completeLessonMdx] }),
    syntaxHighlighting(mdxHighlightStyle),
    mdxEditorTheme,
];

type Props = {
    value: string;
    onChange: (next: string) => void;
    minHeight?: string;
    /** Hauteur maximale des deux panneaux : au-delà, scroll interne. */
    maxHeight?: string;
};

/**
 * Éditeur MDX à deux panneaux : saisie à gauche, rendu live à droite
 * (desktop ≥ lg). Mobile : onglets Éditer / Aperçu.
 *
 * Les deux panneaux ont exactement la même hauteur (pilotée par la
 * saisie, bornée par minHeight/maxHeight) et scrollent en interne.
 */
export function MdxEditor({
    value,
    onChange,
    minHeight = '38vh',
    maxHeight = '60vh',
}: Props) {
    const { Content, error, compiling, revision } = useMdxPreview(value);

    return (
        <div
            className="grid gap-4 lg:grid-cols-2 lg:gap-6"
            aria-label="Éditeur MDX avec aperçu"
        >
            {/* Saisie — CodeMirror. Toujours visible sur desktop ; onglet sur mobile. */}
            <div className="flex min-w-0 flex-col">
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    <Code2 className="size-3.5" />
                    MDX
                    {compiling && (
                        <span className="inline-flex items-center gap-1 text-primary normal-case">
                            <Loader2 className="size-3 animate-spin" />
                            compilation…
                        </span>
                    )}
                </p>

                {/* Éditeur : la valeur part au formulaire via un input caché. */}
                <div
                    className={cn(
                        'overflow-hidden rounded-xl border bg-card',
                        error && 'border-destructive/50',
                    )}
                    style={{ minHeight }}
                >
                    <CodeMirror
                        value={value}
                        onChange={onChange}
                        theme="none"
                        basicSetup={{ autocompletion: false }}
                        extensions={MDX_EDITOR_EXTENSIONS}
                        maxHeight={maxHeight}
                        placeholder={
                            '# Titre de la leçon\n\nMarkdown et <Composant /> mélangés…'
                        }
                        aria-label="Contenu MDX de la leçon"
                    />
                </div>
            </div>

            {/* Rendu live — panneau droit desktop, à la même hauteur que la saisie. */}
            <div className="hidden min-w-0 flex-col lg:flex">
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    <BookOpen className="size-3.5" />
                    Rendu
                </p>

                <MdxEditorPreview
                    Content={Content}
                    error={error}
                    revision={revision}
                    className="min-h-0 flex-1"
                    style={{ maxHeight }}
                />
            </div>

            {/* Mobile : bascule Éditer / Aperçu, façon playground en viewport réduit. */}
            <div className="lg:hidden">
                <Tabs defaultValue="edit">
                    <TabsList className="w-full">
                        <TabsTrigger value="edit" className="flex-1">
                            Éditer
                        </TabsTrigger>
                        <TabsTrigger value="preview" className="flex-1">
                            Aperçu
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="preview" className="mt-2">
                        <MdxEditorPreview
                            Content={Content}
                            error={error}
                            revision={revision}
                            style={{ minHeight, maxHeight }}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

type PreviewProps = {
    Content: MdxContentComponent | null;
    error: string | null;
    className?: string;
    style?: CSSProperties;
    revision: number;
};

function MdxEditorPreview({
    Content,
    error,
    className,
    style,
    revision,
}: PreviewProps) {
    return (
        <div
            className={cn(
                'overflow-y-auto overscroll-contain rounded-xl border bg-card p-5',
                error && 'border-destructive/50',
                className,
            )}
            style={style}
            aria-live="polite"
        >
            {error ? (
                <p role="alert" className="text-sm text-destructive">
                    Erreur MDX : {error}
                </p>
            ) : Content ? (
                <MdxErrorBoundary key={revision}>
                    <article className="mdx-lesson">
                        <Content components={mdxComponents} />
                    </article>
                </MdxErrorBoundary>
            ) : (
                <p className="text-sm text-muted-foreground">
                    Aperçu en cours…
                </p>
            )}
        </div>
    );
}
