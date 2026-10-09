import { useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, Check } from "lucide-react";

type Stage = {
    eyebrow: string;
    title: string;
    description: string;
    note: string;
};

const stages: Stage[] = [
    {
        eyebrow: "01 / OBSERVER",
        title: "Observer",
        description:
            "Une phrase simple du quotidien. Observe comment les mots s'assemblent.",
        note: "Repère l'article devant le nom.",
    },
    {
        eyebrow: "02 / COMPRENDRE",
        title: "Comprendre",
        description:
            "Hund est un nom masculin. Au nominatif, son article défini est der.",
        note: "der + Hund = der Hund",
    },
    {
        eyebrow: "03 / RÉUTILISER",
        title: "Réutiliser",
        description:
            "Applique cette règle à d'autres noms masculins : der Mann, der Tisch, der Hund.",
        note: "Une règle, plusieurs applications.",
    },
];

const vocabulary = [
    {
        word: "Der",
        translation: "Le",
        label: "Article défini",
        explanation:
            "Article masculin au nominatif. Il accompagne le nom Hund.",
    },
    {
        word: "Hund",
        translation: "Chien",
        label: "Nom masculin",
        explanation:
            "Hund signifie chien. En allemand, les noms communs prennent une majuscule.",
    },
    {
        word: "spielt",
        translation: "Joue",
        label: "Verbe",
        explanation:
            "Forme du verbe spielen à la troisième personne du singulier.",
    },
    {
        word: "im",
        translation: "Dans le",
        label: "Préposition contractée",
        explanation:
            "Contraction de in + dem, utilisée ici pour indiquer un lieu.",
    },
    {
        word: "Garten.",
        translation: "Jardin",
        label: "Nom masculin",
        explanation: "Garten signifie jardin. Son article défini est der.",
    },
];

export default function TeachingMethod() {
    const [stage, setStage] = useState(0);
    const [selectedWord, setSelectedWord] = useState<number | null>(null);

    const current = stages[stage];

    const activeWord = selectedWord !== null ? vocabulary[selectedWord] : null;

    function goToStage(next: number) {
        setStage(next);
        setSelectedWord(null);
    }

    return (
        <section
            id="methode"
            aria-labelledby="method-heading"
            className="border-t border-border  px-5 py-14 sm:px-8 lg:py-20"
        >
            <div className="mx-auto max-w-7xl">
                {/* CENTERED SECTION HEADER */}

                <div className="mx-auto max-w-5xl text-center">
                    <h2
                        id="method-heading"
                        className="mt-6 font-display text-5xl leading-[1.1] font-semibold tracking-tight text-balance text-foreground sm:text-6xl lg:text-7xl"
                    >
                        Une règle comprise.{" "}
                        <span className="inline-block -rotate-2 rounded-xl bg-primary px-3 py-1 text-primary-foreground shadow-lg shadow-primary/15">
                            Mille possibilités.
                        </span>
                    </h2>

                    <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                        Pas seulement mémoriser. Comprendre pourquoi, faire des
                        liens et savoir réutiliser ce qu'on apprend.
                    </p>
                </div>

                {/* COMPACT INTERACTIVE WORKSPACE */}

                <div className="mx-auto mt-10 max-w-5xl border-y border-border">
                    {/* STAGE NAVIGATION */}

                    <div
                        role="group"
                        aria-label="Étapes de la méthode"
                        className="grid grid-cols-3 border-b border-border"
                    >
                        {stages.map((item, index) => {
                            const active = stage === index;

                            return (
                                <button
                                    key={item.eyebrow}
                                    type="button"
                                    aria-pressed={active}
                                    onClick={() => goToStage(index)}
                                    className={`relative px-2 py-4 text-center transition-colors duration-300 sm:px-5 ${
                                        active
                                            ? "text-primary"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <span className="block text-[10px] font-bold tracking-widest opacity-70">
                                        0{index + 1}
                                    </span>

                                    <span className="mt-1 block font-display text-base font-semibold sm:text-xl">
                                        {item.title}
                                    </span>

                                    {active && (
                                        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* MAIN SENTENCE */}

                    <div className="px-4 py-7 text-center sm:py-10">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                            {current.eyebrow}
                        </p>

                        <p className="mt-2 text-sm text-muted-foreground">
                            Clique sur les mots pour découvrir leur rôle.
                        </p>

                        <div
                            lang="de"
                            className="mt-6 flex flex-wrap items-baseline justify-center gap-x-[0.22em] gap-y-2 font-display text-[clamp(2rem,5vw,4.5rem)] font-semibold leading-tight tracking-tight"
                        >
                            {vocabulary.map((item, index) => {
                                const isSelected = selectedWord === index;

                                const highlight =
                                    isSelected ||
                                    (stage > 0 &&
                                        selectedWord === null &&
                                        index === 0);

                                return (
                                    <button
                                        key={item.word}
                                        type="button"
                                        lang="de"
                                        aria-pressed={isSelected}
                                        onClick={() =>
                                            setSelectedWord(
                                                isSelected ? null : index,
                                            )
                                        }
                                        className={`relative rounded-lg px-1.5 py-1 transition-[color,background-color,transform] duration-300 ${
                                            highlight
                                                ? "bg-brand-soft text-brand-soft-foreground"
                                                : "text-foreground hover:text-primary"
                                        } ${
                                            isSelected ? "-translate-y-0.5" : ""
                                        }`}
                                    >
                                        {item.word}

                                        {isSelected && (
                                            <span
                                                aria-hidden="true"
                                                className="absolute inset-x-1 -bottom-1 h-0.5 rounded-full bg-primary"
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <p className="mt-5 text-sm text-muted-foreground sm:text-base">
                            Le chien joue dans le jardin.
                        </p>
                    </div>

                    {/* CONTEXTUAL EXPLANATION */}

                    <div
                        aria-live="polite"
                        aria-atomic="true"
                        className="flex min-h-24 flex-wrap items-center justify-between gap-4 border-t border-border px-4 py-4 sm:px-6"
                    >
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                                    {activeWord
                                        ? activeWord.translation
                                        : current.note}
                                </span>

                                {activeWord && (
                                    <span className="text-xs text-muted-foreground">
                                        {activeWord.label}
                                    </span>
                                )}
                            </div>

                            <p className="mt-1.5 text-sm leading-relaxed text-foreground sm:text-base">
                                {activeWord
                                    ? activeWord.explanation
                                    : current.description}
                            </p>
                        </div>

                        {activeWord && (
                            <button
                                type="button"
                                onClick={() => setSelectedWord(null)}
                                className="inline-flex shrink-0 items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary"
                            >
                                <RotateCcw className="size-3.5" />
                                Réinitialiser
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
