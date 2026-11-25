import { Link } from '@inertiajs/react';
import { ArrowLeft, Eye, PencilLine } from 'lucide-react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/Components/ui/button';

export default function Stream({ exam, school, stream, papers }) {
    const schoolUrl = `/exams/${exam.id}/${exam.slug}/marks/schools/${school.id}/${school.slug}`;
    const streamUrl = `${schoolUrl}/streams/${stream.id}/${stream.slug}`;

    return (
        <DashboardLayout title={`${school.name} · ${stream.form} ${stream.name}`}>
            <div className="mx-auto max-w-5xl space-y-6">
                {/* School, Exam & Stream details */}
                <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border bg-card p-4 text-card-foreground">
                    <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                            {school.name} {school.county ? `· ${school.county}` : ''}
                        </p>
                        <h1 className="text-xl font-semibold">
                            {stream.form} {stream.name}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {exam.name} · {exam.subject} · {exam.year}
                            {exam.grading_system ? ` · ${exam.grading_system}` : ''}
                        </p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="h-auto px-4 py-2 whitespace-nowrap shrink-0">
                        <Link href={schoolUrl}>
                            <ArrowLeft className="size-4" /> Back
                        </Link>
                    </Button>
                </div>

                {/* Papers table */}
                <div className="space-y-3">
                    <h2 className="text-base font-semibold">Exam Papers</h2>

                    <div className="rounded-lg border bg-card text-card-foreground">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="w-12 px-4 py-2.5 font-medium">#</th>
                                        <th className="px-4 py-2.5 font-medium">Paper</th>
                                        <th className="px-4 py-2.5 font-medium">Code</th>
                                        <th className="px-4 py-2.5 font-medium">Out Of</th>
                                        <th className="px-4 py-2.5 font-medium">Contribution</th>
                                        <th className="px-4 py-2.5 text-right font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {papers.map((paper, index) => {
                                        const href = `${streamUrl}/papers/${paper.id}`;
                                        return (
                                            <tr key={paper.id} className="border-b last:border-0 hover:bg-muted/30">
                                                <td className="px-4 py-2.5">{index + 1}</td>
                                                <td className="whitespace-nowrap px-4 py-2.5 font-medium">{paper.name}</td>
                                                <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">
                                                    {paper.code || '-'}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-2.5">{paper.out_of}</td>
                                                <td className="whitespace-nowrap px-4 py-2.5">
                                                    {paper.percentage_contribution}%
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-2.5 text-right">
                                                    <Button
                                                        asChild
                                                        variant={paper.has_submitted ? 'outline' : 'default'}
                                                        className="h-auto px-4 py-2 whitespace-nowrap shrink-0"
                                                    >
                                                        <Link href={href}>
                                                            {paper.has_submitted ? (
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
                                    {papers.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-8 text-center text-muted-foreground">
                                                No papers have been configured for this exam yet.
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
