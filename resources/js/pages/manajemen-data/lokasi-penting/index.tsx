import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manajemen Data', href: '#' },
    { title: 'Lokasi Penting', href: '/manajemen-data/lokasi-penting' },
];

interface LocationItem {
    id: number;
    nama: string;
    kategori: string;
    koordinat: string;
    latitude: number;
    longitude: number;
    // Tambahkan properti lain jika ada
}

interface LokasiPentingIndexProps {
    locations: LocationItem[];
}

export default function LokasiPentingIndex({ locations }: LokasiPentingIndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lokasi Penting" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold">Manajemen Lokasi Penting</h1>
                        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                            Tambah Lokasi
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3">Nama</th>
                                    <th className="text-left p-3">Kategori</th>
                                    <th className="text-left p-3">Koordinat</th>
                                    <th className="text-left p-3">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {locations?.map((location: LocationItem) => (
                                    <tr key={location.id} className="border-b hover:bg-muted/50">
                                        <td className="p-3">{location.nama}</td>
                                        <td className="p-3 capitalize">{location.kategori.replace('_', ' ')}</td>
                                        <td className="p-3 text-sm text-muted-foreground">
                                            {location.latitude}, {location.longitude}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-2">
                                                <button className="text-sm text-blue-600 hover:underline">Edit</button>
                                                <button className="text-sm text-red-600 hover:underline">Hapus</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {(!locations || locations.length === 0) && (
                            <div className="text-center py-8 text-muted-foreground">
                                Belum ada data lokasi penting
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
