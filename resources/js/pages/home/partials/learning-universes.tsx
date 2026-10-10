import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
    ArrowRight,
    Check,
    MousePointer2,
    Pause,
    Play,
    RotateCcw,
    X,
} from "lucide-react";

type Lesson = {
    title: string;
    subtitle: string;
    before: string;
    after: string;
    translation: string;
    options: string[];
    correct: number;
    wrong: number;
    explanation: string;
};

const lessons: Lesson[] = [
    {
        title: "Grammaire",
        subtitle: "Les articles définis",
        before: "",
        after: " Hund spielt im Garten.",
        translation: "Le chien joue dans le jardin.",
        options: ["Der", "Die", "Das"],
        correct: 0,
        wrong: 1,
        explanation: "Hund est masculin : on utilise Der.",
    },
    {
        title: "Vocabulaire",
        subtitle: "Les mots du quotidien",
        before: "Das ",
        after: " ist groß.",
        translation: "La maison est grande.",
        options: ["Auto", "Haus", "Buch"],
        correct: 1,
        wrong: 0,
        explanation: "Haus signifie maison.",
    },
    {
        title: "Conjugaison",
        subtitle: "Le verbe lernen",
        before: "Ich ",
        after: " Deutsch.",
        translation: "J'apprends l'allemand.",
        options: ["lernst", "lernt", "lerne"],
        correct: 2,
        wrong: 0,
        explanation: "Avec ich, on conjugue lernen en lerne.",
    },
    {
        title: "Prononciation",
        subtitle: "Les salutations",
        before: "Guten ",
        after: "!",
        translation: "Bonjour ! (le matin)",
        options: ["Abend", "Morgen", "Nacht"],
        correct: 1,
        wrong: 2,
        explanation: "Guten Morgen est une salutation matinale.",
    },
    {
        title: "Compréhension",
        subtitle: "Les situations du quotidien",
        before: "Wie ",
        after: " es dir?",
        translation: "Comment vas-tu ?",
        options: ["ist", "bist", "geht"],
        correct: 2,
        wrong: 0,
        explanation: "On demande Wie geht es dir?",
    },
    {
        title: "Exercices",
        subtitle: "Mise en pratique",
        before: "Wir ",
        after: " aus Frankreich.",
        translation: "Nous venons de France.",
        options: ["kommt", "kommen", "komme"],
        correct: 1,
        wrong: 0,
        explanation: "Avec wir, on utilise kommen.",
    },
];

type Phase =
    | "reading"
    | "moveWrong"
    | "pressWrong"
    | "showWrong"
    | "moveCorrect"
    | "pressCorrect"
    | "showCorrect";

const timings: Record<Phase, number> = {
    reading: 1300,
    moveWrong: 950,
    pressWrong: 350,
    showWrong: 1700,
    moveCorrect: 950,
    pressCorrect: 350,
    showCorrect: 2700,
};

