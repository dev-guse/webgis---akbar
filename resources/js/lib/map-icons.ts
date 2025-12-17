import L from 'leaflet';
import { Base64 } from 'js-base64';

// Define SVG for different facility types using recognizable icons
const SVG_PATHS: { [key: string]: string } = {
    // Schools - Graduation cap
    school: `<path d="M12 3L1 9L5 11.18V17.18L12 21L19 17.18V11.18L21 10.09V17H23V9L12 3Z" fill="currentColor"/>`,

    // Mosque - Dome with minaret
    mosque: `<path d="M12 1C11.45 1 11 1.45 11 2V3H9.5C8.67 3 8 3.67 8 4.5V6H16V4.5C16 3.67 15.33 3 14.5 3H13V2C13 1.45 12.55 1 12 1M8 7V21H16V7H8M10 9H14V11H10V9M10 12H14V14H10V12M10 15H14V17H10V15Z" fill="currentColor"/>`,

    // Church - Cross and building
    church: `<path d="M10 2V5H8V7H10V9H5V21H10V16H14V21H19V9H14V7H16V5H14V2H10M7 11H17V19H15V14H9V19H7V11Z" fill="currentColor"/>`,

    // Temple/Pura/Vihara - Asian temple
    temple: `<path d="M6.5 1H4V4H1L3 6L1 8H23L21 6L23 4H20V1H17.5V4H6.5V1M5 9V11H19V9H5M3 12V22H10V17H14V22H21V12H3M5 14H8V16H5V14M16 14H19V16H16V14Z" fill="currentColor"/>`,

    // Medical - Red cross
    medical: `<circle cx="12" cy="12" r="10" fill="#dc3545"/><rect x="10" y="6" width="4" height="12" fill="white"/><rect x="6" y="10" width="12" height="4" fill="white"/>`,

    // Government building - Building with flag
    building: `<path d="M3 2V22H10V17H14V22H21V2H3M7 4H9V6H7V4M11 4H13V6H11V4M15 4H17V6H15V4M7 8H9V10H7V8M11 8H13V10H11V8M15 8H17V10H15V8M7 12H9V14H7V12M11 12H13V14H11V12M15 12H17V14H15V12Z" fill="currentColor"/>`,

    // Market - Store front
    market: `<path d="M18 6H16V4H8V6H6A2 2 0 0 0 4 8V17A2 2 0 0 0 6 19H8V22H16V19H18A2 2 0 0 0 20 17V8A2 2 0 0 0 18 6M10 6H14V8H10V6M10 20V17H14V20H10M18 17H16V15H8V17H6V8H18V17Z" fill="currentColor"/>`,

    // Bus/Terminal - Bus icon
    bus: `<path d="M18 11H6V6H18M16.5 17A1.5 1.5 0 0 1 15 15.5A1.5 1.5 0 0 1 16.5 14A1.5 1.5 0 0 1 18 15.5A1.5 1.5 0 0 1 16.5 17M7.5 17A1.5 1.5 0 0 1 6 15.5A1.5 1.5 0 0 1 7.5 14A1.5 1.5 0 0 1 9 15.5A1.5 1.5 0 0 1 7.5 17M4 16C4 16.88 4.39 17.67 5 18.22V20A1 1 0 0 0 6 21H7A1 1 0 0 0 8 20V19H16V20A1 1 0 0 0 17 21H18A1 1 0 0 0 19 20V18.22C19.61 17.67 20 16.88 20 16V6C20 2.5 16.42 2 12 2S4 2.5 4 6V16Z" fill="currentColor"/>`,

    // Police - Shield
    police: `<path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M12 5A2 2 0 0 1 14 7A2 2 0 0 1 12 9A2 2 0 0 1 10 7A2 2 0 0 1 12 5M14.2 17H9.8C9.8 15.67 11.03 14.6 12 14.6C12.97 14.6 14.2 15.67 14.2 17Z" fill="currentColor"/>`,

    // Fire department - Fire truck
    fire: `<path d="M20 12V15.5C20 16.6 19.1 17.5 18 17.5C16.9 17.5 16 16.6 16 15.5V13H13L12 14.5V16H7.5C7.5 17.4 6.4 18.5 5 18.5C3.6 18.5 2.5 17.4 2.5 16H1V8H13V10H16L20 12M3 14H5V16H3V14M18 14A1.5 1.5 0 0 1 19.5 15.5A1.5 1.5 0 0 1 18 17A1.5 1.5 0 0 1 16.5 15.5A1.5 1.5 0 0 1 18 14M8 4L6 8H11L13 4H8Z" fill="currentColor"/>`,

    // Park/Forest - Tree
    park: `<path d="M11 21V16.74C10.53 16.91 10.03 17 9.5 17C7 17 5 15 5 12.5C5 11.23 5.5 10.09 6.36 9.27C6.13 8.73 6 8.13 6 7.5C6 5 8 3 10.5 3C11.35 3 12.13 3.26 12.78 3.68C13.34 2.68 14.39 2 15.59 2C17.5 2 19.09 3.59 19.09 5.5C19.09 6.06 18.97 6.59 18.76 7.08C19.53 7.92 20 9.11 20 10.41C20 12.74 18.24 14.5 15.91 14.5C15.73 14.5 15.55 14.5 15.38 14.46L13 21H11Z" fill="currentColor"/>`,

    // Stadium - Sports field
    stadium: `<path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2M17.55 14.7C17.05 15.42 16.36 16 15.55 16.35V10.65C16.36 11 17.05 11.58 17.55 12.3L12 15.45V8.55L17.55 11.7V14.7M6.45 14.7V11.7L12 8.55V15.45L6.45 12.3C6.95 11.58 7.64 11 8.45 10.65V16.35C7.64 16 6.95 15.42 6.45 14.7Z" fill="currentColor"/>`,

    // Library - Book
    library: `<path d="M19 2L14 6.5V17.5L19 13V2M6.5 5C4.55 5 2.45 5.4 1 6.5V21.16C1 21.41 1.25 21.66 1.5 21.66C1.6 21.66 1.65 21.59 1.75 21.59C3.1 20.94 5.05 20.5 6.5 20.5C8.45 20.5 10.55 20.9 12 22C13.35 21.15 15.8 20.5 17.5 20.5C19.15 20.5 20.85 20.81 22.25 21.56C22.35 21.61 22.4 21.59 22.5 21.59C22.75 21.59 23 21.34 23 21.09V6.5C22.4 6.05 21.75 5.75 21 5.5V19C19.9 18.65 18.7 18.5 17.5 18.5C15.8 18.5 13.35 19.15 12 20V6.5C10.55 5.4 8.45 5 6.5 5Z" fill="currentColor"/>`,

    // Cemetery - Cross/grave
    cemetery: `<path d="M10 2H14V9H18V13H14V22H10V13H6V9H10V2Z" fill="currentColor"/>`,

    // Post office - Mail/envelope
    mail: `<path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4M20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>`,

    // House/Pemukiman - Home
    house: `<path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" fill="currentColor"/>`,

    // Pertanian - Sprout/leaf
    pertanian: `<path d="M21,21H3V19H21V21M19.5,18H4.5C4.22,18 4,17.78 4,17.5V10.33C4,10.05 4.22,9.83 4.5,9.83H19.5 C19.78,9.83 20,10.05 20,10.33V17.5C20,17.78 19.78,18 19.5,18M12,9C11,9 11,8 11,8C11,8 11,7 12,7C13,7 13,8 13,8C13,8 13,9 12,9M12,6C9.13,6 7.3,8.08 8,11H16C16.7,8.08 14.88,6 12,6M6.5,5H17.5L16,2H8L6.5,5Z" fill="currentColor" />`,

    // Perkebunan - Group of trees
    perkebunan: `<path d="M7 14H5v5h2v-5zm10-4h-2v9h2V10zm-4 2h-2v7h2v-7zm-4-4H7v9h2V8zm10-4h-2v13h2V4z" fill="currentColor" />`,

    // Industri - Factory
    industri: `<path d="M2 22H22V20H2V22M12 2L2 7H4V18H20V7H22L12 2M16 16H8V11H16V16M16 9H8V4H16V9Z" fill="currentColor" />`,

    // Default - Map pin
    default: `<path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2M12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5Z" fill="currentColor"/>`,

    // Danger - Triangle Alert
    danger: `<path d="M12 2L1 21H23L12 2M12 6L19.53 19H4.47L12 6M11 10V14H13V10H11M11 16V18H13V16H11Z" fill="currentColor"/>`,

    // Disaster Types
    flood: `<path d="M12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22M12 4C14.21 4 16 5.79 16 8C16 10.21 14.21 12 12 12C9.79 12 8 10.21 8 8C8 5.79 9.79 4 12 4M6 15C6.83 15 7.6 15.26 8.24 15.7L9.5 14.44C10.2 13.74 11.16 13.34 12.16 13.34C13.15 13.34 14.11 13.74 14.81 14.44L16.07 15.7C16.71 15.26 17.48 15 18.31 15C19.14 15 19.91 15.26 20.55 15.7L21.81 16.96L20.39 18.38L19.13 17.12C18.91 16.9 18.61 16.79 18.31 16.79C18 16.79 17.7 16.9 17.49 17.12L16.23 18.38C15.53 19.08 14.57 19.48 13.57 19.48C12.58 19.48 11.62 19.08 10.92 18.38L9.66 17.12C9.44 16.9 9.14 16.79 8.84 16.79C8.54 16.79 8.24 16.9 8.03 17.12L6.77 18.38L5.35 16.96L6.61 15.7C7.25 15.26 8.02 15 8.84 15H6Z" fill="currentColor"/>`, // Simplified water/waves
    landslide: `<path d="M6 15.5C6 15.5 8 13.5 10 13.5C12 13.5 14 15.5 14 15.5V22H6V15.5M10 2L1 21H6V16.5C6 16.5 5 16.5 4 16.5L10 4L16 16.5C15 16.5 14 16.5 14 16.5V21H19L10 2M16 16H22V18H16V16M16 19H20V21H16V19Z" fill="currentColor"/>`, // Rocks falling
    quake: `<path d="M11 10.9C10.45 10.9 9.91 11.23 9.59 11.75L4 21H20L19.41 20.03L9.59 4.25C9.27 3.73 8.73 3.4 8.18 3.4C7.63 3.4 7.09 3.73 6.77 4.25L5.77 5.92L7.43 6.92L8.18 5.68L12.59 12.72L15.42 8L11 10.9Z" fill="currentColor"/>`, // Cracks/lines
    fire_disaster: `<path d="M12 2C12 2 4 9 4 15C4 19.97 7.58 24 12 24C16.42 24 20 19.97 20 15C20 9 12 2 12 2M12 22C8.69 22 6 18.88 6 15C6 11.53 10 7.21 12 5.06C14 7.21 18 11.53 18 15C18 18.88 15.31 22 12 22M13 18H10V16H13V18M13 14H10V10H13V14Z" fill="currentColor"/>`, // Flame with exclamation
    tornado: `<path d="M15 4V2H9V4H15M7 6H17V8H7V6M6 10H18V12H6V10M16 14H8V16H16V14M13 18H11V20H13V18Z" fill="currentColor"/>`, // Swirl/Wind lines
    drought: `<path d="M12 2C8.13 2 5 5.13 5 9C5 12.38 7.46 15.18 10.7 15.8C9.62 16.54 8.24 17 6.5 17C4 17 2 15 2 12.5C2 10 4 8 6.5 8V6C2.9 6 0 8.9 0 12.5C0 16.1 2.9 19 6.5 19C7.96 19 9.3 18.53 10.4 17.74C10.84 19.04 12 20 13.5 20C15.43 20 17 18.43 17 16.5C17 14.57 15.43 13 13.5 13C12.38 13 11.39 13.55 10.8 14.39C10.15 13.92 9.4 13.31 8.84 12.61C9.7 11.75 11 10.38 11.53 9.5L12 9L12.47 9.5C13 10.38 14.3 11.75 15.16 12.61C14.6 13.31 13.85 13.92 13.2 14.39C12.61 13.55 11.62 13 10.5 13C10.1 13 9.72 13.08 9.38 13.23C9.38 13.23 12 9.5 12 2Z" fill="currentColor"/>`, // Approximate Sun/Heat

};

