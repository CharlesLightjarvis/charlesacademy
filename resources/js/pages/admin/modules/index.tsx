import { Head } from '@inertiajs/react';
import { dashboard as adminDashboard } from '@/routes/admin';
import { index as adminModulesIndex } from '@/routes/admin/modules';
import type { Module } from '@/types/module';
import ModuleList from './partials/module-list';

type Props = {
    modules: Module[];
};

export default function ModulesIndex({ modules }: Props) {
    return (
        <>
            <Head title="Modules — Administration" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Modules
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Le catalogue des modules : slug, publication et ordre
                        d'affichage gérés automatiquement.
                    </p>
                </div>
                <ModuleList modules={modules} />
            </div>
        </>
    );
}

ModulesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: adminDashboard() },
        { title: 'Modules', href: adminModulesIndex() },
    ],
};
