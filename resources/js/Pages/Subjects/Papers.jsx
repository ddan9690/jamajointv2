import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { ArrowLeft, Plus } from 'lucide-react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import SubjectPaperModal from '@/Components/SubjectPaperModal';
import { Button } from '@/Components/ui/button';

export default function Papers({ subject, papers, max }) {
    const base = `/subjects/${subject.id}/${subject.slug}/papers`;

    // modal = { paper } while open (paper is null when adding), otherwise null
    const [modal, setModal] = useState(null);

    const full = papers.length >= max;

    async function remove(paper) {
        const result = await Swal.fire({
            icon: 'warning',
            title: `Delete ${paper.name}?`,
            showCancelButton: true,
            confirmButtonText: 'Yes, delete',
            confirmButtonColor: '#dc2626',
        });
        if (!result.isConfirmed) return;

        router.delete(`${base}/${paper.id}`, {
            preserveScroll: true,
            onSuccess: () =>
                Swal.fire({ icon: 'success', title: 'Paper deleted', timer: 1500, showConfirmButton: false }),
            onError: (errors) =>
                Swal.fire({ icon: 'error', title: 'Could not delete', text: errors.delete }),
        });
    }

    return (
        <DashboardLayout title={`${subject.name} papers`}>
            <div className="mb-6 flex items-start justify-between gap-2">
                <div>
                    <h1 className="text-xl font-semibold">{subject.name} papers</h1>
                    <p className="text-sm text-muted-foreground">
                        Code {subject.code} · {papers.length} of {max} papers
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/subjects">
                            <ArrowLeft className="size-4" /> Back
                        </Link>
                    </Button>
                    <Button size="sm" disabled={full} onClick={() => setModal({ paper: null })}>
                        <Plus className="size-4" /> Add paper
                    </Button>
                </div>
            </div>

            {full && (
                <p className="mb-4 text-sm text-muted-foreground">
                    The maximum of {max} papers has been reached.
                </p>
            )}

            <div className="rounded-lg border bg-card">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-muted-foreground">
                                <th className="w-12 px-4 py-2 font-medium">#</th>
                                <th className="px-4 py-2 font-medium">Paper</th>
                                <th className="px-4 py-2 font-medium">Code</th>
                                <th className="px-4 py-2 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {papers.map((paper, index) => (
                                <tr key={paper.id} className="border-b last:border-0">
                                    <td className="px-4 py-2">{index + 1}</td>
                                    <td className="whitespace-nowrap px-4 py-2">{paper.name}</td>
                                    <td className="whitespace-nowrap px-4 py-2">{paper.code}</td>
                                    <td className="whitespace-nowrap px-4 py-2 text-right">
                                        <button
                                            onClick={() => setModal({ paper })}
                                            className="text-primary hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => remove(paper)}
                                            className="ml-3 text-destructive hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {papers.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-4 py-8 text-center text-muted-foreground">
                                        No papers yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal && (
                <SubjectPaperModal open onClose={() => setModal(null)} subject={subject} paper={modal.paper} />
            )}
        </DashboardLayout>
    );
}