import { Head, Link } from '@inertiajs/react';
import { Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { index as adminModules } from '@/routes/admin/modules';

export default function AdminDashboard() {
    return (
        <>
            <Head title="Administration" />
            <main className="mx-auto w-full max-w-7xl px-4 py-12">
                <p className="text-sm font-semibold tracking-widest text-emerald-700 uppercase">
                    Administration
                </p>
                <h1 className="mt-3 text-4xl font-bold tracking-tight">
                    Bienvenue dans ton espace admin.
                </h1>
                <p className="mt-4 max-w-2xl text-muted-foreground">
                    Les modules du catalogue se gèrent d'ici : nom, slug,
                    publication et ordre d'affichage.
                </p>

                <Button asChild className="mt-8 rounded-full">
                    <Link href={adminModules()}>
                        <Layers className="size-4" />
                        Gérer les modules
                    </Link>
                </Button>
            </main>
        </>
    );
}
