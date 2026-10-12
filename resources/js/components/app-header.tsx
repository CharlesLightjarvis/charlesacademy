import { Link, usePage } from '@inertiajs/react';
import { BookOpen, BookOpenText, LayoutGrid, Menu } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import AppLogoIcon from '@/components/app-logo-icon';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { useParentUrl } from '@/hooks/use-parent-url';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';
import { index as adminModulesIndex } from '@/routes/admin/modules';
import { dashboard as learnerDashboard } from '@/routes/learner';
import { index as learningIndex } from '@/routes/learner/learn';
import type { Auth, BreadcrumbItem, NavItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

const navigationItems: (NavItem & { permission: string })[] = [
    {
        title: 'Mon espace',
        href: adminDashboard(),
        icon: LayoutGrid,
        permission: 'view.admin-dashboard',
    },
    {
        title: 'Modules',
        href: adminModulesIndex(),
        icon: BookOpenText,
        permission: 'manage.content',
    },
    {
        title: 'Mon espace',
        href: learnerDashboard(),
        icon: LayoutGrid,
        permission: 'view.learner-dashboard',
    },
    {
        title: 'Apprendre',
        href: learningIndex(),
        icon: BookOpen,
        permission: 'view.learning',
    },
];

export function AppHeader({ breadcrumbs = [] }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const getInitials = useInitials();
    const { isCurrentUrl } = useCurrentUrl();
    const { isParentUrl } = useParentUrl();

    // Un onglet est actif sur son URL exacte ou sur toutes ses sous-pages :
    // on reste sur « Modules » pendant la création d'un module, l'édition
    // d'une leçon ou d'un quiz, et sur « Apprendre » pendant une leçon.
    function isNavItemActive(item: (typeof navigationItems)[number]): boolean {
        return isCurrentUrl(item.href) || isParentUrl(item.href);
    }

    const visibleNavItems = navigationItems.filter((item) =>
        auth.permissions.includes(item.permission),
    );
    const homeHref = visibleNavItems[0]?.href ?? dashboard();

    return (
        <>
            <div className="border-b border-sidebar-border/80">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mr-2 h-[34px] w-[34px]"
                                    aria-label="Ouvrir la navigation"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="w-64 bg-sidebar"
                            >
                                <SheetTitle className="sr-only">
                                    Navigation
                                </SheetTitle>
                                <SheetHeader>
                                    <AppLogoIcon className="h-6 w-6 fill-current text-black dark:text-white" />
                                </SheetHeader>
                                <nav className="mt-8 flex flex-col gap-2">
                                    {visibleNavItems.map((item) => (
                                        <SheetClose
                                            asChild
                                            key={item.permission}
                                        >
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    'flex items-center gap-3 rounded-md px-3 py-2 font-medium hover:bg-accent',
                                                    isNavItemActive(item) &&
                                                        'bg-accent',
                                                )}
                                            >
                                                {item.icon && (
                                                    <item.icon className="h-5 w-5" />
                                                )}
                                                {item.title}
                                            </Link>
                                        </SheetClose>
                                    ))}
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link
                        href={homeHref}
                        prefetch
                        className="flex items-center gap-2"
                    >
                        <AppLogo />
                    </Link>

                    <NavigationMenu className="ml-6 hidden h-full items-stretch lg:flex">
                        <NavigationMenuList className="flex h-full items-stretch gap-2">
                            {visibleNavItems.map((item) => (
                                <NavigationMenuItem
                                    key={item.permission}
                                    className="relative flex h-full items-center"
                                >
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            navigationMenuTriggerStyle(),
                                            isNavItemActive(item) &&
                                                'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100',
                                            'h-9 cursor-pointer px-3',
                                        )}
                                    >
                                        {item.icon && (
                                            <item.icon className="mr-2 h-4 w-4" />
                                        )}
                                        {item.title}
                                    </Link>
                                    {isNavItemActive(item) && (
                                        <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white" />
                                    )}
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>

                    <div className="ml-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="size-10 rounded-full p-1"
                                >
                                    <Avatar className="size-8 overflow-hidden rounded-full">
                                        <AvatarImage
                                            src={auth.user?.avatar}
                                            alt={auth.user?.name}
                                        />
                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(auth.user?.name ?? '')}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                {auth.user && (
                                    <UserMenuContent user={auth.user} />
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="border-b border-sidebar-border/70">
                    <div className="mx-auto flex h-12 items-center px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
