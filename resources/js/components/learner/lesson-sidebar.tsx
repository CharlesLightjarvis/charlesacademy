import { Link } from '@inertiajs/react';
import { LockKeyhole, PlayCircle } from 'lucide-react';
import type { LearnModule } from '@/types/learn';
import { show as lessonShow } from '@/routes/learner/learn/lesson';
import { cn } from '@/lib/utils';

type Props = {
    modules: LearnModule[];
    activeModuleId: string;
    activeLessonId: string;
};

export function LessonSidebar({
    modules,
    activeModuleId,
    activeLessonId,
}: Props) {
    const lessonHref = (
        module: LearnModule,
        lesson: { id: string; available: boolean },
    ) =>
        lesson.available
            ? lessonShow.url({ module: module.id, lesson: lesson.id })
            : undefined;

    return (
        <nav
            aria-label="Naviguer entre les leçons"
            className="sticky top-24 hidden max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-card/50 p-3 lg:block"
        >
            <p className="px-3 pt-1 pb-3 text-[10px] font-semibold tracking-[0.18em] text-primary uppercase">
                Parcours du niveau
            </p>
            {modules.map((module, moduleIndex) => {
                const isModuleActive = module.id === activeModuleId;

                return (
                    <div key={module.id} className="mb-4">
                        <p
                            className={cn(
                                'px-3 pb-2 font-display text-sm font-semibold',
                                isModuleActive
                                    ? 'text-foreground'
                                    : 'text-muted-foreground',
                            )}
                        >
                            <span className="mr-2 font-mono text-xs text-muted-foreground">
                                {String(moduleIndex + 1).padStart(2, '0')}
                            </span>
                            {module.title}
                        </p>

                        <ul>
                            {module.lessons.map((lesson) => {
                                const isLessonActive =
                                    isModuleActive &&
                                    lesson.id === activeLessonId;
                                const isReady = lesson.available;
                                const href = lessonHref(module, lesson);

                                return (
                                    <li key={lesson.id}>
                                        {href ? (
                                            <Link
                                                href={href}
                                                className={cn(
                                                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                                                    isLessonActive
                                                        ? 'bg-primary/10 font-semibold text-primary'
                                                        : isReady
                                                          ? 'text-foreground hover:bg-muted hover:text-primary'
                                                          : 'text-muted-foreground/60',
                                                )}
                                                aria-current={
                                                    isLessonActive
                                                        ? 'page'
                                                        : undefined
                                                }
                                            >
                                                <span
                                                    className={cn(
                                                        'flex size-7 shrink-0 items-center justify-center rounded-full border',
                                                        isLessonActive
                                                            ? 'border-primary bg-primary text-primary-foreground'
                                                            : isReady
                                                              ? 'border-primary/40 bg-primary/5 text-primary'
                                                              : 'border-border bg-muted/50 text-muted-foreground',
                                                    )}
                                                >
                                                    {isReady ? (
                                                        <PlayCircle className="size-4" />
                                                    ) : (
                                                        <LockKeyhole className="size-3.5" />
                                                    )}
                                                </span>
                                                <span className="min-w-0 truncate">
                                                    {lesson.title}
                                                </span>
                                            </Link>
                                        ) : (
                                            <span
                                                aria-disabled="true"
                                                className={cn(
                                                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm select-none',
                                                    isLessonActive
                                                        ? 'bg-primary/10 font-semibold text-primary'
                                                        : 'text-muted-foreground/60',
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        'flex size-7 shrink-0 items-center justify-center rounded-full border',
                                                        isLessonActive
                                                            ? 'border-primary bg-primary text-primary-foreground'
                                                            : isReady
                                                              ? 'border-primary/40 bg-primary/5 text-primary'
                                                              : 'border-border bg-muted/50 text-muted-foreground',
                                                    )}
                                                >
                                                    {isReady ? (
                                                        <PlayCircle className="size-4" />
                                                    ) : (
                                                        <LockKeyhole className="size-3.5" />
                                                    )}
                                                </span>
                                                <span className="min-w-0 truncate">
                                                    {lesson.title}
                                                </span>
                                            </span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                );
            })}
        </nav>
    );
}
