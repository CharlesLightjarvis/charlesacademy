import { Form, Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from 'lucide-react';
import QuizController from '@/actions/App/Http/Controllers/Admin/QuizController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard as adminDashboard } from '@/routes/admin';
import {
    edit as moduleEdit,
    index as adminModulesIndex,
} from '@/routes/admin/modules';
import { edit as lessonEdit } from '@/routes/admin/modules/lessons';
import { edit as quizEdit } from '@/routes/admin/modules/lessons/quiz';
import { reorder as questionReorder } from '@/routes/admin/modules/lessons/quiz/questions';
import type { Lesson } from '@/types/lesson';
import type { Module } from '@/types/module';
import DeleteQuestionDialog from './partials/delete-question-dialog';
import QuestionDialog from './partials/question-dialog';

export type QuizQuestion = {
    id: number;
    prompt: string;
    options: Record<string, string>;
    correct_option: string;
    explanation: string | null;
};

type Props = {
    module: Module;
    lesson: Lesson;
    quiz: { title: string | null; is_active: boolean } | null;
    questions: QuizQuestion[];
};

export default function LessonQuiz({ module, lesson, quiz, questions }: Props) {
    const [questionDialog, setQuestionDialog] = useState<
        QuizQuestion | 'create' | null
    >(null);
    const [questionToDelete, setQuestionToDelete] =
        useState<QuizQuestion | null>(null);

    function moveQuestion(index: number, delta: -1 | 1) {
        const target = index + delta;

        if (target < 0 || target >= questions.length) {
            return;
        }

        const reordered = [...questions];
        [reordered[index], reordered[target]] = [
            reordered[target],
            reordered[index],
        ];

        router.patch(
            questionReorder.url({
                module: module.id,
                lesson: lesson.id,
            }),
            { ids: reordered.map((question) => question.id) },
            { preserveScroll: true },
        );
    }

    return (
        <>
            <Head title={`Quiz — ${lesson.title} — ${module.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Quiz de « {lesson.title} »
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Dans le module {module.name} — un petit quiz en fin de
                        leçon, corrigé question par question.
                    </p>
                </div>

                {/* Pas de quiz encore : formulaire de création. */}
                {quiz === null ? (
                    <Form
                        {...QuizController.store.form({
                            module: module.id,
                            lesson: lesson.id,
                        })}
                        options={{ preserveScroll: true }}
                        className="mx-auto w-full max-w-xl space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <p className="text-sm text-muted-foreground">
                                    Cette leçon n'a pas encore de quiz :
                                    donne-lui un titre, puis ajoute ses
                                    questions.
                                </p>

                                <div className="grid gap-2">
                                    <Label htmlFor="title">Titre</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        required
                                        autoComplete="off"
                                        placeholder="Ex. Vérifie ce que tu as retenu"
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={errors.title}
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button disabled={processing}>
                                        Créer le quiz
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        disabled={processing}
                                        asChild
                                    >
                                        <Link
                                            href={moduleEdit.url(module.id, {
                                                query: { tab: 'lecons' },
                                            })}
                                        >
                                            Annuler
                                        </Link>
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                ) : (
                    <>
                        {/* Réglages du quiz. */}
                        <Form
                            {...QuizController.update.form({
                                module: module.id,
                                lesson: lesson.id,
                            })}
                            options={{ preserveScroll: true }}
                            className="mx-auto w-full max-w-xl space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="title">Titre</Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            required
                                            autoComplete="off"
                                            defaultValue={quiz.title ?? ''}
                                        />
                                        <InputError
                                            className="mt-2"
                                            message={errors.title}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="is_active"
                                            name="is_active"
                                            value="1"
                                            defaultChecked={quiz.is_active}
                                        />
                                        <Label htmlFor="is_active">
                                            Quiz visible par les élèves
                                        </Label>
                                    </div>
                                    <InputError
                                        className="mt-2"
                                        message={errors.is_active}
                                    />

                                    <div className="flex items-center gap-4">
                                        <Button disabled={processing}>
                                            Enregistrer
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            disabled={processing}
                                            asChild
                                        >
                                            <Link
                                                href={moduleEdit.url(
                                                    module.id,
                                                    {
                                                        query: {
                                                            tab: 'lecons',
                                                        },
                                                    },
                                                )}
                                            >
                                                Annuler
                                            </Link>
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>

                        {/* Liste des questions. */}
                        <section className="mx-auto w-full max-w-xl rounded-xl border border-border p-6">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2 className="font-display text-lg font-semibold">
                                        Questions ({questions.length})
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        La bonne réponse est surlignée ; les
                                        élèves la voient après correction.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setQuestionDialog('create')}
                                >
                                    <Plus className="size-4" />
                                    Ajouter une question
                                </Button>
                            </div>

                            {questions.length === 0 ? (
                                <p className="mt-6 text-sm text-muted-foreground">
                                    Aucune question pour l'instant : ajoute la
                                    première.
                                </p>
                            ) : (
                                <ol className="mt-6 space-y-3">
                                    {questions.map((question, index) => (
                                        <li
                                            key={question.id}
                                            className="flex items-start gap-3 rounded-xl border border-border p-4"
                                        >
                                            <span className="mt-0.5 font-mono text-xs text-muted-foreground">
                                                {String(index + 1).padStart(
                                                    2,
                                                    '0',
                                                )}
                                            </span>

                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium">
                                                    {question.prompt}
                                                </p>
                                                <div className="mt-2 flex flex-wrap gap-1.5">
                                                    {Object.entries(
                                                        question.options,
                                                    ).map(([key, label]) => (
                                                        <Badge
                                                            key={key}
                                                            variant={
                                                                key ===
                                                                question.correct_option
                                                                    ? 'default'
                                                                    : 'secondary'
                                                            }
                                                        >
                                                            {key.toUpperCase()}.{' '}
                                                            {label}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                {question.explanation && (
                                                    <p className="mt-2 text-xs text-muted-foreground">
                                                        {question.explanation}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex shrink-0 items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8"
                                                    disabled={index === 0}
                                                    aria-label="Monter la question"
                                                    onClick={() =>
                                                        moveQuestion(index, -1)
                                                    }
                                                >
                                                    <ChevronUp className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8"
                                                    disabled={
                                                        index ===
                                                        questions.length - 1
                                                    }
                                                    aria-label="Descendre la question"
                                                    onClick={() =>
                                                        moveQuestion(index, 1)
                                                    }
                                                >
                                                    <ChevronDown className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8"
                                                    aria-label="Modifier la question"
                                                    onClick={() =>
                                                        setQuestionDialog(
                                                            question,
                                                        )
                                                    }
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 text-destructive hover:text-destructive"
                                                    aria-label="Supprimer la question"
                                                    onClick={() =>
                                                        setQuestionToDelete(
                                                            question,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </section>
                    </>
                )}
            </div>

            <QuestionDialog
                module={module}
                lesson={lesson}
                question={questionDialog}
                onClose={() => setQuestionDialog(null)}
            />
            <DeleteQuestionDialog
                module={module}
                lesson={lesson}
                question={questionToDelete}
                onClose={() => setQuestionToDelete(null)}
            />
        </>
    );
}

LessonQuiz.layout = ({ module, lesson }: Props) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: adminDashboard() },
        { title: 'Modules', href: adminModulesIndex() },
        {
            title: module.name,
            href: moduleEdit.url(module.id, { query: { tab: 'lecons' } }),
        },
        {
            title: lesson.title,
            href: lessonEdit.url({ module: module.id, lesson: lesson.id }),
        },
        {
            title: 'Quiz',
            href: quizEdit.url({ module: module.id, lesson: lesson.id }),
        },
    ],
});
