import { evaluate } from '@mdx-js/mdx';
import { useEffect, useState, type ElementType } from 'react';
import remarkGfm from 'remark-gfm';
import * as runtime from 'react/jsx-runtime';
import { MdxErrorBoundary } from '@/components/mdx-error-boundary';
import { mdxComponents } from '@/components/mdx-components';

type Props = {
    source: string;
    /** Composants exposés au MDX — les nôtres par défaut. */
    components?: Record<string, ElementType>;
};

type MdxContentComponent = (props?: {
    components?: Record<string, ElementType>;
}) => React.JSX.Element;

/**
 * Rend du MDX (markdown + JSX) stocké en BD, formaté, comme la leçon alphabet.
 * Le MDX admin est du contenu de confiance : evaluate est assumé.
 */
export function MdxContent({ source, components = mdxComponents }: Props) {
    const [Content, setContent] = useState<MdxContentComponent | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        // On vide le contenu pendant la recompilation : sans cela, la
        // frontière ci-dessous remonterait avec l'ancien composant et
        // pourrait rester bloquée sur son ancienne erreur.
        setContent(null);
        setError(null);

        evaluate(source, { ...runtime, remarkPlugins: [remarkGfm] })
            .then((mod) => {
                if (!cancelled) {
                    const Component =
                        mod.default as unknown as MdxContentComponent;
                    setContent(() => Component);
                }
            })
            .catch((err: unknown) => {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : String(err));
                }
            });

        return () => {
            cancelled = true;
        };
    }, [source]);

    if (error) {
        return <p className="text-sm text-destructive">Erreur MDX : {error}</p>;
    }

    if (!Content) {
        return (
            <p className="text-sm text-muted-foreground">
                Chargement de la leçon…
            </p>
        );
    }

    return (
        <MdxErrorBoundary key={source}>
            <article className="mdx-lesson">
                <Content components={components} />
            </article>
        </MdxErrorBoundary>
    );
}
