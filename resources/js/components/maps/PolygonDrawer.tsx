import { useState, useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { isPointInPolygon } from '@/lib/geometry';
import { DESA_TEGALSAMBI_BOUNDARY } from '@/data/mockMapEvents';
import { toast } from 'sonner';

interface PolygonDrawerProps {
    onPolygonComplete: (coords: [number, number][]) => void;
    color: string;
    opacity: number;
}

export default function PolygonDrawer({ onPolygonComplete, color, opacity }: PolygonDrawerProps) {
    const map = useMap();
    const [isDrawing, setIsDrawing] = useState(false);
    const [points, setPoints] = useState<L.LatLng[]>([]);
    const [markers, setMarkers] = useState<L.CircleMarker[]>([]);
    const [polyline, setPolyline] = useState<L.Polyline | null>(null);
    const [previewPolygon, setPreviewPolygon] = useState<L.Polygon | null>(null);
    const controlRef = useRef<HTMLDivElement>(null);

    // Disable click propagation on the control to prevent map clicks
    useEffect(() => {
        if (controlRef.current) {
            L.DomEvent.disableClickPropagation(controlRef.current);
            L.DomEvent.disableScrollPropagation(controlRef.current);
        }
    }, []);

    useEffect(() => {
        const handleClick = (e: L.LeafletMouseEvent) => {
            if (isDrawing) {
                const newPoint = e.latlng;

                // Validate point is within boundary
                if (DESA_TEGALSAMBI_BOUNDARY) {
                    const isInside = isPointInPolygon(
                        [newPoint.lat, newPoint.lng],
                        DESA_TEGALSAMBI_BOUNDARY
                    );

                    if (!isInside) {
                        toast.error("Titik harus berada di dalam batas Desa Tegalsambi!");
                        return;
                    }
                }

                const updated = [...points, newPoint];
                setPoints(updated);

                // Add marker for this point
                const marker = L.circleMarker(newPoint, {
                    radius: 5,
                    color: color,
                    fillColor: color,
                    fillOpacity: 1,
                    weight: 2
                }).addTo(map);
                setMarkers(prevMarkers => [...prevMarkers, marker]);

                // Handle Polygon vs Polyline visibility
                if (updated.length >= 3) {
                    // We have enough points for a polygon
                    // Remove polyline if it exists to avoid double rendering (opacity accumulation)
                    if (polyline) {
                        map.removeLayer(polyline);
                        setPolyline(null);
                    }

                    // Create or update polygon
                    if (previewPolygon) {
                        previewPolygon.setLatLngs(updated);
                    } else {
                        const newPreviewPolygon = L.polygon(updated, {
                            color: color,
                            fillColor: color,
                            fillOpacity: opacity,
                            weight: 2,
                            opacity: 0.8 // Match polyline stroke opacity
                        }).addTo(map);
                        setPreviewPolygon(newPreviewPolygon);
                    }
                } else {
                    // Less than 3 points, show polyline
                    if (polyline) {
                        polyline.setLatLngs(updated);
                    } else {
                        const newPolyline = L.polyline(updated, {
                            color: color,
                            weight: 2,
                            opacity: 0.8
                        }).addTo(map);
                        setPolyline(newPolyline);
                    }
                }
            }
        };

        map.on('click', handleClick);
        return () => {
            map.off('click', handleClick);
        };
    }, [map, isDrawing, polyline, previewPolygon, color, opacity, points]);

    const startDrawing = () => {
        setIsDrawing(true);
        setPoints([]);
        clearMapLayers();
    };

    const finishDrawing = () => {
        if (points.length >= 3) {
            const coords = points.map(p => [p.lat, p.lng] as [number, number]);
            // Ensure the polygon is closed by adding the first point at the end if not already
            // Leaflet polygons are implicitly closed, but for storage we might want explicit closure or just the points
            // The original code pushed the first point again. Let's keep it consistent.
            coords.push(coords[0]);

            onPolygonComplete(coords);
            clearMapLayers();
            setIsDrawing(false);
            setPoints([]);
            toast.success("Polygon berhasil dibuat!");
        }
    };

    const cancelDrawing = () => {
        clearMapLayers();
        setIsDrawing(false);
        setPoints([]);
    };

    const clearMapLayers = () => {
        markers.forEach(m => map.removeLayer(m));
        setMarkers([]);
        if (polyline) {
            map.removeLayer(polyline);
            setPolyline(null);
        }
        if (previewPolygon) {
            map.removeLayer(previewPolygon);
            setPreviewPolygon(null);
        }
    };

    return (
        <div
            ref={controlRef}
            className="leaflet-top leaflet-left"
            style={{ marginTop: '10px', marginLeft: '10px', zIndex: 1000 }}
        >
            <div className="leaflet-control leaflet-bar bg-white p-2 rounded shadow-md">
                {!isDrawing ? (
                    <Button onClick={startDrawing} size="sm">
                        Mulai Gambar Polygon
                    </Button>
                ) : (
                    <div className="flex flex-col gap-2">
                        <p className="text-xs font-medium">
                            Klik peta untuk menambah titik ({points.length} titik)
                            {points.length >= 3 && <span className="text-green-600 block mt-1">✓ Area valid</span>}
                        </p>
                        <div className="flex gap-2">
                            <Button onClick={finishDrawing} size="sm" disabled={points.length < 3}>
                                Selesai
                            </Button>
                            <Button onClick={cancelDrawing} size="sm" variant="outline">
                                Batal
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
