import { Head, Link } from "@inertiajs/react";
import type { CSSProperties } from "react";
import { ArrowDown, ArrowRight, BookOpen, ChevronDown } from "lucide-react";

import { index as coursesIndex } from "@/routes/courses";

type Book = {
    number: string;
    title: string;
    subtitle: string;
    level: string;
    description: string;
    inside: string[];
    color: string;
    accent: string;
    pattern: "circle" | "lines" | "arch";
};

type Shelf = {
    id: string;
    number: string;
    title: string;
    introduction: string;
    books: Book[];
};

const shelves: Shelf[] = [
    {
        id: "premiers-pas",
        number: "01",
        title: "Pour les premiers pas",
        introduction:
            "Des ouvrages accessibles pour apprivoiser les sons, les mots et les phrases du quotidien.",
        books: [
            {
                number: "01",
                title: "Hallo, on commence !",
                subtitle: "Le livre des premiers mots",
                level: "A1",
                description:
                    "Un point de départ joyeux pour découvrir l'allemand sans se sentir perdu.",
                inside: [
                    "Les sons essentiels",
                    "Saluer et se présenter",
                    "Construire ses premières phrases",
                ],
                color: "#11664d",
                accent: "#8ee3b6",
                pattern: "circle",
            },
            {
                number: "02",
                title: "100 scènes du quotidien",
                subtitle: "Les mots dans leur contexte",
                level: "A1–A2",
                description:
                    "Des situations simples pour retenir le vocabulaire que l'on utilise vraiment.",
                inside: ["À la maison", "En ville", "Au café et au marché"],
                color: "#31527f",
                accent: "#a9d6ef",
                pattern: "lines",
            },
            {
                number: "03",
                title: "Mes phrases à moi",
                subtitle: "Un carnet pour s'exprimer",
                level: "A1–A2",
                description:
                    "De petites constructions utiles à adapter à sa propre vie, une page après l'autre.",
                inside: [
                    "Parler de soi",
                    "Poser des questions",
                    "Raconter sa journée",
                ],
                color: "#79534f",
                accent: "#f0c5aa",
                pattern: "arch",
            },
        ],
    },
    {
        id: "lire-comprendre",
        number: "02",
        title: "Pour lire et comprendre",
        introduction:
            "Des lectures guidées et des repères pour donner du sens aux phrases, au-delà de la traduction mot à mot.",
        books: [
            {
                number: "04",
                title: "Une phrase à la fois",
                subtitle: "Lire l'allemand avec confiance",
                level: "A2",
                description:
                    "Des textes courts annotés pour comprendre comment les idées s'assemblent.",
                inside: [
                    "Repérer l'idée principale",
                    "Suivre une histoire courte",
                    "Comprendre les mots en contexte",
                ],
                color: "#6b4d79",
                accent: "#dec8e9",
                pattern: "lines",
            },
            {
                number: "05",
                title: "La grammaire en chemin",
                subtitle: "Les règles à travers des exemples",
                level: "A2–B1",
                description:
                    "Un guide qui éclaire les structures de la langue au fil de phrases concrètes.",
                inside: [
                    "L'ordre des mots",
                    "Les verbes et les temps",
                    "Les cas sans panique",
                ],
                color: "#315f59",
                accent: "#b6e7d2",
                pattern: "arch",
            },
            {
                number: "06",
                title: "Histoires entre deux langues",
                subtitle: "Petites lectures allemand–français",
                level: "B1",
                description:
                    "Des récits brefs pour élargir son vocabulaire et garder le plaisir de lire.",
                inside: [
                    "Portraits et rencontres",
                    "Histoires de voyage",
                    "Notes de vocabulaire",
                ],
                color: "#8a5a39",
                accent: "#f7d6a0",
                pattern: "circle",
            },
        ],
    },
    {
        id: "parler-pratiquer",
        number: "03",
        title: "Pour parler et pratiquer",
        introduction:
            "Des compagnons de pratique pour essayer, reformuler et prendre progressivement la parole.",
        books: [
            {
                number: "07",
                title: "Ose la conversation",
                subtitle: "Des échanges pour se lancer",
                level: "A2–B1",
                description:
                    "Des dialogues et des amorces pour répondre plus spontanément.",
                inside: [
                    "Entrer dans un échange",
                    "Demander des précisions",
                    "Relancer la conversation",
                ],
                color: "#3b5871",
                accent: "#b8d5e5",
                pattern: "arch",
            },
            {
                number: "08",
                title: "Dire ce que je pense",
                subtitle: "Exprimer et nuancer ses idées",
                level: "B1–B2",
                description:
                    "Une boîte à outils pour expliquer son avis, argumenter et trouver ses mots.",
                inside: [
                    "Donner son opinion",
                    "Nuancer une réponse",
                    "Expliquer son raisonnement",
                ],
                color: "#71485e",
                accent: "#e9adc9",
                pattern: "circle",
            },
            {
                number: "09",
                title: "Le carnet des essais",
                subtitle: "Écrire, corriger, recommencer",
                level: "Tous niveaux",
                description:
                    "Un espace de travail pour transformer les erreurs en nouveaux réflexes.",
                inside: [
                    "Des défis courts",
                    "Des pages de révision",
                    "Un journal de progression",
                ],
                color: "#256856",
                accent: "#b4e3c0",
                pattern: "lines",
            },
        ],
    },
];

