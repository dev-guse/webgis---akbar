<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BatasWilayah extends Model
{
    use HasFactory;

    protected $table = 'batas_wilayah';

    protected $fillable = [
        'nama',
        'jenis',
        'coordinates',
        'warna',
        'opacity',
        'luas',
        'nama_pemilik',
        'no_hp_pemilik',
        'alamat_pemilik',
        'keterangan',
    ];

    protected $casts = [
        'coordinates' => 'array',
        'opacity' => 'decimal:2',
        'luas' => 'decimal:2',
    ];

    /**
     * Calculate area from polygon coordinates using Shoelace formula
     * Returns area in square meters
     */
    public static function calculateArea(array $coordinates): float
    {
        if (count($coordinates) < 3) {
            return 0;
        }

        // Shoelace formula for polygon area
        $area = 0;
        $n = count($coordinates);
        
        for ($i = 0; $i < $n; $i++) {
            $j = ($i + 1) % $n;
            $area += $coordinates[$i][0] * $coordinates[$j][1];
            $area -= $coordinates[$j][0] * $coordinates[$i][1];
        }
        
        $area = abs($area) / 2;
        
        // Convert from degrees to meters (approximate)
        // 1 degree latitude ≈ 111,320 meters
        // 1 degree longitude ≈ 111,320 * cos(latitude) meters
        $metersPerDegreeLat = 111320;
        $metersPerDegreeLng = 111320 * 0.991;
        
        return $area * $metersPerDegreeLat * $metersPerDegreeLng;
    }

    /**
     * Format area for display
     */
    public function getFormattedLuasAttribute(): string
    {
        if (!$this->luas) {
            return '-';
        }

        if ($this->luas >= 10000) {
            // Convert to hectares for large areas
            $hectares = $this->luas / 10000;
            return number_format($hectares, 2, ',', '.') . ' ha';
        }

        return number_format($this->luas, 0, ',', '.') . ' m²';
    }

    /**
     * Boot method to auto-calculate area
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            if ($model->coordinates && is_array($model->coordinates)) {
                $model->luas = self::calculateArea($model->coordinates);
            }
        });
    }
}
