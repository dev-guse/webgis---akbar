<?php

namespace App\Http\Controllers;

use App\Models\Desa;
use App\Models\LokasiPenting;
use App\Models\Infrastruktur;
use App\Models\PenggunaanLahan;
use Inertia\Inertia;
use Inertia\Response;

class PetaController extends Controller
{
    public function index(): Response
    {
        $lokasiPenting = LokasiPenting::all();
        $infrastruktur = Infrastruktur::all();
        $penggunaanLahan = PenggunaanLahan::all();
        
        return Inertia::render('peta-interaktif', [
            'desa' => null, // Will be populated when we have village boundaries
            'lokasiPenting' => $lokasiPenting,
            'infrastruktur' => $infrastruktur,
            'penggunaanLahan' => $penggunaanLahan,
            // Mock data will be loaded directly in the frontend for now
        ]);
    }
}
