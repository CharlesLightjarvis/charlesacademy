import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Level } from '@/types/level';

type Values = {
    name?: string;
    description?: string | null;
    level_id?: number | null;
    is_active?: boolean;
};

type Props = {
    errors: Partial<Record<string, string>>;
    defaultValues?: Values;
    levels: Level[];
};

export default function ModuleFormFields({
    errors,
    defaultValues,
    levels,
}: Props) {
    return (
        <>
            <div className="grid gap-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                    id="name"
                    name="name"
                    required
                    autoComplete="off"
                    placeholder="Ex. Grammaire"
                    defaultValue={defaultValues?.name ?? ''}
                />
                <InputError className="mt-2" message={errors.name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="level">Niveau</Label>
                <Select
                    name="level_id"
                    defaultValue={String(
                        defaultValues?.level_id ?? levels[0]?.id ?? '',
                    )}
                >
                    <SelectTrigger id="level" className="w-full">
                        <SelectValue placeholder="Choisir un niveau" />
                    </SelectTrigger>
                    <SelectContent>
                        {levels.map((level) => (
                            <SelectItem
                                key={level.id}
                                value={String(level.id)}
                            >
                                {level.code} — {level.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError className="mt-2" message={errors.level_id} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    rows={4}
                    placeholder="Description visible dans le catalogue (facultatif)"
                    defaultValue={defaultValues?.description ?? ''}
                />
                <InputError className="mt-2" message={errors.description} />
            </div>

            <div className="flex items-center gap-2">
                <Checkbox
                    id="is_active"
                    name="is_active"
                    value="1"
                    defaultChecked={defaultValues?.is_active ?? true}
                />
                <Label htmlFor="is_active">Module actif</Label>
            </div>
            <InputError className="mt-2" message={errors.is_active} />
        </>
    );
}
