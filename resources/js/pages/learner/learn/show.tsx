import { Form, Head, Link, router } from "@inertiajs/react";
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    CircleDashed,
    ListChecks,
    RotateCcw,
    XCircle,
} from "lucide-react";
import { useState } from "react";
import { LessonSidebar } from "@/components/learner/lesson-sidebar";
import { LessonSidebarSelect } from "@/components/learner/lesson-sidebar-select";
import { MdxContent } from "@/components/learner/mdx-content";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LearnController from "@/actions/App/Http/Controllers/Learner/LearnController";
import { index as learnIndex } from "@/routes/learner/learn";
import { read as lessonRead } from "@/routes/learner/learn/lesson";
import type { LearnModule } from "@/types/learn";

type Question = { prompt: string; options: Record<string, string> };
type Correction = {
    selected: string;
    correct: string;
    explanation: string;
    is_correct: boolean;
};
type QuizResult = {
    score: number;
    bestScore: number;
    corrections: Record<string, Correction>;
};

type Props = {
    level: string;
    module: { id: string; title: string };
    lesson: { id: string; title: string; introduction: string };
    moduleNumber: number;
    lessonNumber: number;
    mdx: string | null;
    questions: Record<string, Question>;
    modules: LearnModule[];
    isRead: boolean;
    flash?: { quizResult?: QuizResult | null };
};

