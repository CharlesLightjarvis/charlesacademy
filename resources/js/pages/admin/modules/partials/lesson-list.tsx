import { router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import {
    create as lessonCreate,
    reorder as lessonReorder,
} from '@/routes/admin/modules/lessons';
import type { Lesson } from '@/types/lesson';
import type { Module } from '@/types/module';
import DeleteLessonDialog from './delete-lesson-dialog';
import { createLessonColumns, LESSON_STATUS_OPTIONS } from './lesson-columns';

type Props = {
    module: Module;
    lessons: Lesson[];
};

export default function LessonList({ module, lessons }: Props) {
    const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
    // Local copy of the order: the drag & drop does not snap back while the
    // new order is being saved, and it rolls back if the request fails.
    const [orderedLessons, setOrderedLessons] = useState<Lesson[]>(lessons);

    useEffect(() => {
        setOrderedLessons(lessons);
    }, [lessons]);

    const columns = useMemo(
        () => createLessonColumns({ onDelete: setLessonToDelete }),
        [],
    );

    function handleRowReorder(ids: string[]) {
        const byId = new Map(
            lessons.map((lesson) => [String(lesson.id), lesson]),
        );
        const reordered = ids
            .map((id) => byId.get(id))
            .filter((lesson): lesson is Lesson => lesson !== undefined);

        setOrderedLessons(reordered);
        router.patch(
            lessonReorder.url(module.id),
            { ids: ids.map(Number) },
            { preserveScroll: true },
        );
    }

    return (
        <div className="space-y-4">
            <DataTable
                columns={columns}
                data={orderedLessons}
                enableRowReorder
                onRowReorder={handleRowReorder}
                actionButton={{
                    label: 'Nouvelle leçon',
                    onClick: () => router.visit(lessonCreate.url(module.id)),
                }}
                searchFilter={{
                    columnIds: ['title', 'slug', 'description'],
                    placeholder: 'Rechercher une leçon...',
                }}
                facetedFilters={[
                    {
                        columnId: 'is_active',
                        title: 'Statut',
                        options: LESSON_STATUS_OPTIONS,
                    },
                ]}
            />

            <DeleteLessonDialog
                module={module}
                lesson={lessonToDelete}
                onClose={() => setLessonToDelete(null)}
            />
        </div>
    );
}
