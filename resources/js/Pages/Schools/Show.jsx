import { useState } from "react";
import { Link, router } from "@inertiajs/react";
import Swal from "sweetalert2";
import { Pencil, Plus, Upload } from "lucide-react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import StreamModal from "@/Components/StreamModal";
import { Button } from "@/Components/ui/button";

export default function Show({ school, forms, canEditSchool }) {
    const base = `/schools/${school.id}/${school.slug}`;

    // modal = { form, stream } while open, otherwise null
    const [modal, setModal] = useState(null);

    async function removeStream(stream) {
        const result = await Swal.fire({
            icon: "warning",
            title: `Delete stream ${stream.name}?`,
            text: `${stream.students_count} student(s) and their marks will be deleted too.`,
            showCancelButton: true,
            confirmButtonText: "Yes, delete",
            confirmButtonColor: "#dc2626",
        });
        if (!result.isConfirmed) return;

        router.delete(`${base}/streams/${stream.id}`, {
            preserveScroll: true,
            onSuccess: () =>
                Swal.fire({
                    icon: "success",
                    title: "Stream deleted",
                    timer: 1500,
                    showConfirmButton: false,
                }),
        });
    }

    return (
        <DashboardLayout title={school.name}>
            <div className="mb-6 flex items-center justify-between gap-2">
                <div>
                    <h1 className="text-xl font-semibold">{school.name}</h1>
                    <p className="text-sm text-muted-foreground">
                        {school.county} ·{" "}
                        <span className="capitalize">{school.type}</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="outline">
                        <Link href="/schools">Back</Link>
                    </Button>
                    {canEditSchool && (
                        <Button asChild>
                            <Link href={`${base}/edit`}>
                                <Pencil className="size-4" /> Edit school
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {forms.map((form) => (
                    <div key={form.id} className="rounded-lg border bg-card">
                        <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
                            <h2 className="font-semibold">{form.name}</h2>

                            <div className="flex gap-2">
                                <Button asChild size="sm" variant="outline">
                                    <Link href={`${base}/forms/${form.id}/import`}>
                                        <Upload className="size-4" /> Import
                                    </Link>
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setModal({ form, stream: null })}
                                >
                                    <Plus className="size-4" /> Add stream
                                </Button>
                            </div>
                        </div>

                        {form.streams.length === 0 ? (
                            <p className="px-4 py-4 text-sm text-muted-foreground">
                                No streams yet.
                            </p>
                        ) : (
                            <ul className="divide-y">
                                {form.streams.map((stream) => (
                                    <li
                                        key={stream.id}
                                        className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                                    >
                                        <div className="flex-1">
                                            <span className="font-medium">
                                                {stream.name}
                                            </span>
                                            <span className="ml-2 text-muted-foreground">
                                                {stream.students_count} students
                                            </span>
                                        </div>
                                        <Link
                                            href={`${base}/streams/${stream.id}/${stream.slug}`}
                                            className="text-primary hover:underline"
                                        >
                                            View students
                                        </Link>
                                        <button
                                            onClick={() => setModal({ form, stream })}
                                            className="text-primary hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => removeStream(stream)}
                                            className="text-destructive hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}

                {forms.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        No forms have been set up yet.
                    </p>
                )}
            </div>

            {modal && (
                <StreamModal
                    open
                    onClose={() => setModal(null)}
                    school={school}
                    form={modal.form}
                    stream={modal.stream}
                />
            )}
        </DashboardLayout>
    );
}