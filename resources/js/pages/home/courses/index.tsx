import { Head, Link } from "@inertiajs/react";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import {
    ArrowDown,
    ArrowRight,
    Check,
    Compass,
    MoveUpRight,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { placementTest } from "@/routes/courses";
import { courses, type Level } from "./catalog";

const levelGuide: Record<
    Level,
    {
        forWhom: string;
        headline: string;
        introduction: string;
        skills: string[];
    }
> = {
    A1: {
        forWhom: "Je pars de zéro",
        headline: "Faire ses premiers pas.",
        introduction:
            "Tu découvres les sons de la langue et les phrases qui servent dès les premières rencontres.",
        skills: [
            "Reconnaître et prononcer les sons essentiels",
            "Saluer et se présenter",
            "Poser des questions simples",
            "Parler de soi et de son quotidien",
        ],
    },
    A2: {
        forWhom: "Je connais les bases",
        headline: "Gagner en autonomie.",
        introduction:
            "Tu relies tes idées, racontes ce que tu as vécu et t'exprimes dans des situations familières.",
        skills: [
            "Raconter une expérience passée",
            "Expliquer une raison",
            "Construire des phrases plus longues",
        ],
    },
    B1: {
        forWhom: "Je veux m'exprimer",
        headline: "Trouver sa voix.",
        introduction:
            "Tu organises tes idées pour partager ton avis et parler de possibilités avec plus d'aisance.",
        skills: [
            "Exprimer et justifier son opinion",
            "Formuler des hypothèses",
            "Développer une réponse personnelle",
        ],
    },
    B2: {
        forWhom: "Je veux approfondir",
        headline: "Aller au bout de ses idées.",
        introduction:
            "Tu affines ta compréhension et apprends à défendre un point de vue avec précision.",
        skills: [
            "Argumenter avec nuance",
            "Comparer plusieurs points de vue",
            "Analyser et synthétiser des documents",
        ],
    },
};

export default function CoursesPage() {
    const [selectedLevel, setSelectedLevel] = useState<Level>("A1");
    const shouldReduceMotion = useReducedMotion();
    const course = courses.find((item) => item.level === selectedLevel)!;
    const guide = levelGuide[selectedLevel];
    const lessonCount = course.modules.reduce(
        (total, module) => total + module.lessons.length,
        0,
    );

    return (
        <>
            <Head title="Formations — CharlesAcademy" />

            <section className="border-b border-border  px-5 py-14  sm:px-8 lg:py-20">
                <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center lg:gap-10 xl:grid-cols-[minmax(0,1fr)_490px] xl:gap-16">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">
                            Formations d'allemand
                        </p>
                        <h1 className="mt-6 max-w-4xl font-display text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-[1.04] tracking-[-.045em] text-balance">
                            Apprendre, en partant de{" "}
                            <span className="inline-block max-w-full -rotate-2 rounded-2xl bg-primary px-4 py-1 text-[.88em] text-primary-foreground shadow-lg shadow-primary/15 sm:px-6 sm:text-[1em]">
                                là où tu es.
                            </span>
                        </h1>
                        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                            Quatre niveaux pour construire ton allemand pas à
                            pas. Repère ton point de départ et vois concrètement
                            ce que chaque parcours t'aidera à faire.
                        </p>
                        <a
                            href="#parcours"
                            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            Voir les parcours
                            <ArrowDown className="size-4" aria-hidden="true" />
                        </a>
                    </div>

                    <div className="w-full max-w-sm -rotate-6 justify-self-center lg:max-w-none lg:-rotate-12 lg:justify-self-end xl:-rotate-[24deg]">
                        <motion.div
                            animate={shouldReduceMotion ? { y: 0 } : { y: [0, -12, 0] }}
                            transition={{ duration: 5.5, ease: "easeInOut", repeat: Infinity }}
                        >
                            <Card variant="floating" className="gap-0 p-7 lg:p-8 xl:p-10">
                                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                                    <Compass className="size-5" aria-hidden="true" />
                                    Ton point de départ
                                </p>
                                <h2 className="mt-7 font-display text-3xl font-semibold leading-tight xl:text-4xl">
                                    Tu ne sais pas par où commencer ?
                                </h2>
                                <p className="mt-5 text-sm leading-relaxed text-muted-foreground xl:text-base">
                                    Quelques questions peuvent t'aider à trouver le niveau qui te correspond.
                                </p>
                                <Link
                                    href={placementTest()}
                                    className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline xl:text-base"
                                >
                                    Faire le test de niveau
                                    <MoveUpRight className="size-5" aria-hidden="true" />
                                </Link>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section
                id="parcours"
                aria-labelledby="path-heading"
                className="scroll-mt-16 px-5 py-12 sm:px-8 lg:py-16"
            >
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">
                                Choisir son parcours
                            </p>
                            <h2
                                id="path-heading"
                                className="mt-3 font-display text-3xl font-semibold sm:text-4xl"
                            >
                                Quel est ton prochain pas ?
                            </h2>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Sélectionne un niveau pour voir le programme.
                        </p>
                    </div>

                    <div
                        role="group"
                        aria-label="Niveaux de formation"
                        className="mt-9 grid grid-cols-2 border-y border-border lg:grid-cols-4"
                    >
                        {courses.map((item, index) => (
                            <button
                                key={item.level}
                                type="button"
                                aria-pressed={selectedLevel === item.level}
                                onClick={() => setSelectedLevel(item.level)}
                                className={cn(
                                    "group relative min-w-0 border-b border-border px-4 py-5 text-left transition-colors hover:bg-primary/5 lg:border-b-0 lg:border-r lg:px-6 lg:last:border-r-0",
                                    selectedLevel === item.level &&
                                        "bg-primary/5",
                                )}
                            >
                                <span className="flex items-start justify-between gap-2">
                                    <span
                                        className={cn(
                                            "font-display text-5xl font-semibold leading-none sm:text-6xl",
                                            selectedLevel === item.level
                                                ? "text-primary"
                                                : "text-foreground group-hover:text-primary",
                                        )}
                                    >
                                        {item.level}
                                    </span>
                                    <span className="pt-1 text-xs font-semibold text-muted-foreground">
                                        0{index + 1}
                                    </span>
                                </span>
                                <span className="mt-4 block font-semibold">
                                    {item.label}
                                </span>
                                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                                    {levelGuide[item.level].forWhom}
                                </span>
                                {selectedLevel === item.level && (
                                    <span
                                        aria-hidden="true"
                                        className="absolute inset-x-0 bottom-0 h-1 bg-primary"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="mt-11 grid gap-10 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] lg:gap-20">
                        <div>
                            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-primary">
                                Niveau {selectedLevel}
                                <span className="size-1 rounded-full bg-primary" />
                                {guide.forWhom}
                            </span>
                            <h3 className="mt-5 max-w-lg font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                                {guide.headline}
                            </h3>
                            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
                                {guide.introduction}
                            </p>

                            <div className="mt-9 border-t border-border pt-6">
                                <h4 className="font-display text-xl font-semibold">
                                    Ce que tu pourras faire
                                </h4>
                                <ul className="mt-5 space-y-3">
                                    {guide.skills.map((skill) => (
                                        <li
                                            key={skill}
                                            className="flex items-start gap-3 text-sm leading-relaxed"
                                        >
                                            <Check
                                                className="mt-0.5 size-4 shrink-0 text-primary"
                                                aria-hidden="true"
                                            />
                                            {skill}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="border-t-2 border-primary pt-6">
                            <div className="flex flex-wrap items-baseline justify-between gap-3">
                                <h4 className="font-display text-2xl font-semibold">
                                    Au programme
                                </h4>
                                <span className="text-xs text-muted-foreground">
                                    {course.modules.length}{" "}
                                    {course.modules.length === 1
                                        ? "module"
                                        : "modules"}{" "}
                                    · {lessonCount}{" "}
                                    {lessonCount === 1 ? "leçon" : "leçons"}
                                </span>
                            </div>

                            <ol className="mt-5">
                                {course.modules.map((module, moduleIndex) => (
                                    <li
                                        key={module.id}
                                        className="grid gap-3 border-t border-border py-5 sm:grid-cols-[2.5rem_minmax(0,1fr)]"
                                    >
                                        <span className="font-display text-lg font-semibold text-primary">
                                            {String(moduleIndex + 1).padStart(
                                                2,
                                                "0",
                                            )}
                                        </span>
                                        <div>
                                            <h5 className="font-display text-xl font-semibold leading-snug">
                                                {module.title}
                                            </h5>
                                            <ul className="mt-3 space-y-2">
                                                {module.lessons.map(
                                                    (lesson) => (
                                                        <li
                                                            key={lesson.id}
                                                            className="flex items-start justify-between gap-4 text-sm leading-relaxed text-muted-foreground"
                                                        >
                                                            <span>
                                                                {lesson.title}
                                                            </span>
                                                            <span className="hidden shrink-0 text-xs sm:inline">
                                                                {
                                                                    lesson.category
                                                                }
                                                            </span>
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                            <p className="border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
                                Aperçu du contenu pédagogique de ce niveau.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
