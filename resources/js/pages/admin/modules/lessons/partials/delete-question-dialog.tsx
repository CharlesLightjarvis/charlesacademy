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
import { destroy as questionDestroy } from '@/routes/admin/modules/lessons/quiz/questions';
import type { Lesson } from '@/types/lesson';
import type { Module } from '@/types/module';
import type { QuizQuestion } from '../quiz';

type Props = {
    module: Module;
    lesson: Lesson;
    question: QuizQuestion | null;
    onClose: () => void;
};

export default function DeleteQuestionDialog({
    module,
    lesson,
    question,
    onClose,
}: Props) {
    function handleDelete() {
        if (!question) {
            return;
        }

        router.delete(
            questionDestroy.url({
                module: module.id,
                lesson: lesson.id,
                question: question.id,
            }),
            {
                preserveScroll: true,
                onSuccess: onClose,
            },
        );
    }

    return (
        <Dialog
            open={question !== null}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Supprimer la question ?</DialogTitle>
                    <DialogDescription>
                        « {question?.prompt} » sera définitivement supprimée du
                        quiz.
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
