import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ModuleController from '@/actions/App/Http/Controllers/Admin/ModuleController';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dashboard as adminDashboard } from '@/routes/admin';
import {
    edit as adminModulesEdit,
    index as adminModulesIndex,
} from '@/routes/admin/modules';
import type { Lesson } from '@/types/lesson';
import type { Level } from '@/types/level';
import type { Module } from '@/types/module';
import LessonList from './partials/lesson-list';
import ModuleFormFields from './partials/module-form-fields';

type Props = {
    module: Module;
    levels: Level[];
    lessons: Lesson[];
};

type TabValue = 'infos' | 'lecons';

function readTabFromUrl(url: string): TabValue {
    const query = new URLSearchParams(url.split('?')[1] ?? '');

    return query.get('tab') === 'lecons' ? 'lecons' : 'infos';
}

export default function ModuleEdit({ module, levels, lessons }: Props) {
    const { url } = usePage();
    const [tab, setTab] = useState<TabValue>(() => readTabFromUrl(url));

    function handleTabChange(value: string) {
        const next = value as TabValue;

        setTab(next);

        // L'onglet actif vit dans l'URL, sans requête : les données des deux
        // onglets sont déjà chargées par le contrôleur.
        window.history.replaceState(
            window.history.state,
            '',
            next === 'lecons'
                ? `${window.location.pathname}?tab=lecons`
                : window.location.pathname,
        );
    }

    return (
        <>
            <Head title={`${module.name} — Administration`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {module.name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Le slug reste celui généré à la création — gère ici les
                        infos du module et ses leçons.
                    </p>
                </div>

                <Tabs value={tab} onValueChange={handleTabChange}>
                    <TabsList>
                        <TabsTrigger value="infos">Informations</TabsTrigger>
                        <TabsTrigger value="lecons">
                            Leçons ({lessons.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="infos">
                        <Form
                            {...ModuleController.update.form(module.id)}
                            options={{ preserveScroll: true }}
                            className="mx-auto w-full max-w-xl space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <ModuleFormFields
                                        errors={errors}
                                        defaultValues={module}
                                        levels={levels}
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
                                            <Link href={adminModulesIndex()}>
                                                Annuler
                                            </Link>
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </TabsContent>

                    <TabsContent value="lecons">
                        <LessonList module={module} lessons={lessons} />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}

ModuleEdit.layout = ({ module }: Props) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: adminDashboard() },
        { title: 'Modules', href: adminModulesIndex() },
        { title: module.name, href: adminModulesEdit.url(module.id) },
    ],
});
