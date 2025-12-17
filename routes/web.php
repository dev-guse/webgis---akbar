<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');


Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard dengan statistik
    Route::get('dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    // Peta Interaktif
    Route::get('peta-interaktif', [App\Http\Controllers\PetaController::class, 'index'])->name('peta.interaktif');

    // Manajemen Data - New pages
    Route::get('manajemen-data/kemacetan', function () {
        return Inertia::render('manajemen-data/kemacetan');
    })->name('manajemen-data.kemacetan');
    
    Route::get('manajemen-data/kecelakaan', function () {
        return Inertia::render('manajemen-data/kecelakaan');
    })->name('manajemen-data.kecelakaan');
    
    Route::get('manajemen-data/wilayah-rawan', function () {
        return Inertia::render('manajemen-data/wilayah-rawan');
    })->name('manajemen-data.wilayah-rawan');
    
    Route::get('manajemen-data/lokasi', function () {
        return Inertia::render('manajemen-data/lokasi');
    })->name('manajemen-data.lokasi');

    Route::get('manajemen-data/penduduk', function () {
        return Inertia::render('manajemen-data/penduduk'); // Placeholder
    })->name('manajemen-data.penduduk');



    // Batas Wilayah
    Route::get('/batas-wilayah', [App\Http\Controllers\BatasWilayahController::class, 'index'])->name('batas-wilayah.index');
    Route::get('/batas-wilayah/create', [App\Http\Controllers\BatasWilayahController::class, 'create'])->name('batas-wilayah.create');
    Route::post('/batas-wilayah', [App\Http\Controllers\BatasWilayahController::class, 'store'])->name('batas-wilayah.store');
    Route::get('/batas-wilayah/{id}', [App\Http\Controllers\BatasWilayahController::class, 'show'])->name('batas-wilayah.show');
    Route::get('/batas-wilayah/{id}/edit', [App\Http\Controllers\BatasWilayahController::class, 'edit'])->name('batas-wilayah.edit');
    Route::put('/batas-wilayah/{id}', [App\Http\Controllers\BatasWilayahController::class, 'update'])->name('batas-wilayah.update');
    Route::delete('/batas-wilayah/{id}', [App\Http\Controllers\BatasWilayahController::class, 'destroy'])->name('batas-wilayah.destroy');

    // Fasilitas (Umum & Privat)
    Route::resource('fasilitas', App\Http\Controllers\FasilitasController::class);

    // Geocoding Proxy
    Route::get('/geocoding/reverse', [App\Http\Controllers\GeocodingController::class, 'reverse'])->name('geocoding.reverse');





    // API untuk data marker (dipindahkan ke luar middleware auth)
    Route::prefix('api/markers')->group(function () {
        Route::get('lokasi-penting', [App\Http\Controllers\MarkerDataController::class, 'getLokasiPentingMarkers'])->name('api.markers.lokasi-penting');
        Route::get('fasilitas', [App\Http\Controllers\FasilitasController::class, 'apiMarkers'])->name('api.markers.fasilitas');
        Route::get('batas-wilayah', [App\Http\Controllers\BatasWilayahController::class, 'apiMarkers'])->name('api.markers.batas-wilayah');
    });

    // Manajemen User
    Route::get('/pengguna/daftar', [App\Http\Controllers\UserController::class, 'index'])->name('pengguna.daftar');

});

// API untuk data marker (dipindahkan ke luar middleware auth)
Route::prefix('api/markers')->group(function () {
    Route::get('lokasi-penting', [App\Http\Controllers\MarkerDataController::class, 'getLokasiPentingMarkers'])->name('api.markers.lokasi-penting');
    Route::get('fasilitas', [App\Http\Controllers\FasilitasController::class, 'apiMarkers'])->name('api.markers.fasilitas');
    Route::get('batas-wilayah', [App\Http\Controllers\BatasWilayahController::class, 'apiMarkers'])->name('api.markers.batas-wilayah');
});

require __DIR__.'/settings.php';
