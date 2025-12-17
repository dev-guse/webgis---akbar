import AppLayout from '@/layouts/app-layout';
import BaseMapLayers from '@/components/maps/BaseMapLayers';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { DESA_TEGALSAMBI_CENTER, DESA_TEGALSAMBI_BOUNDARY } from '@/data/mockMapEvents';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Save, MapPin, Trash2, Upload, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PolygonDrawer from '@/components/maps/PolygonDrawer';
import MapLegend from '@/components/maps/MapLegend';

const LAND_USE_COLORS: { [key: string]: string } = {
    'Pertanian': '#84cc16',      // Lime
    'Pemukiman': '#f59e0b',      // Amber
    'Perkebunan': '#22c55e',     // Green
    'Hutan': '#15803d',          // Dark Green
    'Industri': '#64748b',       // Slate
    'Fasilitas Umum': '#3b82f6', // Blue
    'Lainnya': '#9ca3af',        // Gray
};

// Calculate area from polygon coordinates
const calculateArea = (coordinates: [number, number][]): number => {
    if (coordinates.length < 3) return 0;

    let area = 0;
    const n = coordinates.length;

    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += coordinates[i][0] * coordinates[j][1];
        area -= coordinates[j][0] * coordinates[i][1];
    }

    area = Math.abs(area) / 2;

    // Convert to meters (approximate)
    const metersPerDegreeLat = 111320;
    const metersPerDegreeLng = 111320 * 0.991;

    return area * metersPerDegreeLat * metersPerDegreeLng;
};

// Format area for display
const formatLuas = (luas: number): string => {
    if (luas >= 10000) {
        const hectares = luas / 10000;
        return `${hectares.toFixed(2)} ha`;
    }
    return `${Math.round(luas).toLocaleString('id-ID')} m²`;
};

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
    keterangan?: string;
}

