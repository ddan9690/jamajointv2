import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { Plus } from 'lucide-react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import SubjectModal from '@/Components/SubjectModal';
import { Button } from '@/Components/ui/button';
import { Switch } from '@/Components/ui/switch';

export default function Index({ subjects }) {
    // modal = { subject } while open (subject is null when adding), otherwise null
    const [modal, setModal] = useState(null);

    async function toggle(subject) {
        const activating = !subject.is_active;

        const result = await Swal.fire({
            icon: 'question',
            title: activating ? `Activate ${subject.name}?` : `Deactivate ${subject.name}?`,
            text: activating ? 'The subject will be marked as active.' : 'The subject will be marked as inactive.',
            showCancelButton: true,
            confirmButtonText: 'Yes, continue',
            confirmButtonColor: '#2563eb',
        });
        if (!result.isConfirmed) return;

        router.patch(`/subjects/${subject.id}/${subject.slug}/toggle`, {}, {
            preserveScroll: true,
            onSuccess: () =>
                Swal.fire({
                    icon: 'success',
                    title: activating ? 'Subject activated' : 'Subject deactivated',
                    timer: 1500,
                    showConfirmButton: false,
                }),
        });
    }

    async function remove(subject) {
        const result = await Swal.fire({
            icon: 'warning',
            title: `Delete ${subject.name}?`,
            text: 'Its papers will be deleted too.',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete',
            confirmButtonColor: '#dc2626',
        });
        if (!result.isConfirmed) return;

        router.delete(`/subjects/${subject.id}/${subject.slug}`, {
            preserveScroll: true,
            onSuccess: () =>
                Swal.fire({ icon: 'success', title: 'Subject deleted', timer: 1500, showConfirmButton: false }),
            onError: (errors) =>
                Swal.fire({ icon: 'error', title: 'Could not delete', text: errors.delete }),
        });
    }

    return (
        <DashboardLayout title="Subjects">
            <div className="mb-6 flex items-center justify-between gap-2">
                <div>
                    <h1 className="text-xl font-semibold">Subjects</h1>
                    <p className="text-sm text-muted-foreground">Total subjects: {subjects.length}</p>
                </div>
                <Button onClick={() => setModal({ subject: null })}>
                    <Plus className="size-4" /> Add subject
                </Button>
            </div>

            <div className="rounded-lg border bg-card">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-muted-foreground">
                                <th className="w-12 px-4 py-2 font-medium">#</th>
                                <th className="px-4 py-2 font-medium">Subject</th>
                                <th className="px-4 py-2 font-medium">Code</th>
                                <th className="px-4 py-2 font-medium">Active</th>
                                <th className="px-4 py-2 font-medium">Papers</th>
                                <th className="px-4 py-2 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((subject, index) => (
                                <tr key={subject.id} className="border-b last:border-0">
                                    <td className="px-4 py-2">{index + 1}</td>
                                    <td className="whitespace-nowrap px-4 py-2">{subject.name}</td>
                                    <td className="whitespace-nowrap px-4 py-2">{subject.code}</td>
                                    <td className="px-4 py-2">
                                        <Switch
                                            checked={subject.is_active}
                                            onCheckedChange={() => toggle(subject)}
                                            aria-label={`Toggle ${subject.name}`}
                                        />
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-2">
                                        <Button asChild size="sm" variant="outline" className="h-7 px-2 text-xs">
                                            <Link href={`/subjects/${subject.id}/${subject.slug}/papers`}>
                                                Manage papers ({subject.papers_count})
                                            </Link>
                                        </Button>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-2 text-right">
                                        <button
                                            onClick={() => setModal({ subject })}
                                            className="text-primary hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => remove(subject)}
                                            className="ml-3 text-destructive hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {subjects.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-muted-foreground">
                                        No subjects yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal && <SubjectModal open onClose={() => setModal(null)} subject={modal.subject} />}
        </DashboardLayout>
    );
}