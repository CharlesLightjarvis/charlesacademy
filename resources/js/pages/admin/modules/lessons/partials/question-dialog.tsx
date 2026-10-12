import { Form } from '@inertiajs/react';
import QuizController from '@/actions/App/Http/Controllers/Admin/QuizController';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Lesson } from '@/types/lesson';
import type { Module } from '@/types/module';
import type { QuizQuestion } from '../quiz';

const OPTION_KEYS = ['a', 'b', 'c'] as const;

type Props = {
    module: Module;
    lesson: Lesson;
    /** 'create' = nouveau, question existante = modification, null = fermé. */
    question: QuizQuestion | 'create' | null;
    onClose: () => void;
};

export default function QuestionDialog({
    module,
    lesson,
    question,
    onClose,
}: Props) {
    const isCreate = question === 'create';
    const values = isCreate || question === null ? null : question;
    const args = { module: module.id, lesson: lesson.id };

    return (
        <Dialog
            open={question !== null}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
        >
            <DialogContent className="sm:max-w-xl">
                <Form
                    {...(isCreate
                        ? QuizController.storeQuestion.form(args)
                        : QuizController.updateQuestion.form({
                              ...args,
                              question: values?.id ?? 0,
                          }))}
                    options={{ preserveScroll: true }}
                >
                    {({ processing, errors }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>
                                    {isCreate
                                        ? 'Ajouter une question'
                                        : 'Modifier la question'}
                                </DialogTitle>
                                <DialogDescription>
                                    Trois propositions (A, B, C) et la bonne
                                    réponse à cocher.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="prompt">Énoncé</Label>
                                    <Textarea
                                        id="prompt"
                                        name="prompt"
                                        rows={3}
                                        required
                                        placeholder="Ex. Comment se prononce la lettre C ?"
                                        defaultValue={values?.prompt ?? ''}
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={errors.prompt}
                                    />
                                </div>

                                <fieldset className="space-y-2">
                                    <legend className="text-sm font-medium">
                                        Propositions
                                    </legend>

                                    {OPTION_KEYS.map((key, index) => (
                                        <div
                                            key={key}
                                            className="flex items-center gap-2"
                                        >
                                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold uppercase">
                                                {key}
                                            </span>
                                            <Input
                                                name={`options.${key}`}
                                                required
                                                autoComplete="off"
                                                placeholder={
                                                    index === 0
                                                        ? 'Bonne réponse…'
                                                        : 'Proposition de distraction…'
                                                }
                                                defaultValue={
                                                    values?.options[key] ?? ''
                                                }
                                                className="min-w-0 flex-1"
                                            />
                                            <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
                                                <input
                                                    type="radio"
                                                    name="correct_option"
                                                    value={key}
                                                    required
                                                    defaultChecked={
                                                        values
                                                            ? values.correct_option ===
                                                              key
                                                            : key === 'a'
                                                    }
                                                    className="accent-primary"
                                                />
                                                Bonne
                                            </label>
                                            <InputError
                                                message={
                                                    errors[`options.${key}`]
                                                }
                                            />
                                        </div>
                                    ))}

                                    <InputError
                                        className="mt-2"
                                        message={errors.correct_option}
                                    />
                                </fieldset>

                                <div className="grid gap-2">
                                    <Label htmlFor="explanation">
                                        Explication (facultative)
                                    </Label>
                                    <Textarea
                                        id="explanation"
                                        name="explanation"
                                        rows={2}
                                        placeholder="Affichée à l'élève dans la correction"
                                        defaultValue={values?.explanation ?? ''}
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={errors.explanation}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={processing}
                                >
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {isCreate ? 'Ajouter' : 'Enregistrer'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
