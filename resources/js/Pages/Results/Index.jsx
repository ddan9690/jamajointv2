import { Link } from '@inertiajs/react';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/Components/ui/button';

export default function ResultsIndex({ exam }) {
    const published = exam.status === 'published';

    return (
        <DashboardLayout title={`${exam.name} · Results`}>
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold">{exam.name}</h1>
                        <p className="text-sm text-muted-foreground">
                            {exam.subject} · {exam.form} · {exam.year}
                        </p>
                        {exam.grading_system && (
                            <p className="mt-1 text-xs text-muted-foreground">
                                Grading: <span className="font-medium text-foreground">{exam.grading_system}</span>
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <span
                            className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
                                published
                                    ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                        >
                            {published ? 'Published' : 'Draft'}
                        </span>
                        <Button asChild variant="outline" size="sm" className="h-auto px-4 py-2 whitespace-nowrap shrink-0">
                            <Link href="/">
                                <ArrowLeft className="size-4" /> Back
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-6 text-card-foreground">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="size-5 text-primary" />
                        <h2 className="font-semibold">Exam Results</h2>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Results analysis and downloads for <span className="font-medium text-foreground">{exam.name}</span>.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}
