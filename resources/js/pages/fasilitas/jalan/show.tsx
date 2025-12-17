import React from 'react';
import BaseMapLayers from '@/components/maps/BaseMapLayers';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { Head, Link } from '@inertiajs/react';
import { SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapContainer, Polyline, Polygon, LayersControl, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DESA_TEGALSAMBI_CENTER, DESA_TEGALSAMBI_BOUNDARY } from '@/data/mockMapEvents';
import MapLegend from '@/components/maps/MapLegend';
import { ArrowLeft, Edit } from 'lucide-react';
import { getRoadColor, calculatePolylineLength, formatLength } from '@/lib/road-utils';

interface FasilitasItem {
    id: number;
    desa_id: number;
    nama: string;
    jenis: string;
    kondisi: string;
    koordinat: any; // GeoJSON or array
    alamat_auto?: string;
    alamat_manual?: string;
    rt?: string;
    rw?: string;
    no_telepon?: string;
    jam_operasional?: string;
    kapasitas?: number;
    tahun_dibangun?: number;
    penanggung_jawab?: string;
    keterangan: string | null;
    tipe_akses: 'umum' | 'privat' | 'jalan';
    desa?: {
        id: number;
        nama: string;
    };
}

interface FasilitasShowProps extends SharedData {
    fasilitas: FasilitasItem;
}

const FasilitasJalanShow: React.FC<FasilitasShowProps> = ({ auth, fasilitas }) => {
    const pageTitle = `Detail Jalan`;

    // Parse coordinates
    let polylineCoords: [number, number][] | null = null;
    try {
        if (fasilitas.koordinat) {
            const parsed = typeof fasilitas.koordinat === 'string' ? JSON.parse(fasilitas.koordinat) : fasilitas.koordinat;

            if (parsed.type === 'LineString' && Array.isArray(parsed.coordinates)) {
                // GeoJSON uses [lng, lat], Leaflet wants [lat, lng]
                polylineCoords = parsed.coordinates.map((c: any) => [c[1], c[0]]);
            } else if (Array.isArray(parsed) && Array.isArray(parsed[0])) {
                polylineCoords = parsed as [number, number][];
            }
        }
    } catch (e) {
        console.error("Error parsing coordinates", e);
    }

    const roadLength = polylineCoords ? calculatePolylineLength(polylineCoords) : 0;

    const maxBounds = DESA_TEGALSAMBI_BOUNDARY ? L.latLngBounds(DESA_TEGALSAMBI_BOUNDARY) : undefined;
    const mapCenter = (polylineCoords && polylineCoords.length > 0) ? polylineCoords[0] : DESA_TEGALSAMBI_CENTER;

    const formatLabel = (str: string) => {
        return str.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    };

    return (
        <AppLayoutTemplate>
            <Head title={pageTitle} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <Link href={route('fasilitas.index', { tipe: fasilitas.tipe_akses })}>
                            <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                            </Button>
                        </Link>
                        <Link href={route('fasilitas.edit', { fasilita: fasilitas.id })}>
                            <Button>
                                <Edit className="mr-2 h-4 w-4" /> Edit Data Jalan
                            </Button>
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{fasilitas.nama}</h3>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <Card className="p-6">
                                    <h4 className="text-lg font-semibold mb-4 border-b pb-2">Informasi Utama</h4>
                                    <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                        <div className="sm:col-span-1">
                                            <dt className="text-sm font-medium text-gray-500">Jenis Jalan</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{formatLabel(fasilitas.jenis)}</dd>
                                        </div>
                                        <div className="sm:col-span-1">
                                            <dt className="text-sm font-medium text-gray-500">Kondisi</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${fasilitas.kondisi === 'baik' ? 'bg-green-100 text-green-800' :
                                                    fasilitas.kondisi === 'rusak_ringan' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {formatLabel(fasilitas.kondisi)}
                                                </span>
                                            </dd>
                                        </div>
                                    </dl>
                                </Card>

                                <Card className="p-6">
                                    <h4 className="text-lg font-semibold mb-4 border-b pb-2">Keterangan Tambahan</h4>
                                    <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                        {roadLength > 0 && (
                                            <div className="sm:col-span-1">
                                                <dt className="text-sm font-medium text-gray-500">Estimasi Panjang</dt>
                                                <dd className="mt-1 text-sm text-gray-900 font-bold">{formatLength(roadLength)}</dd>
                                            </div>
                                        )}
                                        <div className="sm:col-span-1">
                                            <dt className="text-sm font-medium text-gray-500">Keterangan</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{fasilitas.keterangan || '-'}</dd>
                                        </div>
                                    </dl>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                <Card className="p-6 h-full flex flex-col">
                                    <h4 className="text-lg font-semibold mb-4 border-b pb-2">Peta Jalur</h4>
                                    <div className="flex-1 rounded-lg overflow-hidden min-h-[400px] relative z-0">
                                        <MapContainer
                                            center={mapCenter}
                                            zoom={15}
                                            scrollWheelZoom={false}
                                            style={{ height: '100%', width: '100%' }}
                                            maxBounds={maxBounds}
                                            maxBoundsViscosity={1.0}
                                            minZoom={13}
                                            dragging={true}
                                            zoomControl={true}
                                        >
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
                                                {polylineCoords && (
                                                    <LayersControl.Overlay checked name="Jalur Jalan">
                                                        <Polyline
                                                            positions={polylineCoords}
                                                            pathOptions={{
                                                                color: getRoadColor(fasilitas.jenis),
                                                                weight: 5,
                                                                opacity: 0.8
                                                            }}
                                                        />
                                                    </LayersControl.Overlay>
                                                )}
                                            </LayersControl>
                                            <MapLegend />
                                        </MapContainer>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayoutTemplate>
    );
};

export default FasilitasJalanShow;
