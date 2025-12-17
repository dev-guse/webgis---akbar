export const LAND_USE_COLORS: { [key: string]: string } = {
    'Pertanian': '#8BC34A', // Light Green
    'Pemukiman': '#FFC107', // Amber
    'Perkebunan': '#4CAF50', // Green
    'Hutan': '#2E7D32',    // Dark Green
    'Industri': '#9E9E9E',   // Grey
    'Fasilitas Umum': '#2196F3', // Blue
    'Lainnya': '#607D8B',    // Blue Grey
};

export const landUseTypes = [
    'Pertanian',
    'Pemukiman',
    'Perkebunan',
    'Hutan',
    'Industri',
    'Fasilitas Umum',
    'Lainnya',
];

export const tingkatBahayaMapColors: { [key: string]: string } = {
    rendah: '#22c55e',      // green-500
    sedang: '#facc15',      // yellow-400
    tinggi: '#f97316',      // orange-500
    sangat_tinggi: '#ef4444', // red-500
};

export const tingkatBahayaColors = {
    rendah: 'bg-green-100 text-green-800',
    sedang: 'bg-yellow-100 text-yellow-800',
    tinggi: 'bg-orange-100 text-orange-800',
    sangat_tinggi: 'bg-red-100 text-red-800',
};
