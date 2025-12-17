import React, { useMemo } from 'react';

interface LegendItem {
    label: string;
    color: string;
    type?: 'point' | 'line' | 'polygon';
    iconHtml?: string | HTMLElement | false;
}

import { DivIcon } from 'leaflet';

function toTitleCase(str: string) {
    return str.replace(/_|-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

interface MapLegendProps {
    items?: LegendItem[];
    title?: string;
    facilityIcons?: { [key: string]: DivIcon; };
}

export default function MapLegend({ items, title = "Legenda", facilityIcons }: MapLegendProps) {
    const legendItems = useMemo(() => {
        if (items && items.length > 0) {
            return items;
        } else if (facilityIcons) {
            return Object.entries(facilityIcons).map(([key, icon]) => ({
                label: toTitleCase(key),
                color: 'transparent', // Color is handled by the icon itself
                type: 'point' as const,
                iconHtml: icon.options.html || '',
            }));
        }
        return [];
    }, [items, facilityIcons]);

    if (legendItems.length === 0) {
        return null; // Don't render if no items
    }

    return (
        <div className="leaflet-bottom leaflet-left">
            <div className="leaflet-control leaflet-bar bg-white p-2 rounded-md shadow-md max-h-[300px] overflow-y-auto">
                <h4 className="font-bold text-sm mb-2">{title}</h4>
                <ul>
                    {legendItems.map((item, index) => (
                        <li key={index} className="flex items-center mb-1 last:mb-0">
                            {item.type === 'line' ? (
                                <div className="w-6 h-1 mr-2" style={{ backgroundColor: item.color }}></div>
                            ) : item.type === 'polygon' ? (
                                <div className="w-4 h-4 mr-2 border border-gray-400" style={{ backgroundColor: item.color, opacity: 0.6 }}></div>
                            ) : (
                                <div className="mr-2 flex items-center justify-center w-6 h-6">
                                    {item.iconHtml ? (
                                        <div dangerouslySetInnerHTML={{ __html: item.iconHtml as string }} style={{ width: '24px', height: '24px' }} />
                                    ) : (
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    )}
                                </div>
                            )}
                            <span className="text-xs capitalize">{item.label}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
