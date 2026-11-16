import { useEffect, useRef, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { ArrowLeft, Eye, EyeOff, FileCheck, FilePen, Lock, Pencil, Plus, Search, X } from 'lucide-react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';

export default function Show({ exam, schools, registeredCount, filters, canManage }) {
    const base = `/exams/${exam.id}/${exam.slug}`;

    const [search, setSearch] = useState(filters.search ?? '');
    const first = useRef(true);

    // Live search: runs 300ms after the user stops typing
    useEffect(() => {
        if (first.current) {
            first.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(base, { search: search || undefined }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    async function change(field, value, title, text, success) {
        const result = await Swal.fire({
            icon: 'question',
            title,
            text,
            showCancelButton: true,
            confirmButtonText: 'Yes, continue',
            confirmButtonColor: '#2563eb',
        });
        if (!result.isConfirmed) return;

        router.patch(`${base}/settings`, { [field]: value }, {
            preserveScroll: true,
            onSuccess: () => Swal.fire({ icon: 'success', title: success, timer: 1500, showConfirmButton: false }),
        });
    }

    async function unregister(school) {
        const result = await Swal.fire({
            icon: 'question',
            title: `Unregister ${school.name}?`,
            text: 'The school will be removed from this exam.',
            showCancelButton: true,
            confirmButtonText: 'Yes, unregister',
            confirmButtonColor: '#2563eb',
        });
        if (!result.isConfirmed) return;

        router.delete(`${base}/schools/${school.id}`, {
            preserveScroll: true,
            onSuccess: () =>
                Swal.fire({ icon: 'success', title: 'School unregistered', timer: 1500, showConfirmButton: false }),
        });
    }

    const published = exam.status === 'published';
    const isPublic = exam.results_visibility === 'public';
    const teachersEnter = exam.mark_submission_mode === 'teachers';

    const badge = (on) =>
        `shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
            on
                ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
        }`;

    return (
        <DashboardLayout title={exam.name}>
            <div className="mx-auto max-w-4xl">
                <div className="mb-4 flex items-start justify-between gap-2">
                    <div>
                        <h1 className="text-xl font-semibold">{exam.name}</h1>
                        <p className="text-sm text-muted-foreground">
                            {exam.subject} · {exam.form} · {exam.year}
                        </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/exams">
                            <ArrowLeft className="size-4" /> Back
                        </Link>
                    </Button>
                </div>

                {/* Settings */}
                <div className="mb-6 divide-y rounded-lg border bg-card text-sm">
                    {/* Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-4">
                        <div className="flex items-center gap-2">
                            <span className={badge(published)}>{published ? 'Published' : 'Draft'}</span>
                            <span>{published ? 'This exam is published.' : 'This exam is still a draft.'}</span>
                        </div>
                        {canManage && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    published
                                        ? change('status', 'draft', 'Change to draft?', 'The exam will be marked as a draft.', 'Exam is now a draft')
                                        : change('status', 'published', 'Publish this exam?', 'The exam will be marked as published.', 'Exam published')
                                }
                            >
                                {published ? <FilePen className="size-4" /> : <FileCheck className="size-4" />}
                                {published ? 'Change to draft' : 'Publish exam'}
                            </Button>
                        )}
                    </div>

                    {/* Results visibility */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-4">
                        <span>
                            Exam results are currently visible to{' '}
                            <b>{isPublic ? 'all participating schools and teachers' : 'admins only'}</b>.
                        </span>
                        {canManage && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    isPublic
                                        ? change('results_visibility', 'admins_only', 'Hide results?', 'Only admins will see the results.', 'Results are now visible to admins only')
                                        : change('results_visibility', 'public', 'Show results to everyone?', 'All participating schools and teachers will see the results.', 'Results are now visible to all participating schools')
                                }
                            >
                                {isPublic ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                {isPublic ? 'Make visible to admins only' : 'Make visible to all schools'}
                            </Button>
                        )}
                    </div>

                    {/* Mark submission mode */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-4">
                        <span>
                            {teachersEnter
                                ? 'Teachers and exam admins can enter marks.'
                                : 'Only exam admins can enter marks.'}
                        </span>
                        {canManage && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    teachersEnter
                                        ? change('mark_submission_mode', 'admins_only', 'Restrict mark entry?', 'Only exam admins will be able to enter marks.', 'Only exam admins can enter marks')
                                        : change('mark_submission_mode', 'teachers', 'Allow teachers to enter marks?', 'Teachers of participating schools will be able to enter marks.', 'Teachers can now enter marks')
                                }
                            >
                                {teachersEnter ? <Lock className="size-4" /> : <Pencil className="size-4" />}
                                {teachersEnter ? 'Allow exam admins only' : 'Allow teachers to enter marks'}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Participating schools */}
                <div className="rounded-lg border bg-card">
                    <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
                        <h2 className="font-semibold">Participating schools ({registeredCount})</h2>
                        {canManage && registeredCount > 0 && (
                            <Button asChild size="sm" variant="outline">
                                <Link href={`${base}/schools`}>
                                    <Plus className="size-4" /> Register schools
                                </Link>
                            </Button>
                        )}
                    </div>

                    {registeredCount === 0 ? (
                        <div className="flex flex-col items-start gap-3 px-4 py-6 text-sm text-muted-foreground">
                            <p>No school has been registered for this exam yet.</p>
                            {canManage && (
                                <Button asChild size="sm">
                                    <Link href={`${base}/schools`}>
                                        <Plus className="size-4" /> Add a school
                                    </Link>
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Live search */}
                            <div className="border-b p-3">
                                <div className="relative">
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
                            </div>

                            <table className="w-full table-fixed text-xs sm:text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="w-8 px-2 py-2 font-medium sm:w-12 sm:px-4">#</th>
                                        <th className="px-2 py-2 font-medium sm:px-4">School</th>
                                        <th className="w-20 px-2 py-2 font-medium sm:w-36 sm:px-4">County</th>
                                        <th className="w-14 px-2 py-2 font-medium sm:w-24 sm:px-4">Type</th>
                                        {canManage && <th className="w-20 px-2 py-2 sm:w-28 sm:px-4" />}
                                    </tr>
                                </thead>
                                <tbody>
                                    {schools.data.map((school, index) => (
                                        <tr key={school.id} className="border-b last:border-0">
                                            <td className="px-2 py-2 sm:px-4">{schools.from + index}</td>
                                            <td className="px-2 py-2 sm:px-4">{school.name}</td>
                                            <td className="truncate px-2 py-2 sm:px-4">{school.county}</td>
                                            <td className="px-2 py-2 capitalize sm:px-4">{school.type}</td>
                                            {canManage && (
                                                <td className="px-2 py-2 text-right sm:px-4">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 px-2 text-xs"
                                                        onClick={() => unregister(school)}
                                                    >
                                                        Unregister
                                                    </Button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {schools.data.length === 0 && (
                                        <tr>
                                            <td colSpan={canManage ? 5 : 4} className="px-4 py-8 text-center text-muted-foreground">
                                                No school found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>

                {/* Pagination */}
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