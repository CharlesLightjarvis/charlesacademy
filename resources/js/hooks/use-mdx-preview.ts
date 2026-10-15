import { useEffect, useState, type ElementType } from 'react';
import { compileLessonMdx } from '@/lib/compile-lesson-mdx';

export type MdxContentProps = {
    components?: Record<string, ElementType>;
};

export type MdxContentComponent = (
    props?: MdxContentProps,
) => React.JSX.Element;

export type MdxPreviewState = {
    Content: MdxContentComponent | null;
    error: string | null;
    compiling: boolean;
    /**
     * Incrémenté à chaque compilation (réussie ou non). Sert de `key` à
     * l'error boundary : avec la source, elle se remonte trop tôt (avant le
     * debounce) et reste bloquée sur l'erreur du composant précédent.
     */
    revision: number;
};

/**
 * Compile le MDX source avec debounce, comme le playground de mdxjs.com.
 * Le résultat est un composant React prêt à rendre.
 */
export function useMdxPreview(source: string, delay = 300): MdxPreviewState {
    const [state, setState] = useState<MdxPreviewState>({
        Content: null,
        error: null,
        compiling: false,
        revision: 0,
    });

    useEffect(() => {
        let cancelled = false;

        setState((s) => ({ ...s, compiling: true }));

        const timer = window.setTimeout(() => {
            compileLessonMdx(source)
                .then((mod) => {
                    if (cancelled) {
                        return;
                    }
                    // Fonction fléchée : recréée à chaque compilation pour que
                    // React re-rend le contenu (note perf de la doc MDX).
                    // Elle retransmet les composants pour que l'aperçu soit
                    // exactement le rendu que verra l'étudiant.
                    const Component =
                        mod.default as unknown as MdxContentComponent;

                    setState((s) => ({
                        // MDX recommande d'appeler le composant directement :
                        // evaluate crée une fonction nouvelle à chaque frappe.
                        Content: (props) => Component(props),
                        error: null,
                        compiling: false,
                        revision: s.revision + 1,
                    }));
                })
                .catch((err: unknown) => {
                    if (cancelled) {
                        return;
                    }
                    setState((s) => ({
                        Content: null,
                        error: err instanceof Error ? err.message : String(err),
                        compiling: false,
                        revision: s.revision + 1,
                    }));
                });
        }, delay);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [source, delay]);

    return state;
}
