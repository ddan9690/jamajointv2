import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/Components/ui/button';

export default function ResultsIndex({
    exam,
    summary = {},
    papers = [],
}) {
    const stats = [
        {
            label: 'Students',
            value: summary.students ?? exam.students_count ?? 0,
        },
        {
            label: 'Schools',
            value: summary.schools ?? exam.schools_count ?? 0,
        },
        {
            label: 'Mean Score',
            value:
                summary.mean_score !== undefined && summary.mean_score !== null
                    ? Number(summary.mean_score).toFixed(4)
                    : '0.0000',
        },
        {
            label: 'Mean Grade',
            value: summary.mean_grade ?? '-',
        },
    ];

    return (
        <DashboardLayout title={`${exam.name} · Results`}>
            <div className="mx-auto max-w-5xl space-y-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h1 className="text-lg font-semibold sm:text-xl">{exam.name}</h1>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                            {exam.subject} · {exam.form} · {exam.year}
                        </p>
                    </div>

                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-auto shrink-0 px-3 py-1.5 whitespace-nowrap sm:px-4 sm:py-2"
                    >
                        <Link href="/">
                            <ArrowLeft className="size-4" /> Back
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                    {stats.map((item) => (
                        <div
                            key={item.label}
                            className="rounded-lg border bg-card p-3 text-card-foreground sm:p-5"
                        >
                            <p className="text-[11px] font-medium text-muted-foreground sm:text-xs">
                                {item.label}
                            </p>
                            <p className="mt-1 text-base font-semibold tabular-nums sm:text-2xl">
                                {item.value}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="overflow-hidden rounded-lg border bg-card text-card-foreground">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs sm:text-sm">
                            <thead>
                                <tr className="border-b bg-muted/40 text-muted-foreground">
                                    <th className="px-3 py-2.5 font-medium sm:px-4">Paper</th>
                                    <th className="px-3 py-2.5 font-medium tabular-nums sm:px-4">Students</th>
                                    <th className="px-3 py-2.5 font-medium tabular-nums sm:px-4">Schools</th>
                                    <th className="px-3 py-2.5 font-medium tabular-nums sm:px-4">Mean Score</th>
                                    <th className="px-3 py-2.5 font-medium sm:px-4">Mean Grade</th>
                                    <th className="px-3 py-2.5 font-medium tabular-nums sm:px-4">% Pass</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {papers.length > 0 ? (
                                    papers.map((paper, idx) => (
                                        <tr key={paper.id ?? paper.name ?? idx} className="hover:bg-muted/20">
                                            <td className="px-3 py-2.5 font-medium sm:px-4">{paper.name}</td>
                                            <td className="px-3 py-2.5 tabular-nums sm:px-4">
                                                {paper.students ?? 0}
                                            </td>
                                            <td className="px-3 py-2.5 tabular-nums sm:px-4">
                                                {paper.schools ?? 0}
                                            </td>
                                            <td className="px-3 py-2.5 tabular-nums sm:px-4">
                                                {paper.mean_score !== undefined && paper.mean_score !== null
                                                    ? Number(paper.mean_score).toFixed(4)
                                                    : '0.0000'}
                                            </td>
                                            <td className="px-3 py-2.5 sm:px-4">
                                                {paper.mean_grade ?? '-'}
                                            </td>
                                            <td className="px-3 py-2.5 tabular-nums sm:px-4">
                                                {paper.pass_percentage !== undefined && paper.pass_percentage !== null
                                                    ? `${Number(paper.pass_percentage).toFixed(2)}%`
                                                    : '0.00%'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-6 text-center text-xs text-muted-foreground sm:text-sm"
                                        >
                                            No paper performance data available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}