function BookCover({
    book,
    className = "",
}: {
    book: Book;
    className?: string;
}) {
    const style = {
        "--book-color": book.color,
        "--book-accent": book.accent,
    } as CSSProperties;

    return (
        <div
            style={style}
            className={`relative isolate flex aspect-[3/4] w-full flex-col justify-between overflow-hidden rounded-r-lg rounded-l-[3px] bg-[var(--book-color)] p-[11%] text-white shadow-[9px_12px_18px_-8px_rgba(0,0,0,.4)] ${className}`}
        >
            <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-2 border-r border-white/20 bg-black/20"
            />
            {book.pattern === "circle" && (
                <span
                    aria-hidden="true"
                    className="absolute -right-1/3 top-1/4 aspect-square w-full rounded-full border-[18px] border-[var(--book-accent)] opacity-70"
                />
            )}
            {book.pattern === "lines" && (
                <span
                    aria-hidden="true"
                    className="absolute -right-10 top-1/4 h-2/3 w-2/3 -rotate-25 border-x-[18px] border-[var(--book-accent)] opacity-65"
                />
            )}
            {book.pattern === "arch" && (
                <span
                    aria-hidden="true"
                    className="absolute -right-8 top-1/3 aspect-square w-[85%] rounded-t-full border-[18px] border-b-0 border-[var(--book-accent)] opacity-65"
                />
            )}
            <div className="relative">
                <p className="text-[9px] font-bold uppercase tracking-[.18em] sm:text-[10px]">
                    CharlesAcademy
                </p>
                <p className="mt-8 font-display text-[clamp(1rem,1.8vw,1.7rem)] font-semibold leading-[1.07] tracking-tight">
                    {book.title}
                </p>
                <p className="mt-2 text-[10px] leading-snug opacity-85 sm:text-xs">
                    {book.subtitle}
                </p>
            </div>
            <div className="relative flex items-end justify-between border-t border-white/35 pt-3 text-[10px] font-semibold">
                <span>{book.level}</span>
                <span className="font-display text-xl opacity-75">
                    {book.number}
                </span>
            </div>
        </div>
    );
}

