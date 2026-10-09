import { useState } from "react";
import {
    ArrowRight,
    BookOpen,
    Check,
    ChevronDown,
    GraduationCap,
    HeartHandshake,
    Lightbulb,
    Users,
} from "lucide-react";

type Commitment = {
    number: string;
    title: string;
    description: string;
    icon: typeof BookOpen;
};

const commitments: Commitment[] = [
    {
        number: "01",
        title: "Comprendre avant de mémoriser",
        description:
            "Découvrir une notion, comprendre sa logique, puis la retrouver dans des exemples concrets plutôt que simplement apprendre une règle par cœur.",
        icon: Lightbulb,
    },
    {
        number: "02",
        title: "Apprendre en pratiquant",
        description:
            "Passer de l'explication à l'application avec des exercices et des situations qui donnent du sens aux connaissances acquises.",
        icon: BookOpen,
    },
    {
        number: "03",
        title: "Avancer progressivement",
        description:
            "Construire les acquis étape par étape, avec des objectifs compréhensibles et une difficulté adaptée à chaque parcours.",
        icon: GraduationCap,
    },
];

// Renseigner uniquement des personnes réelles,
// après validation de leur rôle et de leur accord.
type TeamMember = {
    name: string;
    role: string;
    bio: string;
    image?: string;
};

const team: TeamMember[] = [];

// Ajouter uniquement des avis authentiques, vérifiables,
// publiés avec l'autorisation des personnes concernées.
type Testimonial = {
    quote: string;
    author: string;
    context?: string;
};

const testimonials: Testimonial[] = [];

export default function TrustSection() {
    const [expanded, setExpanded] = useState<number | null>(0);

    return (
        <section
            id="confiance"
            aria-labelledby="trust-heading"
            className="relative overflow-hidden border-t border-border  px-5 py-16 sm:px-8 lg:py-24"
        >
            <div className="mx-auto max-w-7xl">
                {/* ================================
                    CENTERED SECTION HEADER
                   ================================ */}

                <div className="mx-auto max-w-5xl text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">
                        Notre engagement pédagogique
                    </p>

                    <h2
                        id="trust-heading"
                        className="mt-6 font-display text-5xl leading-[1.1] font-semibold tracking-tight text-balance text-foreground sm:text-6xl lg:text-7xl"
                    >
                        Apprendre avec méthode.{" "}
                        <span className="inline-block -rotate-2 rounded-xl bg-primary px-3 py-1 text-primary-foreground shadow-lg shadow-primary/15">
                            Progresser avec confiance.
                        </span>
                    </h2>

                    <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                        Une approche pensée pour rendre les notions plus
                        claires, encourager la pratique et accompagner chaque
                        étape de l'apprentissage.
                    </p>
                </div>

                {/* ================================
                    EDITORIAL COMPOSITION
                   ================================ */}

                <div className="mt-14 grid items-start gap-10 border-t border-border pt-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
                    {/* LEFT — MANIFESTO */}

                    <div className="lg:sticky lg:top-24">
                        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                            <HeartHandshake className="size-4" />
                            Notre philosophie
                        </div>

                        <p className="mt-6 max-w-lg font-display text-3xl font-semibold leading-[1.25] tracking-tight text-foreground sm:text-4xl">
                            L'allemand ne devrait pas être une suite de règles
                            difficiles à retenir.
                        </p>

                        <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
                            Notre démarche consiste à relier les explications
                            aux exemples et à la pratique, pour aider chacun à
                            comprendre ce qu'il apprend.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                            <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                                <Check className="size-4 text-primary" />
                                Clarté
                            </span>

                            <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                                <Check className="size-4 text-primary" />
                                Pratique
                            </span>

                            <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                                <Check className="size-4 text-primary" />
                                Progressivité
                            </span>
                        </div>
                    </div>

                    {/* RIGHT — EXPANDABLE COMMITMENTS */}

                    <div className="border-t border-border lg:border-t-0">
                        {commitments.map((item, index) => {
                            const Icon = item.icon;
                            const isExpanded = expanded === index;

                            return (
                                <div
                                    key={item.number}
                                    className="border-b border-border"
                                >
                                    <button
                                        type="button"
                                        aria-expanded={isExpanded}
                                        aria-controls={`commitment-${index}`}
                                        onClick={() =>
                                            setExpanded(
                                                isExpanded ? null : index,
                                            )
                                        }
                                        className="group flex w-full items-center gap-4 py-6 text-left sm:gap-6"
                                    >
                                        <span className="font-display text-sm font-semibold text-primary">
                                            {item.number}
                                        </span>

                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <Icon className="size-5" />
                                        </span>

                                        <span className="min-w-0 flex-1 font-display text-xl font-semibold text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                                            {item.title}
                                        </span>

                                        <ChevronDown
                                            className={`size-5 shrink-0 text-muted-foreground transition-transform duration-300 ${
                                                isExpanded
                                                    ? "rotate-180 text-primary"
                                                    : ""
                                            }`}
                                        />
                                    </button>

                                    {isExpanded && (
                                        <div
                                            id={`commitment-${index}`}
                                            className="pb-6 pl-10 sm:pl-[6.5rem]"
                                        >
                                            <p className="max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
                                                {item.description}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ================================
                    REAL TEAM — CONDITIONAL
                   ================================ */}

                {team.length > 0 && (
                    <div className="mt-16 border-t border-border pt-10">
                        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                                    L'équipe pédagogique
                                </p>

                                <h3 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
                                    Les personnes derrière l'apprentissage.
                                </h3>
                            </div>

                            <Users className="size-7 text-primary" />
                        </div>

                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {team.map((member) => (
                                <article
                                    key={member.name}
                                    className="border-t border-border pt-5"
                                >
                                    {member.image && (
                                        <img
                                            src={member.image}
                                            alt={`Portrait de ${member.name}`}
                                            loading="lazy"
                                            className="mb-5 aspect-[4/3] w-full rounded-xl object-cover"
                                        />
                                    )}

                                    <h4 className="font-display text-xl font-semibold text-foreground">
                                        {member.name}
                                    </h4>

                                    <p className="mt-1 text-sm font-medium text-primary">
                                        {member.role}
                                    </p>

                                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                        {member.bio}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </div>
                )}

                {/* ================================
                    REAL TESTIMONIALS — CONDITIONAL
                   ================================ */}

                {testimonials.length > 0 && (
                    <div className="mt-14 border-t border-border pt-10">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                            Témoignages d'apprenants
                        </p>

                        <div className="mt-7 grid gap-8 md:grid-cols-2">
                            {testimonials.map((item, index) => (
                                <blockquote
                                    key={`${item.author}-${index}`}
                                    className="border-l-[3px] border-primary pl-5"
                                >
                                    <p className="font-display text-xl leading-relaxed font-medium text-foreground">
                                        « {item.quote} »
                                    </p>

                                    <footer className="mt-4 text-sm text-muted-foreground">
                                        <span className="font-semibold text-foreground">
                                            {item.author}
                                        </span>
                                        {item.context && (
                                            <span> — {item.context}</span>
                                        )}
                                    </footer>
                                </blockquote>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
