import { Form, Head, Link, router, usePage } from '@inertiajs/react';
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
    return new URLSearchParams(url.split('?')[1] ?? '').get('tab') === 'lecons'
        ? 'lecons'
        : 'infos';
}

export default function ModuleEdit({ module, levels, lessons }: Props) {
    // L'URL est l'unique source de vérité de l'onglet : elle est écrite par
    // Inertia dans l'entrée d'historique, donc le retour/avant du navigateur
    // restaure le bon onglet, sans décalage ni flash.
    const { url } = usePage();
    const tab = readTabFromUrl(url);

    function handleTabChange(value: string) {
        const next = value as TabValue;

        if (next === tab) {
            return;
        }

        // Vrai passage par Inertia (et non `history.replaceState`, qu'Inertia
        // n'enregistre pas dans l'entrée d'historique) : le serveur renvoie
        // la même page avec la bonne URL, déjà chargée par le contrôleur.
        // `replace` évite d'empiler une entrée d'historique par onglet.
        router.get(
            next === 'lecons'
                ? adminModulesEdit.url(module.id, { query: { tab: 'lecons' } })
                : adminModulesEdit.url(module.id),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
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
                    <TabsList className="mx-auto w-full max-w-xl">
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
