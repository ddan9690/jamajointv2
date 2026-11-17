import { useEffect, useRef, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { Plus, Search, X } from 'lucide-react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';

export default function Index({ schools, filters }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const firstRender = useRef(true);

    // Live search: runs 300ms after the user stops typing
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                '/schools',
                { search: search || undefined },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    async function remove(school) {
        const result = await Swal.fire({
            icon: 'warning',
            title: `Delete ${school.name}?`,
            text: 'Its streams and students will be deleted too.',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete',
            confirmButtonColor: '#dc2626',
        });
        if (!result.isConfirmed) return;

        router.delete(`/schools/${school.id}/${school.slug}`, {
            preserveScroll: true,
            onSuccess: () =>
                Swal.fire({ icon: 'success', title: 'School deleted', timer: 1500, showConfirmButton: false }),
            onError: (errors) =>
                Swal.fire({ icon: 'error', title: 'Could not delete', text: errors.delete }),
        });
    }

    return (
        <DashboardLayout title="Schools">
            <div className="mb-6 flex items-center justify-between gap-2">
                <div>
                    <h1 className="text-xl font-semibold">Schools</h1>
                    <p className="text-sm text-muted-foreground">Total schools: {schools.total}</p>
                </div>
                <Button asChild>
                    <Link href="/schools/create">
                        <Plus className="size-4" /> Add school
                    </Link>
                </Button>
            </div>

            <div className="relative mb-4 max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search school..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-9"
                />
                {search && (
                    <button
                        type="button"
                        onClick={() => setSearch('')}
                        aria-label="Clear search"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="size-4" />
                    </button>
                )}
            </div>

            <div className="rounded-lg border bg-card">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-muted-foreground">
                                <th className="w-12 px-4 py-2 font-medium">#</th>
                                <th className="px-4 py-2 font-medium">Name</th>
                                <th className="px-4 py-2 font-medium">County</th>
                                <th className="px-4 py-2 font-medium">Students</th>
                                <th className="px-4 py-2 font-medium">Type</th>
                                <th className="px-4 py-2 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schools.data.map((school, index) => (
                                <tr key={school.id} className="border-b last:border-0">
                                    <td className="px-4 py-2">{schools.from + index}</td>
                                    <td className="whitespace-nowrap px-4 py-2">
                                        <Link
                                            href={`/schools/${school.id}/${school.slug}`}
                                            className="font-medium text-primary hover:underline"
                                        >
                                            {school.name}
                                        </Link>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-2">{school.county?.name}</td>
                                    <td className="whitespace-nowrap px-4 py-2">{school.students_count}</td>
                                    <td className="whitespace-nowrap px-4 py-2 capitalize">{school.type}</td>
                                    <td className="whitespace-nowrap px-4 py-2 text-right">
                                        <Link
                                            href={`/schools/${school.id}/${school.slug}/edit`}
                                            className="text-primary hover:underline"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => remove(school)}
                                            className="ml-3 text-destructive hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {schools.data.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-muted-foreground">
                                        No school found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {schools.last_page > 1 && (
                <div className="mt-4 flex flex-wrap gap-1">
                    {schools.links.map((link, i) =>
                        link.url ? (
                            <Link
                                key={i}
                                href={link.url}
                                preserveScroll
                                className={`rounded-md border px-3 py-1 text-sm ${
                                    link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span
                                key={i}
                                className="rounded-md border px-3 py-1 text-sm text-muted-foreground"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        )
                    )}
                </div>
            )}
        </DashboardLayout>
    );
}