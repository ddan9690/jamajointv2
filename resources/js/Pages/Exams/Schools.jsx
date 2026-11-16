import { useEffect, useRef, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { Search, X } from 'lucide-react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';

export default function Schools({ exam, schools, filters }) {
    const base = `/exams/${exam.id}/${exam.slug}`;

    const [search, setSearch] = useState(filters.search ?? '');
    const [selected, setSelected] = useState([]);
    const [busy, setBusy] = useState(false);
    const first = useRef(true);

    // Live search: runs 300ms after the user stops typing. Selections are kept.
    useEffect(() => {
        if (first.current) {
            first.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(`${base}/schools`, { search: search || undefined }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const allSelected = schools.data.length > 0 && schools.data.every((s) => selected.includes(s.id));

    const toggle = (id) =>
        setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    const toggleAll = () =>
        setSelected((prev) =>
            allSelected
                ? prev.filter((id) => !schools.data.some((s) => s.id === id))
                : [...new Set([...prev, ...schools.data.map((s) => s.id)])]
        );

    function register() {
        const count = selected.length;

        router.post(`${base}/schools`, { school_ids: selected }, {
            onStart: () => setBusy(true),
            onFinish: () => setBusy(false),
            onSuccess: () =>
                Swal.fire({
                    icon: 'success',
                    title: 'Schools registered',
                    text: `${count} school${count === 1 ? '' : 's'} registered for this exam.`,
                    confirmButtonText: 'OK',
                }),
        });
    }

    return (
        <DashboardLayout title="Register schools">
            <div className="mx-auto max-w-4xl">
                <div className="mb-4 flex items-start justify-between gap-2">
                    <div>
                        <h1 className="text-xl font-semibold">Register schools</h1>
                        <p className="text-sm text-muted-foreground">
                            {exam.name} · {exam.subject} · {exam.form} · {exam.year}
                        </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href={base}>Back</Link>
                    </Button>
                </div>

                <div className="relative mb-3">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search school or county..."
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
                    <table className="w-full table-fixed text-xs sm:text-sm">
                        <thead>
                            <tr className="border-b text-left text-muted-foreground">
                                <th className="w-9 px-2 py-2 sm:w-12 sm:px-4">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={toggleAll}
                                        disabled={schools.data.length === 0}
                                        aria-label="Select all on this page"
                                    />
                                </th>
                                <th className="px-2 py-2 font-medium sm:px-4">School</th>
                                <th className="w-20 px-2 py-2 font-medium sm:w-36 sm:px-4">County</th>
                                <th className="w-14 px-2 py-2 font-medium sm:w-24 sm:px-4">Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schools.data.map((school) => (
                                <tr
                                    key={school.id}
                                    className={`border-b last:border-0 ${selected.includes(school.id) ? 'bg-accent' : ''}`}
                                >
                                    <td className="px-2 py-2 sm:px-4">
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(school.id)}
                                            onChange={() => toggle(school.id)}
                                            aria-label={`Select ${school.name}`}
                                        />
                                    </td>
                                    <td className="px-2 py-2 sm:px-4">{school.name}</td>
                                    <td className="truncate px-2 py-2 sm:px-4">{school.county?.name}</td>
                                    <td className="px-2 py-2 capitalize sm:px-4">{school.type}</td>
                                </tr>
                            ))}
                            {schools.data.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-4 py-8 text-center text-muted-foreground">
                                        {search ? 'No school found.' : 'All schools are already registered for this exam.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Register button: always in reach on mobile */}
                    <div className="sticky bottom-0 flex items-center justify-between gap-2 rounded-b-lg border-t bg-card px-3 py-3 sm:px-4">
                        <span className="text-sm text-muted-foreground">{selected.length} selected</span>
                        <Button onClick={register} disabled={selected.length === 0 || busy}>
                            {busy ? 'Registering...' : 'Register schools'}
                        </Button>
                    </div>
                </div>

                {schools.last_page > 1 && (
                    <div className="mt-4 flex flex-wrap gap-1">
                        {schools.links.map((link, i) =>
                            link.url ? (
                                <Link
                                    key={i}
                                    href={link.url}
                                    preserveState
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
            </div>
        </DashboardLayout>
    );
}