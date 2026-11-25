import { useRef, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ArrowLeft, Check } from 'lucide-react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';

function validateScore(value) {
    if (value === '' || value === null || value === undefined) {
        return null;
    }

    const str = String(value);
    if (!/^\d+$/.test(str)) {
        return 'Enter digits only (0 to 100).';
    }

    const num = Number(str);
    if (num < 0 || num > 100) {
        return 'Marks must be between 0 and 100.';
    }

    return null;
}

export default function Entry({ exam, school, stream, paper, students }) {
    const schoolUrl = `/exams/${exam.id}/${exam.slug}/marks/schools/${school.id}/${school.slug}`;
    const streamUrl = `${schoolUrl}/streams/${stream.id}/${stream.slug}`;
    const submitUrl = `${streamUrl}/papers/${paper.id}`;

    const [scores, setScores] = useState(() =>
        Object.fromEntries(
            students.map((s) => [s.id, s.score === null || s.score === undefined ? '' : String(s.score)])
        )
    );
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const inputRefs = useRef([]);

    const hasValidationErrors = Object.values(errors).some(Boolean);

    function handleChange(studentId, value) {
        setScores((prev) => ({ ...prev, [studentId]: value }));
        const message = validateScore(value);
        setErrors((prev) => ({ ...prev, [studentId]: message }));
    }

    function handleKeyDown(e, index) {
        if (e.key === 'Enter' || e.key === 'ArrowDown') {
            e.preventDefault();
            const next = inputRefs.current[index + 1];
            if (next) {
                next.focus();
                next.select?.();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = inputRefs.current[index - 1];
            if (prev) {
                prev.focus();
                prev.select?.();
            }
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (students.length === 0 || submitting) return;

        // Re-validate all cells before confirming
        const freshErrors = {};
        let firstInvalidIndex = -1;
        students.forEach((s, index) => {
            const msg = validateScore(scores[s.id]);
            if (msg) {
                freshErrors[s.id] = msg;
                if (firstInvalidIndex === -1) firstInvalidIndex = index;
            }
        });

        setErrors(freshErrors);
        if (firstInvalidIndex !== -1) {
            inputRefs.current[firstInvalidIndex]?.focus();
            return;
        }

        const result = await Swal.fire({
            icon: 'question',
            title: 'Submit marks?',
            text: `Save ${paper.name} marks for ${stream.form} ${stream.name} (${school.name})?`,
            showCancelButton: true,
            confirmButtonText: 'Yes, submit marks',
            confirmButtonColor: '#2563eb',
        });

        if (!result.isConfirmed) return;

        setSubmitting(true);
        try {
            const payload = {
                marks: students.map((s) => ({
                    student_id: s.id,
                    score: scores[s.id] === '' ? null : Number(scores[s.id]),
                })),
            };

            await axios.post(submitUrl, payload);

            await Swal.fire({
                icon: 'success',
                title: 'Marks submitted',
                text: 'Student marks have been saved successfully.',
                timer: 1500,
                showConfirmButton: false,
            });

            router.visit(schoolUrl);
        } catch (err) {
            const serverMsg =
                err.response?.data?.message || 'Could not save marks. Please verify all entries and try again.';
            Swal.fire({
                icon: 'error',
                title: 'Submission failed',
                text: serverMsg,
            });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <DashboardLayout title={`${paper.name} · ${stream.form} ${stream.name}`}>
            <div className="mx-auto max-w-5xl space-y-6">
                {/* Context Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border bg-card p-4 text-card-foreground">
                    <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                            {school.name} · {stream.form} {stream.name}
                        </p>
                        <h1 className="text-xl font-semibold">
                            {paper.name}
                            {paper.code ? ` (${paper.code})` : ''}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {exam.name} · {exam.subject} · {exam.year}
                        </p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="h-auto px-4 py-2 whitespace-nowrap shrink-0">
                        <Link href={streamUrl}>
                            <ArrowLeft className="size-4" /> Back
                        </Link>
                    </Button>
                </div>

                {/* Marks Entry Table */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="rounded-lg border bg-card text-card-foreground">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="w-12 px-4 py-2.5 font-medium">#</th>
                                        <th className="px-4 py-2.5 font-medium">Adm</th>
                                        <th className="px-4 py-2.5 font-medium">Name</th>
                                        <th className="w-24 px-4 py-2.5 font-medium">Gender</th>
                                        <th className="w-48 px-4 py-2.5 font-medium">Marks (0–100)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student, index) => {
                                        const cellError = errors[student.id];
                                        return (
                                            <tr key={student.id} className="border-b last:border-0 hover:bg-muted/20">
                                                <td className="px-4 py-2.5">{index + 1}</td>
                                                <td className="whitespace-nowrap px-4 py-2.5 font-medium">
                                                    {student.admission_number}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-2.5">{student.name}</td>
                                                <td className="px-4 py-2.5">{student.gender || '-'}</td>
                                                <td className="px-4 py-2">
                                                    <Input
                                                        ref={(el) => {
                                                            inputRefs.current[index] = el;
                                                        }}
                                                        type="text"
                                                        inputMode="numeric"
                                                        placeholder="0–100"
                                                        value={scores[student.id] ?? ''}
                                                        aria-invalid={Boolean(cellError)}
                                                        aria-label={`Marks for ${student.name}`}
                                                        onChange={(e) => handleChange(student.id, e.target.value)}
                                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                                        disabled={submitting}
                                                        className="w-28"
                                                    />
                                                    {cellError && (
                                                        <p className="mt-1 text-xs text-destructive">{cellError}</p>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {students.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-8 text-center text-muted-foreground">
                                                No students found in this stream.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {students.length > 0 && (
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-xs text-muted-foreground">
                                Press Enter or Arrow Down to move to the next student. Allowed range: 0 to 100.
                            </p>
                            <Button
                                type="submit"
                                disabled={submitting || hasValidationErrors}
                                className="h-auto px-4 py-2 whitespace-nowrap shrink-0"
                            >
                                <Check className="size-4" />
                                {submitting ? 'Submitting...' : 'Submit Marks'}
                            </Button>
                        </div>
                    )}
                </form>
            </div>
        </DashboardLayout>
    );
}
