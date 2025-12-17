import React, { useState } from 'react';
import BaseMapLayers from '@/components/maps/BaseMapLayers';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { SharedData } from '@/types';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, useMap, LayersControl, LayerGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { DESA_TEGALSAMBI_CENTER, DESA_TEGALSAMBI_BOUNDARY } from '@/data/mockMapEvents';
import { fixLeafletDefaultIcon } from '@/lib/leaflet-utils';
import MapLegend from '@/components/maps/MapLegend';
import { Eye } from 'lucide-react';
import { getRoadColor } from '@/lib/road-utils';

fixLeafletDefaultIcon();

interface FasilitasItem {
    id: number;
    desa_id: number;
    desa: { nama: string };
    nama: string;
    jenis: string;
    kondisi: string;
    koordinat: any; // Can be [lng, lat] or GeoJSON LineString
    alamat_auto?: string;
    alamat_manual?: string;
    rt?: string;
    rw?: string;
    no_telepon?: string;
    jam_operasional?: string;
    kapasitas?: number;
    tahun_dibangun?: number;
    penanggung_jawab?: string;
    keterangan?: string;
    tipe_akses: 'umum' | 'privat' | 'jalan';
    created_at: string;
    updated_at: string;
}

interface FasilitasIndexProps extends SharedData {
    fasilitas: FasilitasItem[];
    tipeAkses: 'umum' | 'privat' | 'jalan';
}

