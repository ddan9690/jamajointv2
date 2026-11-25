import { Link } from '@inertiajs/react';
import { ArrowLeft, Eye, PencilLine } from 'lucide-react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/Components/ui/button';

export default function School({ exam, school, streams, backUrl }) {
    const base = `/exams/${exam.id}/${exam.slug}/marks/schools/${school.id}/${school.slug}`;

    return (
        <DashboardLayout title={`${school.name} · Submit Marks`}>
            <div className="mx-auto max-w-5xl space-y-6">
                {/* School details */}
                <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border bg-card p-4 text-card-foreground">
                    <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">School</p>
                        <h1 className="text-xl font-semibold">{school.name}</h1>
                        <p className="text-sm text-muted-foreground">
                            {school.county || '-'} · <span className="capitalize">{school.type}</span>
                        </p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="h-auto px-4 py-2 whitespace-nowrap shrink-0">
                        <Link href={backUrl || '/'}>
                            <ArrowLeft className="size-4" /> Back
                        </Link>
                    </Button>
                </div>

                {/* Exam details */}
                <div className="rounded-lg border bg-card p-4 text-card-foreground">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Exam</p>
                    <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h2 className="font-semibold">{exam.name}</h2>
                            <p className="text-sm text-muted-foreground">
                                {exam.subject} · {exam.form} · {exam.year}
                                {exam.grading_system ? ` · ${exam.grading_system}` : ''}
                            </p>
                        </div>
                        <span
                            className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
                                exam.status === 'published'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                        >
                            {exam.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                    </div>
                </div>

                {/* Submit Marks streams table */}
                <div className="space-y-3">
                    <h3 className="text-base font-semibold">Submit Marks</h3>

                    <div className="rounded-lg border bg-card text-card-foreground">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="w-12 px-4 py-2.5 font-medium">#</th>
                                        <th className="px-4 py-2.5 font-medium">Stream</th>
                                        <th className="px-4 py-2.5 font-medium">Students</th>
                                        <th className="px-4 py-2.5 text-right font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {streams.map((stream, index) => {
                                        const href = `${base}/streams/${stream.id}/${stream.slug}`;
                                        return (
                                            <tr key={stream.id} className="border-b last:border-0 hover:bg-muted/30">
                                                <td className="px-4 py-2.5">{index + 1}</td>
                                                <td className="whitespace-nowrap px-4 py-2.5 font-medium">
                                                    {exam.form} {stream.name}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-2.5">{stream.students_count}</td>
                                                <td className="whitespace-nowrap px-4 py-2.5 text-right">
                                                    <Button
                                                        asChild
                                                        variant={stream.has_submitted ? 'outline' : 'default'}
                                                        className="h-auto px-4 py-2 whitespace-nowrap shrink-0"
                                                    >
                                                        <Link href={href}>
                                                            {stream.has_submitted ? (
                                                                <>
                                                                    <Eye className="size-4" /> View Submitted Marks
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <PencilLine className="size-4" /> Submit Marks
                                                                </>
                                                            )}
                                                        </Link>
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {streams.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-4 py-8 text-center text-muted-foreground">
                                                No streams found for {exam.form} in this school.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
