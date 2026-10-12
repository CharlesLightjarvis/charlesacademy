import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Circle,
    CircleDashed,
    ListChecks,
    RotateCcw,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { LessonSidebarColumn } from '@/components/learner/lesson-sidebar-column';
import { LessonSidebarSelect } from '@/components/learner/lesson-sidebar-select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { index as learnIndex } from '@/routes/learner/learn';
import { show as lessonShow } from '@/routes/learner/learn/lesson';
import { submit as quizSubmit } from '@/routes/learner/learn/lesson/quiz';
import type { LearnModule } from '@/types/learn';

type Question = { id: string; prompt: string; options: Record<string, string> };
type Correction = {
    selected: string;
    correct: string;
    explanation: string | null;
    is_correct: boolean;
};
type QuizResult = {
    score: number;
    total: number;
    bestScore: number;
    corrections: Record<string, Correction>;
};

type Props = {
    level: string;
    module: { id: string; title: string };
    lesson: { id: string; title: string };
    moduleNumber: number;
    lessonNumber: number;
    quiz: { title: string };
    questions: Question[];
    bestScore: number | null;
    modules: LearnModule[];
    flash?: { quizResult?: QuizResult | null };
};

export default function LessonQuiz({
    level,
    module,
    lesson,
    moduleNumber,
    lessonNumber,
    quiz,
    questions,
    bestScore: initialBestScore,
    modules,
    flash,
}: Props) {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [result, setResult] = useState<QuizResult | null>(null);
    const { post, processing, errors, transform } = useForm();

    // La correction revient par le flash après la soumission.
    useEffect(() => {
        if (flash?.quizResult) {
            setResult(flash.quizResult);
        }
    }, [flash?.quizResult]);

    const current = questions[step];
    const correction = result?.corrections[current.id];
    const isCorrecting = result !== null;
    const answered = questions.filter(
        (question) => answers[question.id],
    ).length;
    const bestScore = result?.bestScore ?? initialBestScore;
    const questionError = (errors as Record<string, string | undefined>)[
        `answers.${current.id}`
    ];

    function submitAnswers() {
        transform(() => ({ answers }));

        post(
            quizSubmit.url({
                module: module.id,
                lesson: lesson.id,
            }),
            {
                onError: (serverErrors) => {
                    const firstInvalid = questions.findIndex(
                        (question) => serverErrors[`answers.${question.id}`],
                    );

                    if (firstInvalid !== -1) {
                        setStep(firstInvalid);
                    }
                },
            },
        );
    }

    function restart() {
        setResult(null);
        setAnswers({});
        setStep(0);
    }

    return (
        <>
            <Head title={`${quiz.title} · ${lesson.title} · ${level}`} />

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
                    activeQuiz
                />

                <div className="mt-8 grid gap-8 lg:mt-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
                    <LessonSidebarColumn
                        level={level}
                        modules={modules}
                        activeModuleId={module.id}
                        activeLessonId={lesson.id}
                        activeQuizId={lesson.id}
                    />

                    <div className="min-w-0 flex-1">
                        <header className="border-b border-border pb-6">
                            <p className="text-xs font-bold tracking-[.2em] text-primary uppercase">
                                {level} · Module{' '}
                                {String(moduleNumber).padStart(2, '0')} · Leçon{' '}
                                {String(lessonNumber).padStart(2, '0')}
                            </p>
                            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                                {quiz.title}
                            </h1>
                            <div className="mt-4 flex flex-wrap items-center gap-4">
                                <p className="text-sm text-muted-foreground">
                                    {questions.length} question
                                    {questions.length > 1 ? 's' : ''} pour
                                    vérifier ce que tu as retenu de la leçon «{' '}
                                    {lesson.title} ».
                                </p>
                                {bestScore !== null && (
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Meilleur score : {bestScore}/
                                        {questions.length}
                                    </span>
                                )}
                            </div>
                            <Link
                                href={lessonShow.url({
                                    module: module.id,
                                    lesson: lesson.id,
                                })}
                                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                            >
                                <ArrowLeft className="size-4" />
                                Retour à la leçon
                            </Link>
                        </header>

                        <div className="mt-6">
                            {/* Barre de progression : cliquable pour se déplacer. */}
                            <div className="flex items-center gap-3">
                                <p className="shrink-0 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    {isCorrecting
                                        ? `Question ${step + 1} / ${questions.length}`
                                        : answered === questions.length
                                          ? 'Dernière question'
                                          : `Question ${step + 1} / ${questions.length}`}
                                </p>
                                <div className="flex flex-1 gap-1.5">
                                    {questions.map((question, index) => (
                                        <button
                                            key={question.id}
                                            type="button"
                                            aria-label={`Aller à la question ${index + 1}`}
                                            disabled={
                                                !isCorrecting && index > step
                                            }
                                            onClick={() => setStep(index)}
                                            className={cn(
                                                'h-1.5 flex-1 rounded-full transition-colors',
                                                isCorrecting
                                                    ? 'cursor-pointer bg-primary/80 hover:bg-primary'
                                                    : index < step ||
                                                        answers[question.id]
                                                      ? 'cursor-pointer bg-primary'
                                                      : index === step
                                                        ? 'bg-primary/40'
                                                        : 'bg-muted',
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Carte score, une fois la correction rendue. */}
                            {result && (
                                <div
                                    role="status"
                                    className="mt-5 rounded-2xl border border-primary/30 bg-primary/5 p-5"
                                >
                                    <div className="flex flex-wrap items-center gap-3">
                                        <CheckCircle2 className="size-6 text-primary" />
                                        <h2 className="font-display text-xl font-semibold">
                                            Résultat : {result.score}/
                                            {result.total}
                                        </h2>
                                        <span className="text-sm text-muted-foreground">
                                            Meilleur score : {result.bestScore}/
                                            {result.total}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {result.score === result.total
                                            ? 'Sans faute, bravo !'
                                            : 'Voici la correction : navigue d’une question à l’autre pour tout revoir.'}
                                    </p>
                                </div>
                            )}

                            <fieldset
                                key={current.id}
                                className="mt-6 rounded-2xl border border-border p-5 sm:p-6"
                            >
                                <legend className="px-2 font-display text-lg font-semibold">
                                    {step + 1}. {current.prompt}
                                </legend>

                                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                                    {Object.entries(current.options).map(
                                        ([optionKey, label]) => {
                                            if (correction) {
                                                const isRightOption =
                                                    correction.correct ===
                                                    optionKey;
                                                const isChosen =
                                                    correction.selected ===
                                                    optionKey;

                                                return (
                                                    <div
                                                        key={optionKey}
                                                        className={cn(
                                                            'flex items-center gap-3 rounded-xl border p-4',
                                                            isRightOption
                                                                ? 'border-primary bg-primary/5'
                                                                : isChosen
                                                                  ? 'border-destructive bg-destructive/5'
                                                                  : 'border-border',
                                                        )}
                                                    >
                                                        {isRightOption ? (
                                                            <CheckCircle2 className="size-4 shrink-0 text-primary" />
                                                        ) : isChosen ? (
                                                            <XCircle className="size-4 shrink-0 text-destructive" />
                                                        ) : (
                                                            <Circle className="size-4 shrink-0 text-muted-foreground/40" />
                                                        )}
                                                        <span
                                                            className={
                                                                isRightOption ||
                                                                isChosen
                                                                    ? 'font-medium'
                                                                    : 'text-muted-foreground'
                                                            }
                                                        >
                                                            {label}
                                                        </span>
                                                        {(isRightOption ||
                                                            isChosen) && (
                                                            <span
                                                                className={cn(
                                                                    'ml-auto shrink-0 text-[10px] font-bold tracking-wider uppercase',
                                                                    isRightOption
                                                                        ? 'text-primary'
                                                                        : 'text-destructive',
                                                                )}
                                                            >
                                                                {isRightOption
                                                                    ? 'Bonne réponse'
                                                                    : 'Ta réponse'}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            }

                                            return (
                                                <label
                                                    key={optionKey}
                                                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 has-checked:border-primary has-checked:bg-primary/5"
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`answers[${current.id}]`}
                                                        value={optionKey}
                                                        checked={
                                                            answers[
                                                                current.id
                                                            ] === optionKey
                                                        }
                                                        onChange={() =>
                                                            setAnswers(
                                                                (previous) => ({
                                                                    ...previous,
                                                                    [current.id]:
                                                                        optionKey,
                                                                }),
                                                            )
                                                        }
                                                        className="accent-primary"
                                                    />
                                                    <span>{label}</span>
                                                </label>
                                            );
                                        },
                                    )}
                                </div>

                                {correction?.explanation && (
                                    <p className="mt-4 text-sm text-muted-foreground">
                                        {correction.explanation}
                                    </p>
                                )}

                                {questionError && (
                                    <p className="mt-3 text-sm text-destructive">
                                        {questionError}
                                    </p>
                                )}
                            </fieldset>

                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    disabled={step === 0 || processing}
                                    onClick={() =>
                                        setStep((currentStep) =>
                                            Math.max(0, currentStep - 1),
                                        )
                                    }
                                >
                                    <ArrowLeft className="size-4" />
                                    Précédent
                                </Button>

                                {isCorrecting ? (
                                    step < questions.length - 1 ? (
                                        <Button
                                            size="lg"
                                            className="rounded-full"
                                            onClick={() =>
                                                setStep(
                                                    (currentStep) =>
                                                        currentStep + 1,
                                                )
                                            }
                                        >
                                            Suivant
                                        </Button>
                                    ) : (
                                        <Button
                                            size="lg"
                                            variant="secondary"
                                            className="rounded-full"
                                            onClick={restart}
                                        >
                                            <RotateCcw className="size-4" />
                                            Recommencer
                                        </Button>
                                    )
                                ) : step < questions.length - 1 ? (
                                    <Button
                                        size="lg"
                                        className="rounded-full"
                                        disabled={
                                            !answers[current.id] || processing
                                        }
                                        onClick={() =>
                                            setStep(
                                                (currentStep) =>
                                                    currentStep + 1,
                                            )
                                        }
                                    >
                                        Suivant
                                    </Button>
                                ) : (
                                    <Button
                                        size="lg"
                                        className="rounded-full"
                                        disabled={
                                            !answers[current.id] || processing
                                        }
                                        onClick={submitAnswers}
                                    >
                                        <ListChecks className="size-4" />
                                        {processing
                                            ? 'Correction en cours…'
                                            : 'Corriger mes réponses'}
                                    </Button>
                                )}

                                {!isCorrecting &&
                                    !answers[current.id] &&
                                    step === questions.length - 1 && (
                                        <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <CircleDashed className="size-4" />
                                            Choisis une réponse pour terminer.
                                        </p>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
