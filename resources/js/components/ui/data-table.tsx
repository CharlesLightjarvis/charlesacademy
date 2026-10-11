import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getExpandedRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { GripVertical } from 'lucide-react';
import type {
    ColumnDef,
    ColumnFiltersState,
    Row,
    SortingState,
    VisibilityState,
} from '@tanstack/react-table';
import * as React from 'react';
import { cn } from '@/lib/utils';

import { DataTablePagination } from './data-table-pagination';
import { DataTableToolbar } from './data-table-toolbar';
import type {
    SearchFilterConfig,
    FacetedFilterConfig,
    ActionButtonConfig,
} from './data-table-toolbar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from './table';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchFilter?: SearchFilterConfig;
    facetedFilters?: FacetedFilterConfig[];
    actionButton?: ActionButtonConfig;
    enablePagination?: boolean;
    renderSubComponent?: (props: { row: Row<TData> }) => React.ReactNode;
    onRowClick?: (row: Row<TData>) => void;
    /**
     * Make the visible rows draggable (drag handle in a leading column) and
     * report the whole dataset in its new order through `onRowReorder`.
     */
    enableRowReorder?: boolean;
    onRowReorder?: (orderedIds: string[]) => void;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchFilter,
    facetedFilters,
    actionButton,
    enablePagination = true,
    renderSubComponent,
    onRowClick,
    enableRowReorder = false,
    onRowReorder,
}: DataTableProps<TData, TValue>) {
    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = React.useState('');

    // Rows are keyed by their own `id` when reordering is enabled so that a
    // drag & drop can report positions across the whole dataset.
    const getRowId = React.useCallback(
        (row: TData, index: number): string => {
            if (enableRowReorder) {
                const candidate = row as unknown as { id?: unknown };

                if (candidate?.id !== undefined && candidate.id !== null) {
                    return String(candidate.id);
                }
            }

            return String(index);
        },
        [enableRowReorder],
    );

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
        useSensor(KeyboardSensor),
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const orderedIds = data.map((row, index) => getRowId(row, index));
        const from = orderedIds.indexOf(String(active.id));
        const to = orderedIds.indexOf(String(over.id));

        if (from === -1 || to === -1) {
            return;
        }

        onRowReorder?.(arrayMove(orderedIds, from, to));
    }

    // Keep a ref so the globalFilterFn closure always reads the latest columnIds
    const searchColumnIdsRef = React.useRef<string[]>(
        searchFilter?.columnIds ?? [],
    );
    searchColumnIdsRef.current = searchFilter?.columnIds ?? [];

    const table = useReactTable({
        data,
        columns,
        getRowId,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            globalFilter,
        },
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onGlobalFilterChange: setGlobalFilter,
        // OR logic: row passes if ANY of the specified columnIds matches
        globalFilterFn: (row, columnId, value) => {
            const ids = searchColumnIdsRef.current;

            if (!value || ids.length === 0) {
                return true;
            }

            if (!ids.includes(columnId)) {
                return false;
            }

            const search = String(value).toLowerCase();

            return String(row.getValue(columnId) ?? '')
                .toLowerCase()
                .includes(search);
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: enablePagination
            ? getPaginationRowModel()
            : undefined,
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getExpandedRowModel: getExpandedRowModel(),
        getRowCanExpand: renderSubComponent ? () => true : undefined,
        paginateExpandedRows: false,
    });

    const rows = table.getRowModel().rows;
    const isReorderable = enableRowReorder && Boolean(onRowReorder);
    const cellCount = columns.length + (isReorderable ? 1 : 0);

    function renderCells(row: Row<TData>) {
        return row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
        ));
    }

    function renderExpandedRow(row: Row<TData>) {
        if (!row.getIsExpanded() || !renderSubComponent) {
            return null;
        }

        return (
            <TableRow>
                <TableCell colSpan={cellCount} className="bg-muted/30 p-0">
                    {renderSubComponent({ row })}
                </TableCell>
            </TableRow>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <DataTableToolbar
                table={table}
                searchFilter={searchFilter}
                facetedFilters={facetedFilters}
                actionButton={actionButton}
            />
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {isReorderable && (
                                    <TableHead className="w-10" />
                                )}
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            colSpan={header.colSpan}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext(),
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {rows.length ? (
                            isReorderable ? (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={rows.map((row) => row.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {rows.map((row) => (
                                            <React.Fragment key={row.id}>
                                                <SortableRow
                                                    rowId={row.id}
                                                    data-state={
                                                        row.getIsSelected() &&
                                                        'selected'
                                                    }
                                                    className={cn(
                                                        onRowClick &&
                                                            'cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                                                    )}
                                                    tabIndex={
                                                        onRowClick
                                                            ? 0
                                                            : undefined
                                                    }
                                                    onClick={() =>
                                                        onRowClick?.(row)
                                                    }
                                                    onKeyDown={(event) => {
                                                        if (
                                                            onRowClick &&
                                                            (event.key ===
                                                                'Enter' ||
                                                                event.key ===
                                                                    ' ')
                                                        ) {
                                                            event.preventDefault();
                                                            onRowClick(row);
                                                        }
                                                    }}
                                                >
                                                    {renderCells(row)}
                                                </SortableRow>
                                                {renderExpandedRow(row)}
                                            </React.Fragment>
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            ) : (
                                rows.map((row) => (
                                    <React.Fragment key={row.id}>
                                        <TableRow
                                            data-state={
                                                row.getIsSelected() &&
                                                'selected'
                                            }
                                            className={cn(
                                                onRowClick &&
                                                    'cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                                            )}
                                            tabIndex={onRowClick ? 0 : undefined}
                                            onClick={() => onRowClick?.(row)}
                                            onKeyDown={(event) => {
                                                if (
                                                    onRowClick &&
                                                    (event.key === 'Enter' ||
                                                        event.key === ' ')
                                                ) {
                                                    event.preventDefault();
                                                    onRowClick(row);
                                                }
                                            }}
                                        >
                                            {renderCells(row)}
                                        </TableRow>
                                        {renderExpandedRow(row)}
                                    </React.Fragment>
                                ))
                            )
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={cellCount}
                                    className="h-24 text-center"
                                >
                                    Aucun résultat.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {enablePagination && <DataTablePagination table={table} />}
        </div>
    );
}

function SortableRow({
    rowId,
    children,
    className,
    ...props
}: React.ComponentProps<typeof TableRow> & { rowId: string }) {
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
        useSortable({ id: rowId });

    return (
        <TableRow
            ref={setNodeRef}
            className={cn(
                isDragging && 'relative z-10 opacity-80 bg-accent',
                className,
            )}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
            {...props}
        >
            <TableCell className="w-10 text-center">
                <button
                    type="button"
                    aria-label="Déplacer la ligne"
                    className="cursor-grab text-muted-foreground active:cursor-grabbing"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="size-4" />
                </button>
            </TableCell>
            {children}
        </TableRow>
    );
}