export const getFacilityIconSVG = (type: string, fillColor: string = '#3b82f6', strokeColor: string = 'white', iconSize: number = 32) => {
    // Map specific types to general SVG paths
    let iconKey = 'default';
    let iconColor = fillColor;

    // Handle danger levels only if specifically asked for levels (legacy/fallback)
    // But we prefer explicit disaster typing now
    if (['rendah', 'sedang', 'tinggi', 'sangat_tinggi'].includes(type)) {
        iconKey = 'danger'; // Triangle
        switch (type) {
            case 'rendah': iconColor = '#22c55e'; break;
            case 'sedang': iconColor = '#facc15'; break;
            case 'tinggi': iconColor = '#f97316'; break;
            case 'sangat_tinggi': iconColor = '#ef4444'; break;
        }
    }

    // Handle Disaster Types
    switch (type) {
        case 'banjir': iconKey = 'flood'; break;
        case 'longsor': iconKey = 'landslide'; break;
        case 'gempa': iconKey = 'quake'; break;
        case 'kebakaran': iconKey = 'fire_disaster'; break; // Use new distinct icon
        case 'angin_puting_beliung': iconKey = 'tornado'; break;
        case 'kekeringan': iconKey = 'drought'; break;
        
        // Handle Batas Wilayah (Land Use) Types
        case 'Pertanian':
            iconKey = 'pertanian';
            iconColor = '#4ade80'; // green-400
            break;
        case 'Pemukiman':
            iconKey = 'house';
            iconColor = '#fb923c'; // orange-400
            break;
        case 'Perkebunan':
            iconKey = 'perkebunan';
            iconColor = '#a3e635'; // lime-400
            break;
        case 'Hutan':
            iconKey = 'park';
            iconColor = '#22c55e'; // green-500
            break;
        case 'Industri':
            iconKey = 'industri';
            iconColor = '#94a3b8'; // slate-400
            break;
        case 'Fasilitas Umum':
            iconKey = 'building';
            iconColor = '#60a5fa'; // blue-400
            break;
        case 'Lainnya':
            iconKey = 'default';
            iconColor = '#a1a1aa'; // zinc-400
            break;

        // Legacy/Facilities logic follows...
        case 'sekolah_sd':
        case 'sekolah_smp':
        case 'sekolah_sma':
        case 'universitas':
            iconKey = 'school';
            iconColor = '#f59e0b'; // Amber
            break;
        case 'masjid':
        case 'mushola':
            iconKey = 'mosque';
            iconColor = '#10b981'; // Green
            break;
        case 'gereja':
            iconKey = 'church';
            iconColor = '#8b5cf6'; // Purple
            break;
        case 'pura':
        case 'vihara':
            iconKey = 'temple';
            iconColor = '#f97316'; // Orange
            break;
        case 'puskesmas':
        case 'klinik':
        case 'rumah_sakit_umum':
        case 'posyandu':
            iconKey = 'medical';
            iconColor = '#ef4444'; // Red (medical cross is already red internally)
            break;
        case 'kantor_desa_kelurahan':
        case 'kantor_kecamatan':
        case 'kantor_pemerintah_dinas_instansi':
            iconKey = 'building';
            iconColor = '#6b7280'; // Gray
            break;
        case 'balai_desa_pertemuan':
            iconKey = 'building';
            iconColor = '#6b7280';
            break;
        case 'pasar_tradisional':
            iconKey = 'market';
            iconColor = '#f97316'; // Orange
            break;
        case 'terminal_halte':
            iconKey = 'bus';
            iconColor = '#8b5cf6'; // Purple
            break;
        case 'pos_polisi':
            iconKey = 'police';
            iconColor = '#3b82f6'; // Blue
            break;
        case 'pos_damkar':
            iconKey = 'fire';
            iconColor = '#dc2626'; // Dark red
            break;
        case 'lapangan_taman':
            iconKey = 'park';
            iconColor = '#059669'; // Green
            break;
        case 'stadion_gor':
            iconKey = 'stadium';
            iconColor = '#6b7280'; // Gray
            break;
        case 'perpustakaan_daerah':
            iconKey = 'library';
            iconColor = '#06b6d4'; // Cyan
            break;
        case 'tempat_pemakaman_umum_tpu':
            iconKey = 'cemetery';
            iconColor = '#1f2937'; // Dark gray
            break;
        case 'kantor_pos':
            iconKey = 'mail';
            iconColor = '#eab308'; // Yellow
            break;
        case 'rumah':
            iconKey = 'house';
            iconColor = '#3b82f6'; // Blue
            break;
        default:
            // If type is not recognized, default to building icon
            if (!SVG_PATHS[iconKey]) {
                iconKey = 'building';
                iconColor = '#6b7280';
            }
            break;
    }

    // Create SVG with circular background and icon on top
    const iconPath = SVG_PATHS[iconKey] || SVG_PATHS['building'];

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="11" fill="${iconColor}" stroke="white" stroke-width="1.5"/>
        <g transform="scale(0.7) translate(4, 4)" fill="white">
            ${iconPath}
        </g>
    </svg>`;
};


export const createFacilityIcon = (type: string) => {
    const svgHtml = getFacilityIconSVG(type, undefined, undefined, 40); // Changed 32 to 40

    return L.divIcon({
        className: 'custom-facility-icon',
        html: svgHtml,
        iconSize: [40, 40], // Changed [32, 32] to [40, 40]
        iconAnchor: [20, 20], // Changed [16, 16] to [20, 20]
        // Center the icon. The SVG has a circle at cx=12, cy=12, r=11. Viewbox 0-24. 
        // Current getFacilityIconSVG uses 24x24 viewBox but defaults iconSize to 40. 
        // The SVG definition: width=${iconSize} height=${iconSize} viewBox="0 0 24 24".
        // If iconSize is 40, then 40px x 40px is the element size.
        // Map anchor [20, 20] centers it on the latlng.
    });
};

export const createDangerIcon = (level: string) => {
    return createFacilityIcon(level);
};

export const createDisasterIcon = (type: string, level: string) => {
    // Determine color based on level
    let color = '#3b82f6'; // default blue
    switch (level) {
        case 'rendah': color = '#22c55e'; break;
        case 'sedang': color = '#facc15'; break;
        case 'tinggi': color = '#f97316'; break;
        case 'sangat_tinggi': color = '#ef4444'; break;
    }

    // Get SVG for the type, with the specific color
    const svgHtml = getFacilityIconSVG(type, color, undefined, 40); // Changed 32 to 40

    return L.divIcon({
        className: 'custom-facility-icon',
        html: svgHtml,
        iconSize: [40, 40], // Changed [32, 32] to [40, 40]
        iconAnchor: [20, 20], // Changed [16, 16] to [20, 20]
        popupAnchor: [0, -20] // Changed [0, -16] to [0, -20]
    });
};

// Deprecate direct object usage in favor of function to ensure fresh SVG generation?
// Actually, let's keep facilityIcons for backward compatibility if needed, but redefine it to use DivIcons for consistency.
// However, DivIcons are better created on fly or cached.
// Let's redefine facilityIcons to use DivIcons too.
export const facilityIcons: { [key: string]: L.DivIcon } = {
    ...Object.fromEntries(
        Object.keys(SVG_PATHS).map(key => [
            key,
            createFacilityIcon(key)
        ])
    ),
    // Specific overrides - we need to map the keys map-icons.ts previously had 
    // to calls to createFacilityIcon(key) which internally handles the switch for colors.
    masjid: createFacilityIcon('masjid'),
    mushola: createFacilityIcon('mushola'),
    sekolah_sd: createFacilityIcon('sekolah_sd'),
    sekolah_smp: createFacilityIcon('sekolah_smp'),
    sekolah_sma: createFacilityIcon('sekolah_sma'),
    universitas: createFacilityIcon('universitas'),
    toko: createFacilityIcon('toko'),
    gereja: createFacilityIcon('gereja'),
    pura: createFacilityIcon('pura'),
    vihara: createFacilityIcon('vihara'),
    puskesmas: createFacilityIcon('puskesmas'),
    klinik: createFacilityIcon('klinik'),
    rumah_sakit_umum: createFacilityIcon('rumah_sakit_umum'),
    posyandu: createFacilityIcon('posyandu'),
    kantor_desa_kelurahan: createFacilityIcon('kantor_desa_kelurahan'),
    kantor_kecamatan: createFacilityIcon('kantor_kecamatan'),
    kantor_pemerintah_dinas_instansi: createFacilityIcon('kantor_pemerintah_dinas_instansi'),
    balai_desa_pertemuan: createFacilityIcon('balai_desa_pertemuan'),
    pasar_tradisional: createFacilityIcon('pasar_tradisional'),
    terminal_halte: createFacilityIcon('terminal_halte'),
    pos_polisi: createFacilityIcon('pos_polisi'),
    pos_damkar: createFacilityIcon('pos_damkar'),
    lapangan_taman: createFacilityIcon('lapangan_taman'),
    stadion_gor: createFacilityIcon('stadion_gor'),
    perpustakaan_daerah: createFacilityIcon('perpustakaan_daerah'),
    tempat_pemakaman_umum_tpu: createFacilityIcon('tempat_pemakaman_umum_tpu'),
    kantor_pos: createFacilityIcon('kantor_pos'),
    rumah: createFacilityIcon('rumah'),
};