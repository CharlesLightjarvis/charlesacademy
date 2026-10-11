export type Module = {
    id: number;
    name: string;
    level_id: number | null;
    slug: string;
    description: string | null;
    is_active: boolean;
    order_column: number;
    created_at: string;
    updated_at: string;
};