export default function EditBatasWilayah({ batasWilayah }: { batasWilayah: BatasWilayah }) {
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);

    const { data, setData, put, processing, errors } = useForm({
        nama: batasWilayah.nama,
        jenis: batasWilayah.jenis,
        nama_pemilik: batasWilayah.nama_pemilik || '',
        no_hp_pemilik: batasWilayah.no_hp_pemilik || '',
        alamat_pemilik: batasWilayah.alamat_pemilik || '',
        coordinates: batasWilayah.coordinates,
        warna: batasWilayah.warna,
        opacity: batasWilayah.opacity,
        keterangan: batasWilayah.keterangan || '',
        foto: null as File | null,
    });

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

    const handlePolygonComplete = (coords: [number, number][]) => {
        setData('coordinates', coords);
    };

    const handleClearPolygon = () => {
        setData('coordinates', []);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/batas-wilayah/${batasWilayah.id}`);
    };

    const maxBounds = DESA_TEGALSAMBI_BOUNDARY ? L.latLngBounds(DESA_TEGALSAMBI_BOUNDARY) : undefined;

    return (
        <AppLayout>
            <Head title="Edit Batas Wilayah" />
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/batas-wilayah">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Batas Wilayah</h1>
                        <p className="text-muted-foreground">Ubah informasi atau polygon batas wilayah</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form Section */}
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>Informasi Batas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nama">Nama Batas Wilayah</Label>
                                <Input
                                    id="nama"
                                    placeholder="Contoh: Lahan Pertanian Utara"
                                    value={data.nama}
                                    onChange={e => setData('nama', e.target.value)}
                                />
                                {errors.nama && <p className="text-sm text-red-500">{errors.nama}</p>}
                            </div>



                            <div className="space-y-2">
                                <Label htmlFor="jenis">Jenis Lahan</Label>
                                <Select
                                    value={data.jenis}
                                    onValueChange={(value) => setData('jenis', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih jenis lahan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pertanian">Pertanian</SelectItem>
                                        <SelectItem value="Pemukiman">Pemukiman</SelectItem>
                                        <SelectItem value="Perkebunan">Perkebunan</SelectItem>
                                        <SelectItem value="Hutan">Hutan</SelectItem>
                                        <SelectItem value="Industri">Industri</SelectItem>
                                        <SelectItem value="Fasilitas Umum">Fasilitas Umum</SelectItem>
                                        <SelectItem value="Lainnya">Lainnya</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.jenis && <p className="text-sm text-red-500">{errors.jenis}</p>}
                            </div>

                            <div className="pt-4 border-t">
                                <h3 className="font-semibold mb-3">Informasi Pemilik</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nama_pemilik">Nama Pemilik</Label>
                                        <Input
                                            id="nama_pemilik"
                                            placeholder="Nama lengkap pemilik lahan"
                                            value={data.nama_pemilik}
                                            onChange={e => setData('nama_pemilik', e.target.value)}
                                        />
                                        {errors.nama_pemilik && <p className="text-sm text-red-500">{errors.nama_pemilik}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="no_hp_pemilik">No. HP Pemilik</Label>
                                        <Input
                                            id="no_hp_pemilik"
                                            placeholder="Contoh: 08123456789"
                                            value={data.no_hp_pemilik}
                                            onChange={e => setData('no_hp_pemilik', e.target.value)}
                                        />
                                        {errors.no_hp_pemilik && <p className="text-sm text-red-500">{errors.no_hp_pemilik}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="alamat_pemilik">Alamat Pemilik</Label>
                                        <Textarea
                                            id="alamat_pemilik"
                                            placeholder="Alamat lengkap pemilik"
                                            value={data.alamat_pemilik}
                                            onChange={e => setData('alamat_pemilik', e.target.value)}
                                            rows={2}
                                        />
                                        {errors.alamat_pemilik && <p className="text-sm text-red-500">{errors.alamat_pemilik}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="opacity">Opacity: {Math.round(data.opacity * 100)}%</Label>
                                <Slider
                                    id="opacity"
                                    min={0}
                                    max={100}
                                    step={5}
                                    value={[data.opacity * 100]}
                                    onValueChange={(value) => setData('opacity', value[0] / 100)}
                                    className="w-full"
                                />
                                {errors.opacity && <p className="text-sm text-red-500">{errors.opacity}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="keterangan">Keterangan (Opsional)</Label>
                                <Textarea
                                    id="keterangan"
                                    placeholder="Deskripsi tambahan tentang batas wilayah ini"
                                    value={data.keterangan}
                                    onChange={e => setData('keterangan', e.target.value)}
                                    rows={3}
                                />
                                {errors.keterangan && <p className="text-sm text-red-500">{errors.keterangan}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="foto">Foto Batas Wilayah (Opsional)</Label>
                                <div className="flex items-center gap-4">
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
                                {errors.foto && <p className="text-sm text-red-500">{errors.foto}</p>}
                            </div>

                            {data.coordinates.length > 0 && (
                                <div className="space-y-2">
                                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                                        <p className="text-sm text-green-800">
                                            ✓ Polygon berhasil digambar ({data.coordinates.length} titik)
                                        </p>
                                        <p className="text-sm text-green-700 mt-1">
                                            📏 Luas: {formatLuas(calculateArea(data.coordinates))}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleClearPolygon}
                                        className="w-full"
                                    >
                                        <Trash2 className="mr-2 h-3 w-3" /> Hapus Polygon
                                    </Button>
                                </div>
                            )}

                            {errors.coordinates && <p className="text-sm text-red-500">{errors.coordinates}</p>}

                            <Button type="submit" className="w-full" disabled={processing || data.coordinates.length === 0}>
                                <Save className="mr-2 h-4 w-4" /> Simpan Perubahan
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Map Section */}
                    <Card className="lg:col-span-2 h-[700px] flex flex-col overflow-hidden">
                        <CardHeader className="p-4 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-blue-500" /> Gambar Polygon Batas Wilayah
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Klik tombol "Mulai Gambar Polygon" kemudian klik pada peta untuk menambah titik. Warna polygon otomatis menyesuaikan jenis lahan.
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
                                <BaseMapLayers />

                                {/* Desa Boundary */}
                                {DESA_TEGALSAMBI_BOUNDARY && (
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
                                )}

                                <PolygonDrawer
                                    onPolygonComplete={handlePolygonComplete}
                                    color={data.warna}
                                    opacity={data.opacity}
                                />

                                {/* Preview polygon with current color/opacity */}
                                {data.coordinates.length > 0 && (
                                    <Polygon
                                        positions={data.coordinates}
                                        pathOptions={{
                                            color: data.warna,
                                            fillColor: data.warna,
                                            fillOpacity: data.opacity,
                                            weight: 2,
                                        }}
                                    />
                                )}

                                <MapLegend
                                    title="Jenis Lahan"
                                    items={Object.entries(LAND_USE_COLORS).map(([label, color]) => ({
                                        label,
                                        color,
                                        type: 'point'
                                    }))}
                                />
                            </MapContainer>
                        </div>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
