import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import MapView from '@/components/maps/map-view';
import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, Car, AlertTriangle, Layers } from 'lucide-react';
import { DESA_TEGALSAMBI_BOUNDARY } from '@/data/mockMapEvents';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';


const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Peta Interaktif', href: '/peta-interaktif' },
];

interface LokasiPentingMarker {
    id: number;
    nama: string;
    description?: string;
    latitude: number;
    longitude: number;
    // Tambahkan properti lain jika ada
}

export default function PetaInteraktif() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeLayers, setActiveLayers] = useState<string[]>(() => {
        const params = new URLSearchParams(window.location.search);
        const layerParam = params.get('layer');
        if (layerParam) {
            return [layerParam];
        } else {
            return ['fasilitas-umum', 'fasilitas-privat', 'fasilitas-jalan', 'batas-wilayah'];
        }
    });
    const [showLayerPanel, setShowLayerPanel] = useState(false);
    const [lokasiPentingMarkers, setLokasiPentingMarkers] = useState<LokasiPentingMarker[]>([]);
    const [fasilitasUmumMarkers, setFasilitasUmumMarkers] = useState([]);
    const [fasilitasPrivatMarkers, setFasilitasPrivatMarkers] = useState([]);
    const [fasilitasJalanMarkers, setFasilitasJalanMarkers] = useState([]);
    const [bencanaBerlangsungMarkers, setBencanaBerlangsungMarkers] = useState([]);
    const [bencanaRiwayatMarkers, setBencanaRiwayatMarkers] = useState([]);
    const [rumahMarkers, setRumahMarkers] = useState([]);
    const [batasWilayahMarkers, setBatasWilayahMarkers] = useState([]);

    useEffect(() => {
        const fetchDataForLayer = async (layer: string) => {
            try {
                switch (layer) {
                    case 'fasilitas-umum':
                        const responseFasilitasUmum = await axios.get(route('api.markers.fasilitas', { tipe: 'umum' }));
                        setFasilitasUmumMarkers(responseFasilitasUmum.data);
                        break;
                    case 'fasilitas-privat':
                        const responseFasilitasPrivat = await axios.get(route('api.markers.fasilitas', { tipe: 'privat' }));
                        setFasilitasPrivatMarkers(responseFasilitasPrivat.data);
                        break;
                    case 'fasilitas-jalan':
                        const responseFasilitasJalan = await axios.get(route('api.markers.fasilitas', { tipe: 'jalan' }));
                        setFasilitasJalanMarkers(responseFasilitasJalan.data);
                        break;
                    case 'batas-wilayah':
                        const responseBatasWilayah = await axios.get(route('api.markers.batas-wilayah'));
                        const transformedData = responseBatasWilayah.data.map((item: any) => ({
                            ...item,
                            coordinates: Array.isArray(item.coordinates) ? item.coordinates : []
                        }));
                        setBatasWilayahMarkers(transformedData);
                        break;
                    default:
                        break;
                }
            } catch (error) {
                console.error(`Error fetching ${layer}:`, error);
            }
        };

        activeLayers.forEach(fetchDataForLayer);

        const fetchLokasiPenting = async () => {
            try {
                const response = await axios.get(route('api.markers.lokasi-penting'));
                setLokasiPentingMarkers(response.data);
            } catch (error) {
                console.error('Error fetching lokasi penting:', error);
            }
        };
        fetchLokasiPenting();
    }, [activeLayers]);

    // Filter locations based on search (now using API data for lokasiPenting)
    const filteredLokasiPenting = useMemo(() => {
        if (!searchQuery) return lokasiPentingMarkers;
        const query = searchQuery.toLowerCase();
        return lokasiPentingMarkers.filter((loc: LokasiPentingMarker) =>
            loc.nama.toLowerCase().includes(query) || loc.description?.toLowerCase().includes(query)
        );
    }, [searchQuery, lokasiPentingMarkers]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const toggleLayer = (layerId: string) => {
        setActiveLayers(prev =>
            prev.includes(layerId)
                ? prev.filter(l => l !== layerId)
                : [...prev, layerId]
        );
    };

    const layerOptions = [
        { id: 'fasilitas-umum', label: 'Fasilitas Umum', icon: '🏥' },
        { id: 'fasilitas-privat', label: 'Fasilitas Privat', icon: '🏢' },
        { id: 'fasilitas-jalan', label: 'Fasilitas Jalan', icon: '🛣️' },
        { id: 'batas-wilayah', label: 'Batas Wilayah', icon: '📍' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Peta Interaktif" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 relative">
                {/* Search Bar Overlay */}
                <div className="absolute top-8 left-8 z-[400] w-72 bg-background/90 backdrop-blur shadow-lg rounded-lg border p-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Cari lokasi di Desa Tegalsambi..."
                            className="w-full pl-8 pr-4 py-2 text-sm bg-transparent border-none focus:ring-0 outline-none"
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                    </div>
                    {searchQuery && (
                        <div className="mt-2 max-h-60 overflow-y-auto border-t pt-2">
                            {filteredLokasiPenting.length > 0 ? (
                                <ul className="space-y-1">
                                    {filteredLokasiPenting.map((loc: LokasiPentingMarker) => (
                                        <li
                                            key={loc.id}
                                            className="px-2 py-1.5 hover:bg-muted rounded cursor-pointer text-sm flex flex-col"
                                            onClick={() => {
                                                setSearchQuery(loc.nama);
                                            }}
                                        >
                                            <span className="font-medium flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {loc.nama}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{loc.description}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground px-2 py-1">Tidak ditemukan</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Layer Panel Toggle Button */}
                <div className="absolute bottom-8 right-8 z-[400]">
                    <Button
                        onClick={() => setShowLayerPanel(!showLayerPanel)}
                        className="rounded-full shadow-lg"
                        size="icon"
                    >
                        <Layers className="h-4 w-4" />
                    </Button>
                </div>

                {/* Layer Panel */}
                {showLayerPanel && (
                    <div className="absolute bottom-20 right-8 z-[400] bg-background/95 backdrop-blur shadow-lg rounded-lg border p-4 w-72 max-h-96 overflow-y-auto">
                        <h4 className="font-semibold text-sm mb-3">Pilih Layer</h4>
                        <div className="space-y-2">
                            {layerOptions.map(layer => (
                                <div key={layer.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={layer.id}
                                        checked={activeLayers.includes(layer.id)}
                                        onCheckedChange={() => toggleLayer(layer.id)}
                                    />
                                    <Label htmlFor={layer.id} className="text-sm cursor-pointer flex items-center gap-2">
                                        <span>{layer.icon}</span>
                                        {layer.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}



                <div className="rounded-xl border border-sidebar-border/70 p-0 overflow-hidden h-[calc(100vh-8rem)] dark:border-sidebar-border shadow-md">
                    <MapView
                        lokasiPenting={filteredLokasiPenting} // Fetched API data
                        fasilitasUmum={fasilitasUmumMarkers} // Fetched API data
                        fasilitasPrivat={fasilitasPrivatMarkers} // Fetched API data
                        fasilitasJalan={fasilitasJalanMarkers} // Fetched API data
                        batasWilayah={batasWilayahMarkers} // Fetched API data
                        villageBoundary={DESA_TEGALSAMBI_BOUNDARY}
                        activeLayers={activeLayers}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
