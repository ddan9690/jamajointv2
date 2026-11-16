import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { Plus, Trash2 } from 'lucide-react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import StudentModal from '@/Components/StudentModal';
import { Button } from '@/Components/ui/button';

export default function Show({ school, stream, students, counts }) {
    const schoolUrl = `/schools/${school.id}/${school.slug}`;
    const streamUrl = `${schoolUrl}/streams/${stream.id}/${stream.slug}`;

    const [selected, setSelected] = useState([]);
    const [adding, setAdding] = useState(false);

    const allSelected = students.length > 0 && selected.length === students.length;

    const toggle = (id) =>
        setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    const toggleAll = () => setSelected(allSelected ? [] : students.map((s) => s.id));

    async function removeSelected() {
        const count = selected.length;

        const result = await Swal.fire({
            icon: 'warning',
            title: `Delete ${count} student${count > 1 ? 's' : ''}?`,
            text: 'Their marks will be deleted too.',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete',
            confirmButtonColor: '#dc2626',
        });
        if (!result.isConfirmed) return;

        router.delete(`${streamUrl}/students`, {
            data: { ids: selected },
            preserveScroll: true,
            onSuccess: () => {
                setSelected([]);
                Swal.fire({
                    icon: 'success',
                    title: `${count} student${count > 1 ? 's' : ''} deleted`,
                    timer: 1500,
                    showConfirmButton: false,
                });
            },
        });
    }

    return (
        <DashboardLayout title={`${stream.form} ${stream.name}`}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h1 className="text-xl font-semibold">
                        {stream.form} {stream.name} students
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {school.name} · Total {counts.total} · M {counts.male} · F {counts.female}
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href={schoolUrl}>Back</Link>
                </Button>
            </div>

            <div className="rounded-lg border bg-card">
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <h2 className="font-semibold">Students</h2>
                    <Button size="sm" onClick={() => setAdding(true)}>
                        <Plus className="size-4" /> Add student
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-muted-foreground">
                                <th className="w-10 px-4 py-2">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={toggleAll}
                                        aria-label="Select all"
                                    />
                                </th>
                                <th className="w-12 px-4 py-2 font-medium">#</th>
                                <th className="px-4 py-2 font-medium">Admission number</th>
                                <th className="px-4 py-2 font-medium">Name</th>
                                <th className="px-4 py-2 font-medium">Gender</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, index) => (
                                <tr
                                    key={student.id}
                                    className={`border-b last:border-0 ${selected.includes(student.id) ? 'bg-accent' : ''}`}
                                >
                                    <td className="px-4 py-2">
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(student.id)}
                                            onChange={() => toggle(student.id)}
                                            aria-label={`Select ${student.name}`}
                                        />
                                    </td>
                                    <td className="px-4 py-2">{index + 1}</td>
                                    <td className="whitespace-nowrap px-4 py-2">{student.admission_number}</td>
                                    <td className="whitespace-nowrap px-4 py-2">{student.name}</td>
                                    <td className="px-4 py-2">{student.gender}</td>
                                </tr>
                            ))}
                            {students.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-muted-foreground">
                                        No students in this stream.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {selected.length > 0 && (
                    <div className="flex items-center justify-between border-t px-4 py-3">
                        <span className="text-sm text-muted-foreground">{selected.length} selected</span>
                        <Button size="sm" variant="destructive" onClick={removeSelected}>
                            <Trash2 className="size-4" /> Delete selected
                        </Button>
                    </div>
                )}
            </div>

            {adding && (
                <StudentModal
                    open
                    onClose={() => setAdding(false)}
                    school={school}
                    stream={stream}
                    url={`${streamUrl}/students`}
                />
            )}
        </DashboardLayout>
    );
}