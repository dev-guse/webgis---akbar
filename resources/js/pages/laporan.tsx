import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { FileDown, FileText } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Laporan & Ekspor', href: '/laporan' },
];

interface LaporanProps {
    stats: {
        lokasi: number;
        infrastruktur: number;
        lahan: number;
    };
}

export default function Laporan({ stats }: LaporanProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                    <h1 className="text-2xl font-bold mb-6">Pusat Laporan & Ekspor Data</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Lokasi Penting Card */}
                        <div className="border rounded-lg p-6 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Data Lokasi Penting</h3>
                                    <p className="text-sm text-muted-foreground">{stats.lokasi} data tersedia</p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                Unduh data lokasi penting termasuk koordinat dan deskripsi dalam format CSV.
                            </p>
                            <a
                                href="/laporan/export/lokasi"
                                target="_blank"
                                className="inline-flex items-center justify-center w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium"
                            >
                                <FileDown className="mr-2 h-4 w-4" />
                                Download CSV
                            </a>
                        </div>

                        {/* Infrastruktur Card (Placeholder) */}
                        <div className="border rounded-lg p-6 hover:bg-muted/50 transition-colors opacity-75">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                    <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Data Infrastruktur</h3>
                                    <p className="text-sm text-muted-foreground">{stats.infrastruktur} data tersedia</p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                Laporan kondisi infrastruktur jalan, jembatan, dan fasilitas lainnya.
                            </p>
                            <button disabled className="inline-flex items-center justify-center w-full px-4 py-2 bg-muted text-muted-foreground rounded-md cursor-not-allowed text-sm font-medium">
                                Segera Hadir
                            </button>
                        </div>

                        {/* Penggunaan Lahan Card (Placeholder) */}
                        <div className="border rounded-lg p-6 hover:bg-muted/50 transition-colors opacity-75">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Data Penggunaan Lahan</h3>
                                    <p className="text-sm text-muted-foreground">{stats.lahan} data tersedia</p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                Rekapitulasi luas penggunaan lahan berdasarkan jenis peruntukan.
                            </p>
                            <button disabled className="inline-flex items-center justify-center w-full px-4 py-2 bg-muted text-muted-foreground rounded-md cursor-not-allowed text-sm font-medium">
                                Segera Hadir
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
