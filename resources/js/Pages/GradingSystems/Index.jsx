import { useEffect, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { Edit, Eye, Plus, Search, Trash2, CheckCircle, Circle } from 'lucide-react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import GradingSystemModal from '@/Components/GradingSystemModal';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';

export default function GradingSystemsIndex({ gradingSystems, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [modal, setModal] = useState(null);

    // Live search debouncing
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(
                    '/grading-systems',
                    { search },
                    { preserveState: true, replace: true }
                );
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    async function toggleDefault(system) {
        if (system.is_default) return;

        router.put(`/grading-systems/${system.id}`, { is_default: true }, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Default system updated',
                    text: `${system.name} is now the active default.`,
                    timer: 1500,
                    showConfirmButton: false,
                });
            },
        });
    }

    async function removeSystem(system) {
        const result = await Swal.fire({
            icon: 'warning',
            title: `Delete ${system.name}?`,
            text: 'This grading system and all its bands will be permanently removed.',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete',
            confirmButtonColor: '#dc2626',
        });
        if (!result.isConfirmed) return;

        router.delete(`/grading-systems/${system.id}`, {
            preserveScroll: true,
            onSuccess: () =>
                Swal.fire({
                    icon: 'success',
                    title: 'Grading system deleted',
                    timer: 1500,
                    showConfirmButton: false,
                }),
        });
    }

    return (
        <DashboardLayout title="Grading Systems">
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">Grading Systems</h1>
                        <p className="text-sm text-muted-foreground">Manage exam grading scales and score brackets.</p>
                    </div>
                    <Button onClick={() => setModal({ system: null })}>
                        <Plus className="mr-2 size-4" /> Add grading system
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search grading systems..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-semibold w-16">#</th>
                                <th className="px-4 py-3 font-semibold">Grading System</th>
                                <th className="px-4 py-3 font-semibold text-center w-32">Default</th>
                                <th className="px-4 py-3 font-semibold text-right w-44">Manage</th>
                                <th className="px-4 py-3 font-semibold text-right w-24">Delete</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {gradingSystems.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-muted-foreground">
                                        No grading systems found.
                                    </td>
                                </tr>
                            ) : (
                                gradingSystems.map((system, index) => (
                                    <tr key={system.id} className="hover:bg-muted/10">
                                        <td className="px-4 py-3 text-muted-foreground font-mono">{index + 1}</td>
                                        <td className="px-4 py-3 font-medium text-foreground">
                                            {system.name}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                type="button"
                                                onClick={() => toggleDefault(system)}
                                                className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-primary"
                                                title={system.is_default ? 'Current default' : 'Click to set as default'}
                                            >
                                                {system.is_default ? (
                                                    <CheckCircle className="size-4 text-primary fill-primary/20" />
                                                ) : (
                                                    <Circle className="size-4 text-muted-foreground" />
                                                )}
                                                <span className={system.is_default ? 'text-primary font-semibold' : 'text-muted-foreground'}>
                                                    {system.is_default ? 'Default' : 'Set'}
                                                </span>
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button asChild size="sm" variant="outline">
                                                    <Link href={`/grading-systems/${system.id}`}>
                                                        <Eye className="mr-1.5 size-3.5" /> Manage
                                                    </Link>
                                                </Button>
                                                {!system.is_default && (
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="size-8"
                                                        onClick={() => setModal({ system })}
                                                        title="Edit Name"
                                                    >
                                                        <Edit className="size-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {!system.is_default && (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="size-8 text-destructive hover:bg-destructive/10"
                                                    onClick={() => removeSystem(system)}
                                                    title="Delete System"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal && (
                <GradingSystemModal
                    open
                    onClose={() => setModal(null)}
                    gradingSystem={modal.system}
                />
            )}
        </DashboardLayout>
    );
}