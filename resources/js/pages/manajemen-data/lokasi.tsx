import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { getEventsByType, type MapEvent } from '@/data/mockMapEvents';
import { MapPin, Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manajemen Data', href: '/manajemen-data' },
    { title: 'Lokasi', href: '/manajemen-data/lokasi' },
];

export default function Lokasi() {
    const [events] = useState<MapEvent[]>(getEventsByType('location'));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Lokasi Penting" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <MapPin className="h-6 w-6 text-green-600" />
                                Data Lokasi Penting
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Kelola data lokasi penting di Desa Tegalsambi
                            </p>
                        </div>
                        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Lokasi
                        </button>
                    </div>

                    {/* Stats Card */}
                    <div className="p-6 rounded-lg border bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 mb-6">
                        <div className="text-sm text-muted-foreground">Total Lokasi Penting</div>
                        <div className="text-4xl font-bold text-green-600 mt-2">{events.length}</div>
                        <div className="text-xs text-muted-foreground mt-2">Fasilitas dan lokasi umum tercatat</div>
                    </div>

                    {/* Table */}
                    <div className="border rounded-lg">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left p-3 font-semibold">Nama Lokasi</th>
                                    <th className="text-left p-3 font-semibold">Koordinat</th>
                                    <th className="text-left p-3 font-semibold">Deskripsi</th>
                                    <th className="text-left p-3 font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event) => (
                                    <tr key={event.id} className="border-t hover:bg-muted/30">
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-green-600" />
                                                <span className="font-medium">{event.title}</span>
                                            </div>
                                        </td>
                                        <td className="p-3 text-sm text-muted-foreground font-mono">
                                            {event.latitude}, {event.longitude}
                                        </td>
                                        <td className="p-3 text-sm text-muted-foreground">
                                            {event.description}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-2">
                                                <button className="p-2 hover:bg-muted rounded">
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button className="p-2 hover:bg-muted rounded text-red-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
