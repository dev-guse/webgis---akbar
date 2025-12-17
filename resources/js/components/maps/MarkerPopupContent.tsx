import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';

interface MarkerPopupContentProps {
  name: string;
  type: 'fasilitas' | 'bencana' | 'rumah' | 'batas-wilayah' | 'lokasi-penting';
  id: number;
  additionalInfo?: {
    label: string;
    value: string | number;
  }[];
  imageUrl?: string;
}

export default function MarkerPopupContent({
  name,
  type,
  id,
  additionalInfo = [],
  imageUrl,
}: MarkerPopupContentProps) {
  const getDetailRoute = () => {
    switch (type) {
      case 'fasilitas':
        return route('fasilitas.show', { id: id });
      case 'bencana':
        return route('bencana.show', { id: id });
      case 'rumah':
        return route('data-kependudukan.lokasi-penduduk.show', { id: id });
      case 'batas-wilayah':
        return route('batas-wilayah.show', { id: id });
      case 'lokasi-penting':
        return `/manajemen-data/lokasi-penting/${id}`;
      default:
        return '#';
    }
  };

  return (
    <div className="p-3 min-w-[250px]">
      {imageUrl && (
        <div className="mb-3 rounded-md overflow-hidden aspect-video relative bg-gray-100">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <h3 className="font-bold text-base mb-2">{name}</h3>
      
      {additionalInfo.length > 0 && (
        <div className="text-sm space-y-1 mb-3">
          {additionalInfo.map((info, idx) => (
            <p key={idx}>
              <span className="font-semibold">{info.label}:</span> {info.value}
            </p>
          ))}
        </div>
      )}
      
      <Link href={getDetailRoute()}>
        <Button size="sm" className="w-full">
          <ExternalLink className="h-3 w-3 mr-2" />
          Lihat Detail
        </Button>
      </Link>
    </div>
  );
}
