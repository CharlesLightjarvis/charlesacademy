import { evaluate } from '@mdx-js/mdx';
import remarkGfm from 'remark-gfm';
import * as runtime from 'react/jsx-runtime';
import { safeLessonMdx } from './safe-lesson-mdx';

/**
 * Ancienne leçon Alphabet : remplace uniquement sa grille JSX historique par
 * le composant intégré. Le reste du contenu passe toujours par le filtre MDX.
 */
export function normalizeLegacyAlphabet(source: string): string {
    return source.replace(
        /<style>\{`[\s\S]*?`}<\/style>\s*<div className="alphabet-grid not-prose">[\s\S]*?<\/div>\s*(?=## Les caractères particuliers)/g,
        (legacyGrid) =>
            legacyGrid.includes('["A", "a"]') &&
            legacyGrid.includes('["ß", "ès-tsèt"]') &&
            legacyGrid.includes('.map(([letter, name]) =>')
                ? '<LetterGrid />\n\n'
                : legacyGrid,
    );
}

export function compileLessonMdx(source: string) {
    return evaluate(normalizeLegacyAlphabet(source), {
        ...runtime,
        remarkPlugins: [remarkGfm, safeLessonMdx],
    });
}