const FasilitasJalanIndex: React.FC<FasilitasIndexProps> = ({ auth, fasilitas, tipeAkses }) => {
    const pageTitle = 'Fasilitas Jalan';
    const [mapCenter, setMapCenter] = useState<[number, number]>(DESA_TEGALSAMBI_CENTER);
    const [mapZoom, setMapZoom] = useState(14);
    const [mapKey, setMapKey] = useState(0);
    const pageDescription = 'Daftar dan pengelolaan data jalan desa';

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus data jalan ini?')) {
            router.delete(route('fasilitas.destroy', { id: id }), {
                onSuccess: () => {
                    router.visit(route('fasilitas.index', { tipe: tipeAkses }));
                },
                onError: (errors) => {
                    console.error("Error deleting:", errors);
                    alert("Gagal menghapus data.");
                }
            });
        }
    };

    const handleRowClick = (item: FasilitasItem) => {
        let coords = item.koordinat;
        // Parse if string
        if (typeof coords === 'string') {
            try {
                coords = JSON.parse(coords);
            } catch (e) {
                console.error("Failed to parse coordinates", e);
                return;
            }
        }

        if (coords && coords.type === 'LineString' && coords.coordinates && coords.coordinates.length > 0) {
            // GeoJSON uses [lng, lat], Leaflet uses [lat, lng].
            // We need to find center of the line
            const firstPoint = coords.coordinates[0];
            setMapCenter([firstPoint[1], firstPoint[0]]);
            setMapZoom(16);
            setMapKey(prev => prev + 1);
        } else if (Array.isArray(coords) && coords.length === 2) {
            setMapCenter([coords[1], coords[0]]);
            setMapZoom(16);
            setMapKey(prev => prev + 1);
        }
    };

    const MapController = ({ center, zoom }: { center: [number, number], zoom: number }) => {
        const map = useMap();
        React.useEffect(() => {
            map.setView(center, zoom);
        }, [center, zoom, map]);
        return null;
    };

    const maxBounds = DESA_TEGALSAMBI_BOUNDARY ? L.latLngBounds(DESA_TEGALSAMBI_BOUNDARY) : undefined;

    return (
        <AppLayoutTemplate>
            <Head title={pageTitle} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{pageDescription}</h3>
                            <Link href={route('fasilitas.create', { tipe: tipeAkses })}>
                                <Button>Tambah Jalan</Button>
                            </Link>
                        </div>

                        <div className="mb-8 rounded-lg overflow-hidden" style={{ height: '500px', width: '100%' }}>
                            <MapContainer
                                key={mapKey}
                                center={mapCenter}
                                zoom={mapZoom}
                                scrollWheelZoom={true}
                                style={{ height: '100%', width: '100%' }}
                                maxBounds={maxBounds}
                                maxBoundsViscosity={1.0}
                                minZoom={13}
                            >
                                <MapController center={mapCenter} zoom={mapZoom} />
                                <LayersControl position="topright">
                                    <LayersControl.BaseLayer checked name="OpenStreetMap">
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                    </LayersControl.BaseLayer>
                                    <LayersControl.BaseLayer name="Satellite (Esri)">
                                        <TileLayer
                                            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                        />
                                    </LayersControl.BaseLayer>
                                    <LayersControl.BaseLayer name="Topographic (OpenTopoMap)">
                                        <TileLayer
                                            attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
                                            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                                        />
                                    </LayersControl.BaseLayer>
                                    {DESA_TEGALSAMBI_BOUNDARY && (
                                        <LayersControl.Overlay checked name="Batas Desa">
                                            <Polygon
                                                positions={DESA_TEGALSAMBI_BOUNDARY}
                                                pathOptions={{
                                                    color: '#2563eb',
                                                    fillColor: 'transparent',
                                                    weight: 3,
                                                    dashArray: '5, 5'
                                                }}
                                            />
                                        </LayersControl.Overlay>
                                    )}
                                    <LayersControl.Overlay checked name="Jalan">
                                        <LayerGroup>
                                            {fasilitas.map((item) => {
                                                let coords = item.koordinat;
                                                if (typeof coords === 'string') {
                                                    try {
                                                        coords = JSON.parse(coords);
                                                    } catch (e) { return null; }
                                                }

                                                if (coords && coords.type === 'LineString' && coords.coordinates) {
                                                    // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
                                                    const positions = coords.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
                                                    return (
                                                        <Polyline
                                                            key={item.id}
                                                            positions={positions}
                                                            pathOptions={{ color: getRoadColor(item.jenis), weight: 4 }}
                                                        >
                                                            <Popup>
                                                                <div className="font-bold">{item.nama}</div>
                                                                <div>Jenis: {item.jenis}</div>
                                                                <div>Kondisi: {item.kondisi}</div>
                                                                {item.keterangan && <div>Ket: {item.keterangan}</div>}
                                                                <div className="flex gap-2 mt-2">
                                                                    <Link href={route('fasilitas.edit', { fasilita: item.id, tipe: tipeAkses })}>
                                                                        <Button size="sm">Edit</Button>
                                                                    </Link>
                                                                    <Button variant="destructive" onClick={() => handleDelete(item.id)} size="sm">Hapus</Button>
                                                                </div>
                                                            </Popup>
                                                        </Polyline>
                                                    );
                                                }
                                                return null;
                                            })}
                                        </LayerGroup>
                                    </LayersControl.Overlay>
                                </LayersControl>
                                <MapLegend
                                    title="Jenis Jalan"
                                    items={[
                                        { label: 'Jalan Nasional', color: '#dc2626', type: 'line' },
                                        { label: 'Jalan Provinsi', color: '#ea580c', type: 'line' },
                                        { label: 'Jalan Kabupaten', color: '#eab308', type: 'line' },
                                        { label: 'Jalan Desa', color: '#16a34a', type: 'line' },
                                        { label: 'Jalan Lingkungan', color: '#2563eb', type: 'line' },
                                        { label: 'Jalan Setapak', color: '#9333ea', type: 'line' },
                                    ]}
                                />
                            </MapContainer>
                        </div>

                        {/* Table Section */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Nama Jalan</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Jenis</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Kondisi</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Keterangan</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {fasilitas.length > 0 ? (
                                        fasilitas.map((item) => (
                                            <tr
                                                key={item.id}
                                                onClick={() => handleRowClick(item)}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{item.nama}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">{item.jenis.replace(/_/g, ' ')}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">{item.kondisi.replace(/_/g, ' ')}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.keterangan || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex gap-2">
                                                        <Link href={route('fasilitas.show', { id: item.id })}>
                                                            <Button size="sm" variant="outline">
                                                                <Eye className="h-4 w-4 mr-1" />
                                                                Detail
                                                            </Button>
                                                        </Link>
                                                        <Link href={route('fasilitas.edit', { fasilita: item.id, tipe: tipeAkses })}>
                                                            <Button size="sm">Edit</Button>
                                                        </Link>
                                                        <Button variant="destructive" onClick={() => handleDelete(item.id)} size="sm">Hapus</Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">Belum ada data jalan</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayoutTemplate>
    );
};

export default FasilitasJalanIndex;
