export type Lesson = {
    id: number;
    module_id: number;
    title: string;
    slug: string;
    description: string | null;
    content: string | null;
    is_active: boolean;
    order_column: number;
    created_at: string;
    updated_at: string;
};
