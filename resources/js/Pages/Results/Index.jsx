import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Award,
    ChevronRight,
    School,
    Trophy,
    Users,
} from 'lucide-react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/Components/ui/button';

const REPORT_LINKS = [
    {
        label: 'School Ranking',
        href: '#',
        icon: Trophy,
    },
    {
        label: 'My School Results',
        href: '#',
        icon: School,
    },
    {
        label: 'Overall Student Ranking',
        href: '#',
        icon: Users,
    },
    {
        label: 'Top Students',
        href: '#',
        icon: Award,
    },
];

export default function Index({ exam, results = {} }) {
    const {
        participating_schools_count = 0,
        total_students_count = 0,
        male_students_count = 0,
        female_students_count = 0,
        mean_score = '0.0000',
        mean_grade = '-',
        pass_percentage = '0.00',
        paper_performance = [],
    } = results;

    return (
        <DashboardLayout title={`${exam.name} · Results`}>
            <div className="mx-auto max-w-6xl space-y-4 px-3 py-3 sm:space-y-5 sm:px-5 sm:py-5">
                {/* Prominent Exam Header */}
                <div className="flex items-start justify-between gap-2 border-b pb-3 sm:pb-4">
                    <div className="min-w-0 space-y-1">
                        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                            {exam.name}
                        </h1>
                        <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                            {exam.subject} · {exam.form} · {exam.year}
                        </p>
                        <h2 className="pt-0.5 text-sm font-semibold text-foreground sm:text-base">
                            Results Analysis
                        </h2>
                    </div>

                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-auto shrink-0 px-2.5 py-1.5 text-xs whitespace-nowrap sm:px-3.5 sm:py-2 sm:text-sm"
                    >
                        <Link href="/">
                            <ArrowLeft className="size-3.5 sm:size-4" /> Back
                        </Link>
                    </Button>
                </div>

                {/* Compact Metric Cards (2 per row on mobile, auto-fit with equal space between on desktop) */}
                <div className="grid grid-cols-2 gap-2 sm:flex sm:w-full sm:flex-wrap sm:items-stretch sm:justify-between sm:gap-2.5">
                    <div className="flex flex-col justify-center rounded-lg border bg-card px-3 py-2 text-card-foreground sm:w-fit sm:min-w-28 sm:px-3.5 sm:py-2.5">
                        <p className="text-[11px] font-medium text-muted-foreground sm:text-xs">
                            Schools
                        </p>
                        <p className="mt-0.5 text-base font-bold leading-tight text-foreground sm:text-lg">
                            {participating_schools_count}
                        </p>
                    </div>

                    <div className="flex flex-col justify-center rounded-lg border bg-card px-3 py-2 text-card-foreground sm:w-fit sm:min-w-36 sm:px-3.5 sm:py-2.5">
                        <p className="text-[11px] font-medium text-muted-foreground sm:text-xs">
                            Students
                        </p>
                        <p className="mt-0.5 text-base font-bold leading-tight text-foreground sm:text-lg">
                            {total_students_count}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                            M: <span className="font-medium text-foreground">{male_students_count}</span>
                            {' · '}
                            F: <span className="font-medium text-foreground">{female_students_count}</span>
                        </p>
                    </div>

                    <div className="flex flex-col justify-center rounded-lg border bg-card px-3 py-2 text-card-foreground sm:w-fit sm:min-w-32 sm:px-3.5 sm:py-2.5">
                        <p className="text-[11px] font-medium text-muted-foreground sm:text-xs">
                            Mean Score
                        </p>
                        <p className="mt-0.5 text-base font-bold leading-tight text-foreground sm:text-lg">
                            {mean_score}
                        </p>
                    </div>

                    <div className="flex flex-col justify-center rounded-lg border bg-card px-3 py-2 text-card-foreground sm:w-fit sm:min-w-28 sm:px-3.5 sm:py-2.5">
                        <p className="text-[11px] font-medium text-muted-foreground sm:text-xs">
                            Mean Grade
                        </p>
                        <p className="mt-0.5 text-base font-bold leading-tight text-foreground sm:text-lg">
                            {mean_grade}
                        </p>
                    </div>

                    <div className="col-span-2 flex flex-col justify-center rounded-lg border bg-card px-3 py-2 text-card-foreground sm:col-span-1 sm:w-fit sm:min-w-28 sm:px-3.5 sm:py-2.5">
                        <p className="text-[11px] font-medium text-muted-foreground sm:text-xs">
                            % Pass
                        </p>
                        <p className="mt-0.5 text-base font-bold leading-tight text-foreground sm:text-lg">
                            {pass_percentage}%
                        </p>
                    </div>
                </div>

                {/* Prominent Analysis & Ranking Navigation */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                    {REPORT_LINKS.map(({ label, href, icon: Icon }) => (
                        <a
                            key={label}
                            href={href}
                            className="group flex items-center justify-between gap-2 rounded-lg border border-primary/25 bg-card px-3 py-2.5 text-left text-foreground shadow-xs transition hover:border-primary/60 hover:bg-accent sm:px-3.5 sm:py-3"
                        >
                            <span className="flex min-w-0 items-center gap-2">
                                <Icon className="size-4 shrink-0 text-primary" />
                                <span className="truncate text-xs font-semibold sm:text-sm">
                                    {label}
                                </span>
                            </span>
                            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground sm:size-4" />
                        </a>
                    ))}
                </div>

                {/* Paper Performance Table */}
                <div className="rounded-lg border bg-card text-card-foreground">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs sm:text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-3 py-2 font-medium sm:px-4">Paper</th>
                                    <th className="px-3 py-2 font-medium sm:px-4">Mean Score</th>
                                    <th className="px-3 py-2 font-medium sm:px-4">Mean Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paper_performance.length > 0 ? (
                                    paper_performance.map((paper, index) => (
                                        <tr
                                            key={paper.exam_paper_id ?? index}
                                            className="border-b last:border-0"
                                        >
                                            <td className="whitespace-nowrap px-3 py-2 font-medium text-foreground sm:px-4">
                                                {paper.paper_name ?? paper.name}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-2 text-foreground sm:px-4">
                                                {paper.mean_score}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-2 font-medium text-foreground sm:px-4">
                                                {paper.mean_grade}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="px-3 py-5 text-center text-muted-foreground sm:px-4"
                                        >
                                            No paper data available.
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