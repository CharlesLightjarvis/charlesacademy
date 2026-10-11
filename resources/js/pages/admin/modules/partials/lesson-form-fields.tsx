import { MdxEditor } from '@/components/admin/mdx-editor';
import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Values = {
    title?: string;
    description?: string | null;
    is_active?: boolean;
};

type Props = {
    errors: Partial<Record<string, string>>;
    defaultValues?: Values;
    content: string;
    onContentChange: (next: string) => void;
};

export default function LessonFormFields({
    errors,
    defaultValues,
    content,
    onContentChange,
}: Props) {
    return (
        <>
            {/* Titre / Description : colonne de lecture classique. */}
            <div className="mx-auto w-full max-w-4xl space-y-6">
                <div className="grid gap-2">
                    <Label htmlFor="title">Titre</Label>
                    <Input
                        id="title"
                        name="title"
                        required
                        autoComplete="off"
                        placeholder="Ex. Les salutations"
                        defaultValue={defaultValues?.title ?? ''}
                    />
                    <InputError className="mt-2" message={errors.title} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        rows={2}
                        placeholder="Ce que l'élève apprendra (facultatif)"
                        defaultValue={defaultValues?.description ?? ''}
                    />
                    <InputError className="mt-2" message={errors.description} />
                </div>
            </div>

            {/* Contenu (MDX) : pleine largeur, jusqu'aux bords du conteneur. */}
            <div className="grid gap-2">
                <Label>Contenu (MDX)</Label>
                <MdxEditor value={content} onChange={onContentChange} />
                {/* Le MDX est envoyé au formulaire via un input caché. */}
                <input type="hidden" name="content" value={content} readOnly />
                <InputError className="mt-2" message={errors.content} />
            </div>

            {/* Publication : même colonne que Titre / Description. */}
            <div className="mx-auto w-full max-w-4xl space-y-6">
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="is_active"
                        name="is_active"
                        value="1"
                        defaultChecked={defaultValues?.is_active ?? false}
                    />
                    <Label htmlFor="is_active">Publier la leçon</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                    Décoché, la leçon reste un brouillon : le contenu n'est
                    alors pas obligatoire.
                </p>
                <InputError className="mt-2" message={errors.is_active} />
            </div>
        </>
    );
}
