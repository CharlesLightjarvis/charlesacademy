import { useState } from "react";
import {
    ArrowRight,
    BookOpen,
    BookText,
    Check,
    CheckCircle2,
    ChevronRight,
    CircleHelp,
    GraduationCap,
    LayoutDashboard,
    RotateCcw,
    TrendingUp,
} from "lucide-react";

const navigation = [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "courses", label: "Catalogue", icon: BookOpen },
    { id: "lesson", label: "Une leçon", icon: BookText },
    { id: "quiz", label: "Quiz", icon: CircleHelp },
    { id: "progress", label: "Progression", icon: TrendingUp },
] as const;

type View = (typeof navigation)[number]["id"];

const demoCourses = [
    {
        title: "Premiers pas en allemand",
        level: "A1",
        subject: "Découvrir les bases",
        lessons: 8,
    },
    {
        title: "Les articles et les noms",
        level: "A1",
        subject: "Comprendre la grammaire",
        lessons: 12,
    },
    {
        title: "Parler au quotidien",
        level: "A2",
        subject: "Construire des phrases",
        lessons: 10,
    },
    {
        title: "Exprimer ses idées",
        level: "B1",
        subject: "Développer son expression",
        lessons: 14,
    },
] as const;

const quiz = {
    question: "___ Hund spielt im Garten.",
    answers: ["Der", "Die", "Das"],
    correct: 0,
};

