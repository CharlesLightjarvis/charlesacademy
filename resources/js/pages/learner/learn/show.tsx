import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    CircleDashed,
    ListChecks,
} from 'lucide-react';
import { useState } from 'react';
import { LessonSidebarColumn } from '@/components/learner/lesson-sidebar-column';
import { LessonSidebarSelect } from '@/components/learner/lesson-sidebar-select';
import { MdxContent } from '@/components/learner/mdx-content';
import { Button } from '@/components/ui/button';
import { index as learnIndex } from '@/routes/learner/learn';
import { read as lessonRead } from '@/routes/learner/learn/lesson';
import { show as quizShow } from '@/routes/learner/learn/lesson/quiz';
import type { LearnModule } from '@/types/learn';

type Props = {
    level: string;
    module: { id: string; title: string };
    lesson: { id: string; title: string; introduction: string };
    moduleNumber: number;
    lessonNumber: number;
    mdx: string | null;
    quiz: { title: string; length: number; bestScore: number | null } | null;
    modules: LearnModule[];
    isRead: boolean;
};

export default function LessonShow({
    level,
    module,
    lesson,
    moduleNumber,
    lessonNumber,
    mdx,
    quiz,
    modules,
    isRead: initialIsRead,
}: Props) {
    const [isRead, setIsRead] = useState(initialIsRead);
    const [isTogglingRead, setIsTogglingRead] = useState(false);

    function toggleReadStatus() {
        setIsRead((current) => !current);
        router.patch(
            lessonRead.url({ module: module.id, lesson: lesson.id }),
            {},
            {
                preserveScroll: true,
                only: ['isRead'],
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
                    <LessonSidebarColumn
                        level={level}
                        modules={modules}
                        activeModuleId={module.id}
                        activeLessonId={lesson.id}
                    />

                    <div className="min-w-0 flex-1">
                        <header className="border-b border-border pb-6">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-xs font-bold tracking-[.2em] text-primary uppercase">
                                        {level} · Module{' '}
                                        {String(moduleNumber).padStart(2, '0')}{' '}
                                        · Leçon{' '}
                                        {String(lessonNumber).padStart(2, '0')}
                                    </p>
                                    <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                                        {lesson.title}
                                    </h1>
                                    <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground lg:text-lg">
                                        {lesson.introduction}
                                    </p>
                                </div>

                                <Button
                                    variant={isRead ? 'secondary' : 'default'}
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

                        <div className="mt-8">
                            {mdx ? (
                                <MdxContent source={mdx} />
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Le contenu de cette leçon arrive bientôt.
                                </p>
                            )}
                        </div>

                        {quiz && (
                            <section
                                aria-labelledby="exercise-heading"
                                className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-5"
                            >
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
                                    {quiz.length} question
                                    {quiz.length > 1 ? 's' : ''} · Tu peux
                                    recommencer autant de fois que tu veux ; ton
                                    meilleur score reste enregistré.
                                    {quiz.bestScore !== null &&
                                        ` Meilleur score : ${quiz.bestScore}/${quiz.length}.`}
                                </p>
                                <Button
                                    size="lg"
                                    className="mt-4 rounded-full"
                                    asChild
                                >
                                    <Link
                                        href={quizShow.url({
                                            module: module.id,
                                            lesson: lesson.id,
                                        })}
                                    >
                                        <ListChecks className="size-4" />
                                        {quiz.bestScore !== null
                                            ? 'Refaire le quiz'
                                            : 'Faire le quiz'}
                                    </Link>
                                </Button>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
