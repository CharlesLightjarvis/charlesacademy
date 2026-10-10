import { Head, Link } from "@inertiajs/react";
import { useState } from "react";
import type { ReactNode } from "react";
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    CheckCircle2,
    Compass,
    RotateCcw,
    Target,
} from "lucide-react";

import HomeLayout from "@/layouts/home/home-layout";

const answers = [
    { label: "Der", correct: true },
    { label: "Die", correct: false },
    { label: "Das", correct: false },
];

const steps = [
    {
        number: "01",
        title: "Compréhension",
        description:
            "Identifier les mots, les expressions et les phrases que tu comprends.",
        icon: BookOpen,
    },
    {
        number: "02",
        title: "Connaissances",
        description:
            "Observer ta maîtrise du vocabulaire et des structures grammaticales.",
        icon: Target,
    },
    {
        number: "03",
        title: "Orientation",
        description:
            "Utiliser ces observations pour choisir un point de départ adapté.",
        icon: Compass,
    },
];

export default function PlacementTestPage() {
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

    const isCorrect =
        selectedAnswer !== null && answers[selectedAnswer].correct;

    return (
        <>
            <Head title="Test de niveau — CharlesAcademy" />

            <main className="min-h-screen bg-background text-foreground">
                {/* HERO */}

                <section className="px-5 pb-12 pt-8 sm:px-8 lg:pb-16">
                    <div className="mx-auto max-w-6xl">
                        <Link
                            href="/courses"
                            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
                        >
                            <ArrowLeft className="size-4" />
                            Retour aux formations
                        </Link>

                        <div className="mx-auto mt-12 max-w-5xl text-center">
                            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">
                                Le point de départ
                            </p>

                            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.1] tracking-tight text-balance sm:text-6xl lg:text-7xl">
                                Tu en es où{" "}
                                <span className="inline-block -rotate-2 rounded-xl bg-primary px-3 py-1 text-primary-foreground shadow-lg shadow-primary/15">
                                    en allemand ?
                                </span>
                            </h1>

                            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                                Découvre le principe d'un exercice de
                                positionnement et explore les compétences utiles
                                pour choisir ton parcours.
                            </p>
                        </div>
                    </div>
                </section>

                {/* INTERACTIVE EXAMPLE */}

                <section className="border-y border-border px-5 py-12 sm:px-8 lg:py-16">
                    <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
                        {/* EXPLANATION */}

                        <div>
                            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                                <Compass className="size-4" />
                                Découvre le principe
                            </span>

                            <h2 className="mt-5 font-display text-3xl font-semibold leading-tight sm:text-4xl">
                                Une question pour commencer.
                            </h2>

                            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
                                Essaie cet exemple de grammaire. Tu reçois une
                                explication après ta réponse.
                            </p>

                            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
                                Il s'agit d'un exercice de démonstration, et non
                                d'un test de niveau complet.
                            </p>
                        </div>

                        {/* QUESTION */}

                        <div className="lg:border-l lg:border-border lg:pl-12">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                                    Grammaire · Exemple A1
                                </span>

                                <span className="text-xs text-muted-foreground">
                                    01 / 01
                                </span>
                            </div>

                            <p className="mt-6 text-sm text-muted-foreground">
                                Choisis l'article correct :
                            </p>

                            <h3
                                lang="de"
                                className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-4xl"
                            >
                                <span
                                    className={
                                        selectedAnswer === null
                                            ? "text-primary"
                                            : isCorrect
                                              ? "text-primary"
                                              : "text-destructive"
                                    }
                                >
                                    {selectedAnswer === null
                                        ? "___"
                                        : answers[selectedAnswer].label}
                                </span>{" "}
                                Hund spielt im Garten.
                            </h3>

                            <div className="mt-8 grid grid-cols-3 gap-3">
                                {answers.map((answer, index) => {
                                    const active = selectedAnswer === index;

                                    return (
                                        <button
                                            key={answer.label}
                                            type="button"
                                            aria-pressed={active}
                                            onClick={() =>
                                                setSelectedAnswer(index)
                                            }
                                            className={`rounded-xl border-2 px-3 py-4 font-display text-xl font-semibold transition-colors ${
                                                active
                                                    ? answer.correct
                                                        ? "border-primary bg-primary text-primary-foreground"
                                                        : "border-destructive bg-destructive/10 text-destructive"
                                                    : "border-border text-foreground hover:border-primary"
                                            }`}
                                        >
                                            {answer.label}
                                        </button>
                                    );
                                })}
                            </div>

                            <div
                                aria-live="polite"
                                className="mt-6 min-h-20 border-t border-border pt-5"
                            >
                                {selectedAnswer === null ? (
                                    <p className="text-sm text-muted-foreground">
                                        Sélectionne une réponse pour découvrir
                                        l'explication.
                                    </p>
                                ) : (
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2
                                            className={`mt-0.5 size-5 shrink-0 ${
                                                isCorrect
                                                    ? "text-primary"
                                                    : "text-muted-foreground"
                                            }`}
                                        />

                                        <div>
                                            <p className="font-semibold">
                                                {isCorrect
                                                    ? "Richtig ! Bonne réponse."
                                                    : "Pas tout à fait."}
                                            </p>

                                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                                « Hund » est masculin. Au
                                                nominatif, son article défini
                                                est « der ».
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedAnswer(null)}
                                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                            >
                                <RotateCcw className="size-4" />
                                Recommencer
                            </button>
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS */}

                <section className="px-5 py-12 sm:px-8 lg:py-16">
                    <div className="mx-auto max-w-6xl">
                        <div className="text-center">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                                Le positionnement
                            </p>

                            <h2 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
                                Comprendre où commencer.
                            </h2>
                        </div>

                        <div className="mt-10 divide-y divide-border border-y border-border">
                            {steps.map((step) => {
                                const Icon = step.icon;

                                return (
                                    <div
                                        key={step.number}
                                        className="flex items-start gap-4 py-5 sm:gap-7"
                                    >
                                        <span className="font-display text-lg font-semibold text-primary">
                                            {step.number}
                                        </span>

                                        <Icon className="mt-1 size-5 shrink-0 text-primary" />

                                        <div>
                                            <h3 className="font-display text-xl font-semibold">
                                                {step.title}
                                            </h3>

                                            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* CTA */}

                <section className="border-t border-border px-5 py-12 text-center sm:px-8 lg:py-16">
                    <div className="mx-auto max-w-3xl">
                        <h2 className="font-display text-3xl font-semibold sm:text-4xl">
                            Prêt à explorer les niveaux ?
                        </h2>

                        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                            Le test complet n'est pas encore disponible. Tu peux
                            néanmoins découvrir les objectifs associés aux
                            différents niveaux d'allemand.
                        </p>

                        <Link
                            href="/courses"
                            className="mt-7 inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
                        >
                            Explorer le contenu des formations
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>
                </section>
            </main>
        </>
    );
}
