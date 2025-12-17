import React from 'react';
import { MapContainer, TileLayer, Polygon, LayersControl, LayerGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { DESA_TEGALSAMBI_CENTER, DESA_TEGALSAMBI_BOUNDARY } from '@/data/mockMapEvents';
import MapLegend from './MapLegend';

interface BaseMapContainerProps {
    center?: [number, number];
    zoom?: number;
    height?: string;
    children?: React.ReactNode;
    maxBounds?: L.LatLngBounds;
    minZoom?: number;
    showDesaBoundary?: boolean;
    showLegend?: boolean;
    legendTitle?: string;
    legendItems?: Array<{
        label: string;
        color: string;
        type: 'point' | 'polygon' | 'line';
        iconHtml?: string;
    }>;
}

export default function BaseMapContainer({
    center = DESA_TEGALSAMBI_CENTER,
    zoom = 14,
    height = 'h-[500px]',
    children,
    maxBounds,
    minZoom = 13,
    showDesaBoundary = true,
    showLegend = true,
    legendTitle = 'Legenda',
    legendItems = [],
}: BaseMapContainerProps) {
    const bounds = maxBounds || (DESA_TEGALSAMBI_BOUNDARY ? L.latLngBounds(DESA_TEGALSAMBI_BOUNDARY) : undefined);

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
            maxBounds={bounds}
            maxBoundsViscosity={1.0}
            minZoom={minZoom}
            className={height}
        >
            <LayersControl position="topright">
                {/* Base Layers */}
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
                {showDesaBoundary && DESA_TEGALSAMBI_BOUNDARY && (
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

                {/* Custom Overlays */}
                {children}
            </LayersControl>

            {/* Legend */}
            {showLegend && (
                <MapLegend
                    title={legendTitle}
                    items={legendItems}
                />
            )}
        </MapContainer>
    );
}
