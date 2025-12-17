import React, { useState } from 'react';
import BaseMapLayers from '@/components/maps/BaseMapLayers';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { SharedData } from '@/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapContainer, Polygon, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DESA_TEGALSAMBI_CENTER, DESA_TEGALSAMBI_BOUNDARY } from '@/data/mockMapEvents';
import MapLegend from '@/components/maps/MapLegend';
import PolylineDrawer from '@/components/maps/PolylineDrawer';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Command,
    CommandInput,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRoadColor, calculatePolylineLength, formatLength } from '@/lib/road-utils';

interface Desa {
    id: number;
    nama: string;
}

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

interface FasilitasEditProps extends SharedData {
    fasilitas: FasilitasItem;
    desa: Desa[];
    tipeAkses: 'umum' | 'privat' | 'jalan';
    jenisOptions: string[];
    kondisiOptions: string[];
}

const FasilitasJalanEdit: React.FC<FasilitasEditProps> = ({ auth, fasilitas, desa, tipeAkses, jenisOptions, kondisiOptions }) => {
    const pageTitle = `Edit Data Jalan`;

    // Parse initial coordinates
    let initialPolylineCoords: [number, number][] | null = null;
    let initialStringCoords = '';

    try {
        if (fasilitas.koordinat) {
            const parsed = typeof fasilitas.koordinat === 'string' ? JSON.parse(fasilitas.koordinat) : fasilitas.koordinat;

            if (parsed.type === 'LineString' && Array.isArray(parsed.coordinates)) {
                // GeoJSON uses [lng, lat], Leaflet wants [lat, lng]
                initialPolylineCoords = parsed.coordinates.map((c: any) => [c[1], c[0]]);
                initialStringCoords = JSON.stringify(parsed);
            } else if (Array.isArray(parsed) && Array.isArray(parsed[0])) {
                initialPolylineCoords = parsed as [number, number][];
                initialStringCoords = JSON.stringify({ type: 'LineString', coordinates: parsed.map(c => [c[1], c[0]]) });
            }
        }
    } catch (e) {
        console.error("Error parsing existing coordinates", e);
    }

    const { data, setData, put, processing, errors } = useForm({
        desa_id: fasilitas.desa_id.toString(),
        nama: fasilitas.nama,
        jenis: fasilitas.jenis,
        kondisi: fasilitas.kondisi,
        koordinat: initialStringCoords,
        alamat_auto: fasilitas.alamat_auto || '',
        alamat_manual: fasilitas.alamat_manual || '',
        rt: fasilitas.rt || '',
        rw: fasilitas.rw || '',
        no_telepon: fasilitas.no_telepon || '',
        jam_operasional: fasilitas.jam_operasional || '',
        kapasitas: fasilitas.kapasitas ? String(fasilitas.kapasitas) : '',
        tahun_dibangun: fasilitas.tahun_dibangun ? String(fasilitas.tahun_dibangun) : '',
        penanggung_jawab: fasilitas.penanggung_jawab || '',
        keterangan: fasilitas.keterangan || '',
        tipe_akses: fasilitas.tipe_akses,
    });

    const [polylineCoords, setPolylineCoords] = useState<[number, number][] | null>(initialPolylineCoords);
    const [roadLength, setRoadLength] = useState<number>(initialPolylineCoords ? calculatePolylineLength(initialPolylineCoords) : 0);
    const [openJenisCombobox, setOpenJenisCombobox] = useState(false);

    const handlePolylineComplete = (coords: [number, number][]) => {
        setPolylineCoords(coords);
        const length = calculatePolylineLength(coords);
        setRoadLength(length);

        // Store as LineString GeoJSON
        const lineString = {
            type: 'LineString',
            coordinates: coords.map(([lat, lng]) => [lng, lat]) // GeoJSON uses [lng, lat]
        };
        setData('koordinat', JSON.stringify(lineString));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('fasilitas.update', { id: fasilitas.id }));
    };

    const maxBounds = DESA_TEGALSAMBI_BOUNDARY ? L.latLngBounds(DESA_TEGALSAMBI_BOUNDARY) : undefined;

    // Determine center
    const mapCenter = (polylineCoords && polylineCoords.length > 0) ? polylineCoords[0] : DESA_TEGALSAMBI_CENTER;

    const currentColor = data.jenis ? getRoadColor(data.jenis) : '#3b82f6';
    const isRoadTypeSelected = !!data.jenis;

    const formattedJenisOptions = jenisOptions.map((jenis) => ({
        value: jenis,
        label: jenis.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    }));

    return (
        <AppLayoutTemplate>
            <Head title={pageTitle} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{pageTitle}</h3>

                        <form onSubmit={submit} className="space-y-6">
                            <Card className="p-6">
                                <h4 className="text-lg font-semibold mb-4">Detail Jalan</h4>

                                <div>
                                    <Label htmlFor="nama">Nama Jalan</Label>
                                    <Input
                                        id="nama"
                                        name="nama"
                                        value={data.nama}
                                        className="mt-1 block w-full"
                                        autoComplete="nama"
                                        onChange={(e) => setData('nama', e.target.value)}
                                    />
                                    <InputError message={errors.nama} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="jenis">Jenis Jalan</Label>
                                    <Popover open={openJenisCombobox} onOpenChange={setOpenJenisCombobox}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openJenisCombobox}
                                                className="w-full justify-between mt-1"
                                            >
                                                {data.jenis
                                                    ? formattedJenisOptions.find((jenis) => jenis.value === data.jenis)?.label
                                                    : "Pilih Jenis Jalan..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-[9999]">
                                            <Command>
                                                <CommandInput placeholder="Cari jenis jalan..." />
                                                <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                                                <CommandGroup>
                                                    {formattedJenisOptions.map((jenis) => (
                                                        <CommandItem
                                                            key={jenis.value}
                                                            value={jenis.value}
                                                            onSelect={(currentValue) => {
                                                                setData('jenis', currentValue === data.jenis ? "" : currentValue);
                                                                setOpenJenisCombobox(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    data.jenis === jenis.value ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getRoadColor(jenis.value) }}></div>
                                                                {jenis.label}
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <InputError message={errors.jenis} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="kondisi">Kondisi</Label>
                                    <select
                                        id="kondisi"
                                        name="kondisi"
                                        value={data.kondisi}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                        onChange={(e) => setData('kondisi', e.target.value)}
                                    >
                                        <option value="">Pilih Kondisi</option>
                                        {kondisiOptions.map((kondisi) => (
                                            <option key={kondisi} value={kondisi}>
                                                {kondisi.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.kondisi} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="keterangan">Keterangan</Label>
                                    <Input
                                        id="keterangan"
                                        name="keterangan"
                                        value={data.keterangan}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('keterangan', e.target.value)}
                                    />
                                    <InputError message={errors.keterangan} className="mt-2" />
                                </div>
                            </Card>

                            <Card className="p-6">
                                <h4 className="text-lg font-semibold mb-4">Jalur Jalan</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <Label>Edit Jalur (Polyline)</Label>
                                            <p className="text-xs text-gray-500 dark:text-gray-300 mb-2">
                                                {isRoadTypeSelected
                                                    ? "Klik pada peta untuk menggambar ulang jalur jalan."
                                                    : "⚠️ Silakan pilih 'Jenis Jalan' terlebih dahulu."}
                                            </p>
                                        </div>
                                        {roadLength > 0 && (
                                            <div className="text-right">
                                                <Label>Estimasi Panjang</Label>
                                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                    {formatLength(roadLength)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="rounded-lg overflow-hidden relative" style={{ height: '400px', width: '100%' }}>
                                        {!isRoadTypeSelected && (
                                            <div className="absolute inset-0 bg-gray-900/10 z-[1000] flex items-center justify-center backdrop-blur-[1px]">
                                                <div className="bg-white p-4 rounded shadow-lg text-center">
                                                    <p className="text-red-500 font-medium">Pilih Jenis Jalan Terlebih Dahulu</p>
                                                </div>
                                            </div>
                                        )}

                                        <MapContainer
                                            center={mapCenter}
                                            zoom={14}
                                            scrollWheelZoom={true}
                                            style={{ height: '100%', width: '100%' }}
                                            maxBounds={maxBounds}
                                            maxBoundsViscosity={1.0}
                                            minZoom={13}
                                        >
                                            <BaseMapLayers />
                                            <MapLegend
                                                title="Legenda"
                                                items={data.jenis ? [
                                                    {
                                                        label: formattedJenisOptions.find(j => j.value === data.jenis)?.label || data.jenis,
                                                        color: currentColor,
                                                        type: 'line'
                                                    }
                                                ] : []}
                                            />
                                            {DESA_TEGALSAMBI_BOUNDARY && (
                                                <Polygon
                                                    positions={DESA_TEGALSAMBI_BOUNDARY}
                                                    pathOptions={{
                                                        color: '#94a3b8',
                                                        fillColor: '#cbd5e1',
                                                        fillOpacity: 0.1,
                                                        weight: 1,
                                                        dashArray: '5, 5'
                                                    }}
                                                />
                                            )}

                                            {isRoadTypeSelected && (
                                                <PolylineDrawer
                                                    onPolylineComplete={handlePolylineComplete}
                                                    color={currentColor}
                                                />
                                            )}

                                            {polylineCoords && (
                                                <Polyline
                                                    positions={polylineCoords}
                                                    pathOptions={{
                                                        color: currentColor,
                                                        weight: 5,
                                                        opacity: 0.8
                                                    }}
                                                />
                                            )}
                                        </MapContainer>
                                    </div>
                                    <InputError message={errors.koordinat} className="mt-2" />
                                </div>
                            </Card>

                            <input type="hidden" name="tipe_akses" value={data.tipe_akses} />

                            <div className="flex items-center gap-4">
                                <Button disabled={processing}>Simpan Perubahan</Button>
                                <Link href={route('fasilitas.index', { tipe: tipeAkses })} className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800">
                                    Batal
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayoutTemplate>
    );
};

export default FasilitasJalanEdit;
