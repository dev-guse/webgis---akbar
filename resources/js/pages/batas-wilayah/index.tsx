import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, useMap, LayersControl, LayerGroup, Tooltip, Marker } from 'react-leaflet';
import L from 'leaflet';
import { DESA_TEGALSAMBI_CENTER, DESA_TEGALSAMBI_BOUNDARY } from '@/data/mockMapEvents';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, MapPin, Edit, Trash2, Eye } from 'lucide-react';
import { createFacilityIcon, getFacilityIconSVG } from '@/lib/map-icons';

import MapLegend from '@/components/maps/MapLegend';
import MarkerPopupContent from '@/components/maps/MarkerPopupContent';

import { LAND_USE_COLORS, landUseTypes } from '@/lib/map-constants';

const landUseLegendItems = landUseTypes.map(type => ({
    label: type,
    type: 'point' as const,
    iconHtml: createFacilityIcon(type).options.html,
    color: LAND_USE_COLORS[type] || '#000000', // Default to black if color not found
}));


interface BatasWilayah {
    id: number;
    nama: string;
    jenis: string;
    nama_pemilik?: string;
    no_hp_pemilik?: string;
    alamat_pemilik?: string;
    coordinates: [number, number][];
    warna: string;
    opacity: number;
    luas?: number;
    keterangan?: string;
    foto_batas_wilayah?: string;
}

// Helper to format area
const formatLuas = (luas?: number): string => {
    if (!luas) return '-';
    if (luas >= 10000) {
        const hectares = luas / 10000;
        return `${hectares.toFixed(2)} ha`;
    }
    return `${Math.round(luas).toLocaleString('id-ID')} m²`;
};

// Component to control map zoom to specific polygon
function MapController({ targetBounds }: { targetBounds: L.LatLngBounds | null }) {
    const map = useMap();

    useEffect(() => {
        if (targetBounds) {
            map.fitBounds(targetBounds, {
                padding: [50, 50],
                maxZoom: 16,
                animate: true,
                duration: 1
            });
        }
    }, [targetBounds, map]);

    return null;
}

