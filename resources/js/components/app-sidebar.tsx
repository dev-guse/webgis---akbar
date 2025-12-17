import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { type NavItem } from '@/types';
import { dashboard } from '@/routes';
import { Link } from '@inertiajs/react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
    AlertTriangle, BookOpen, Folder, LayoutGrid, Map, MapPin,
    Users, Settings, Shield, Activity, Building, Hospital, UserSquare, AreaChart, Home, Tractor, Mountain, History, AlertCircle
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Visualisasi Peta',
        icon: Map,
        items: [
            {
                title: 'Peta Interaktif',
                href: '/peta-interaktif',
                icon: Map,
            },
        ],
    },
    {
        title: 'Fasilitas',
        icon: Building,
        items: [
            {
                title: 'Umum',
                href: route('fasilitas.index', { tipe: 'umum' }),
                icon: Hospital,
            },
            {
                title: 'Privat',
                href: route('fasilitas.index', { tipe: 'privat' }),
                icon: Home,
            },
            {
                title: 'Jalan',
                href: route('fasilitas.index', { tipe: 'jalan' }),
                icon: MapPin,
            },
        ],
    },

    {
        title: 'Kelola Lahan',
        icon: Tractor,
        items: [
            {
                title: 'Batas Wilayah',
                href: '/batas-wilayah',
                icon: Mountain,
            },
        ],
    },
    {
        title: 'Pengaturan Sistem',
        icon: Settings,
        items: [
            {
                title: 'Manajemen User',
                href: '/pengguna/daftar',
                icon: Users,
            },
        ],
    },
];

const footerNavItems: NavItem[] = [

];

export function AppSidebar() {
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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
