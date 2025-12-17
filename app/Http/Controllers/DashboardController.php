<?php

namespace App\Http\Controllers;

use App\Models\Desa;
use App\Models\Infrastruktur;
use App\Models\Fasilitas;
use App\Models\BatasWilayah;
use App\Models\User;
use App\Models\PenggunaanLahan;
use Inertia\Inertia;
use Inertia\Response;


class DashboardController extends Controller
{
    public function index(): Response
    {
        $desa = Desa::first();
        
        $stats = [
            'users' => [
                'total' => User::count()
            ],
            'fasilitas' => [
                'total' => Fasilitas::count(),
                'umum' => Fasilitas::where('jenis', 'umum')->count(),
                'privat' => Fasilitas::where('jenis', 'privat')->count(),
            ],
            'batas_wilayah' => [
                'total' => BatasWilayah::count()
            ],
        ];

        // Group infrastruktur by kondisi
        $infrastrukturByKondisi = Infrastruktur::selectRaw('kondisi, count(*) as total')
            ->groupBy('kondisi')
            ->get()
            ->mapWithKeys(fn($item) => [$item->kondisi => $item->total]);

        // Group penggunaan lahan by jenis with luas
        $penggunaanLahanByJenis = PenggunaanLahan::selectRaw('jenis, sum(luas) as total_luas')
            ->groupBy('jenis')
            ->get()
            ->mapWithKeys(fn($item) => [$item->jenis => $item->total_luas]);

        $fasilitasByType = Fasilitas::selectRaw('jenis, count(*) as total')
            ->groupBy('jenis')
            ->get()
            ->mapWithKeys(fn($item) => [$item->jenis => $item->total]);

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'infrastrukturByKondisi' => $infrastrukturByKondisi,
            'penggunaanLahanByJenis' => $penggunaanLahanByJenis,
            'desa' => $desa,
            'fasilitasByType' => $fasilitasByType,
        ]);
    }
}
