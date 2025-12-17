<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GeocodingController extends Controller
{
    public function reverse(Request $request)
    {
        $lat = $request->query('lat');
        $lon = $request->query('lon');

        if (!$lat || !$lon) {
            return response()->json(['error' => 'Missing latitude or longitude'], 400);
        }

        try {
            $response = Http::withoutVerifying()
                ->withHeaders([
                    'User-Agent' => 'WebGIS/1.0',
                ])
                ->get('https://nominatim.openstreetmap.org/reverse', [
                'format' => 'json',
                'lat' => $lat,
                'lon' => $lon,
                'addressdetails' => 1,
                'zoom' => 18,
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            return response()->json([
                'error' => 'Nominatim error',
                'details' => $response->body()
            ], $response->status());

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
