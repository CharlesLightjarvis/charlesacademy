import { LockKeyhole, PlayCircle } from 'lucide-react';
import { router } from '@inertiajs/react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { LearnModule } from '@/types/learn';
import { show as lessonShow } from '@/routes/learner/learn/lesson';

type Props = {
    modules: LearnModule[];
    activeModuleId: string;
    activeLessonId: string;
};

export function LessonSidebarSelect({
    modules,
    activeModuleId,
    activeLessonId,
}: Props) {
    const activeModule = modules.find((module) => module.id === activeModuleId);
    const activeLesson = activeModule?.lessons.find(
        (lesson) => lesson.id === activeLessonId,
    );

    function selectLesson(value: string) {
        const [moduleSlug, lessonSlug] = value.split(':');
        const module = modules.find((item) => item.id === moduleSlug);
        const lesson = module?.lessons.find(
            (item) => item.id === lessonSlug,
        );

        if (module && lesson?.available) {
            router.visit(
                lessonShow.url({ module: module.id, lesson: lesson.id }),
                { preserveScroll: false },
            );
        }
    }

    return (
        <div className="lg:hidden" aria-label="Naviguer entre les leçons">
            <Select
                value={`${activeModuleId}:${activeLessonId}`}
                onValueChange={selectLesson}
            >
                <SelectTrigger
                    aria-label="Choisir une leçon"
                    className="!h-auto w-full min-w-0 rounded-xl border-primary/30 bg-primary/10 px-4 py-3 text-left shadow-sm transition-colors hover:border-primary/50 hover:bg-primary/15 focus-visible:ring-primary/30 [&>svg]:text-primary"
                >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        {activeLesson?.available ? (
                            <PlayCircle className="size-5 shrink-0 text-primary" />
                        ) : (
                            <LockKeyhole className="size-5 shrink-0 text-muted-foreground" />
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold tracking-[0.18em] text-primary uppercase">
                                Leçon
                            </p>
                            <p className="mt-0.5 truncate font-display text-sm font-semibold">
                                <SelectValue placeholder="Choisir une leçon" />
                            </p>
                        </div>
                    </div>
                </SelectTrigger>

                <SelectContent
                    position="popper"
                    className="max-h-[min(420px,60dvh)] min-w-[var(--radix-select-trigger-width)]"
                >
                    {modules.map((module) => (
                        <SelectGroup key={module.id}>
                            <SelectLabel className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                {module.title}
                            </SelectLabel>
                            {module.lessons.map((lesson) => {
                                const value = `${module.id}:${lesson.id}`;

                                return (
                                    <SelectItem
                                        key={lesson.id}
                                        value={value}
                                        disabled={!lesson.available}
                                        className="py-2.5"
                                    >
                                        <span className="flex min-w-0 items-center gap-2">
                                            {lesson.available ? (
                                                <PlayCircle className="size-4 shrink-0 text-primary" />
                                            ) : (
                                                <LockKeyhole className="size-3.5 shrink-0 text-muted-foreground" />
                                            )}
                                            <span className="truncate">
                                                {lesson.title}
                                            </span>
                                        </span>
                                    </SelectItem>
                                );
                            })}
                        </SelectGroup>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
