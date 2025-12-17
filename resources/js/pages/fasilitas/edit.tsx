import React, { useState } from 'react';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { SharedData } from '@/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapContainer, Marker, useMapEvents, Polygon, LayersControl, TileLayer, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DESA_TEGALSAMBI_CENTER, DESA_TEGALSAMBI_BOUNDARY } from '@/data/mockMapEvents';
import MapLegend from '@/components/maps/MapLegend';
import { facilityIcons, getFacilityIconSVG } from '@/lib/map-icons';
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
import { Check, ChevronsUpDown, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Fix for default Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface Desa {
    id: number;
    nama: string;
}

interface FasilitasItem {
    id: number;
    des_id: number;
    nama: string;
    jenis: string;
    kondisi: string;
    koordinat: number[]; // [longitude, latitude]
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
    tipe_akses: 'umum' | 'privat';
}

interface FasilitasEditProps extends SharedData {
    fasilitas: FasilitasItem;
    desa: Desa[];
    tipeAkses: 'umum' | 'privat';
    jenisOptions: string[];
    kondisiOptions: string[];
}

const FasilitasEdit: React.FC<FasilitasEditProps> = ({ auth, fasilitas, desa, tipeAkses, jenisOptions, kondisiOptions }) => {
    const pageTitle = `Edit Fasilitas ${tipeAkses === 'umum' ? 'Umum' : 'Privat'}`;

    const initialCoordinates = fasilitas.koordinat && fasilitas.koordinat.length === 2
        ? new L.LatLng(fasilitas.koordinat[1], fasilitas.koordinat[0])
        : null;

    const { data, setData, put, processing, errors } = useForm({
        des_id: fasilitas.des_id.toString(),
        nama: fasilitas.nama,
        jenis: fasilitas.jenis,
        kondisi: fasilitas.kondisi,
        koordinat: initialCoordinates ? JSON.stringify([initialCoordinates.lng, initialCoordinates.lat]) : '',
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
        foto: null as File | null,
        tipe_akses: fasilitas.tipe_akses,
    });

    const [markerPosition, setMarkerPosition] = useState<L.LatLng | null>(initialCoordinates);
    const [openJenisCombobox, setOpenJenisCombobox] = useState(false);
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);

    const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("Ukuran foto tidak boleh lebih dari 2MB.");
                return;
            }

            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                alert("Format foto harus JPG, JPEG, atau PNG.");
                return;
            }

            setData('foto', file);

            const reader = new FileReader();
            reader.onload = (e) => {
                setFotoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveFoto = () => {
        setData('foto', null);
        setFotoPreview(null);
    };

    const MapEventHandler = () => {
        const map = useMapEvents({
            click: async (e) => {
                // Validate that a type is selected
                if (!data.jenis) {
                    alert("Silakan pilih Jenis Fasilitas terlebih dahulu sebelum mengubah lokasi.");
                    return;
                }

                const clickedLatLng = e.latlng;
                const bounds = L.latLngBounds(DESA_TEGALSAMBI_BOUNDARY);

                if (bounds.contains(clickedLatLng)) {
                    setMarkerPosition(clickedLatLng);
                    setData('koordinat', JSON.stringify([clickedLatLng.lng, clickedLatLng.lat]));

                    // Reverse geocoding
                    try {
                        const response = await fetch(
                            route('geocoding.reverse', { lat: clickedLatLng.lat, lon: clickedLatLng.lng })
                        );
                        const result = await response.json();

                        if (result && result.display_name) {
                            setData('alamat_auto', result.display_name);
                        }
                    } catch (error) {
                        console.error('Reverse geocoding error:', error);
                    }
                } else {
                    alert('Lokasi marker harus berada di dalam batas desa!');
                }
            },
        });
        return null;
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('fasilitas.update', { id: fasilitas.id }));
    };

    const initialCenter: L.LatLngExpression = markerPosition || DESA_TEGALSAMBI_CENTER;
    const initialZoom = 14;
    const maxBounds = DESA_TEGALSAMBI_BOUNDARY ? L.latLngBounds(DESA_TEGALSAMBI_BOUNDARY) : undefined;

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
                                <h4 className="text-lg font-semibold mb-4">Detail Fasilitas</h4>

                                <div>
                                    <Label htmlFor="nama">Nama Fasilitas</Label>
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
                                    <Label htmlFor="jenis">Jenis</Label>
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
                                                    : "Pilih Jenis..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-[9999]">
                                            <Command>
                                                <CommandInput placeholder="Cari jenis fasilitas..." />
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
                                                            {jenis.label}
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
                            </Card>

                            <Card className="p-6">
                                <h4 className="text-lg font-semibold mb-4">Informasi Lokasi</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="rt">RT</Label>
                                        <Input
                                            id="rt"
                                            name="rt"
                                            value={data.rt}
                                            placeholder="Contoh: 001"
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('rt', e.target.value)}
                                        />
                                        <InputError message={errors.rt} className="mt-2" />
                                    </div>

                                    <div>
                                        <Label htmlFor="rw">RW</Label>
                                        <Input
                                            id="rw"
                                            name="rw"
                                            value={data.rw}
                                            placeholder="Contoh: 002"
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('rw', e.target.value)}
                                        />
                                        <InputError message={errors.rw} className="mt-2" />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <Label htmlFor="alamat_auto">Alamat (Dari Marker)</Label>
                                    <Input
                                        id="alamat_auto"
                                        name="alamat_auto"
                                        value={data.alamat_auto}
                                        className="mt-1 block w-full bg-gray-100 dark:bg-gray-700"
                                        readOnly
                                        placeholder="Klik marker di peta untuk mengisi otomatis"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Alamat ini akan terisi otomatis saat Anda klik marker di peta</p>
                                    <InputError message={errors.alamat_auto} className="mt-2" />
                                </div>

                                <div className="mt-4">
                                    <Label htmlFor="alamat_manual">Alamat (Manual)</Label>
                                    <Input
                                        id="alamat_manual"
                                        name="alamat_manual"
                                        value={data.alamat_manual}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('alamat_manual', e.target.value)}
                                        placeholder="Isi alamat manual jika diperlukan"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Anda bisa mengisi atau mengedit alamat manual di sini</p>
                                    <InputError message={errors.alamat_manual} className="mt-2" />
                                </div>
                            </Card>

                            <Card className="p-6">
                                <h4 className="text-lg font-semibold mb-4">Informasi Tambahan</h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="no_telepon">No. Telepon</Label>
                                        <Input
                                            id="no_telepon"
                                            name="no_telepon"
                                            value={data.no_telepon}
                                            placeholder="Contoh: 081234567890"
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('no_telepon', e.target.value)}
                                        />
                                        <InputError message={errors.no_telepon} className="mt-2" />
                                    </div>

                                    <div>
                                        <Label htmlFor="jam_operasional">Jam Operasional</Label>
                                        <Input
                                            id="jam_operasional"
                                            name="jam_operasional"
                                            value={data.jam_operasional}
                                            placeholder="Contoh: 08:00 - 17:00"
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('jam_operasional', e.target.value)}
                                        />
                                        <InputError message={errors.jam_operasional} className="mt-2" />
                                    </div>

                                    <div>
                                        <Label htmlFor="kapasitas">Kapasitas</Label>
                                        <Input
                                            id="kapasitas"
                                            name="kapasitas"
                                            type="number"
                                            value={data.kapasitas}
                                            placeholder="Contoh: 100"
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('kapasitas', e.target.value)}
                                        />
                                        <InputError message={errors.kapasitas} className="mt-2" />
                                    </div>

                                    <div>
                                        <Label htmlFor="tahun_dibangun">Tahun Dibangun</Label>
                                        <Input
                                            id="tahun_dibangun"
                                            name="tahun_dibangun"
                                            type="number"
                                            value={data.tahun_dibangun}
                                            placeholder="Contoh: 2020"
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('tahun_dibangun', e.target.value)}
                                        />
                                        <InputError message={errors.tahun_dibangun} className="mt-2" />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <Label htmlFor="penanggung_jawab">Penanggung Jawab</Label>
                                    <Input
                                        id="penanggung_jawab"
                                        name="penanggung_jawab"
                                        value={data.penanggung_jawab}
                                        placeholder="Contoh: Bapak Ahmad"
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('penanggung_jawab', e.target.value)}
                                    />
                                    <InputError message={errors.penanggung_jawab} className="mt-2" />
                                </div>

                                <div className="mt-4">
                                    <Label htmlFor="keterangan">Keterangan</Label>
                                    <Input
                                        id="keterangan"
                                        name="keterangan"
                                        value={data.keterangan}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('keterangan', e.target.value)}
                                        placeholder="Isi keterangan tambahan jika ada"
                                    />
                                    <InputError message={errors.keterangan} className="mt-2" />
                                </div>

                                <div className="mt-4">
                                    <Label htmlFor="foto">Foto Fasilitas (Opsional)</Label>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex-1">
                                            <label htmlFor="foto" className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition">
                                                <div className="text-center">
                                                    <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                                                    <p className="text-sm font-medium">Klik untuk upload foto</p>
                                                    <p className="text-xs text-muted-foreground">JPG, JPEG, PNG (Max 2MB)</p>
                                                </div>
                                                <input
                                                    id="foto"
                                                    type="file"
                                                    accept="image/jpeg,image/jpg,image/png"
                                                    onChange={handleFotoChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                        {fotoPreview && (
                                            <div className="relative w-24 h-24">
                                                <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveFoto}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <InputError message={errors.foto} className="mt-2" />
                                </div>
                            </Card>

                            <Card className="p-6">
                                <h4 className="text-lg font-semibold mb-4">Peta Lokasi Fasilitas</h4>
                                <div className="rounded-md overflow-hidden">
                                    <MapContainer
                                        center={initialCenter}
                                        zoom={initialZoom}
                                        scrollWheelZoom={true}
                                        style={{ height: '500px', width: '100%' }}
                                        maxBounds={maxBounds}
                                        maxBoundsViscosity={1.0}
                                    >
                                        <MapEventHandler />
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
                                                    <Polygon positions={DESA_TEGALSAMBI_BOUNDARY} pathOptions={{ color: '#2563eb', fillColor: 'transparent', weight: 3, dashArray: '5, 5' }} />
                                                </LayersControl.Overlay>
                                            )}
                                            <LayersControl.Overlay checked name="Lokasi Fasilitas">
                                                <LayerGroup>
                                                    {markerPosition && data.jenis && (
                                                        <Marker
                                                            position={markerPosition}
                                                            icon={L.divIcon({
                                                                html: getFacilityIconSVG(data.jenis),
                                                                className: '',
                                                                iconSize: [32, 32],
                                                                iconAnchor: [16, 32],
                                                            })}
                                                        />
                                                    )}
                                                </LayerGroup>
                                            </LayersControl.Overlay>
                                        </LayersControl>
                                        <MapLegend facilityIcons={facilityIcons} />
                                    </MapContainer>
                                </div>
                                <InputError message={errors.koordinat} className="mt-2" />
                            </Card>

                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={processing}>Simpan Perubahan</Button>
                                <Link href={route('fasilitas.index', { tipe_akses: tipeAkses })} className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-500 rounded-md font-semibold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-25 transition ease-in-out duration-150">
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

export default FasilitasEdit;