export default function PlatformPreview() {
    const [view, setView] = useState<View>("dashboard");
    const [level, setLevel] = useState("Tous");
    const [answer, setAnswer] = useState<number | null>(null);
    const [lessonPage, setLessonPage] = useState(0);

    const activeIndex = navigation.findIndex((item) => item.id === view);

    const filteredCourses = demoCourses.filter(
        (course) => level === "Tous" || course.level === level,
    );

    function navigate(next: View) {
        setView(next);
    }

    function nextView() {
        const next = navigation[(activeIndex + 1) % navigation.length];
        setView(next.id);
    }

    return (
        <section
            id="plateforme"
            aria-labelledby="platform-heading"
            className="relative overflow-hidden border-t border-border  px-5 py-16 sm:px-8 lg:py-24"
        >
            <div className="mx-auto max-w-7xl">
                {/* HEADING */}

                <div className="mx-auto max-w-5xl text-center">
                    <h2
                        id="platform-heading"
                        className="mt-6 font-display text-5xl font-semibold leading-[1.1] tracking-tight text-balance text-foreground sm:text-6xl lg:text-7xl"
                    >
                        Un espace pour apprendre.{" "}
                        <span className="inline-block -rotate-2 rounded-xl bg-primary px-3 py-1 text-primary-foreground shadow-lg shadow-primary/15">
                            À ton rythme.
                        </span>
                    </h2>

                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                        Découvre les différents espaces d'apprentissage à
                        travers cette démonstration interactive.
                    </p>
                </div>

                {/* PRODUCT EXPLORER */}

                <div className="mt-12 overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-[0_30px_90px_-55px_rgba(0,0,0,0.35)]">
                    {/* TOP BAR */}

                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-8">
                        <div className="flex items-center gap-3">
                            <span className="flex size-9 items-center justify-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
                                C
                            </span>

                            <div>
                                <p className="font-display text-lg font-semibold text-foreground">
                                    CharlesAcademy
                                </p>
                                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                                    Espace apprenant · Démo
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="size-2 rounded-full bg-primary" />
                            Visite interactive
                        </div>
                    </div>

                    {/* MOBILE NAVIGATION */}

                    <div className="flex gap-1 overflow-x-auto border-b border-border p-3 lg:hidden">
                        {navigation.map((item) => {
                            const Icon = item.icon;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => navigate(item.id)}
                                    aria-pressed={view === item.id}
                                    className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors ${
                                        view === item.id
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                    }`}
                                >
                                    <Icon className="size-4" />
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex min-h-[440px]">
                        {/* DESKTOP SIDEBAR */}

                        <nav
                            aria-label="Explorer la plateforme"
                            className="hidden w-60 shrink-0 flex-col border-r border-border bg-muted/30 px-3 py-6 lg:flex"
                        >
                            <p className="mb-5 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                Explorer
                            </p>

                            <div className="space-y-1">
                                {navigation.map((item) => {
                                    const Icon = item.icon;
                                    const active = view === item.id;

                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => navigate(item.id)}
                                            aria-current={
                                                active ? "page" : undefined
                                            }
                                            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                                                active
                                                    ? "bg-primary text-primary-foreground"
                                                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                            }`}
                                        >
                                            <Icon className="size-[18px]" />
                                            {item.label}
                                            {active && (
                                                <ChevronRight className="ml-auto size-4" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-auto border-t border-border px-4 pt-5">
                                <p className="text-xs leading-relaxed text-muted-foreground">
                                    Une visite guidée de l'univers
                                    CharlesAcademy.
                                </p>
                            </div>
                        </nav>

                        {/* MAIN EXPERIENCE */}

                        <main className="min-w-0 flex-1 px-5 py-7 sm:px-9 sm:py-9">
                            {/* DASHBOARD */}

                            {view === "dashboard" && (
                                <div className="space-y-7">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                                            Mon espace
                                        </p>

                                        <h3 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
                                            Bon retour !
                                        </h3>

                                        <p className="mt-2 text-muted-foreground">
                                            Une nouvelle occasion de progresser
                                            en allemand.
                                        </p>
                                    </div>

                                    <div className="border-y border-border py-7">
                                        <div className="flex flex-wrap items-end justify-between gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Parcours de découverte
                                                </p>

                                                <p className="mt-2 font-display text-5xl font-semibold text-primary">
                                                    65%
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate("lesson")
                                                }
                                                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
                                            >
                                                Continuer
                                                <ArrowRight className="size-4" />
                                            </button>
                                        </div>

                                        <div className="mt-6 h-2 overflow-hidden rounded-full bg-secondary">
                                            <div className="h-full w-[65%] rounded-full bg-primary" />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-12 gap-y-5">
                                        <div>
                                            <p className="font-display text-3xl font-semibold">
                                                12
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Leçons terminées
                                            </p>
                                        </div>

                                        <div>
                                            <p className="font-display text-3xl font-semibold">
                                                08
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Exercices réussis
                                            </p>
                                        </div>

                                        <div>
                                            <p className="font-display text-3xl font-semibold">
                                                A1
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Niveau illustré
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* COURSE CATALOG */}

                            {view === "courses" && (
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                                        Catalogue
                                    </p>

                                    <h3 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
                                        Qu'allons-nous apprendre ?
                                    </h3>

                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Explore quelques exemples de parcours.
                                    </p>

                                    <div
                                        role="group"
                                        aria-label="Filtrer par niveau"
                                        className="mt-6 flex flex-wrap gap-2"
                                    >
                                        {["Tous", "A1", "A2", "B1"].map(
                                            (item) => (
                                                <button
                                                    key={item}
                                                    type="button"
                                                    aria-pressed={
                                                        level === item
                                                    }
                                                    onClick={() =>
                                                        setLevel(item)
                                                    }
                                                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                                                        level === item
                                                            ? "border-primary bg-primary text-primary-foreground"
                                                            : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                                                    }`}
                                                >
                                                    {item}
                                                </button>
                                            ),
                                        )}
                                    </div>

                                    <div className="mt-6 divide-y divide-border border-y border-border">
                                        {filteredCourses.map((course) => (
                                            <button
                                                key={course.title}
                                                type="button"
                                                onClick={() =>
                                                    navigate("lesson")
                                                }
                                                className="group flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:text-primary"
                                            >
                                                <div className="flex min-w-0 items-center gap-4">
                                                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary font-display font-semibold text-secondary-foreground">
                                                        {course.level}
                                                    </span>

                                                    <div>
                                                        <h4 className="font-display text-base font-semibold sm:text-lg">
                                                            {course.title}
                                                        </h4>

                                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                                            {course.subject} ·{" "}
                                                            {course.lessons}{" "}
                                                            leçons
                                                        </p>
                                                    </div>
                                                </div>

                                                <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-1" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* LESSON */}

                            {view === "lesson" && (
                                <div className="mx-auto max-w-2xl">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                                            Leçon interactive
                                        </span>

                                        <span className="text-xs text-muted-foreground">
                                            {lessonPage + 1} / 2
                                        </span>
                                    </div>

                                    <h3 className="mt-5 font-display text-3xl font-semibold sm:text-4xl">
                                        Les articles allemands.
                                    </h3>

                                    <p className="mt-3 text-muted-foreground">
                                        En allemand, les noms possèdent un genre
                                        grammatical.
                                    </p>

                                    <div
                                        key={lessonPage}
                                        className="mt-9 border-l-[3px] border-primary pl-6"
                                    >
                                        {lessonPage === 0 ? (
                                            <>
                                                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                                                    Les trois articles
                                                </p>

                                                <p
                                                    lang="de"
                                                    className="mt-5 font-display text-4xl font-semibold leading-relaxed sm:text-5xl"
                                                >
                                                    <span className="text-primary">
                                                        der
                                                    </span>
                                                    {" · "}
                                                    die
                                                    {" · "}
                                                    das
                                                </p>

                                                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                                                    Masculin, féminin et neutre
                                                    : chaque nom possède son
                                                    article.
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                                                    Exemple concret
                                                </p>

                                                <p
                                                    lang="de"
                                                    className="mt-5 font-display text-3xl font-semibold sm:text-4xl"
                                                >
                                                    <span className="text-primary">
                                                        Der Hund
                                                    </span>{" "}
                                                    spielt.
                                                </p>

                                                <p className="mt-4 text-sm text-muted-foreground">
                                                    Le chien joue. Hund est un
                                                    nom masculin.
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    <div className="mt-10 flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setLessonPage(
                                                    (value) => (value + 1) % 2,
                                                )
                                            }
                                            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
                                        >
                                            {lessonPage === 0
                                                ? "Voir un exemple"
                                                : "Revoir la règle"}
                                            <ArrowRight className="size-4" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => navigate("quiz")}
                                            className="rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-accent"
                                        >
                                            Tester mes connaissances
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* QUIZ */}

                            {view === "quiz" && (
                                <div className="mx-auto max-w-2xl">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                                        Quiz · Grammaire A1
                                    </p>

                                    <h3 className="mt-5 font-display text-3xl font-semibold sm:text-4xl">
                                        À toi de trouver.
                                    </h3>

                                    <p className="mt-4 text-sm text-muted-foreground">
                                        Complète la phrase :
                                    </p>

                                    <p
                                        lang="de"
                                        className="mt-5 font-display text-3xl font-semibold leading-tight sm:text-4xl"
                                    >
                                        <span
                                            className={
                                                answer === null
                                                    ? "text-primary"
                                                    : answer === quiz.correct
                                                      ? "text-primary"
                                                      : "text-destructive"
                                            }
                                        >
                                            {answer === null
                                                ? "___"
                                                : quiz.answers[answer]}
                                        </span>{" "}
                                        Hund spielt im Garten.
                                    </p>

                                    <div className="mt-8 flex flex-wrap gap-3">
                                        {quiz.answers.map((option, i) => (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => setAnswer(i)}
                                                aria-pressed={answer === i}
                                                className={`min-w-24 rounded-xl border-2 px-5 py-3 font-display text-xl font-semibold transition-colors ${
                                                    answer === i
                                                        ? i === quiz.correct
                                                            ? "border-primary bg-primary text-primary-foreground"
                                                            : "border-destructive bg-destructive/10 text-destructive"
                                                        : "border-border text-foreground hover:border-primary"
                                                }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>

                                    <div
                                        aria-live="polite"
                                        className="mt-6 min-h-16"
                                    >
                                        {answer !== null && (
                                            <div className="flex items-start gap-3">
                                                {answer === quiz.correct ? (
                                                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                                                ) : (
                                                    <RotateCcw className="mt-0.5 size-5 shrink-0 text-destructive" />
                                                )}

                                                <p className="text-sm leading-relaxed text-foreground">
                                                    {answer === quiz.correct
                                                        ? "Richtig! Hund est masculin : der Hund."
                                                        : "Pas tout à fait. Hund est masculin au nominatif. Essaie encore."}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setAnswer(null)}
                                        className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary"
                                    >
                                        <RotateCcw className="size-3.5" />
                                        Recommencer
                                    </button>
                                </div>
                            )}

                            {/* PROGRESS */}

                            {view === "progress" && (
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                                        Suivi pédagogique
                                    </p>

                                    <h3 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
                                        Chaque progrès compte.
                                    </h3>

                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Visualise tes efforts et les notions
                                        travaillées.
                                    </p>

                                    <div className="mt-8 flex flex-wrap items-end gap-5">
                                        <span className="font-display text-6xl font-semibold text-primary sm:text-7xl">
                                            78%
                                        </span>
                                        <span className="pb-2 text-sm text-muted-foreground">
                                            Exemple de progression
                                        </span>
                                    </div>

                                    <div
                                        role="img"
                                        aria-label="Graphique fictif d'une progression hebdomadaire"
                                        className="mt-7 flex h-36 items-end gap-3 border-b border-border pb-1 sm:gap-5"
                                    >
                                        {[30, 48, 38, 65, 55, 88, 78].map(
                                            (height, i) => (
                                                <div
                                                    key={i}
                                                    className="flex h-full flex-1 items-end"
                                                >
                                                    <div
                                                        className={`w-full rounded-t-md transition-[height] duration-500 ${
                                                            i === 6
                                                                ? "bg-primary"
                                                                : "bg-primary/25"
                                                        }`}
                                                        style={{
                                                            height: `${height}%`,
                                                        }}
                                                    />
                                                </div>
                                            ),
                                        )}
                                    </div>

                                    <div className="mt-3 grid grid-cols-7 gap-3 text-center text-[10px] text-muted-foreground sm:gap-5">
                                        {[
                                            "L",
                                            "M",
                                            "M",
                                            "J",
                                            "V",
                                            "S",
                                            "D",
                                        ].map((day, i) => (
                                            <span key={i}>{day}</span>
                                        ))}
                                    </div>

                                    <p className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary">
                                        <Check className="size-4" />
                                        La régularité fait la différence.
                                    </p>
                                </div>
                            )}
                        </main>
                    </div>

                    {/* PRODUCT FOOTER */}

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/30 px-5 py-4 sm:px-8">
                        <p className="text-xs text-muted-foreground">
                            Aperçu conceptuel · Données de démonstration
                        </p>

                        <button
                            type="button"
                            onClick={nextView}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-foreground"
                        >
                            {activeIndex === navigation.length - 1
                                ? "Recommencer la visite"
                                : "Explorer la suite"}
                            <ArrowRight className="size-4" />
                        </button>
                    </div>
                </div>

                {/* LOWER SIGNATURE */}

                <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                    <GraduationCap className="size-4 text-primary" />
                    Une expérience pensée pour apprendre, pratiquer et
                    progresser.
                </div>
            </div>
        </section>
    );
}