export default function LessonShow({
    level,
    module,
    lesson,
    moduleNumber,
    lessonNumber,
    mdx,
    questions,
    modules,
    isRead: initialIsRead,
    flash,
}: Props) {
    const result = flash?.quizResult ?? null;
    const hasQuiz = Object.keys(questions).length > 0;
    const [isRead, setIsRead] = useState(initialIsRead);
    const [isTogglingRead, setIsTogglingRead] = useState(false);

    function toggleReadStatus() {
        setIsRead((current) => !current);
        router.patch(
            lessonRead.url({ module: module.id, lesson: lesson.id }),
            {},
            {
                preserveScroll: true,
                only: ["isRead"],
                onStart: () => setIsTogglingRead(true),
                onFinish: () => setIsTogglingRead(false),
            },
        );
    }

    return (
        <>
            <Head title={`${lesson.title} · ${level}`} />

            <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:py-5">
                <div className="flex items-center justify-between gap-3 lg:hidden">
                    <Link
                        href={learnIndex()}
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
                    >
                        <ArrowLeft className="size-4" />
                        Modules {level}
                    </Link>
                </div>

                <LessonSidebarSelect
                    modules={modules}
                    activeModuleId={module.id}
                    activeLessonId={lesson.id}
                />

                <div className="mt-8 grid gap-8 lg:mt-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
                    <aside className="hidden lg:flex">
                        <div className="w-full">
                            <Link
                                href={learnIndex()}
                                className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
                            >
                                <ArrowLeft className="size-4" />
                                Modules {level}
                            </Link>
                            <LessonSidebar
                                modules={modules}
                                activeModuleId={module.id}
                                activeLessonId={lesson.id}
                            />
                        </div>
                    </aside>

                    <div className="min-w-0 flex-1">
                        <header className="border-b border-border pb-6">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-xs font-bold tracking-[.2em] text-primary uppercase">
                                        {level} · Module{" "}
                                        {String(moduleNumber).padStart(2, "0")}{" "}
                                        · Leçon{" "}
                                        {String(lessonNumber).padStart(2, "0")}
                                    </p>
                                    <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                                        {lesson.title}
                                    </h1>
                                    <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground lg:text-lg">
                                        {lesson.introduction}
                                    </p>
                                </div>

                                <Button
                                    variant={isRead ? "secondary" : "default"}
                                    size="sm"
                                    disabled={isTogglingRead}
                                    onClick={toggleReadStatus}
                                    className="shrink-0 rounded-full"
                                    aria-pressed={isRead}
                                >
                                    {isRead ? (
                                        <>
                                            <CheckCircle2 className="size-4" />
                                            Lu
                                        </>
                                    ) : (
                                        <>
                                            <CircleDashed className="size-4" />
                                            Non lu
                                        </>
                                    )}
                                </Button>
                            </div>
                        </header>

                        <Tabs defaultValue="lesson" className="mt-6">
                            <TabsList>
                                <TabsTrigger
                                    value="lesson"
                                    className="gap-1.5 px-4"
                                >
                                    <BookOpen className="size-4" />
                                    Leçon
                                </TabsTrigger>
                                {hasQuiz && (
                                    <TabsTrigger
                                        value="quiz"
                                        className="gap-1.5 px-4"
                                    >
                                        <ListChecks className="size-4" />
                                        Quiz
                                    </TabsTrigger>
                                )}
                            </TabsList>

                            <TabsContent value="lesson" className="mt-8">
                                {mdx ? (
                                    <MdxContent source={mdx} />
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Le contenu de cette leçon arrive
                                        bientôt.
                                    </p>
                                )}
                            </TabsContent>

                            {hasQuiz && (
                                <TabsContent value="quiz" className="mt-8">
                                    <section aria-labelledby="exercise-heading">
                                        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                                            <p className="text-xs font-bold tracking-wider text-primary uppercase">
                                                À toi de jouer
                                            </p>
                                            <h2
                                                id="exercise-heading"
                                                className="mt-2 font-display text-2xl font-semibold"
                                            >
                                                Vérifie ce que tu as retenu
                                            </h2>
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                Tu peux recommencer autant de
                                                fois que tu veux ; ton meilleur
                                                score reste enregistré.
                                            </p>

                                            {result && (
                                                <div
                                                    role="status"
                                                    className="mt-5 rounded-xl border border-primary/30 bg-background p-5"
                                                >
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <CheckCircle2 className="size-6 text-primary" />
                                                        <h3 className="font-display text-xl font-semibold">
                                                            Résultat :{" "}
                                                            {result.score}/
                                                            {
                                                                Object.keys(
                                                                    questions,
                                                                ).length
                                                            }
                                                        </h3>
                                                        <span className="text-sm text-muted-foreground">
                                                            Meilleur score :{" "}
                                                            {result.bestScore}/
                                                            {
                                                                Object.keys(
                                                                    questions,
                                                                ).length
                                                            }
                                                        </span>
                                                    </div>
                                                    <p className="mt-2 text-sm text-muted-foreground">
                                                        Ta correction est
                                                        affichée sous chaque
                                                        question.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <Form
                                            {...LearnController.submitQuiz.form(
                                                {
                                                    module: module.id,
                                                    lesson: lesson.id,
                                                },
                                            )}
                                            className="mt-6 space-y-8"
                                        >
                                            {({ processing, errors }) => (
                                                <>
                                                    {Object.entries(
                                                        questions,
                                                    ).map(
                                                        (
                                                            [key, question],
                                                            index,
                                                        ) => {
                                                            const correction =
                                                                result?.corrections[
                                                                    key
                                                                ];

                                                            return (
                                                                <fieldset
                                                                    key={key}
                                                                    className="border-b border-border pb-7"
                                                                >
                                                                    <legend className="font-display text-lg font-semibold">
                                                                        {index +
                                                                            1}.{" "}
                                                                        {
                                                                            question.prompt
                                                                        }
                                                                    </legend>
                                                                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                                                                        {Object.entries(
                                                                            question.options,
                                                                        ).map(
                                                                            ([
                                                                                optionKey,
                                                                                label,
                                                                            ]) => (
                                                                                <label
                                                                                    key={
                                                                                        optionKey
                                                                                    }
                                                                                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 has-checked:border-primary has-checked:bg-primary/5"
                                                                                >
                                                                                    <input
                                                                                        type="radio"
                                                                                        name={`answers[${key}]`}
                                                                                        value={
                                                                                            optionKey
                                                                                        }
                                                                                        required
                                                                                        defaultChecked={
                                                                                            correction?.selected ===
                                                                                            optionKey
                                                                                        }
                                                                                        className="accent-primary"
                                                                                    />
                                                                                    <span>
                                                                                        {
                                                                                            label
                                                                                        }
                                                                                    </span>
                                                                                </label>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                    {errors[
                                                                        `answers.${key}`
                                                                    ] && (
                                                                        <p className="mt-2 text-sm text-destructive">
                                                                            {
                                                                                errors[
                                                                                    `answers.${key}`
                                                                                ]
                                                                            }
                                                                        </p>
                                                                    )}
                                                                    {correction && (
                                                                        <div className="mt-4 flex items-start gap-2 text-sm">
                                                                            {correction.is_correct ? (
                                                                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                                                                            ) : (
                                                                                <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                                                                            )}
                                                                            <p>
                                                                                <strong>
                                                                                    {correction.is_correct
                                                                                        ? "Bonne réponse."
                                                                                        : `Bonne réponse : ${question.options[correction.correct]}.`}
                                                                                </strong>{" "}
                                                                                {
                                                                                    correction.explanation
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </fieldset>
                                                            );
                                                        },
                                                    )}
                                                    <Button
                                                        type="submit"
                                                        disabled={processing}
                                                        size="lg"
                                                        className="rounded-full"
                                                    >
                                                        {result && (
                                                            <RotateCcw className="size-4" />
                                                        )}
                                                        {processing
                                                            ? "Correction en cours…"
                                                            : result
                                                              ? "Recommencer"
                                                              : "Corriger mes réponses"}
                                                    </Button>
                                                </>
                                            )}
                                        </Form>
                                    </section>
                                </TabsContent>
                            )}
                        </Tabs>
                    </div>
                </div>
            </div>
        </>
    );
}