export default function BatasWilayahIndex({ batasWilayah }: { batasWilayah: BatasWilayah[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBatasId, setSelectedBatasId] = useState<number | null>(null);
    const [targetBounds, setTargetBounds] = useState<L.LatLngBounds | null>(null);

    const filteredBatas = batasWilayah.filter(b =>
        b.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.jenis.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus batas wilayah ini?')) {
            router.delete(`/batas-wilayah/${id}`);
        }
    };

    const handleZoomToPolygon = (batas: BatasWilayah) => {
        setSelectedBatasId(batas.id);
        const bounds = L.latLngBounds(batas.coordinates);
        setTargetBounds(bounds);
    };


    const maxBounds = DESA_TEGALSAMBI_BOUNDARY ? L.latLngBounds(DESA_TEGALSAMBI_BOUNDARY) : undefined;

    return (
        <AppLayout>
            <Head title="Batas Wilayah" />
            <div className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Batas Wilayah</h1>
                        <p className="text-muted-foreground">Kelola batas wilayah lahan di Desa Tegalsambi</p>
                    </div>
                    <Link href="/batas-wilayah/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Tambah Batas
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Map Section */}
                    <Card className="lg:col-span-2 h-[600px] flex flex-col overflow-hidden">
                        <CardHeader className="p-4 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-blue-500" /> Peta Batas Wilayah
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Klik item di daftar untuk zoom ke lokasi polygon
                            </p>
                        </CardHeader>
                        <div className="flex-1 relative z-0">
                            <MapContainer
                                center={DESA_TEGALSAMBI_CENTER}
                                zoom={14}
                                scrollWheelZoom={true}
                                style={{ height: '100%', width: '100%' }}
                                maxBounds={maxBounds}
                                maxBoundsViscosity={1.0}
                                minZoom={13}
                            >
                                <MapLegend
                                    title="Legenda Batas Wilayah"
                                    items={landUseLegendItems}
                                />

                                <MapController targetBounds={targetBounds} />

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

                                    {/* Desa Boundary */}
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

                                    {/* Batas Wilayah Polygons */}
                                    <LayersControl.Overlay checked name="Batas Lahan">
                                        <LayerGroup>
                                            {filteredBatas.map((batas) => {
                                                const polygonCenter = L.latLngBounds(batas.coordinates).getCenter();
                                                return (
                                                    <React.Fragment key={batas.id}>
                                                        <Polygon
                                                            positions={batas.coordinates}
                                                            pathOptions={{
                                                                color: '#3b82f6',
                                                                fillColor: '#3b82f6',
                                                                fillOpacity: batas.opacity,
                                                                weight: selectedBatasId === batas.id ? 4 : 2,
                                                            }}
                                                            eventHandlers={{
                                                                click: () => setSelectedBatasId(batas.id)
                                                            }}
                                                        >
                                                            <Tooltip>{batas.nama}</Tooltip>
                                                            <Popup>
                                                                <MarkerPopupContent
                                                                    name={batas.nama}
                                                                    type="batas-wilayah"
                                                                    id={batas.id}
                                                                    imageUrl={batas.foto_batas_wilayah}
                                                                    additionalInfo={[
                                                                        { label: 'Jenis', value: batas.jenis },
                                                                        { label: 'Luas', value: formatLuas(batas.luas) },
                                                                        ...(batas.nama_pemilik ? [{ label: 'Pemilik', value: batas.nama_pemilik }] : []),
                                                                        ...(batas.no_hp_pemilik ? [{ label: 'No. HP', value: batas.no_hp_pemilik }] : []),
                                                                        ...(batas.keterangan ? [{ label: 'Keterangan', value: batas.keterangan }] : []),
                                                                    ]}
                                                                />
                                                            </Popup>
                                                        </Polygon>
                                                        <Marker position={polygonCenter} icon={createFacilityIcon(batas.jenis)} />
                                                    </React.Fragment>
                                                );
                                            })}
                                        </LayerGroup>
                                    </LayersControl.Overlay>
                                </LayersControl>
                            </MapContainer>
                        </div>
                    </Card>

                    {/* Data List Section */}
                    <Card className="h-[600px] flex flex-col">
                        <CardHeader className="p-4 border-b">
                            <CardTitle className="text-lg">Daftar Batas Wilayah</CardTitle>
                            <div className="relative mt-2">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama atau jenis..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Luas</TableHead>
                                        <TableHead>Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredBatas.length > 0 ? (
                                        filteredBatas.map((batas) => (
                                            <TableRow
                                                key={batas.id}
                                                className={`cursor-pointer hover:bg-muted/50 ${selectedBatasId === batas.id ? 'bg-blue-50' : ''}`}
                                                onClick={() => handleZoomToPolygon(batas)}
                                            >
                                                <TableCell>
                                                    <div className="font-medium">{batas.nama}</div>
                                                    <Badge variant="outline" className="text-xs mt-1">
                                                        {batas.jenis}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-muted-foreground">
                                                        {formatLuas(batas.luas)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            title="Zoom ke Polygon"
                                                            onClick={() => handleZoomToPolygon(batas)}
                                                        >
                                                            <MapPin className="h-3 w-3" />
                                                        </Button>
                                                        <Link href={`/batas-wilayah/${batas.id}`}>
                                                            <Button size="sm" variant="outline" title="Detail">
                                                                <Eye className="h-3 w-3" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/batas-wilayah/${batas.id}/edit`}>
                                                            <Button size="sm" variant="outline" title="Edit">
                                                                <Edit className="h-3 w-3" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            title="Hapus"
                                                            onClick={() => handleDelete(batas.id)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                                Tidak ada data ditemukan
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
