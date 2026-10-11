import { Form, Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import LessonController from '@/actions/App/Http/Controllers/Admin/LessonController';
import { Button } from '@/components/ui/button';
import { dashboard as adminDashboard } from '@/routes/admin';
import {
    edit as moduleEdit,
    index as adminModulesIndex,
} from '@/routes/admin/modules';
import { edit as lessonEdit } from '@/routes/admin/modules/lessons';
import type { Lesson } from '@/types/lesson';
import type { Module } from '@/types/module';
import LessonFormFields from '../partials/lesson-form-fields';

type Props = {
    module: Module;
    lesson: Lesson;
};

export default function LessonEdit({ module, lesson }: Props) {
    const [content, setContent] = useState(lesson.content ?? '');

    return (
        <>
            <Head title={`Modifier ${lesson.title} — ${module.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {lesson.title}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Dans le module {module.name} — le slug reste celui
                        généré à la création.
                    </p>
                </div>

                <Form
                    {...LessonController.update.form({
                        module: module.id,
                        lesson: lesson.id,
                    })}
                    options={{ preserveScroll: true }}
                    className="w-full space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <LessonFormFields
                                errors={errors}
                                defaultValues={lesson}
                                content={content}
                                onContentChange={setContent}
                            />

                            <div className="mx-auto flex w-full max-w-4xl items-center gap-4">
                                <Button disabled={processing}>
                                    Enregistrer
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
            </div>
        </>
    );
}

LessonEdit.layout = ({ module, lesson }: Props) => ({
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
    ],
});
