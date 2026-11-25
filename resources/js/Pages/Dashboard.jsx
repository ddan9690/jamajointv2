import { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { BarChart3, ClipboardList, PencilLine } from 'lucide-react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/Components/ui/button';

function ExamCard({ exam }) {
    const base = `/exams/${exam.id}/${exam.slug}`;
    const published = exam.status === 'published';

    return (
        <div className="flex flex-col justify-between gap-4 rounded-lg border bg-card p-4 text-sm text-card-foreground">
            <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold">{exam.name}</h2>
                    <span
                        className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
                            published
                                ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                    >
                        {published ? 'Published' : 'Draft'}
                    </span>
                </div>
                <p className="text-muted-foreground">{exam.subject}</p>
                <p className="text-muted-foreground">
                    {exam.form} · {exam.year}
                </p>
                {exam.grading_system && (
                    <p className="text-xs text-muted-foreground">
                        Grading: <span className="font-medium text-foreground">{exam.grading_system}</span>
                    </p>
                )}
            </div>

            <div>
                {published ? (
                    <Button
                        asChild
                        className="h-auto bg-green-600 px-4 py-2 text-white whitespace-nowrap shrink-0 hover:bg-green-700 dark:bg-green-600 dark:text-white dark:hover:bg-green-500"
                    >
                        <Link href={`${base}/results`}>
                            <BarChart3 className="size-4" /> View Results
                        </Link>
                    </Button>
                ) : (
                    <Button asChild className="h-auto px-4 py-2 whitespace-nowrap shrink-0">
                        <Link href={`${base}/marks`}>
                            <PencilLine className="size-4" /> Submit Marks
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}

export default function Dashboard({ stats = [], exams = [], isSuperAdmin = false }) {
    const { auth } = usePage().props;
    const firstName = auth?.user?.name ? auth.user.name.split(' ')[0] : 'User';

    const [showWelcome, setShowWelcome] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowWelcome(false), 10000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <DashboardLayout title="Dashboard">
            <div className="flex items-center justify-between gap-2">
                <h1 className="text-xl font-semibold">Dashboard</h1>
                {isSuperAdmin && (
                    <Link href="/exams" className="text-sm text-primary whitespace-nowrap shrink-0 hover:underline">
                        View all exams
                    </Link>
                )}
            </div>

            {showWelcome && (
                <div className="mb-6 mt-2 rounded-md bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
                    Welcome back, {firstName}!
                </div>
            )}

            {stats.length > 0 && (
                <div
                    className={`mb-6 mt-4 grid gap-4 ${
                        stats.length === 1 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-4'
                    }`}
                >
                    {stats.map((s) => (
                        <div key={s.label} className="rounded-lg border bg-card p-4 text-card-foreground">
                            <div className="text-sm text-muted-foreground">{s.label}</div>
                            <div className="mt-1 text-2xl font-semibold">{s.value}</div>
                        </div>
                    ))}
                </div>
            )}

            {exams.length === 0 ? (
                <div className="mt-4 flex flex-col items-center gap-2 rounded-lg border bg-card p-10 text-center text-card-foreground">
                    <ClipboardList className="size-8 text-muted-foreground" />
                    <p className="font-medium">No exams found to show.</p>
                    {!isSuperAdmin && (
                        <p className="text-sm text-muted-foreground">
                            Your school has not been registered for any exams yet. Once registered, they will appear here.
                        </p>
                    )}
                </div>
            ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {exams.map((exam) => (
                        <ExamCard key={exam.id} exam={exam} />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}