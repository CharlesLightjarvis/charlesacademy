import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { destroy as adminModulesDestroy } from '@/routes/admin/modules';
import type { Module } from '@/types/module';

type Props = {
    module: Module | null;
    onClose: () => void;
};

export default function DeleteModuleDialog({ module, onClose }: Props) {
    function handleDelete() {
        if (!module) {
            return;
        }

        router.delete(adminModulesDestroy.url(module.id), {
            preserveScroll: true,
            onSuccess: onClose,
        });
    }

    return (
        <Dialog
            open={module !== null}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Supprimer le module ?</DialogTitle>
                    <DialogDescription>
                        Le module « {module?.name} » sera définitivement
                        supprimé.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                        Supprimer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
