import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { ArrowLeft, Mail, Phone, School, UserPlus } from 'lucide-react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import ExamAdminModal from '@/Components/ExamAdminModal';
import FlashMessage from '@/Components/FlashMessage';
import { Button } from '@/Components/ui/button';

export default function Admins({ exam, admins }) {
    const base = `/exams/${exam.id}/${exam.slug}`;
    const [adding, setAdding] = useState(false);

    async function remove(admin) {
        const result = await Swal.fire({
            icon: 'question',
            title: `Remove ${admin.name} as admin?`,
            text: 'They will no longer manage this exam.',
            showCancelButton: true,
            confirmButtonText: 'Yes, remove',
            confirmButtonColor: '#2563eb',
        });
        if (!result.isConfirmed) return;

        router.delete(`${base}/admins/${admin.id}`, {
            preserveScroll: true,
            onSuccess: () =>
                Swal.fire({ icon: 'success', title: 'Admin removed', timer: 1500, showConfirmButton: false }),
        });
    }

    return (
        <DashboardLayout title="Manage exam admins">
            <div className="mx-auto max-w-4xl">
                <div className="mb-4 flex items-start justify-between gap-2">
                    <div>
                        <h1 className="text-xl font-semibold">{exam.name}</h1>
                        <p className="text-sm text-muted-foreground">
                            {exam.subject} · {exam.form} · {exam.year}
                        </p>
                        <h2 className="mt-2 font-medium">Manage exam admins</h2>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href={base}>
                                <ArrowLeft className="size-4" /> Back
                            </Link>
                        </Button>
                        <Button size="sm" onClick={() => setAdding(true)}>
                            <UserPlus className="size-4" /> Add admin
                        </Button>
                    </div>
                </div>

                {!adding && (
                    <div className="mb-4 empty:hidden">
                        <FlashMessage />
                    </div>
                )}

                {admins.length === 0 ? (
                    <div className="flex flex-col items-start gap-3 rounded-lg border bg-card p-6 text-sm text-muted-foreground">
                        <p>This exam has no admins yet.</p>
                        <Button size="sm" onClick={() => setAdding(true)}>
                            <UserPlus className="size-4" /> Add admin
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                        {admins.map((admin) => (
                            <div
                                key={admin.id}
                                className="flex flex-col justify-between gap-3 rounded-lg border bg-card p-4 text-sm"
                            >
                                <div className="space-y-1.5">
                                    <p className="font-semibold">{admin.name}</p>
                                    <p className="flex items-center gap-2 text-muted-foreground">
                                        <School className="size-4 shrink-0" /> {admin.school ?? '-'}
                                    </p>
                                    <p className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="size-4 shrink-0" /> {admin.phone}
                                    </p>
                                    <p className="flex items-center gap-2 break-all text-muted-foreground">
                                        <Mail className="size-4 shrink-0" /> {admin.email}
                                    </p>
                                </div>
                                <div>
                                    <Button size="sm" variant="outline" onClick={() => remove(admin)}>
                                        Remove as admin
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {adding && <ExamAdminModal open onClose={() => setAdding(false)} exam={exam} />}
        </DashboardLayout>
    );
}