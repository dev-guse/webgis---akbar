// Mock data for WebGIS Desa Tegalsambi
// Coordinates centered around Tegalsambi, Jepara

export interface MapEvent {
    id: number;
    event_type: 'traffic' | 'accident' | 'hazard' | 'location';
    level?: 'low' | 'medium' | 'high';
    hazard_type?: 'banjir' | 'longsor' | 'kriminal' | 'kebakaran';
    title: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    radius?: number; // meters
    polyline?: [number, number][]; // array of [lat, lng]
    polygon?: [number, number][]; // array of [lat, lng]
    image_path?: string;
    created_at: string;
}

// Center of Desa Tegalsambi, Kec. Tahunan, Kab. Jepara
export const DESA_TEGALSAMBI_CENTER: [number, number] = [-6.6181, 110.6539];

// Placeholder administrative boundary of Desa Tegalsambi
// Created as a box around the center for demonstration
export const DESA_TEGALSAMBI_BOUNDARY: [number, number][] = [
     [-6.612469000999923, 110.66034],
    [-6.613425000999975, 110.660849],
    [-6.613989, 110.661167],
    [-6.614368, 110.661422],
    [-6.614631, 110.661643],
    [-6.614794, 110.661819],
    [-6.614996, 110.661981000000125],
    [-6.615286, 110.662058000000101],
    [-6.615689, 110.662081],
    [-6.616034, 110.662023],
    [-6.616216, 110.661941],
    [-6.616621, 110.661815],
    [-6.617381, 110.661573],
    [-6.617933, 110.66133],
    [-6.618301, 110.66114600000013],
    [-6.618635, 110.66095],
    [-6.618929, 110.660762],
    [-6.619428, 110.660621],
    [-6.619934, 110.660436],
    [-6.620268, 110.660285],
    [-6.620554, 110.659646],
    [-6.620969, 110.659389],
    [-6.621458, 110.659077],
    [-6.621784, 110.658966],
    [-6.62205, 110.658979],
    [-6.622143, 110.658968],
    [-6.622271, 110.658849],
    [-6.622339, 110.6586080000001],
    [-6.622379, 110.658473],
    [-6.622545, 110.658222],
    [-6.622688001, 110.658051],
    [-6.622877, 110.657793],
    [-6.62289, 110.657489],
    [-6.622919, 110.657316],
    [-6.623108, 110.656716],
    [-6.623067, 110.656559],
    [-6.623087, 110.6565],
    [-6.623197, 110.656297],
    [-6.623468000999956, 110.656028],
    [-6.623753, 110.655803],
    [-6.623936000999954, 110.655669],
    [-6.623979, 110.655485],
    [-6.62401, 110.65518],
    [-6.624056, 110.654385],
    [-6.624013, 110.654226],
    [-6.623692, 110.65396],
    [-6.623556, 110.653938],
    [-6.623226, 110.653894],
    [-6.623175000999961, 110.653828],
    [-6.623194000999934, 110.653675],
    [-6.62338, 110.653004],
    [-6.623459, 110.65289],
    [-6.623468000999956, 110.652781],
    [-6.623412, 110.652649],
    [-6.623295, 110.65231],
    [-6.623359, 110.65223],
    [-6.6234480009999, 110.652084],
    [-6.623509, 110.651692000000125],
    [-6.623455, 110.6516230000001],
    [-6.62322, 110.65138],
    [-6.623223, 110.651238],
    [-6.623189, 110.650833],
    [-6.623098, 110.650681],
    [-6.622813, 110.650208],
    [-6.622584, 110.650014],
    [-6.622482, 110.649893],
    [-6.622506, 110.649688],
    [-6.622508, 110.649678],
    [-6.62242, 110.649258],
    [-6.622306, 110.64885],
    [-6.622279999999893, 110.648677],
    [-6.622205, 110.648593],
    [-6.622133, 110.648501],
    [-6.622119, 110.648383],
    [-6.622118, 110.648146],
    [-6.622007, 110.647940000000105],
    [-6.621926, 110.647750000000102],
    [-6.621881, 110.647502000000102],
    [-6.621703, 110.647161],
    [-6.621304, 110.646252],
    [-6.621035, 110.646006],
    [-6.620595, 110.646128],
    [-6.619852, 110.646284],
    [-6.618722, 110.646568],
    [-6.618099, 110.646775],
    [-6.617462, 110.64688],
    [-6.617341, 110.647004],
    [-6.617021, 110.647251],
    [-6.61536, 110.648341],
    [-6.614944, 110.648679],
    [-6.613968, 110.649485000000126],
    [-6.613717000999976, 110.649692000000115],
    [-6.613389, 110.649971],
    [-6.613116999999892, 110.650185],
    [-6.612425, 110.650788],
    [-6.611427, 110.651657],
    [-6.610058, 110.652585],
    [-6.610277, 110.653182],
    [-6.610626, 110.653979],
    [-6.61099, 110.654636],
    [-6.611311, 110.6552480000001],
    [-6.611666, 110.655946000000114],
    [-6.612098000999957, 110.65654],
    [-6.612163, 110.657021],
    [-6.612061, 110.657186],
    [-6.612005, 110.657562],
    [-6.612003, 110.657832],
    [-6.612096, 110.658181],
    [-6.612173, 110.658336],
    [-6.612206, 110.658379],
    [-6.612166, 110.658449],
    [-6.612239999999893, 110.658582],
    [-6.612664000999892, 110.659465],
    [-6.612959, 110.659845],
    [-6.612469000999923, 110.66034]

];

