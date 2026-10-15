type LessonNode = {
    type: string;
    name?: string | null;
    value?: string;
    url?: string;
    attributes?: Array<{
        type: string;
        name?: string;
        value?: string | null | { type: string };
    }>;
    children?: LessonNode[];
};

const allowedComponents: Record<string, readonly string[]> = {
    Callout: ['tone'],
    LetterGrid: ['letters'],
};

function safeUrl(url: string): boolean {
    const normalized = Array.from(url.trim())
        .filter((character) => (character.codePointAt(0) ?? 0) > 32)
        .join('');

    if (normalized.startsWith('//')) {
        return false;
    }

    const scheme = /^([a-z][a-z\d+.-]*):/i.exec(normalized)?.[1]?.toLowerCase();

    return !scheme || ['https', 'http', 'mailto'].includes(scheme);
}

function verifyNode(node: LessonNode): void {
    if (
        ['mdxFlowExpression', 'mdxTextExpression', 'mdxjsEsm', 'html'].includes(
            node.type,
        )
    ) {
        throw new Error(
            'Les expressions JavaScript et le HTML ne sont pas autorisés dans une leçon.',
        );
    }

    if (
        node.type === 'mdxJsxFlowElement' ||
        node.type === 'mdxJsxTextElement'
    ) {
        const allowedAttributes = node.name
            ? allowedComponents[node.name]
            : undefined;

        if (!allowedAttributes) {
            throw new Error('Ce composant n’est pas autorisé dans une leçon.');
        }

        for (const attribute of node.attributes ?? []) {
            if (
                attribute.type !== 'mdxJsxAttribute' ||
                !attribute.name ||
                !allowedAttributes.includes(attribute.name) ||
                (attribute.value !== null &&
                    typeof attribute.value !== 'string')
            ) {
                throw new Error('Cet attribut MDX n’est pas autorisé.');
            }

            if (
                attribute.name === 'tone' &&
                !['tip', 'info', 'warn'].includes(attribute.value ?? '')
            ) {
                throw new Error('Ce ton de composant n’est pas autorisé.');
            }
        }
    }

    if (
        (node.type === 'link' ||
            node.type === 'image' ||
            node.type === 'definition') &&
        node.url &&
        !safeUrl(node.url)
    ) {
        throw new Error('Cette adresse de lien n’est pas autorisée.');
    }

    for (const child of node.children ?? []) {
        verifyNode(child);
    }
}

/** Vérifie l'AST avant toute compilation et exécution MDX. */
export function safeLessonMdx() {
    return (tree: LessonNode): void => verifyNode(tree);
}
