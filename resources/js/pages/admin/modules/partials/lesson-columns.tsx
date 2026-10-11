import { Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { edit as lessonEdit } from '@/routes/admin/modules/lessons';
import type { Lesson } from '@/types/lesson';

export const LESSON_STATUS_OPTIONS = [
    { label: 'Publiée', value: 'true' },
    { label: 'Brouillon', value: 'false' },
] as const;

type ColumnsOptions = {
    onDelete: (lesson: Lesson) => void;
};

export const createLessonColumns = ({
    onDelete,
}: ColumnsOptions): ColumnDef<Lesson>[] => [
    {
        accessorKey: 'title',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Leçon" />
        ),
        cell: ({ row }) => (
            <span className="font-medium">{row.original.title}</span>
        ),
    },
    {
        accessorKey: 'slug',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Slug" />
        ),
        cell: ({ row }) => (
            <span className="font-mono text-xs text-muted-foreground">
                {row.original.slug}
            </span>
        ),
    },
    {
        accessorKey: 'description',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Description" />
        ),
        cell: ({ row }) => (
            <span className="block max-w-80 truncate text-muted-foreground">
                {row.original.description ?? '—'}
            </span>
        ),
    },
    {
        accessorKey: 'is_active',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Statut" />
        ),
        filterFn: (row, id, value: string[]) =>
            value.includes(String(row.getValue(id))),
        cell: ({ row }) => (
            <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
                {row.original.is_active ? 'Publiée' : 'Brouillon'}
            </Badge>
        ),
    },
    {
        accessorKey: 'order_column',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Ordre" />
        ),
        cell: ({ row }) => (
            <span className="text-muted-foreground">
                {row.original.order_column}
            </span>
        ),
    },
    {
        id: 'actions',
        cell: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="size-8 p-0">
                        <span className="sr-only">Actions</span>
                        <MoreHorizontal />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <Link
                                href={lessonEdit({
                                    module: row.original.module_id,
                                    lesson: row.original.id,
                                })}
                            >
                                <Pencil />
                                Modifier
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onDelete(row.original)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 />
                            Supprimer
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];
