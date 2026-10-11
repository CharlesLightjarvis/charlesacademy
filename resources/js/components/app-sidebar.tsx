import { Link, usePage } from '@inertiajs/react';
import { Layers, LayoutGrid } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';
import { index as adminModulesIndex } from '@/routes/admin/modules';
import { dashboard as learnerDashboard } from '@/routes/learner';
import type { Auth, NavItem } from '@/types';

const mainNavItems: (NavItem & { permission: string })[] = [
    {
        title: 'Mon espace',
        href: adminDashboard(),
        icon: LayoutGrid,
        permission: 'view.admin-dashboard',
    },
    {
        title: 'Modules',
        href: adminModulesIndex(),
        icon: Layers,
        permission: 'manage.content',
    },
    {
        title: 'Mon espace',
        href: learnerDashboard(),
        icon: LayoutGrid,
        permission: 'view.learner-dashboard',
    },
];

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const visibleNavItems = mainNavItems.filter((item) =>
        auth.permissions.includes(item.permission),
    );

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={visibleNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
