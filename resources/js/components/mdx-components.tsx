import { Info, Lightbulb, TriangleAlert } from 'lucide-react';
import type {
    ComponentPropsWithoutRef,
    ComponentType,
    ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

type LetterGridProps = {
    /** Chaîne ou liste de lettres — par défaut les 26 lettres. */
    letters?: string | string[];
    className?: string;
};

/**
 * Les lettres de la leçon en petits carreaux (l'ancien rendu structuré de la
 * leçon alphabet), utilisable directement dans le MDX : `<LetterGrid />`.
 */
export function LetterGrid({ letters = ALPHABET, className }: LetterGridProps) {
    const items =
        typeof letters === 'string'
            ? letters.replace(/\s+/g, '').split('')
            : letters;

    return (
        <div
            className={cn(
                'mdx-letters grid grid-cols-7 gap-2 sm:grid-cols-[repeat(13,minmax(0,1fr))]',
                className,
            )}
        >
            {items.map((letter, index) => (
                <span
                    key={`${letter}-${index}`}
                    className="flex aspect-square items-center justify-center rounded-xl border border-border bg-card font-display text-2xl font-semibold"
                >
                    {letter}
                </span>
            ))}
        </div>
    );
}

type CalloutTone = 'tip' | 'info' | 'warn';

type CalloutProps = {
    tone?: CalloutTone;
    children?: ReactNode;
};

const CALLOUT_TONES: Record<
    CalloutTone,
    { className: string; iconClassName: string; icon: ComponentType<{ className?: string }> }
> = {
    tip: {
        className: 'border-primary/30 bg-primary/5',
        iconClassName: 'text-primary',
        icon: Lightbulb,
    },
    info: {
        className: 'border-info/30 bg-info/10',
        iconClassName: 'text-info',
        icon: Info,
    },
    warn: {
        className: 'border-warning/40 bg-warning/15',
        iconClassName: 'text-warning',
        icon: TriangleAlert,
    },
};

/** Encadré de leçon : `<Callout tone="tip">…</Callout>` (docs/mdx-lessons.md). */
export function Callout({ tone = 'tip', children }: CalloutProps) {
    const { className, iconClassName, icon: Icon } =
        CALLOUT_TONES[tone] ?? CALLOUT_TONES.tip;

    return (
        <aside
            role="note"
            className={cn(
                'flex items-start gap-3 rounded-xl border p-4',
                className,
            )}
        >
            <Icon
                className={cn('mt-0.5 size-5 shrink-0', iconClassName)}
                aria-hidden="true"
            />
            <div className="min-w-0 space-y-2 text-sm leading-relaxed">
                {children}
            </div>
        </aside>
    );
}

/**
 * Tableaux (extension GFM via remark-gfm) : conteneur scrollable + style
 * cohérent avec le design system, pilotable par l'auteur via className.
 */
function MdxTable({ className, ...props }: ComponentPropsWithoutRef<'table'>) {
    return (
        <div className="my-6 overflow-x-auto">
            <table
                className={cn('w-full border-collapse text-sm', className)}
                {...props}
            />
        </div>
    );
}

function MdxTableRow({ className, ...props }: ComponentPropsWithoutRef<'tr'>) {
    return (
        <tr className={cn('even:bg-muted/40', className)} {...props} />
    );
}

function MdxTableHeader({
    className,
    ...props
}: ComponentPropsWithoutRef<'th'>) {
    return (
        <th
            className={cn(
                'border border-border bg-muted/60 px-3 py-2 text-left font-semibold',
                className,
            )}
            {...props}
        />
    );
}

function MdxTableCell({ className, ...props }: ComponentPropsWithoutRef<'td'>) {
    return (
        <td
            className={cn(
                'border border-border px-3 py-2 align-top',
                className,
            )}
            {...props}
        />
    );
}

/**
 * Composants exposés au MDX : leçon étudiant, aperçu de l'éditeur admin et
 * extraction du texte lu à voix haute doivent tous les recevoir, sinon MDX
 * lève « Expected component … to be defined » au rendu.
 */
export const mdxComponents = {
    Callout,
    LetterGrid,
    table: MdxTable,
    tr: MdxTableRow,
    th: MdxTableHeader,
    td: MdxTableCell,
};