export default function ResourcesPage() {
    const allBooks = shelves.flatMap((shelf) => shelf.books);

    return (
        <>
            <Head title="Bibliothèque — CharlesAcademy" />

            <section className="relative overflow-hidden bg-[#073e31] px-5 pb-0 pt-16 text-white sm:px-8 lg:pt-20">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-36 -top-48 size-[36rem] rounded-full border border-white/10"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-16 -top-28 size-[28rem] rounded-full border border-white/10"
                />
                <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(330px,.8fr)]">
                    <div className="pb-12 lg:pb-20">
                        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#b9e8ca]">
                            La bibliothèque CharlesAcademy
                        </p>
                        <h1 className="mt-7 max-w-4xl font-display text-[clamp(3.2rem,7vw,6.5rem)] font-semibold leading-[1.04] tracking-[-.04em] text-balance">
                            Une langue à{" "}
                            <span className="inline-block -rotate-2 rounded-2xl bg-[#b9e8ca] px-4 py-1 text-[#073e31] sm:px-6">
                                feuilleter.
                            </span>
                        </h1>
                        <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/75">
                            Des livres imaginés pour accompagner chaque étape de
                            ton allemand. Choisis le rayon qui te ressemble et
                            découvre ce qu'il y a à lire, à comprendre et à
                            essayer.
                        </p>
                        <a
                            href="#rayons"
                            className="mt-9 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 font-semibold text-[#073e31] transition-colors hover:bg-[#b9e8ca]"
                        >
                            Parcourir les rayons{" "}
                            <ArrowDown className="size-4" aria-hidden="true" />
                        </a>
                    </div>
                    <div
                        aria-hidden="true"
                        className="relative flex h-72 items-end justify-center gap-2 sm:h-80 lg:h-[420px]"
                    >
                        <div className="w-28 -rotate-8 translate-y-4 sm:w-36 lg:w-40">
                            <BookCover book={allBooks[3]} />
                        </div>
                        <div className="z-10 w-32 rotate-3 sm:w-40 lg:w-44">
                            <BookCover book={allBooks[0]} />
                        </div>
                        <div className="w-28 rotate-9 translate-y-6 sm:w-36 lg:w-40">
                            <BookCover book={allBooks[6]} />
                        </div>
                        <span className="absolute bottom-0 left-0 h-3 w-full rounded-t-sm bg-[#b9e8ca]" />
                    </div>
                </div>
            </section>

            <div
                id="rayons"
                className="border-b border-border px-5 py-5 sm:px-8"
            >
                <nav
                    aria-label="Rayons de la bibliothèque"
                    className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3"
                >
                    <span className="text-xs font-bold uppercase tracking-[.18em] text-primary">
                        Choisir un rayon
                    </span>
                    {shelves.map((shelf) => (
                        <a
                            key={shelf.id}
                            href={`#${shelf.id}`}
                            className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-primary"
                        >
                            <span className="text-primary">{shelf.number}</span>
                            {shelf.title}
                        </a>
                    ))}
                </nav>
            </div>

            {shelves.map((shelf) => (
                <section
                    key={shelf.id}
                    id={shelf.id}
                    aria-labelledby={`${shelf.id}-heading`}
                    className="scroll-mt-20 border-b border-border px-5 py-16 sm:px-8 lg:py-20"
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">
                                    Rayon {shelf.number} / 03
                                </p>
                                <h2
                                    id={`${shelf.id}-heading`}
                                    className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl"
                                >
                                    {shelf.title}
                                </h2>
                            </div>
                            <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                                {shelf.introduction}
                            </p>
                        </div>
                        <div className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
                            {shelf.books.map((book) => (
                                <article key={book.number} className="min-w-0">
                                    <div className="flex h-64 items-end justify-center border-b-[10px] border-primary/15 bg-gradient-to-b from-transparent to-primary/5 px-5 pt-6 sm:h-72">
                                        <BookCover
                                            book={book}
                                            className="max-w-[160px] translate-y-[10px] transition-transform duration-300 hover:-translate-y-1 sm:max-w-[180px]"
                                        />
                                    </div>
                                    <div className="pt-7">
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-primary">
                                            <BookOpen
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                            {book.level}
                                        </div>
                                        <h3 className="mt-3 font-display text-2xl font-semibold leading-tight">
                                            {book.title}
                                        </h3>
                                        <p className="mt-1 text-sm font-medium text-foreground/80">
                                            {book.subtitle}
                                        </p>
                                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                            {book.description}
                                        </p>
                                        <details className="group mt-5 border-t border-border pt-4">
                                            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-primary [&::-webkit-details-marker]:hidden">
                                                Découvrir le contenu{" "}
                                                <ChevronDown
                                                    className="size-4 transition-transform group-open:rotate-180"
                                                    aria-hidden="true"
                                                />
                                            </summary>
                                            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                                                {book.inside.map((chapter) => (
                                                    <li
                                                        key={chapter}
                                                        className="flex items-start gap-2"
                                                    >
                                                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                                                        {chapter}
                                                    </li>
                                                ))}
                                            </ul>
                                        </details>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            ))}

            <section className="px-5 py-12 sm:px-8">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5">
                    <div>
                        <p className="font-display text-xl font-semibold">
                            Continue l'histoire avec une formation.
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Les livres donnent des idées ; les leçons t'aident à
                            les mettre en pratique.
                        </p>
                    </div>
                    <Link
                        href={coursesIndex()}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                    >
                        Explorer le contenu des formations{" "}
                        <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                </div>
                <p className="mx-auto mt-8 max-w-7xl border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
                    Cette bibliothèque présente des projets d'ouvrages
                    CharlesAcademy. Ils ne sont pas encore publiés ou proposés
                    au téléchargement.
                </p>
            </section>
        </>
    );
}
