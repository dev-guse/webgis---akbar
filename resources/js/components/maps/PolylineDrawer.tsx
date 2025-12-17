import { useState, useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { isPointInPolygon } from '@/lib/geometry';
import { DESA_TEGALSAMBI_BOUNDARY } from '@/data/mockMapEvents';
import { toast } from 'sonner';

interface PolylineDrawerProps {
    onPolylineComplete: (coords: [number, number][]) => void;
    color: string;
    existingPolyline?: [number, number][] | null;
}

export default function PolylineDrawer({ onPolylineComplete, color, existingPolyline }: PolylineDrawerProps) {
    const map = useMap();
    const [isDrawing, setIsDrawing] = useState(false);
    const [points, setPoints] = useState<L.LatLng[]>([]);
    const [markers, setMarkers] = useState<L.CircleMarker[]>([]);
    const [polyline, setPolyline] = useState<L.Polyline | null>(null);
    const controlRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (existingPolyline && existingPolyline.length > 0) {
            const initialPoints = existingPolyline.map(coord => L.latLng(coord[0], coord[1]));
            setPoints(initialPoints);
            const initialPolyline = L.polyline(initialPoints, {
                color: color,
                weight: 4,
                opacity: 0.8
            }).addTo(map);
            setPolyline(initialPolyline);

            initialPoints.forEach(point => {
                const marker = L.circleMarker(point, {
                    radius: 5,
                    color: color,
                    fillColor: color,
                    fillOpacity: 1,
                    weight: 2
                }).addTo(map);
                setMarkers(prevMarkers => [...prevMarkers, marker]);
            });
        }
    }, [existingPolyline, map, color]);

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

                // Update polyline
                if (polyline) {
                    polyline.setLatLngs(updated);
                } else {
                    const newPolyline = L.polyline(updated, {
                        color: color,
                        weight: 4,
                        opacity: 0.8
                    }).addTo(map);
                    setPolyline(newPolyline);
                }
            }
        };

        const handleDblClick = (e: L.LeafletMouseEvent) => {
            if (isDrawing && points.length >= 2) {
                L.DomEvent.stopPropagation(e);
                finishDrawing();
            }
        };

        map.on('click', handleClick);
        map.on('dblclick', handleDblClick);

        return () => {
            map.off('click', handleClick);
            map.off('dblclick', handleDblClick);
        };
    }, [isDrawing, points, map, polyline, color, existingPolyline]);

    const startDrawing = () => {
        setIsDrawing(true);
        toast.info("Klik pada peta untuk menambah titik. Double-click untuk selesai.");
    };

    const finishDrawing = () => {
        if (points.length >= 2) {
            const coords: [number, number][] = points.map(p => [p.lat, p.lng]);
            onPolylineComplete(coords);
            clearDrawing();
        } else {
            toast.error("Minimal 2 titik diperlukan untuk membuat garis!");
        }
    };

    const clearDrawing = () => {
        setIsDrawing(false);
        setPoints([]);

        // Remove all markers
        markers.forEach(marker => map.removeLayer(marker));
        setMarkers([]);

        // Remove polyline
        if (polyline) {
            map.removeLayer(polyline);
            setPolyline(null);
        }
    };

    const cancelDrawing = () => {
        clearDrawing();
        toast.info("Menggambar dibatalkan");
    };

    return (
        <div
            ref={controlRef}
            className="leaflet-top leaflet-right"
            style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                zIndex: 1000,
            }}
        >
            <div className="leaflet-control leaflet-bar bg-white p-2 rounded shadow-lg">
                {!isDrawing ? (
                    <Button onClick={startDrawing} size="sm">
                        Gambar Garis Jalan
                    </Button>
                ) : (
                    <div className="flex flex-col gap-2">
                        <div className="text-xs font-medium text-center">
                            Titik: {points.length}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={finishDrawing}
                                size="sm"
                                disabled={points.length < 2}
                                variant="default"
                            >
                                Selesai
                            </Button>
                            <Button
                                onClick={cancelDrawing}
                                size="sm"
                                variant="outline"
                            >
                                Batal
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