export default function LearningUniverses() {
    const [index, setIndex] = useState(0);
    const [phase, setPhase] = useState<Phase>("reading");
    const [playing, setPlaying] = useState(true);
    const [manualAnswer, setManualAnswer] = useState<number | null>(null);
    const [cursor, setCursor] = useState({ x: 70, y: 90 });

    const workspaceRef = useRef<HTMLDivElement>(null);
    const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const lesson = lessons[index];

    const wrongVisible = ["showWrong", "moveCorrect", "pressCorrect"].includes(
        phase,
    );

    const correctVisible = phase === "showCorrect";

    const isClicking = phase === "pressWrong" || phase === "pressCorrect";

    const activeAnswer = playing
        ? correctVisible
            ? lesson.correct
            : wrongVisible
              ? lesson.wrong
              : null
        : manualAnswer;

    const answerIsCorrect =
        activeAnswer !== null && activeAnswer === lesson.correct;

    /* ----------------------------------------
       SYNCHRONISATION DU SCÉNARIO
       ---------------------------------------- */

    useEffect(() => {
        if (!playing) return;

        const timer = window.setTimeout(() => {
            switch (phase) {
                case "reading":
                    setPhase("moveWrong");
                    break;

                case "moveWrong":
                    setPhase("pressWrong");
                    break;

                case "pressWrong":
                    setPhase("showWrong");
                    break;

                case "showWrong":
                    setPhase("moveCorrect");
                    break;

                case "moveCorrect":
                    setPhase("pressCorrect");
                    break;

                case "pressCorrect":
                    setPhase("showCorrect");
                    break;

                case "showCorrect":
                    setIndex((i) => (i + 1) % lessons.length);
                    setPhase("reading");
                    break;
            }
        }, timings[phase]);

        return () => window.clearTimeout(timer);
    }, [phase, playing, index]);

    /* ----------------------------------------
       POSITION RÉELLE DU CURSEUR
       ---------------------------------------- */

    useLayoutEffect(() => {
        const updateCursor = () => {
            if (!workspaceRef.current) return;

            let target: number | null = null;

            if (
                phase === "moveWrong" ||
                phase === "pressWrong" ||
                phase === "showWrong"
            ) {
                target = lesson.wrong;
            }

            if (
                phase === "moveCorrect" ||
                phase === "pressCorrect" ||
                phase === "showCorrect"
            ) {
                target = lesson.correct;
            }

            if (target === null) return;

            const button = optionRefs.current[target];
            if (!button) return;

            const buttonRect = button.getBoundingClientRect();
            const parentRect = workspaceRef.current.getBoundingClientRect();

            setCursor({
                x: buttonRect.left - parentRect.left + buttonRect.width / 2,
                y: buttonRect.top - parentRect.top + buttonRect.height / 2,
            });
        };

        updateCursor();

        window.addEventListener("resize", updateCursor);

        return () => {
            window.removeEventListener("resize", updateCursor);
        };
    }, [index, phase, lesson]);

    /* ----------------------------------------
       INTERACTIONS UTILISATEUR
       ---------------------------------------- */

    function selectLesson(next: number) {
        setIndex(next);
        setPhase("reading");
        setManualAnswer(null);
    }

    function handleAnswer(option: number) {
        setPlaying(false);
        setManualAnswer(option);
        setPhase(option === lesson.correct ? "showCorrect" : "showWrong");
    }

    function nextLesson() {
        setIndex((i) => (i + 1) % lessons.length);
        setPhase("reading");
        setManualAnswer(null);
    }

    function restart() {
        setPlaying(true);
        setIndex(0);
        setPhase("reading");
        setManualAnswer(null);
        setCursor({ x: 70, y: 90 });
    }

    function togglePlayback() {
        if (!playing) {
            setManualAnswer(null);
            setPhase("reading");
        }
        setPlaying((value) => !value);
    }

    return (
        <section
            id="univers"
            aria-labelledby="universes-heading"
            className="relative overflow-hidden  px-4 py-24 sm:px-8 lg:py-36"
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,var(--brand-soft),transparent_65%)] opacity-70 dark:opacity-25"
            />

            <div className="relative mx-auto max-w-7xl">
                {/* HEADING */}

                <div className="mx-auto max-w-4xl text-center">
                    <h2
                        id="universes-heading"
                        className="mt-6 font-display text-5xl leading-[1.1] font-semibold tracking-tight text-balance text-foreground sm:text-6xl lg:text-7xl"
                    >
                        Comprendre, c’est bien.{" "}
                        <span className="inline-block -rotate-2 rounded-xl bg-primary px-3 py-1 text-primary-foreground shadow-lg shadow-primary/15">
                            Essayer, c’est mieux.
                        </span>
                    </h2>

                    <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                        Choisis une activité, tente une réponse et découvre
                        l'explication. La pratique commence ici.
                    </p>
                </div>

                {/* UNIVERSES */}

                <div
                    role="group"
                    aria-label="Choisir une activité"
                    className="mt-14 flex flex-wrap justify-center gap-x-6 gap-y-3 border-b border-border/70 pb-5"
                >
                    {lessons.map((item, i) => (
                        <button
                            key={item.title}
                            type="button"
                            onClick={() => selectLesson(i)}
                            aria-pressed={index === i}
                            className={`relative pb-2 text-sm font-semibold transition-colors sm:text-base ${
                                index === i
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {item.title}

                            {index === i && (
                                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />
                            )}
                        </button>
                    ))}
                </div>

                {/* COMPUTER */}

                <div className="relative mx-auto mt-12 max-w-5xl">
                    <div className="overflow-hidden rounded-[1.5rem] border-[5px] border-[#25302b] bg-card shadow-[0_32px_95px_-35px_rgba(0,0,0,0.4)] dark:border-[#385044] sm:border-[9px]">
                        {/* WINDOW BAR */}

                        <div className="flex items-center justify-between border-b border-border bg-muted/70 px-5 py-3">
                            <div className="flex gap-1.5">
                                <span className="size-2.5 rounded-full bg-[#ff6b6b]" />
                                <span className="size-2.5 rounded-full bg-[#ffc83d]" />
                                <span className="size-2.5 rounded-full bg-[#22c58b]" />
                            </div>

                            <span className="text-xs font-semibold text-muted-foreground">
                                CharlesAcademy — Atelier pratique
                            </span>

                            <span className="w-8" />
                        </div>

                        {/* APP WORKSPACE */}

                        <div
                            ref={workspaceRef}
                            className="relative min-h-[560px] bg-card sm:min-h-[535px]"
                        >
                            {/* APP HEADER */}

                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-5 sm:px-10">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                                        Module{" "}
                                        {String(index + 1).padStart(2, "0")}
                                    </p>

                                    <h3 className="mt-1 font-display text-2xl font-semibold">
                                        {lesson.title}
                                    </h3>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span
                                        className={`size-2 rounded-full bg-primary ${
                                            playing ? "animate-pulse" : ""
                                        }`}
                                    />
                                    {playing
                                        ? "Démo automatique"
                                        : "À toi de jouer"}
                                </div>
                            </div>

                            {/* EXERCISE */}

                            <div
                                key={index}
                                className="mx-auto max-w-2xl px-5 pb-24 pt-9 sm:px-10 sm:pt-12"
                            >
                                <p className="text-sm font-semibold text-primary">
                                    {lesson.subtitle}
                                </p>

                                {/* LIVE ANSWER INSERTION */}

                                <h4 className="mt-6 font-display text-3xl font-semibold leading-[1.35] text-foreground sm:text-5xl">
                                    {lesson.before}

                                    <span
                                        className={`inline-flex min-w-[2.8ch] items-center justify-center rounded-lg px-2 py-0.5 align-baseline transition-[background-color,color] duration-300 ${
                                            activeAnswer === null
                                                ? "border-b-2 border-dashed border-primary/50 bg-primary/5 text-primary"
                                                : answerIsCorrect
                                                  ? "bg-primary/12 text-primary"
                                                  : "bg-destructive/12 text-destructive"
                                        }`}
                                    >
                                        {activeAnswer === null
                                            ? "___"
                                            : lesson.options[activeAnswer]}
                                    </span>

                                    {lesson.after}
                                </h4>

                                <p className="mt-4 text-sm text-muted-foreground sm:text-base">
                                    {lesson.translation}
                                </p>

                                {/* ANSWERS */}

                                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                                    {lesson.options.map(
                                        (option, optionIndex) => {
                                            const selected =
                                                activeAnswer === optionIndex;

                                            const correct =
                                                selected && answerIsCorrect;

                                            const wrong =
                                                selected && !answerIsCorrect;

                                            const targetClick =
                                                playing &&
                                                isClicking &&
                                                optionIndex ===
                                                    (phase === "pressWrong"
                                                        ? lesson.wrong
                                                        : lesson.correct);

                                            return (
                                                <button
                                                    key={`${index}-${option}`}
                                                    ref={(element) => {
                                                        optionRefs.current[
                                                            optionIndex
                                                        ] = element;
                                                    }}
                                                    type="button"
                                                    onClick={() =>
                                                        handleAnswer(
                                                            optionIndex,
                                                        )
                                                    }
                                                    aria-pressed={selected}
                                                    className={`relative min-h-17 overflow-visible rounded-xl border-2 px-4 py-4 text-center font-display text-lg font-medium transition-[background-color,border-color,color,transform] duration-300 ${
                                                        correct
                                                            ? "scale-[1.03] border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/15"
                                                            : wrong
                                                              ? "border-destructive bg-destructive/10 text-destructive"
                                                              : "border-border bg-background text-foreground hover:border-primary/60 hover:bg-accent"
                                                    }`}
                                                >
                                                    {option}

                                                    {correct && (
                                                        <Check className="absolute right-2 top-2 size-4" />
                                                    )}

                                                    {wrong && (
                                                        <X className="absolute right-2 top-2 size-4" />
                                                    )}

                                                    {/* CLICK SHOCKWAVE */}

                                                    {targetClick && (
                                                        <span
                                                            key={phase}
                                                            aria-hidden="true"
                                                            className="pointer-events-none absolute left-1/2 top-1/2 z-20 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary/70 animate-[click-ripple_400ms_ease-out_forwards]"
                                                        />
                                                    )}
                                                </button>
                                            );
                                        },
                                    )}
                                </div>

                                {/* FEEDBACK */}

                                <div
                                    aria-live="polite"
                                    className="mt-8 min-h-24"
                                >
                                    {!wrongVisible &&
                                        !correctVisible &&
                                        activeAnswer === null && (
                                            <p className="text-sm text-muted-foreground">
                                                {phase === "reading"
                                                    ? "Lis la phrase et trouve le mot manquant…"
                                                    : "Choix de la réponse en cours…"}
                                            </p>
                                        )}

                                    {activeAnswer !== null &&
                                        !answerIsCorrect && (
                                            <div className="border-l-2 border-destructive pl-4">
                                                <p className="font-display text-xl font-semibold text-destructive">
                                                    Nicht ganz!
                                                </p>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    Cette réponse ne convient
                                                    pas. Observons la
                                                    correction.
                                                </p>
                                            </div>
                                        )}

                                    {activeAnswer !== null &&
                                        answerIsCorrect && (
                                            <div className="border-l-2 border-primary pl-4">
                                                <p className="font-display text-xl font-semibold text-primary">
                                                    Richtig! Sehr gut!
                                                </p>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {lesson.explanation}
                                                </p>

                                                {!playing && (
                                                    <button
                                                        type="button"
                                                        onClick={nextLesson}
                                                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                                                    >
                                                        Exercice suivant
                                                        <ArrowRight className="size-4" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                </div>
                            </div>

                            {/* REAL POSITIONED CURSOR */}

                            {playing && (
                                <div
                                    aria-hidden="true"
                                    className="pointer-events-none absolute left-0 top-0 z-30 hidden will-change-transform transition-transform duration-[850ms] ease-in-out sm:block motion-reduce:transition-none"
                                    style={{
                                        transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)`,
                                    }}
                                >
                                    <MousePointer2
                                        className={`size-7 -translate-x-1 -translate-y-1 fill-foreground text-background drop-shadow-md transition-transform duration-150 ${
                                            isClicking
                                                ? "scale-75"
                                                : "scale-100"
                                        }`}
                                    />

                                    <span className="mt-1 block w-fit rounded-md bg-foreground px-2 py-1 text-[10px] font-medium text-background">
                                        Démo
                                    </span>
                                </div>
                            )}

                            {/* PROGRESS */}

                            <div className="absolute inset-x-0 bottom-0 border-t border-border/60 bg-muted/40 px-5 py-4 sm:px-10">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>
                                        Exercice {index + 1} sur{" "}
                                        {lessons.length}
                                    </span>
                                    <span>
                                        {Math.round(
                                            ((index + 1) / lessons.length) *
                                                100,
                                        )}
                                        % de la démo
                                    </span>
                                </div>

                                <div className="mt-2 h-1 overflow-hidden rounded-full bg-border">
                                    <div
                                        className="h-full rounded-full bg-primary transition-[width] duration-700"
                                        style={{
                                            width: `${((index + 1) / lessons.length) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* COMPUTER STAND */}

                    <div
                        aria-hidden="true"
                        className="mx-auto h-12 w-16 bg-gradient-to-b from-[#69746e] to-[#c2cac4] dark:from-[#24372d] dark:to-[#53675b] sm:h-16 sm:w-24"
                    />

                    <div
                        aria-hidden="true"
                        className="mx-auto h-3 w-40 rounded-t-xl bg-gradient-to-b from-[#aab8af] to-[#718278] shadow-lg dark:from-[#54675b] dark:to-[#2c4034] sm:w-56"
                    />
                </div>

                {/* CONTROLS */}

                <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
                    <button
                        type="button"
                        onClick={togglePlayback}
                        className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                    >
                        {playing ? (
                            <Pause className="size-4" />
                        ) : (
                            <Play className="size-4" />
                        )}

                        {playing ? "Pause" : "Lecture auto"}
                    </button>

                    <button
                        type="button"
                        onClick={restart}
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
                    >
                        <RotateCcw className="size-4" />
                        Recommencer
                    </button>
                </div>

                <p className="mt-5 text-center text-xs text-muted-foreground">
                    Démonstration interactive CharlesAcademy.
                </p>
            </div>
        </section>
    );
}
