import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { LessonSidebar } from '@/components/learner/lesson-sidebar';
import { index as learnIndex } from '@/routes/learner/learn';
import type { LearnModule } from '@/types/learn';

type Props = {
    level: string;
    modules: LearnModule[];
    activeModuleId: string;
    activeLessonId: string;
    /** Slug de la leçon dont le quiz est affiché (null = page de leçon). */
    activeQuizId?: string | null;
};

/**
 * Colonne de gauche des pages de leçon et de quiz : le retour vers les
 * modules juste au-dessus du parcours, et le tout reste collé au scroll.
 * Le bouton de retour ne défile jamais — seule la liste défile en interne.
 */
export function LessonSidebarColumn({
    level,
    modules,
    activeModuleId,
    activeLessonId,
    activeQuizId = null,
}: Props) {
    return (
        <aside className="hidden lg:block">
            <div className="sticky top-24">
                <Link
                    href={learnIndex()}
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
                >
                    <ArrowLeft className="size-4" />
                    Modules {level}
                </Link>

                <div className="mt-3 max-h-[calc(100dvh-9rem)] overflow-y-auto overscroll-contain">
                    <LessonSidebar
                        modules={modules}
                        activeModuleId={activeModuleId}
                        activeLessonId={activeLessonId}
                        activeQuizId={activeQuizId}
                    />
                </div>
            </div>
        </aside>
    );
}
