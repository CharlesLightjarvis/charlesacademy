import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Circle,
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
import {
    submit as quizSubmit,
    validate as quizValidate,
} from '@/routes/learner/learn/lesson/quiz';
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
    const [corrections, setCorrections] = useState<Record<string, Correction>>(
        {},
    );
    const [validating, setValidating] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [result, setResult] = useState<QuizResult | null>(null);
    const { post, processing, errors, transform } = useForm();

    // La correction finale revient par le flash après la soumission.
    useEffect(() => {
        if (flash?.quizResult) {
            setResult(flash.quizResult);
        }
    }, [flash?.quizResult]);

    const current = questions[step];
    // Chaque réponse est corrigée au fil du eau ; après la soumission, le
    // flash complète les corrections (la page vient d'être rechargée).
    const correction =
        corrections[current.id] ?? result?.corrections[current.id];
    const isReviewing = result !== null;
    const bestScore = result?.bestScore ?? initialBestScore;
    const isLastQuestion = step === questions.length - 1;
    const questionError = (errors as Record<string, string | undefined>)[
        `answers.${current.id}`
    ];

    /**
     * Envoie la réponse choisie au serveur, qui la corrige tout de suite :
     * vert si elle est bonne, sinon notre choix passe en rouge et la bonne
     * proposition en vert. La question est ensuite verrouillée.
     */
    async function validateCurrentAnswer() {
        const selected = answers[current.id];

        if (!selected || validating) {
            return;
        }

        setValidating(true);
        setValidationError(null);

        try {
            const response = await fetch(
                quizValidate.url({ module: module.id, lesson: lesson.id }),
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') ?? '',
                    },
                    body: JSON.stringify({
                        question_id: current.id,
                        answer: selected,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error('La validation a échoué.');
            }

            const validated: Correction = await response.json();

            setCorrections((previous) => ({
                ...previous,
                [current.id]: validated,
            }));
        } catch {
            setValidationError('La vérification a échoué, réessaie.');
        } finally {
            setValidating(false);
        }
    }

    /**
     * Toutes les réponses sont verrouillées : on les renvoie au serveur qui
     * calcule et enregistre le score.
     */
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
        setCorrections({});
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
                                    Question {step + 1} / {questions.length}
                                </p>
                                <div className="flex flex-1 gap-1.5">
                                    {questions.map((question, index) => {
                                        const questionCorrection =
                                            corrections[question.id] ??
                                            result?.corrections[question.id];

                                        return (
                                            <button
                                                key={question.id}
                                                type="button"
                                                aria-label={`Aller à la question ${index + 1}`}
                                                disabled={
                                                    !isReviewing && index > step
                                                }
                                                onClick={() => setStep(index)}
                                                className={cn(
                                                    'h-1.5 flex-1 rounded-full transition-colors',
                                                    questionCorrection
                                                        ? questionCorrection.is_correct
                                                            ? 'cursor-pointer bg-success hover:opacity-80'
                                                            : 'cursor-pointer bg-destructive hover:opacity-80'
                                                        : index < step ||
                                                            answers[question.id]
                                                          ? 'cursor-pointer bg-primary hover:bg-primary/80'
                                                          : index === step
                                                            ? 'bg-primary/40'
                                                            : 'bg-muted',
                                                )}
                                            />
                                        );
                                    })}
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

                            {/* Question centrée, sans carte : les propositions
                                occupent toute la largeur, deux par ligne. */}
                            <div key={current.id} className="mt-8">
                                <p className="text-center font-display text-lg font-semibold sm:text-xl">
                                    <span className="text-primary">
                                        {step + 1}.
                                    </span>{' '}
                                    {current.prompt}
                                </p>

                                <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3">
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
                                                            'flex items-center gap-2.5 rounded-xl border p-3 sm:p-4',
                                                            isRightOption
                                                                ? 'border-success bg-success/10'
                                                                : isChosen
                                                                  ? 'border-destructive bg-destructive/10'
                                                                  : 'border-border',
                                                        )}
                                                    >
                                                        {isRightOption ? (
                                                            <CheckCircle2 className="size-4 shrink-0 text-success" />
                                                        ) : isChosen ? (
                                                            <XCircle className="size-4 shrink-0 text-destructive" />
                                                        ) : (
                                                            <Circle className="size-4 shrink-0 text-muted-foreground/40" />
                                                        )}
                                                        <span
                                                            className={cn(
                                                                'min-w-0 text-sm leading-snug',
                                                                isRightOption
                                                                    ? 'font-medium text-success'
                                                                    : isChosen
                                                                      ? 'font-medium text-destructive'
                                                                      : 'text-muted-foreground',
                                                            )}
                                                        >
                                                            {label}
                                                        </span>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <label
                                                    key={optionKey}
                                                    className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border p-3 transition-colors has-checked:border-primary has-checked:bg-primary/5 sm:p-4"
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
                                                    <span className="min-w-0 text-sm leading-snug">
                                                        {label}
                                                    </span>
                                                </label>
                                            );
                                        },
                                    )}
                                </div>

                                {correction?.explanation && (
                                    <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-muted-foreground">
                                        {correction.explanation}
                                    </p>
                                )}

                                {questionError && (
                                    <p className="mt-3 text-center text-sm text-destructive">
                                        {questionError}
                                    </p>
                                )}

                                {validationError && (
                                    <p className="mt-3 text-center text-sm text-destructive">
                                        {validationError}
                                    </p>
                                )}
                            </div>

                            {/* Un seul bouton centré : il valide la réponse,
                                puis guide jusqu'au résultat. */}
                            <div className="mt-7 flex flex-col items-center gap-3">
                                {/* Verdict au-dessus du bouton, dès la
                                    correction de la question : même style que
                                    le badge Quiz de la sidebar (fond teinté
                                    léger + texte coloré). */}
                                {correction && (
                                    <p
                                        className={cn(
                                            'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold',
                                            correction.is_correct
                                                ? 'bg-success/10 text-success'
                                                : 'bg-destructive/10 text-destructive',
                                        )}
                                    >
                                        {correction.is_correct ? (
                                            <CheckCircle2 className="size-4" />
                                        ) : (
                                            <XCircle className="size-4" />
                                        )}
                                        {correction.is_correct
                                            ? 'Bonne réponse !'
                                            : 'Mauvaise réponse'}
                                    </p>
                                )}

                                {isReviewing ? (
                                    <Button
                                        size="lg"
                                        className="rounded-full px-8"
                                        onClick={restart}
                                    >
                                        <RotateCcw className="size-4" />
                                        Recommencer
                                    </Button>
                                ) : correction ? (
                                    isLastQuestion ? (
                                        <Button
                                            size="lg"
                                            className="rounded-full px-8"
                                            disabled={processing}
                                            onClick={submitAnswers}
                                        >
                                            <CheckCircle2 className="size-4" />
                                            {processing
                                                ? 'Correction en cours…'
                                                : 'Voir mon résultat'}
                                        </Button>
                                    ) : (
                                        <Button
                                            size="lg"
                                            className="rounded-full px-8"
                                            onClick={() =>
                                                setStep(
                                                    (currentStep) =>
                                                        currentStep + 1,
                                                )
                                            }
                                        >
                                            Question suivante
                                            <ArrowRight className="size-4" />
                                        </Button>
                                    )
                                ) : (
                                    <Button
                                        size="lg"
                                        className="rounded-full px-8"
                                        disabled={
                                            !answers[current.id] || validating
                                        }
                                        onClick={validateCurrentAnswer}
                                    >
                                        <ListChecks className="size-4" />
                                        {validating
                                            ? 'Vérification…'
                                            : 'Valider votre réponse'}
                                    </Button>
                                )}

                                {!isReviewing &&
                                    !correction &&
                                    !answers[current.id] && (
                                        <p className="text-sm text-muted-foreground">
                                            Choisis une réponse pour valider.
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
