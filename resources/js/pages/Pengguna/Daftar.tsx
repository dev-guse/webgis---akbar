import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageProps, User } from '@/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle } from 'lucide-react';

interface UserProps extends PageProps {
    users: {
        data: User[];
        links: [];
        total: number;
    };
    filters: {
        search?: string;
    };
}

export default function Daftar({ users, filters, auth }: UserProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isInternalUpdate, setIsInternalUpdate] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        errors,
        reset,
    } = useForm({
        id: '',
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        if (isInternalUpdate) {
            const timer = setTimeout(() => {
                router.get(
                    route('pengguna.daftar'),
                    { search: searchQuery },
                    { preserveState: true, replace: true }
                );
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [searchQuery, isInternalUpdate]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setIsInternalUpdate(true);
    };

    const openAddModal = () => {
        reset();
        setIsAddModalOpen(true);
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
        reset();
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setData({
            id: String(user.id),
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedUser(null);
        reset();
    };

    const openDeleteModal = (user: User) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
    };

    const submitAdd = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('users.store'), {
            onSuccess: () => {
                closeAddModal();
                toast.success('User berhasil ditambahkan.');
            },
            onError: (err) => {
                console.error(err);
                toast.error('Gagal menambahkan user.');
            },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedUser) {
            put(route('users.update', { id: selectedUser.id }), {
                onSuccess: () => {
                    closeEditModal();
                    toast.success('User berhasil diperbarui.');
                },
                onError: (err) => {
                    console.error(err);
                    toast.error('Gagal memperbarui user.');
                },
            });
        }
    };

    const submitDelete = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedUser) {
            destroy(route('users.destroy', { id: selectedUser.id }), {
                onSuccess: () => {
                    closeDeleteModal();
                    toast.success('User berhasil dihapus.');
                },
                onError: (err) => {
                    console.error(err);
                    toast.error('Gagal menghapus user.');
                },
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Manajemen User" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <Input
                                    type="text"
                                    placeholder="Cari user..."
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    className="max-w-sm"
                                />
                                <Button onClick={openAddModal}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah User
                                </Button>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.data.length > 0 ? (
                                        users.data.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Buka menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => openEditModal(user)} disabled={user.id === 1}>Edit</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => openDeleteModal(user)} disabled={user.id === 1}>Hapus</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center">
                                                Tidak ada user ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add User Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Tambah User Baru</DialogTitle>
                        <DialogDescription>
                            Isi detail user baru di sini.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitAdd} className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Nama
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="col-span-3"
                            />
                            {errors.name && <p className="col-span-4 text-red-500 text-xs">{errors.name}</p>}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="col-span-3"
                            />
                            {errors.email && <p className="col-span-4 text-red-500 text-xs">{errors.email}</p>}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="col-span-3"
                            />
                            {errors.password && <p className="col-span-4 text-red-500 text-xs">{errors.password}</p>}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password_confirmation" className="text-right">
                                Konfirmasi Password
                            </Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="col-span-3"
                            />
                            {errors.password_confirmation && <p className="col-span-4 text-red-500 text-xs">{errors.password_confirmation}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeAddModal}>Batal</Button>
                            <Button type="submit" disabled={processing}>Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit User Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Ubah detail user di sini.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-name" className="text-right">
                                Nama
                            </Label>
                            <Input
                                id="edit-name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="col-span-3"
                            />
                            {errors.name && <p className="col-span-4 text-red-500 text-xs">{errors.name}</p>}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="col-span-3"
                            />
                            {errors.email && <p className="col-span-4 text-red-500 text-xs">{errors.email}</p>}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-password" className="text-right">
                                Password (kosongkan jika tidak diubah)
                            </Label>
                            <Input
                                id="edit-password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="col-span-3"
                            />
                            {errors.password && <p className="col-span-4 text-red-500 text-xs">{errors.password}</p>}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-password_confirmation" className="text-right">
                                Konfirmasi Password
                            </Label>
                            <Input
                                id="edit-password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="col-span-3"
                            />
                            {errors.password_confirmation && <p className="col-span-4 text-red-500 text-xs">{errors.password_confirmation}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeEditModal}>Batal</Button>
                            <Button type="submit" disabled={processing}>Simpan Perubahan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete User Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Hapus User</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus user "{selectedUser?.name}"? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={closeDeleteModal}>Batal</Button>
                        <Button variant="destructive" onClick={submitDelete} disabled={processing}>Hapus</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
