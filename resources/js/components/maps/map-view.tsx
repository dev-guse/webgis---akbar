import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, GeoJSON, LayersControl, LayerGroup, Circle, useMap, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import React, { useEffect, useState } from 'react';
import { DESA_TEGALSAMBI_CENTER } from '@/data/mockMapEvents';
import { fixLeafletDefaultIcon } from '@/lib/leaflet-utils';
import MapLegend from '@/components/maps/MapLegend';
import { getFacilityIconSVG, createFacilityIcon, createDisasterIcon } from '@/lib/map-icons';
import MarkerPopupContent from '@/components/maps/MarkerPopupContent';
import { Button } from '../ui/button';
import { Link } from '@inertiajs/react';
import { LAND_USE_COLORS, landUseTypes, tingkatBahayaMapColors } from '@/lib/map-constants';
import { getRoadColor } from '@/lib/road-utils';

interface LegendItem {
    label: string;
    color: string;
    type?: 'point' | 'line';
    iconHtml?: string | HTMLElement | false;
}

interface BatasWilayahItem {
    id: string | number;
    coordinates: [number, number][];
    warna?: string;
    opacity?: number;
    nama: string;
    jenis: string;
    nama_pemilik?: string;
    luas?: number;
    keterangan?: string;
}

fixLeafletDefaultIcon();

interface MapViewProps {
    center?: [number, number];
    zoom?: number;
    desa?: any;
    lokasiPenting?: any[];
    infrastruktur?: any[];
    penggunaanLahan?: any[];
    trafficEvents?: any[];
    accidentEvents?: any[];
    hazardEvents?: any[];
    fasilitasUmum?: any[]; // Fasilitas Umum
    fasilitasPrivat?: any[]; // Fasilitas Privat
    fasilitasJalan?: any[]; // Fasilitas Jalan
    batasWilayah?: BatasWilayahItem[]; // Batas Wilayah
    villageBoundary?: [number, number][]; // Village boundary
    activeLayers?: string[];
}

// Component to fit map bounds to the village boundary
function FitBounds({ boundary }: { boundary: [number, number][] }) {
    const map = useMap();

    useEffect(() => {
        if (boundary && boundary.length > 0) {
            const bounds = L.latLngBounds(boundary);
            map.fitBounds(bounds);
        }
    }, [boundary, map]);

    return null;
}

