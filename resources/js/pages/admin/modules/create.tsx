import { Form, Head, Link } from '@inertiajs/react';
import ModuleController from '@/actions/App/Http/Controllers/Admin/ModuleController';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dashboard as adminDashboard } from '@/routes/admin';
import {
    create as adminModulesCreate,
    index as adminModulesIndex,
} from '@/routes/admin/modules';
import type { Level } from '@/types/level';
import ModuleFormFields from './partials/module-form-fields';

type Props = {
    levels: Level[];
};

export default function ModuleCreate({ levels }: Props) {
    return (
        <>
            <Head title="Nouveau module — Administration" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Nouveau module
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Le slug et l'ordre d'affichage sont générés
                        automatiquement.
                    </p>
                </div>

                <Tabs value="infos">
                    <TabsList className="mx-auto w-full max-w-xl">
                        <TabsTrigger value="infos">Informations</TabsTrigger>
                        <TabsTrigger value="lecons" disabled>
                            Leçons
                        </TabsTrigger>
                    </TabsList>

                    <p className="mx-auto w-full max-w-xl text-xs text-muted-foreground">
                        Enregistre d'abord le module : ses leçons s'ajoutent
                        ensuite dans l'onglet Leçons.
                    </p>

                    <TabsContent value="infos">
                        <Form
                            {...ModuleController.store.form()}
                            options={{ preserveScroll: true }}
                            className="mx-auto w-full max-w-xl space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <ModuleFormFields
                                        errors={errors}
                                        levels={levels}
                                    />

                                    <div className="flex items-center gap-4">
                                        <Button disabled={processing}>
                                            Créer le module
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
                </Tabs>
            </div>
        </>
    );
}

ModuleCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: adminDashboard() },
        { title: 'Modules', href: adminModulesIndex() },
        { title: 'Nouveau module', href: adminModulesCreate() },
    ],
};
