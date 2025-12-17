import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Stats {
    users: { total: number };
    fasilitas: { total: number; umum: number; privat: number };
    batas_wilayah: { total: number };
}

interface FasilitasByType {
    type: string;
    count: number;
}

interface Bencana {
    id: number;
    nama_bencana: string;
    tanggal: string;
    status: string;
    lokasi: string;
}

interface Props {
    stats: Stats;
    recentBencana: Bencana[];
    fasilitasByType: FasilitasByType[];
}
import {
    MapPin,
    Users,
    Home,
    Building,
    AlertTriangle,
    Shield,
    Map as MapIcon,
    Settings,
    UserSquare,
    AlertCircle,
    Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

export default function Dashboard({ stats, fasilitasByType }: Props) {

    const fasilitasChartData = Array.isArray(fasilitasByType) ? fasilitasByType.map(item => ({
        name: item.type,
        value: item.count,
    })) : [];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard WebGIS" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Welcome Card */}
                <div className="rounded-xl border border-sidebar-border/70 p-6 bg-gradient-to-r from-primary/10 to-primary/5 dark:border-sidebar-border">
                    <h1 className="text-3xl font-bold">WebGIS Desa Tegalsambi</h1>
                    <p className="text-muted-foreground mt-2">
                        Dashboard Ringkasan Data Desa Tegalsambi
                    </p>
                </div>

                {/* Main Statistics Grid */}
                <div className="grid gap-4 grid-cols-2">
                    {/* Fasilitas */}
                    <Card className="bg-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Fasilitas</CardTitle>
                            <Building className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.fasilitas.total}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.fasilitas.umum} Umum, {stats.fasilitas.privat} Privat
                            </p>
                        </CardContent>
                    </Card>

                    {/* Batas Wilayah */}
                    <Card className="bg-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Batas Wilayah</CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.batas_wilayah.total}</div>
                            <p className="text-xs text-muted-foreground">
                                Area terdaftar
                            </p>
                        </CardContent>
                    </Card>

                </div>

                {/* Secondary Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* System Users */}
                    <Card className="bg-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pengguna Sistem</CardTitle>
                            <Settings className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.users.total}</div>
                            <p className="text-xs text-muted-foreground">
                                Akun terdaftar
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Shortcuts */}
                <div className="grid gap-4">
                    <Link href="/peta-interaktif" className="bg-card border hover:bg-muted transition-colors rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-center">
                        <MapIcon className="h-6 w-6 text-primary" />
                        <span className="text-sm font-medium">Peta Interaktif</span>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
