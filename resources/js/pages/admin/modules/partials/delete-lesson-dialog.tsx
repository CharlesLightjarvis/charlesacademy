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
import { destroy as lessonDestroy } from '@/routes/admin/modules/lessons';
import type { Lesson } from '@/types/lesson';
import type { Module } from '@/types/module';

type Props = {
    module: Module;
    lesson: Lesson | null;
    onClose: () => void;
};

export default function DeleteLessonDialog({ module, lesson, onClose }: Props) {
    function handleDelete() {
        if (!lesson) {
            return;
        }

        router.delete(
            lessonDestroy.url({ module: module.id, lesson: lesson.id }),
            {
                preserveScroll: true,
                onSuccess: onClose,
            },
        );
    }

    return (
        <Dialog
            open={lesson !== null}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Supprimer la leçon ?</DialogTitle>
                    <DialogDescription>
                        La leçon « {lesson?.title} » sera définitivement
                        supprimée.
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
