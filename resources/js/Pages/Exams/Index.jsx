import { useEffect, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { Edit, Eye, Plus, Search, Trash2 } from 'lucide-react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import ExamModal from '@/Components/ExamModal';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';

export default function ExamsIndex({ exams, academicYears, forms, subjects, gradingSystems, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [modal, setModal] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get('/exams', { search }, { preserveState: true, replace: true });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    async function removeExam(exam) {
        const result = await Swal.fire({
            icon: 'warning',
            title: `Delete ${exam.name}?`,
            text: 'This exam and associated paper marks will be permanently removed.',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete',
            confirmButtonColor: '#dc2626',
        });
        if (!result.isConfirmed) return;

        router.delete(`/exams/${exam.id}/${exam.slug}`, {
            preserveScroll: true,
            onSuccess: () =>
                Swal.fire({
                    icon: 'success',
                    title: 'Exam deleted',
                    timer: 1500,
                    showConfirmButton: false,
                }),
        });
    }

    return (
        <DashboardLayout title="Exams">
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">Examinations</h1>
                    </div>
                    <Button onClick={() => setModal({ exam: null })}>
                        <Plus className="mr-2 size-4" /> Create exam
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search exams..."
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
                                <th className="px-4 py-3 font-semibold">Exam</th>
                                <th className="px-4 py-3 font-semibold">Subject</th>
                                <th className="px-4 py-3 font-semibold text-center">Status</th>
                                <th className="px-4 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {exams.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-4 py-8 text-center text-muted-foreground">
                                        No examinations found.
                                    </td>
                                </tr>
                            ) : (
                                exams.map((exam) => (
                                    <tr key={exam.id} className="hover:bg-muted/10">
                                        <td className="px-4 py-3 font-medium text-foreground">
                                            <div>{exam.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {exam.academic_year?.name} · {exam.form?.name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{exam.subject?.name}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                exam.status === 'published' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                                            }`}>
                                                {exam.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button asChild size="sm" variant="outline">
                                                    <Link href={`/exams/${exam.id}/${exam.slug}`}>
                                                        <Eye className="mr-1.5 size-3.5" /> View
                                                    </Link>
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="size-8"
                                                    onClick={() => setModal({ exam })}
                                                    title="Edit Exam"
                                                >
                                                    <Edit className="size-3.5" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="size-8 text-destructive hover:bg-destructive/10"
                                                    onClick={() => removeExam(exam)}
                                                    title="Delete Exam"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal && (
                <ExamModal
                    open
                    onClose={() => setModal(null)}
                    exam={modal.exam}
                    academicYears={academicYears}
                    forms={forms}
                    subjects={subjects}
                    gradingSystems={gradingSystems}
                />
            )}
        </DashboardLayout>
    );
}