import { router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import {
    create as adminModulesCreate,
    reorder as adminModulesReorder,
} from '@/routes/admin/modules';
import type { Module } from '@/types/module';
import DeleteModuleDialog from './delete-module-dialog';
import { createColumns, MODULE_STATUS_OPTIONS } from './columns';

type Props = {
    modules: Module[];
};

export default function ModuleList({ modules }: Props) {
    const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null);
    // Local copy of the order: the drag & drop does not snap back while the
    // new order is being saved, and it rolls back if the request fails.
    const [orderedModules, setOrderedModules] = useState<Module[]>(modules);

    useEffect(() => {
        setOrderedModules(modules);
    }, [modules]);

    const columns = useMemo(
        () => createColumns({ onDelete: setModuleToDelete }),
        [],
    );

    function handleRowReorder(ids: string[]) {
        const byId = new Map(
            modules.map((module) => [String(module.id), module]),
        );
        const reordered = ids
            .map((id) => byId.get(id))
            .filter((module): module is Module => module !== undefined);

        setOrderedModules(reordered);
        router.patch(
            adminModulesReorder.url(),
            { ids: ids.map(Number) },
            { preserveScroll: true },
        );
    }

    return (
        <div className="space-y-4">
            <DataTable
                columns={columns}
                data={orderedModules}
                enableRowReorder
                onRowReorder={handleRowReorder}
                actionButton={{
                    label: 'Nouveau module',
                    onClick: () => router.visit(adminModulesCreate()),
                }}
                searchFilter={{
                    columnIds: ['name', 'description'],
                    placeholder: 'Rechercher un module...',
                }}
                facetedFilters={[
                    {
                        columnId: 'is_active',
                        title: 'Statut',
                        options: MODULE_STATUS_OPTIONS,
                    },
                ]}
            />

            <DeleteModuleDialog
                module={moduleToDelete}
                onClose={() => setModuleToDelete(null)}
            />
        </div>
    );
}
