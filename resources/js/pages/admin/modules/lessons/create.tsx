import { Form, Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import LessonController from '@/actions/App/Http/Controllers/Admin/LessonController';
import { Button } from '@/components/ui/button';
import { dashboard as adminDashboard } from '@/routes/admin';
import {
    edit as moduleEdit,
    index as adminModulesIndex,
} from '@/routes/admin/modules';
import { create as lessonCreate } from '@/routes/admin/modules/lessons';
import type { Module } from '@/types/module';
import LessonFormFields from '../partials/lesson-form-fields';

type Props = {
    module: Module;
};

export default function LessonCreate({ module }: Props) {
    const [content, setContent] = useState('');

    return (
        <>
            <Head title={`Nouvelle leçon — ${module.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Nouvelle leçon
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Dans le module {module.name} — le slug est généré depuis
                        le titre.
                    </p>
                </div>

                <Form
                    {...LessonController.store.form(module.id)}
                    options={{ preserveScroll: true }}
                    className="w-full space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <LessonFormFields
                                errors={errors}
                                content={content}
                                onContentChange={setContent}
                            />

                            <div className="mx-auto flex w-full max-w-4xl items-center gap-4">
                                <Button disabled={processing}>
                                    Créer la leçon
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

LessonCreate.layout = ({ module }: Props) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: adminDashboard() },
        { title: 'Modules', href: adminModulesIndex() },
        {
            title: module.name,
            href: moduleEdit.url(module.id, { query: { tab: 'lecons' } }),
        },
        { title: 'Nouvelle leçon', href: lessonCreate.url(module.id) },
    ],
});
