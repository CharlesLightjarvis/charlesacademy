import { useState } from "react";
import { ArrowRight, Check, ChevronLeft, ChevronRight } from "lucide-react";

/* =========================================================
   CHARLESACADEMY — LEARNING PATHS
   Interactive CEFR Level Journey
   React + Tailwind CSS v4 + shadcn/ui tokens
   ========================================================= */

const levels = [
    {
        code: "A1",
        name: "Découverte",
        audience: "Je pars de zéro.",
        headline: "Tout commence ici.",
        description:
            "Découvre tes premiers mots et apprends à construire des phrases simples.",
        example: "Ich heiße Marie.",
        translation: "Je m'appelle Marie.",
        objective: "Faire ses premiers pas en allemand.",
        skills: [
            "Se présenter",
            "Saluer",
            "Poser des questions",
            "Parler de son quotidien",
        ],
    },
    {
        code: "A2",
        name: "Fondations",
        audience: "Je connais les bases.",
        headline: "Prends confiance.",
        description:
            "Développe ton vocabulaire et gagne en autonomie dans les situations familières.",
        example: "Gestern war ich im Kino.",
        translation: "Hier, j'étais au cinéma.",
        objective: "Gagner en autonomie au quotidien.",
        skills: ["Décrire", "Raconter", "Échanger", "Exprimer ses besoins"],
    },
    {
        code: "B1",
        name: "Autonomie",
        audience: "Je veux aller plus loin.",
        headline: "Exprime tes idées.",
        description:
            "Apprends à structurer tes phrases, expliquer tes opinions et raconter tes expériences.",
        example: "Ich denke, dass Deutsch wichtig ist.",
        translation: "Je pense que l'allemand est important.",
        objective: "Communiquer avec davantage d'aisance.",
        skills: [
            "Exprimer son opinion",
            "Expliquer",
            "Argumenter simplement",
            "Raconter une expérience",
        ],
    },
    {
        code: "B2",
        name: "Approfondissement",
        audience: "Je veux me perfectionner.",
        headline: "Va plus loin.",
        description:
            "Développe ta précision pour comprendre et exprimer des idées plus complexes.",
        example: "Obwohl es schwierig ist, macht das Lernen Spaß.",
        translation: "Même si c'est difficile, apprendre est agréable.",
        objective: "S'exprimer avec davantage de précision et de nuance.",
        skills: [
            "Nuancer",
            "Débattre",
            "Approfondir",
            "Défendre un point de vue",
        ],
    },
] as const;

export default function LearningPaths() {
    const [active, setActive] = useState(0);

    const current = levels[active];

    function changeLevel(index: number) {
        setActive(Math.max(0, Math.min(index, levels.length - 1)));
    }

    function nextLevel() {
        setActive((previous) => (previous + 1) % levels.length);
    }

    function previousLevel() {
        setActive((previous) => Math.max(0, previous - 1));
    }

    return (
        <section
            id="parcours"
            aria-labelledby="paths-heading"
            className="relative overflow-hidden border-t border-border  px-5 py-14 sm:px-8 lg:py-20"
        >
            <div className="mx-auto max-w-7xl">
                {/* =================================================
                    01 — CENTERED EDITORIAL HEADER
                   ================================================= */}

                <div className="mx-auto max-w-5xl text-center">
                    <h2
                        id="paths-heading"
                        className="mt-6 font-display text-5xl font-semibold leading-[1.1] tracking-tight text-balance text-foreground sm:text-6xl lg:text-7xl"
                    >
                        Même pratique.{" "}
                        <span className="inline-block -rotate-2 rounded-xl bg-primary px-3 py-1 text-primary-foreground shadow-lg shadow-primary/15">
                            À ton niveau.
                        </span>
                    </h2>

                    <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                        Du A1 au B2, tu pratiques la grammaire, le vocabulaire
                        et l'expression orale avec des activités qui évoluent
                        avec toi.
                    </p>
                </div>

                {/* =================================================
                    02 — INTERACTIVE LEVEL TIMELINE
                   ================================================= */}

                <div
                    role="group"
                    aria-label="Explorer les niveaux d'allemand"
                    className="relative mx-auto mt-12 max-w-5xl sm:mt-14"
                >
                    {/* Timeline background */}

                    <div
                        aria-hidden="true"
                        className="absolute left-[12.5%] right-[12.5%] top-7 h-1 rounded-full bg-border sm:top-9"
                    />

                    {/* Timeline active progress */}

                    <div
                        aria-hidden="true"
                        className="absolute left-[12.5%] top-7 h-1 rounded-full bg-primary transition-[width] duration-500 ease-out motion-reduce:transition-none sm:top-9"
                        style={{
                            width: `${(active / (levels.length - 1)) * 75}%`,
                        }}
                    />

                    {/* Level nodes */}

                    <div className="relative grid grid-cols-4 gap-2">
                        {levels.map((level, index) => {
                            const isActive = active === index;
                            const isPassed = index < active;

                            return (
                                <button
                                    key={level.code}
                                    type="button"
                                    aria-pressed={isActive}
                                    onClick={() => changeLevel(index)}
                                    className="group flex min-w-0 flex-col items-center text-center"
                                >
                                    {/* Circular level */}

                                    <span
                                        className={`relative z-10 flex size-14 items-center justify-center rounded-full border-[3px] font-display text-lg font-semibold transition-all duration-300 sm:size-[4.5rem] sm:text-2xl ${
                                            isActive
                                                ? "scale-110 border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                                : isPassed
                                                  ? "border-primary bg-background text-primary"
                                                  : "border-border bg-background text-muted-foreground group-hover:border-primary group-hover:text-primary"
                                        }`}
                                    >
                                        {isPassed ? (
                                            <Check
                                                className="size-6"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            level.code
                                        )}
                                    </span>

                                    {/* Level name */}

                                    <span
                                        className={`mt-4 font-display text-sm font-semibold transition-colors duration-300 sm:text-xl ${
                                            isActive
                                                ? "text-primary"
                                                : "text-foreground group-hover:text-primary"
                                        }`}
                                    >
                                        {level.name}
                                    </span>

                                    {/* Audience */}

                                    <span className="mt-1 hidden max-w-36 text-xs leading-relaxed text-muted-foreground sm:block">
                                        {level.audience}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* =================================================
                    03 — LANGUAGE SHOWCASE
                   ================================================= */}

                <div className="relative mx-auto mt-2 max-w-6xl border-y border-border py-8 text-center sm:mt-14 sm:py-12">
                    {/* Language specimen */}

                    <div key={current.code} className="mx-auto  max-w-5xl">
                        <h3
                            lang="de"
                            className="mt-5 font-display text-[clamp(2.25rem,5vw,4.75rem)] font-semibold leading-[1.15] tracking-tight text-balance text-foreground"
                        >
                            {current.example}
                        </h3>

                        <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-primary sm:text-xl">
                            {current.translation}
                        </p>
                    </div>

                    {/* Objective */}

                    <div className="mx-auto mt-8 max-w-2xl">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                            L'objectif de ce niveau
                        </p>

                        <p className="mt-3 font-display text-xl font-medium leading-relaxed text-foreground sm:text-2xl">
                            {current.objective}
                        </p>
                    </div>

                    {/* Skills */}

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-border pt-6">
                        {current.skills.map((skill) => (
                            <span
                                key={skill}
                                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground"
                            >
                                <Check
                                    className="size-4 shrink-0 text-primary"
                                    aria-hidden="true"
                                />

                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
