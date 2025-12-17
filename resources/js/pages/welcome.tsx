import { Head, Link, usePage } from '@inertiajs/react';
import { Map, Database, BarChart3, Layers } from 'lucide-react';
import { type SharedData } from '@/types';
import { dashboard, login, register } from '@/routes';

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="WebGIS Desa" />
            <div className="min-h-screen bg-background text-foreground flex flex-col">
                {/* Navigation */}
                <header className="border-b">
                    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-xl">
                            <Map className="h-6 w-6 text-primary" />
                            <span>WebGIS Desa</span>
                        </div>
                        <nav className="flex items-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="text-sm font-medium hover:underline underline-offset-4"
                                    >
                                        Log in
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                                        >
                                            Register
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="flex-1">
                    <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/30">
                        <div className="container mx-auto px-4 text-center">
                            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                                WebGIS Desa: <br className="hidden md:block" />
                                <span className="text-primary">Analisis Peta Wilayah & Kependudukan</span>
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                                Platform terpadu untuk visualisasi, analisis, dan pengelolaan data geografis serta kependudukan desa secara komprehensif.
                            </p>
                            <div className="flex justify-center gap-4">
                                <Link
                                    href="/peta-interaktif"
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8"
                                >
                                    <Map className="mr-2 h-4 w-4" />
                                    Buka Peta Interaktif
                                </Link>
                                <Link
                                    href="/data-kependudukan/persebaran-penduduk"
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-8"
                                >
                                    Lihat Data Kependudukan
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Features Section */}
                    <section className="py-20 bg-background">
                        <div className="container mx-auto px-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                        <Layers className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">Peta Interaktif</h3>
                                    <p className="text-muted-foreground">
                                        Visualisasi interaktif data kependudukan, batas wilayah, penggunaan lahan, dan fasilitas desa dalam satu peta digital.
                                    </p>
                                </div>
                                <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                        <Database className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">Data Terintegrasi</h3>
                                    <p className="text-muted-foreground">
                                        Pengelolaan data demografi, lokasi penting, fasilitas umum, dan potensi desa dalam satu basis data terpusat.
                                    </p>
                                </div>
                                <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                        <BarChart3 className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">Statistik Wilayah</h3>
                                    <p className="text-muted-foreground">
                                        Dashboard informatif menyajikan ringkasan data demografi, infrastruktur, dan analisis spasial desa secara visual.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t py-8 bg-muted/30">
                    <div className="container mx-auto px-4 text-center text-muted-foreground">
                        <p>&copy; 2025 WebGIS Desa Tegalsambi, Kec. Tahunan, Kab. Jepara, Prov. Jawa Tengah. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
