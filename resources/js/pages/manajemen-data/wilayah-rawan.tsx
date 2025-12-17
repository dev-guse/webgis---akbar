import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { getEventsByType, type MapEvent } from '@/data/mockMapEvents';
import { AlertTriangle, Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manajemen Data', href: '/manajemen-data' },
    { title: 'Wilayah Rawan', href: '/manajemen-data/wilayah-rawan' },
];

export default function WilayahRawan() {
    const [events] = useState<MapEvent[]>(getEventsByType('hazard'));
    const [filter, setFilter] = useState<string>('all');

    const filteredEvents = filter === 'all'
        ? events
        : events.filter(e => e.hazard_type === filter);

    const getHazardTypeBadgeColor = (type?: string) => {
        switch (type) {
            case 'banjir':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'longsor':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
            case 'kriminal':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'kebakaran':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Wilayah Rawan" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                                Data Wilayah Rawan
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Kelola data wilayah rawan di Desa Somagede
                            </p>
                        </div>
                        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Wilayah Rawan
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        <div className="p-4 rounded-lg border bg-card">
                            <div className="text-sm text-muted-foreground">Total</div>
                            <div className="text-2xl font-bold">{events.length}</div>
                        </div>
                        <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
                            <div className="text-sm text-muted-foreground">Banjir</div>
                            <div className="text-2xl font-bold text-blue-600">
                                {getEventsByType('hazard').filter(e => e.hazard_type === 'banjir').length}
                            </div>
                        </div>
                        <div className="p-4 rounded-lg border bg-orange-50 dark:bg-orange-950/20">
                            <div className="text-sm text-muted-foreground">Longsor</div>
                            <div className="text-2xl font-bold text-orange-600">
                                {getEventsByType('hazard').filter(e => e.hazard_type === 'longsor').length}
                            </div>
                        </div>
                        <div className="p-4 rounded-lg border bg-red-50 dark:bg-red-950/20">
                            <div className="text-sm text-muted-foreground">Kriminal</div>
                            <div className="text-2xl font-bold text-red-600">
                                {getEventsByType('hazard').filter(e => e.hazard_type === 'kriminal').length}
                            </div>
                        </div>
                        <div className="p-4 rounded-lg border bg-yellow-50 dark:bg-yellow-950/20">
                            <div className="text-sm text-muted-foreground">Kebakaran</div>
                            <div className="text-2xl font-bold text-yellow-600">
                                {getEventsByType('hazard').filter(e => e.hazard_type === 'kebakaran').length}
                            </div>
                        </div>
                    </div>

                    {/* Filter */}
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted hover:bg-muted/80'
                                }`}
                        >
                            Semua
                        </button>
                        <button
                            onClick={() => setFilter('banjir')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'banjir'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-muted hover:bg-muted/80'
                                }`}
                        >
                            Banjir
                        </button>
                        <button
                            onClick={() => setFilter('longsor')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'longsor'
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-muted hover:bg-muted/80'
                                }`}
                        >
                            Longsor
                        </button>
                        <button
                            onClick={() => setFilter('kriminal')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'kriminal'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-muted hover:bg-muted/80'
                                }`}
                        >
                            Kriminal
                        </button>
                        <button
                            onClick={() => setFilter('kebakaran')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'kebakaran'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-muted hover:bg-muted/80'
                                }`}
                        >
                            Kebakaran
                        </button>
                    </div>

                    {/* Table */}
                    <div className="border rounded-lg">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left p-3 font-semibold">Judul</th>
                                    <th className="text-left p-3 font-semibold">Jenis</th>
                                    <th className="text-left p-3 font-semibold">Tipe Area</th>
                                    <th className="text-left p-3 font-semibold">Deskripsi</th>
                                    <th className="text-left p-3 font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEvents.map((event) => (
                                    <tr key={event.id} className="border-t hover:bg-muted/30">
                                        <td className="p-3 font-medium">{event.title}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getHazardTypeBadgeColor(event.hazard_type)}`}>
                                                {event.hazard_type?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            {event.polygon ? (
                                                <span className="px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                                                    Polygon
                                                </span>
                                            ) : event.polyline ? (
                                                <span className="px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                                    Polyline
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                                    Circle
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3 text-sm text-muted-foreground max-w-md truncate">
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
