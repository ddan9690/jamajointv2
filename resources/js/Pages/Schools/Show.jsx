import { useState } from "react";
import { Link, router } from "@inertiajs/react";
import axios from "axios";
import Swal from "sweetalert2";
import { Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import StreamModal from "@/Components/StreamModal";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";

export default function Show({ school, forms, teachers = [], canEditSchool }) {
    const base = `/schools/${school.id}/${school.slug}`;

    // modal = { form, stream } while open, otherwise null
    const [modal, setModal] = useState(null);

    // Student search
    const [term, setTerm] = useState("");
    const [results, setResults] = useState(null); // null = not searched yet
    const [searched, setSearched] = useState("");
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);

    async function search(e) {
        e.preventDefault();

        const q = term.trim();
        if (!q) return;

        setSearching(true);
        setSearchError(null);

        try {
            const { data } = await axios.get(`${base}/student-search`, {
                params: { q },
            });
            setResults(data);
            setSearched(q);
        } catch (err) {
            setResults(null);
            setSearchError("The search could not be completed. Please try again.");
        } finally {
            setSearching(false);
        }
    }

    function clearSearch() {
        setTerm("");
        setResults(null);
        setSearchError(null);
    }

    async function removeStudent(student) {
        const result = await Swal.fire({
            icon: "warning",
            title: "Delete student?",
            showCancelButton: true,
            confirmButtonText: "Yes, delete",
            confirmButtonColor: "#dc2626",
        });
        if (!result.isConfirmed) return;

        try {
            await axios.delete(`${base}/students/${student.id}`);
            setResults((prev) => prev.filter((s) => s.id !== student.id));
            router.reload({ only: ["forms"], preserveScroll: true });

            Swal.fire({
                icon: "success",
                title: "Student deleted",
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (err) {
            setSearchError("The student could not be deleted. Please try again.");
        }
    }

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

            {/* Student search */}
            <div className="mb-6 rounded-lg border bg-card p-4">
                <h2 className="mb-2 font-semibold">Find a student</h2>

                <form onSubmit={search} className="flex gap-2">
                    <Input
                        placeholder="Name or admission number"
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                    />
                    <Button type="submit" disabled={searching || !term.trim()}>
                        <Search className="size-4" />{" "}
                        {searching ? "Searching..." : "Search"}
                    </Button>
                </form>

                {searchError && (
                    <p className="mt-3 text-sm text-destructive">{searchError}</p>
                )}

                {results !== null && (
                    <div className="mt-4">
                        {results.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No student matching "{searched}" found.
                            </p>
                        ) : (
                            <ul className="divide-y rounded-md border">
                                {results.map((student) => (
                                    <li
                                        key={student.id}
                                        className="flex flex-wrap items-center justify-between gap-3 p-3 text-sm"
                                    >
                                        <div className="space-y-0.5">
                                            <p className="font-medium">
                                                {student.name}
                                            </p>
                                            <p className="text-muted-foreground">
                                                Admission {student.admission_number}{" "}
                                                · Gender {student.gender || "-"}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {student.form} · {student.stream}
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-destructive"
                                            onClick={() => removeStudent(student)}
                                        >
                                            <Trash2 className="size-4" /> Delete
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="mt-3 flex justify-end">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={clearSearch}
                            >
                                Clear
                            </Button>
                        </div>
                    </div>
                )}
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
                                    onClick={() =>
                                        setModal({ form, stream: null })
                                    }
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
                                            onClick={() =>
                                                setModal({ form, stream })
                                            }
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

            {/* Teachers */}
            <div className="mt-6 rounded-lg border bg-card">
                <div className="border-b px-4 py-3">
                    <h2 className="font-semibold">Teachers</h2>
                </div>

                {teachers.length === 0 ? (
                    <p className="px-4 py-4 text-sm text-muted-foreground">
                        No teachers registered for this school yet.
                    </p>
                ) : (
                    <ul className="divide-y">
                        {teachers.map((teacher) => (
                            <li key={teacher.id} className="px-4 py-3 text-sm">
                                <span className="font-medium">{teacher.name}</span>
                                {teacher.phone && (
                                    <span className="text-muted-foreground">
                                        {" "}
                                        - {teacher.phone}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
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