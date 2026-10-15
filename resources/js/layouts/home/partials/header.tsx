import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { dashboard, login, register } from '@/routes';
import type { Auth } from '@/types';

import Logo from './logo';
import { MenuToggleIcon } from './menu-toggle-icon';
import ThemeToggle from './ThemeToggle';
import { useScroll } from './use-scroll';

export function Header() {
    const [open, setOpen] = useState(false);
    const scrolled = useScroll(10);
    const { auth } = usePage<{ auth: Auth }>().props;
    const { url } = usePage();

    useEffect(() => setOpen(false), [url]);

    useEffect(() => {
        if (!open) {
            return;
        }

        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        }

        document.addEventListener('keydown', closeOnEscape);

        return () => document.removeEventListener('keydown', closeOnEscape);
    }, [open]);

    return (
        <header
            className={cn(
                'sticky top-0 z-50 w-full border-b border-transparent transition-colors duration-300',
                scrolled &&
                    'border-border bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/85',
            )}
        >
            <nav
                aria-label="Navigation principale"
                className="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-3 px-4 lg:px-6"
            >
                <Link
                    href="/"
                    aria-label="CharlesAcademy — Accueil"
                    className="shrink-0"
                    onClick={() => setOpen(false)}
                >
                    <Logo className="w-28 sm:w-44" />
                </Link>

                <div className="ml-auto hidden items-center gap-2 sm:flex">
                    {auth.user ? (
                        <Button size="sm" asChild>
                            <Link href={dashboard()}>Mon espace</Link>
                        </Button>
                    ) : (
                        <>
                            <Button variant="secondary" size="sm" asChild>
                                <Link href={login()}>Connexion</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href={register()}>Créer un compte</Link>
                            </Button>
                        </>
                    )}

                    <ThemeToggle />
                </div>

                <div className="ml-auto flex items-center gap-2 sm:hidden">
                    <ThemeToggle />
                    <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        aria-expanded={open}
                        aria-controls="mobile-account-menu"
                        aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
                        onClick={() => setOpen((previous) => !previous)}
                    >
                        <MenuToggleIcon
                            open={open}
                            className="size-5"
                            duration={300}
                        />
                    </Button>
                </div>
            </nav>

            {open && (
                <div
                    id="mobile-account-menu"
                    className="absolute inset-x-0 top-full border-b border-border bg-background p-4 shadow-lg sm:hidden"
                >
                    <div className="mx-auto flex max-w-[1600px] flex-col gap-2">
                        {auth.user ? (
                            <Button asChild>
                                <Link
                                    href={dashboard()}
                                    onClick={() => setOpen(false)}
                                >
                                    Mon espace
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild>
                                    <Link
                                        href={register()}
                                        onClick={() => setOpen(false)}
                                    >
                                        Créer un compte
                                    </Link>
                                </Button>
                                <Button variant="secondary" asChild>
                                    <Link
                                        href={login()}
                                        onClick={() => setOpen(false)}
                                    >
                                        Connexion
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
