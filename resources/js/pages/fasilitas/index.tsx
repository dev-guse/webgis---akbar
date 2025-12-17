import React, { useState } from 'react';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { Head, Link, router } from '@inertiajs/react';
import { SharedData } from '@/types';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, LayersControl, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { DESA_TEGALSAMBI_CENTER, DESA_TEGALSAMBI_BOUNDARY } from '@/data/mockMapEvents';
import { facilityIcons, getFacilityIconSVG } from '@/lib/map-icons';
import { Eye } from 'lucide-react';
import MapLegend from '@/components/maps/MapLegend';
import { fixLeafletDefaultIcon } from '@/lib/leaflet-utils';

fixLeafletDefaultIcon();

interface FasilitasItem {
    id: number;
    desa_id: number;
    desa: { nama: string };
    nama: string;
    jenis: string;
    kondisi: string;
    koordinat: [number, number]; // [longitude, latitude]
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
    tipe_akses: 'umum' | 'privat';
    created_at: string;
    updated_at: string;
}

interface FasilitasIndexProps extends SharedData {
    fasilitas: FasilitasItem[];
    tipeAkses: 'umum' | 'privat';
}

const FasilitasIndex: React.FC<FasilitasIndexProps> = ({ auth, fasilitas, tipeAkses }) => {
    const pageTitle = tipeAkses === 'umum' ? 'Fasilitas Umum' : 'Fasilitas Privat';
    const [mapCenter, setMapCenter] = useState<[number, number]>(DESA_TEGALSAMBI_CENTER);
    const [mapZoom, setMapZoom] = useState(14);
    const [mapKey, setMapKey] = useState(0);
    const pageDescription = tipeAkses === 'umum' ? 'Daftar dan pengelolaan fasilitas umum' : 'Daftar dan pengelolaan fasilitas privat';

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus fasilitas ini?')) {
            router.delete(route('fasilitas.destroy', { id: id }), {
                onSuccess: () => {
                    // This will cause a full page reload and re-fetch of data
                    router.visit(route('fasilitas.index', { tipe: tipeAkses }));
                },
                onError: (errors) => {
                    console.error("Error deleting:", errors);
                    alert("Gagal menghapus fasilitas.");
                }
            });
        }
    };

    const handleRowClick = (item: FasilitasItem) => {
        if (item.koordinat && item.koordinat.length === 2) {
            setMapCenter([item.koordinat[1], item.koordinat[0]]);
            setMapZoom(18);
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
                                <Button>Tambah {pageTitle}</Button>
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
                                                    fillColor: '#3b82f6',
                                                    fillOpacity: 0.1,
                                                    weight: 2,
                                                    dashArray: '5, 5'
                                                }}
                                            />
                                        </LayersControl.Overlay>
                                    )}

                                    <LayersControl.Overlay checked name={pageTitle}>
                                        <LayerGroup>
                                            {fasilitas.map((item) => (
                                                item.koordinat && item.koordinat.length === 2 && (
                                                    <Marker
                                                        key={item.id}
                                                        position={[item.koordinat[1], item.koordinat[0]]}
                                                        icon={facilityIcons[item.jenis] || facilityIcons['default']}
                                                    >
                                                        <Popup>
                                                            <div className="font-bold">{item.nama}</div>
                                                            <div>Jenis: {item.jenis}</div>
                                                            <div>Kondisi: {item.kondisi}</div>
                                                            {item.alamat_manual && <div>Alamat: {item.alamat_manual}</div>}
                                                            {item.rt && item.rw && <div>RT/RW: {item.rt}/{item.rw}</div>}
                                                            {item.no_telepon && <div>Telepon: {item.no_telepon}</div>}
                                                            {item.jam_operasional && <div>Jam: {item.jam_operasional}</div>}
                                                            {item.penanggung_jawab && <div>PJ: {item.penanggung_jawab}</div>}
                                                            <div className="flex gap-2 mt-2">
                                                                <Link href={route('fasilitas.edit', { fasilita: item.id, tipe: tipeAkses })}>
                                                                    <Button size="sm">Edit</Button>
                                                                </Link>
                                                                <Button variant="destructive" onClick={() => handleDelete(item.id)} size="sm">Hapus</Button>
                                                            </div>
                                                        </Popup>
                                                    </Marker>
                                                )
                                            ))}
                                        </LayerGroup>
                                    </LayersControl.Overlay>
                                </LayersControl>
                                <MapLegend
                                    title="Legenda Fasilitas"
                                    items={Object.keys(facilityIcons)
                                        .filter(type => fasilitas.some(f => f.jenis === type))
                                        .map(type => ({
                                            label: type.replace(/_/g, ' '),
                                            color: 'transparent',
                                            type: 'point',
                                            iconHtml: getFacilityIconSVG(type, undefined, undefined, 24)
                                        }))}
                                />
                            </MapContainer>
                        </div>

                        {/* Table Section */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Nama</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Jenis</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Alamat</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">RT/RW</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Kondisi</th>
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
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.jenis}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {item.alamat_manual || item.alamat_auto || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {item.rt && item.rw ? `${item.rt}/${item.rw}` : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.kondisi}</td>
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
                                            <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">Belum ada {pageTitle}</td>
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

export default FasilitasIndex;