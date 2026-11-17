import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { ArrowDown, ArrowUp, ArrowUpDown, Search, Shield, ShieldAlert, Trash2, UserCog, X } from 'lucide-react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import UserModal from '@/Components/UserModal';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Switch } from '@/Components/ui/switch';

export default function Index({ users, counties, schools, filters }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [editingUser, setEditingUser] = useState(null);

    function handleSearch(e) {
        e.preventDefault();
        router.get('/users', { search: search || undefined, sort: filters.sort, direction: filters.direction }, { preserveState: true, preserveScroll: true });
    }

    function handleSort(field) {
        const direction = filters.sort === field && filters.direction === 'asc' ? 'desc' : 'asc';
        router.get('/users', { search: filters.search, sort: field, direction }, { preserveState: true, preserveScroll: true });
    }

    function renderSortIcon(field) {
        if (filters.sort !== field) {
            return <ArrowUpDown className="size-3.5 text-muted-foreground/50 ml-1 inline" />;
        }
        return filters.direction === 'asc' ? (
            <ArrowUp className="size-3.5 text-primary ml-1 inline" />
        ) : (
            <ArrowDown className="size-3.5 text-primary ml-1 inline" />
        );
    }

    async function toggleStatus(user) {
        const activating = user.status !== 'active';
        const result = await Swal.fire({
            icon: 'question',
            title: activating ? `Activate ${user.name}?` : `Deactivate ${user.name}?`,
            text: activating ? 'The user will be able to log in.' : 'The user will be blocked from logging in.',
            showCancelButton: true,
            confirmButtonText: 'Yes, continue',
            confirmButtonColor: '#2563eb',
        });
        if (!result.isConfirmed) return;

        router.patch(`/users/${user.id}/toggle-status`, {}, {
            preserveScroll: true,
            onSuccess: () =>
                Swal.fire({
                    icon: 'success',
                    title: activating ? 'User activated' : 'User deactivated',
                    timer: 1500,
                    showConfirmButton: false,
                }),
        });
    }

    async function toggleSuperAdmin(user) {
        const isSuper = user.role === 'super_admin';
        const result = await Swal.fire({
            icon: 'question',
            title: isSuper ? `Revoke Super Admin from ${user.name}?` : `Make ${user.name} a Super Admin?`,
            text: isSuper ? 'User will lose super admin privileges.' : 'User will gain full system administration access.',
            showCancelButton: true,
            confirmButtonText: 'Yes, continue',
            confirmButtonColor: '#2563eb',
        });
        if (!result.isConfirmed) return;

        router.patch(`/users/${user.id}/toggle-super`, {}, {
            preserveScroll: true,
            onSuccess: () =>
                Swal.fire({ icon: 'success', title: 'Role updated successfully', timer: 1500, showConfirmButton: false }),
        });
    }

    async function remove(user) {
        const result = await Swal.fire({
            icon: 'warning',
            title: `Delete ${user.name}?`,
            text: 'This action cannot be undone.',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete',
            confirmButtonColor: '#dc2626',
        });
        if (!result.isConfirmed) return;

        router.delete(`/users/${user.id}`, {
            preserveScroll: true,
            onSuccess: () =>
                Swal.fire({ icon: 'success', title: 'User deleted', timer: 1500, showConfirmButton: false }),
        });
    }

    return (
        <DashboardLayout title="Manage Users">
            <Head title="Users" />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold">System Users</h1>
                    <p className="text-sm text-muted-foreground">Total registered users: {users.total}</p>
                </div>

                <form onSubmit={handleSearch} className="flex w-full sm:w-auto gap-2">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search name, email, phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 w-full"
                        />
                    </div>
                    <Button type="submit" variant="secondary">Search</Button>
                    {search && (
                        <Button type="button" variant="outline" onClick={() => { setSearch(''); router.get('/users', { sort: filters.sort, direction: filters.direction }); }}>
                            <X className="size-4" />
                        </Button>
                    )}
                </form>
            </div>

            <div className="rounded-lg border bg-card">
                <div 
                    className="overflow-x-auto"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    <style>{`
                        div::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>
                    <table className="w-full text-xs sm:text-sm whitespace-nowrap">
                        <thead>
                            <tr className="border-b text-left text-muted-foreground">
                                <th className="w-10 px-2 sm:px-4 py-2 font-medium">#</th>
                                <th 
                                    className="px-2 sm:px-4 py-2 font-medium cursor-pointer hover:text-foreground select-none"
                                    onClick={() => handleSort('name')}
                                >
                                    Name {renderSortIcon('name')}
                                </th>
                                <th 
                                    className="px-2 sm:px-4 py-2 font-medium cursor-pointer hover:text-foreground select-none"
                                    onClick={() => handleSort('county')}
                                >
                                    County {renderSortIcon('county')}
                                </th>
                                <th 
                                    className="px-2 sm:px-4 py-2 font-medium cursor-pointer hover:text-foreground select-none"
                                    onClick={() => handleSort('school')}
                                >
                                    School {renderSortIcon('school')}
                                </th>
                                <th className="px-2 sm:px-4 py-2 font-medium">Phone</th>
                                <th className="px-2 sm:px-4 py-2 font-medium">Email</th>
                                <th className="px-2 sm:px-4 py-2 font-medium">Status</th>
                                <th 
                                    className="px-2 sm:px-4 py-2 font-medium cursor-pointer hover:text-foreground select-none"
                                    onClick={() => handleSort('last_active_at')}
                                >
                                    Last Login {renderSortIcon('last_active_at')}
                                </th>
                                <th className="px-2 sm:px-4 py-2 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.map((user, index) => (
                                <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50">
                                    <td className="px-2 sm:px-4 py-2.5">{users.from + index}</td>
                                    <td className="px-2 sm:px-4 py-2.5 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <span>{user.name}</span>
                                            {user.role === 'super_admin' && (
                                                <span className="inline-flex items-center rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                                                    Super
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-2 sm:px-4 py-2.5 text-muted-foreground">{user.county || '-'}</td>
                                    <td className="px-2 sm:px-4 py-2.5 text-muted-foreground">{user.school || '-'}</td>
                                    <td className="px-2 sm:px-4 py-2.5">+254{user.phone}</td>
                                    <td className="px-2 sm:px-4 py-2.5">{user.email}</td>
                                    <td className="px-2 sm:px-4 py-2.5">
                                        <Switch
                                            checked={user.status === 'active'}
                                            onCheckedChange={() => toggleStatus(user)}
                                            aria-label={`Toggle status for ${user.name}`}
                                        />
                                    </td>
                                    <td className="px-2 sm:px-4 py-2.5">
                                        {user.last_login_human === 'online' ? (
                                            <span className="inline-flex items-center gap-1.5 font-medium text-green-600 dark:text-green-400">
                                                <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                                                online
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">{user.last_login_human}</span>
                                        )}
                                    </td>
                                    <td className="px-2 sm:px-4 py-2.5 text-right">
                                        <div className="flex justify-end gap-1.5">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 px-2 text-xs"
                                                onClick={() => toggleSuperAdmin(user)}
                                                title={user.role === 'super_admin' ? 'Revoke Super Admin' : 'Make Super Admin'}
                                            >
                                                {user.role === 'super_admin' ? (
                                                    <ShieldAlert className="size-3.5 text-orange-600" />
                                                ) : (
                                                    <Shield className="size-3.5 text-purple-600" />
                                                )}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 px-2 text-xs"
                                                onClick={() => setEditingUser(user)}
                                            >
                                                <UserCog className="size-3.5" /> Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                                                onClick={() => remove(user)}
                                            >
                                                <Trash2 className="size-3.5" /> Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.data.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="px-4 py-8 text-center text-muted-foreground">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <UserModal
                open={!!editingUser}
                onClose={() => setEditingUser(null)}
                user={editingUser}
                counties={counties}
                schools={schools}
            />
        </DashboardLayout>
    );
}