export default function MapView({
    center = DESA_TEGALSAMBI_CENTER, // Desa Tegalsambi coordinates
    zoom = 14,
    desa,
    lokasiPenting = [],
    infrastruktur = [],
    penggunaanLahan = [],
    trafficEvents = [],
    accidentEvents = [],
    hazardEvents = [],
    fasilitasUmum = [],
    fasilitasPrivat = [],
    fasilitasJalan = [],
    batasWilayah = [],
    villageBoundary,
    activeLayers = []
}: MapViewProps) {

    // Helper to parse GeoJSON if it's a string
    const parseGeoJSON = (data: any) => {
        if (typeof data === 'string') {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.error("Invalid GeoJSON:", e);
                return null;
            }
        }
        return data;
    };

    // Create mask polygon (World - Village)
    const maskPolygon = villageBoundary ? [
        // Outer ring (World)
        [
            [90, -180],
            [90, 180],
            [-90, 180],
            [-90, -180]
        ],
        // Inner ring (Village hole)
        villageBoundary
    ] : null;

    // Calculate maxBounds from villageBoundary
    const maxBounds = villageBoundary ? L.latLngBounds(villageBoundary) : undefined;

    const getLegendItems = (): LegendItem[] => {
        const items: LegendItem[] = [];



        if (activeLayers.includes('fasilitas-umum') && fasilitasUmum.length > 0) {
            // Assuming fasilitasUmum items have a 'jenis' property that maps to an icon type
            const uniqueJenis = [...new Set(fasilitasUmum.map(f => f.jenis))];
            uniqueJenis.forEach(jenis => {
                items.push({
                    label: `Fasilitas Umum (${jenis})`,
                    color: '#3b82f6', // Default color, actual icon color comes from getFacilityIconSVG
                    iconHtml: getFacilityIconSVG(jenis, '#3b82f6')
                });
            });
        }

        if (activeLayers.includes('fasilitas-privat') && fasilitasPrivat.length > 0) {
            const uniqueJenis = [...new Set(fasilitasPrivat.map(f => f.jenis))];
            uniqueJenis.forEach(jenis => {
                items.push({
                    label: `Fasilitas Privat (${jenis})`,
                    color: '#3b82f6', // Default color, actual icon color comes from getFacilityIconSVG
                    iconHtml: getFacilityIconSVG(jenis, '#3b82f6')
                });
            });
        }

        if (activeLayers.includes('fasilitas-jalan') && fasilitasJalan.length > 0) {
            items.push(
                { label: 'Jalan Nasional', color: getRoadColor('jalan_nasional'), type: 'line' },
                { label: 'Jalan Provinsi', color: getRoadColor('jalan_provinsi'), type: 'line' },
                { label: 'Jalan Kabupaten', color: getRoadColor('jalan_kabupaten'), type: 'line' },
                { label: 'Jalan Desa', color: getRoadColor('jalan_desa'), type: 'line' },
                { label: 'Jalan Lingkungan', color: getRoadColor('jalan_lingkungan'), type: 'line' },
                { label: 'Jalan Setapak', color: getRoadColor('jalan_setapak'), type: 'line' }
            );
        }

        if (activeLayers.includes('batas-wilayah') && batasWilayah.length > 0) {
            landUseTypes.forEach(type => {
                items.push({
                    label: type,
                    color: LAND_USE_COLORS[type] || '#000000',
                    type: 'point',
                    iconHtml: createFacilityIcon(type).options.html
                });
            });
        }





        return items;
    };

    const legendItems = getLegendItems();

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '100%', width: '100%', borderRadius: '0.5rem', background: '#e5e7eb' }}
            maxBounds={maxBounds}
            maxBoundsViscosity={1.0} // Prevent dragging outside bounds
            minZoom={13} // Prevent zooming out too far
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


                {/* Fit map to village boundary if provided */}
                {villageBoundary && <FitBounds boundary={villageBoundary} />}

                {/* Render MapLegend */}
                {legendItems.length > 0 && <MapLegend items={legendItems} />}



                {/* Village Boundary Outline */}
                {villageBoundary && (
                    <Polygon
                        positions={villageBoundary}
                        pathOptions={{
                            color: '#2563eb',
                            fillColor: 'transparent',
                            weight: 3,
                            dashArray: '5, 5'
                        }}
                    />
                )}





                {/* Fasilitas Umum */}
                <LayersControl.Overlay checked={activeLayers.includes('fasilitas-umum')} name="Fasilitas Umum">
                    <LayerGroup>
                        {fasilitasUmum.map((item) => (
                            item.koordinat && item.koordinat.length === 2 && (
                                <Marker
                                    key={`fasilitas-umum-${item.id}`}
                                    position={[item.koordinat[1], item.koordinat[0]]}
                                    icon={createFacilityIcon(item.jenis)}
                                >
                                    <Tooltip>{item.nama}</Tooltip>
                                    <Popup>
                                        <MarkerPopupContent
                                            name={item.nama}
                                            type="fasilitas"
                                            id={item.id}
                                            imageUrl={item.foto}
                                            additionalInfo={[
                                                { label: 'Jenis', value: item.jenis },
                                                { label: 'Kondisi', value: item.kondisi },
                                                ...(item.alamat_manual ? [{ label: 'Alamat', value: item.alamat_manual }] : []),
                                            ]}
                                        />
                                    </Popup>
                                </Marker>
                            )
                        ))}
                    </LayerGroup>
                </LayersControl.Overlay>

                {/* Fasilitas Privat */}
                <LayersControl.Overlay checked={activeLayers.includes('fasilitas-privat')} name="Fasilitas Privat">
                    <LayerGroup>
                        {fasilitasPrivat.map((item) => (
                            item.koordinat && item.koordinat.length === 2 && (
                                <Marker
                                    key={`fasilitas-privat-${item.id}`}
                                    position={[item.koordinat[1], item.koordinat[0]]}
                                    icon={createFacilityIcon(item.jenis)}
                                >
                                    <Tooltip>{item.nama}</Tooltip>
                                    <Popup>
                                        <MarkerPopupContent
                                            name={item.nama}
                                            type="fasilitas"
                                            id={item.id}
                                            imageUrl={item.foto}
                                            additionalInfo={[
                                                { label: 'Jenis', value: item.jenis },
                                                { label: 'Kondisi', value: item.kondisi },
                                                ...(item.alamat_manual ? [{ label: 'Alamat', value: item.alamat_manual }] : []),
                                            ]}
                                        />
                                    </Popup>
                                </Marker>
                            )
                        ))}
                    </LayerGroup>
                </LayersControl.Overlay>

                {/* Fasilitas Jalan */}
                <LayersControl.Overlay checked={activeLayers.includes('fasilitas-jalan')} name="Fasilitas Jalan">
                    <LayerGroup>
                        {fasilitasJalan.map((item) => {
                            // Handle jalan as valid GeoJSON LineString or array
                            let coords = item.koordinat;
                            if (typeof coords === 'string') {
                                try {
                                    coords = JSON.parse(coords);
                                } catch (e) { return null; }
                            }

                            // Case 1: GeoJSON LineString
                            if (coords && coords.type === 'LineString' && Array.isArray(coords.coordinates)) {
                                const positions = coords.coordinates.map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
                                return (
                                    <Polyline
                                        key={`fasilitas-jalan-${item.id}`}
                                        positions={positions}
                                        pathOptions={{ color: getRoadColor(item.jenis), weight: 4 }}
                                    >
                                        <Popup>
                                            <div className="font-bold">{item.nama}</div>
                                            <div>Jenis: {item.jenis}</div>
                                            <div>Kondisi: {item.kondisi}</div>
                                        </Popup>
                                    </Polyline>
                                );
                            }

                            // Case 2: Simple Array of Coordinates (Legacy/Fallback)
                            if (coords && Array.isArray(coords) && coords.length >= 2) {
                                // Check if it's a polyline (array of coordinate pairs)
                                const isPolyline = Array.isArray(coords[0]) && coords[0].length === 2;
                                if (isPolyline) {
                                    const positions = coords.map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
                                    return (
                                        <Polyline
                                            key={`fasilitas-jalan-${item.id}`}
                                            positions={positions}
                                            pathOptions={{ color: getRoadColor(item.jenis), weight: 3 }}
                                        >
                                            <Popup>
                                                <div className="font-bold">{item.nama}</div>
                                                <div>Jenis: {item.jenis}</div>
                                                <div>Kondisi: {item.kondisi}</div>
                                            </Popup>
                                        </Polyline>
                                    );
                                }
                            }
                            // Handle as marker if single coordinate
                            if (item.koordinat && item.koordinat.length === 2) {
                                return (
                                    <Marker
                                        key={`fasilitas-jalan-${item.id}`}
                                        position={[item.koordinat[1], item.koordinat[0]]}
                                        icon={createFacilityIcon(item.jenis)}
                                    >
                                        <Popup>
                                            <div className="font-bold">{item.nama}</div>
                                            <div>Jenis: {item.jenis}</div>
                                            <div>Kondisi: {item.kondisi}</div>
                                        </Popup>
                                    </Marker>
                                );
                            }
                            return null;
                        })}
                    </LayerGroup>
                </LayersControl.Overlay>


                {/* Batas Wilayah */}
                <LayersControl.Overlay checked={activeLayers.includes('batas-wilayah')} name="Batas Wilayah">
                    <LayerGroup>
                        {batasWilayah.map((item) => {
                            if (!item.coordinates || item.coordinates.length === 0) return null;
                            const polygonCenter = L.latLngBounds(item.coordinates).getCenter();

                            return (
                                <React.Fragment key={`batas-wilayah-group-${item.id}`}>
                                    <Polygon
                                        positions={item.coordinates}
                                        pathOptions={{
                                            color: LAND_USE_COLORS[item.jenis] || '#3388ff',
                                            fillColor: LAND_USE_COLORS[item.jenis] || '#3388ff',
                                            fillOpacity: 0.5,
                                            weight: 2
                                        }}
                                    >
                                        <Popup>
                                            <div className="p-2 min-w-[220px]">
                                                <h3 className="font-bold text-sm mb-2">{item.nama}</h3>
                                                <div className="text-xs space-y-1 mb-3">
                                                    <p><span className="font-semibold">Jenis:</span> {item.jenis}</p>
                                                    {item.nama_pemilik && <p><span className="font-semibold">Pemilik:</span> {item.nama_pemilik}</p>}
                                                    {item.luas && <p><span className="font-semibold">Luas:</span> {(item.luas / 10000).toFixed(2)} ha</p>}
                                                    {item.keterangan && <p><span className="font-semibold">Keterangan:</span> {item.keterangan}</p>}
                                                </div>
                                                <Link href={route('batas-wilayah.index')}>
                                                    <Button size="sm" className="w-full">Detail</Button>
                                                </Link>
                                            </div>
                                        </Popup>
                                        <Tooltip>{item.nama}</Tooltip>
                                    </Polygon>
                                    <Marker position={polygonCenter} icon={createFacilityIcon(item.jenis)} />
                                </React.Fragment>
                            );
                        })}
                    </LayerGroup>
                </LayersControl.Overlay>




            </LayersControl>
        </MapContainer>
    );
}