export const mockMapEvents: MapEvent[] = [
    // TRAFFIC EVENTS - Circle type
    {
        id: 1,
        event_type: 'traffic',
        level: 'high',
        title: 'Kemacetan Pasar Pagi',
        description: 'Kemacetan rutin di area pasar pada pagi hari (06:00-09:00)',
        latitude: -6.6175,
        longitude: 110.6535,
        radius: 200,
        created_at: '2025-12-01 07:30:00'
    },
    {
        id: 2,
        event_type: 'traffic',
        level: 'medium',
        title: 'Area Sekolah SD',
        description: 'Kemacetan saat jam masuk dan pulang sekolah',
        latitude: -6.6190,
        longitude: 110.6545,
        radius: 150,
        created_at: '2025-12-01 07:00:00'
    },
    {
        id: 3,
        event_type: 'traffic',
        level: 'low',
        title: 'Persimpangan Masjid',
        description: 'Sedikit padat saat jam sholat Jumat',
        latitude: -6.6165,
        longitude: 110.6550,
        radius: 100,
        created_at: '2025-12-01 12:00:00'
    },
    // TRAFFIC EVENTS - Polyline type
    {
        id: 4,
        event_type: 'traffic',
        level: 'high',
        title: 'Jalan Utama Desa',
        description: 'Kemacetan sepanjang jalan utama menuju kecamatan',
        polyline: [
            [-6.6175, 110.6535],
            [-6.6170, 110.6530],
            [-6.6160, 110.6525]
        ],
        created_at: '2025-12-01 08:00:00'
    },
    {
        id: 5,
        event_type: 'traffic',
        level: 'medium',
        title: 'Jalan Gang Sempit',
        description: 'Macet akibat parkir kendaraan di bahu jalan',
        polyline: [
            [-6.6190, 110.6545],
            [-6.6195, 110.6548],
            [-6.6200, 110.6550]
        ],
        created_at: '2025-12-01 10:00:00'
    },
    // ACCIDENT EVENTS
    {
        id: 6,
        event_type: 'accident',
        title: 'Kecelakaan Motor vs Motor',
        description: 'Tabrakan motor di tikungan tajam, 2 orang luka ringan',
        latitude: -6.6210,
        longitude: 110.6510,
        radius: 50,
        image_path: '/images/accident1.jpg',
        created_at: '2025-11-30 14:30:00'
    },
    {
        id: 7,
        event_type: 'accident',
        title: 'Kecelakaan Truk Terguling',
        description: 'Truk terguling akibat rem blong di turunan',
        latitude: -6.6220,
        longitude: 110.6520,
        radius: 100,
        image_path: '/images/accident2.jpg',
        created_at: '2025-11-28 09:15:00'
    },
    // HAZARD EVENTS - Banjir
    {
        id: 8,
        event_type: 'hazard',
        hazard_type: 'banjir',
        title: 'Area Rawan Banjir Sungai',
        description: 'Daerah rendah yang sering tergenang saat musim hujan',
        polygon: [
            [-6.6250, 110.6550],
            [-6.6250, 110.6570],
            [-6.6270, 110.6570],
            [-6.6270, 110.6550],
            [-6.6250, 110.6550]
        ],
        created_at: '2025-11-01 00:00:00'
    },
    {
        id: 9,
        event_type: 'hazard',
        hazard_type: 'banjir',
        title: 'Titik Genangan Air',
        description: 'Area parkir yang sering tergenang',
        latitude: -6.6260,
        longitude: 110.6560,
        radius: 80,
        created_at: '2025-11-01 00:00:00'
    },
    // HAZARD EVENTS - Longsor
    {
        id: 10,
        event_type: 'hazard',
        hazard_type: 'longsor',
        title: 'Tebing Rawan Longsor',
        description: 'Tebing curam di pinggir jalan dengan tanah labil',
        polygon: [
            [-6.6100, 110.6450],
            [-6.6100, 110.6470],
            [-6.6120, 110.6470],
            [-6.6120, 110.6450],
            [-6.6100, 110.6450]
        ],
        created_at: '2025-10-15 00:00:00'
    },
    // HAZARD EVENTS - Kriminal
    {
        id: 11,
        event_type: 'hazard',
        hazard_type: 'kriminal',
        title: 'Area Rawan Penjambretan',
        description: 'Jalan sepi dengan penerangan kurang, sering terjadi penjambretan malam hari',
        polyline: [
            [-6.6230, 110.6600],
            [-6.6240, 110.6610],
            [-6.6250, 110.6620]
        ],
        created_at: '2025-11-20 00:00:00'
    },
    // HAZARD EVENTS - Kebakaran
    {
        id: 12,
        event_type: 'hazard',
        hazard_type: 'kebakaran',
        title: 'Wilayah Padat Pemukiman',
        description: 'Pemukiman padat dengan jarak rumah rapat, rawan kebakaran',
        polygon: [
            [-6.6150, 110.6500],
            [-6.6150, 110.6520],
            [-6.6170, 110.6520],
            [-6.6170, 110.6500],
            [-6.6150, 110.6500]
        ],
        created_at: '2025-09-10 00:00:00'
    },
    // LOCATION EVENTS
    {
        id: 13,
        event_type: 'location',
        title: 'Balai Desa Tegalsambi',
        description: 'Kantor pemerintahan desa',
        latitude: -6.6181,
        longitude: 110.6539,
        created_at: '2025-01-01 00:00:00'
    },
    {
        id: 14,
        event_type: 'location',
        title: 'Puskesmas Pembantu',
        description: 'Fasilitas kesehatan desa',
        latitude: -6.6170,
        longitude: 110.6540,
        created_at: '2025-01-01 00:00:00'
    },
    {
        id: 15,
        event_type: 'location',
        title: 'Masjid Agung Tegalsambi',
        description: 'Masjid utama desa',
        latitude: -6.6190,
        longitude: 110.6530,
        created_at: '2025-01-01 00:00:00'
    }

];

// Helper functions
export const getEventsByType = (type: MapEvent['event_type']) => {
    return mockMapEvents.filter(event => event.event_type === type);
};

export const getEventsByLevel = (level: MapEvent['level']) => {
    return mockMapEvents.filter(event => event.level === level);
};

export const getEventsByHazardType = (hazardType: MapEvent['hazard_type']) => {
    return mockMapEvents.filter(event => event.hazard_type === hazardType);
};

export const getEventStats = () => {
    return {
        traffic: {
            total: getEventsByType('traffic').length,
            low: getEventsByLevel('low').length,
            medium: getEventsByLevel('medium').length,
            high: getEventsByLevel('high').length,
        },
        accident: {
            total: getEventsByType('accident').length,
        },
        hazard: {
            total: getEventsByType('hazard').length,
            banjir: getEventsByHazardType('banjir').length,
            longsor: getEventsByHazardType('longsor').length,
            kriminal: getEventsByHazardType('kriminal').length,
            kebakaran: getEventsByHazardType('kebakaran').length,
        },
        location: {
            total: getEventsByType('location').length,
        }
    };
};
