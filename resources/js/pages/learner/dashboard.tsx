import { Head } from '@inertiajs/react';

export default function LearnerDashboard() {
    return (
        <>
            <Head title="Mon espace" />
            <main className="mx-auto w-full max-w-7xl px-4 py-12">
                <p className="text-sm font-semibold tracking-widest text-emerald-700 uppercase">
                    Mon espace
                </p>
                <h1 className="mt-3 text-4xl font-bold tracking-tight">
                    Pratique l’allemand à ton rythme.
                </h1>
                <p className="mt-4 max-w-2xl text-muted-foreground">
                    Grammaire, vocabulaire et expression orale : retrouve
                    bientôt tes activités ici.
                </p>
            </main>
        </>
    );
}
