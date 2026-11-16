import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';

const stats = [
    { label: 'Exams', value: '12' },
    { label: 'Schools', value: '20' },
    { label: 'Students', value: '1,240' },
    { label: 'Marks submitted', value: '86%' },
];

const exams = [
    { name: 'Joint English Mock', subject: 'English', form: 'Form 4', status: 'Published' },
    { name: 'Joint Mathematics Mock', subject: 'Mathematics', form: 'Form 4', status: 'Draft' },
    { name: 'Joint History Mock', subject: 'History', form: 'Form 3', status: 'Published' },
    { name: 'Joint Chemistry Mock', subject: 'Chemistry', form: 'Form 4', status: 'Draft' },
];

export default function Dashboard() {
    const { auth } = usePage().props;
    const firstName = auth?.user?.name ? auth.user.name.split(' ')[0] : 'User';

    const [showWelcome, setShowWelcome] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowWelcome(false);
        }, 15000); // Disappears after 15 seconds

        return () => clearTimeout(timer);
    }, []);

    return (
        <DashboardLayout title="Dashboard">
            <h1 className="text-xl font-semibold">Dashboard</h1>
            
            {showWelcome && (
                <p className="mb-6 text-sm text-muted-foreground transition-opacity duration-700 ease-in-out">
                    Welcome back, {firstName}.
                </p>
            )}

            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {stats.map((s) => (
                    <div key={s.label} className="rounded-lg border bg-card p-4">
                        <div className="text-sm text-muted-foreground">{s.label}</div>
                        <div className="mt-1 text-2xl font-semibold">{s.value}</div>
                    </div>
                ))}
            </div>

            <div className="rounded-lg border bg-card">
                <div className="border-b px-4 py-3 font-semibold">Recent exams</div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-muted-foreground">
                                <th className="px-4 py-2 font-medium">Exam</th>
                                <th className="px-4 py-2 font-medium">Subject</th>
                                <th className="px-4 py-2 font-medium">Form</th>
                                <th className="px-4 py-2 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exams.map((e) => (
                                <tr key={e.name} className="border-b last:border-0">
                                    <td className="whitespace-nowrap px-4 py-2">{e.name}</td>
                                    <td className="whitespace-nowrap px-4 py-2">{e.subject}</td>
                                    <td className="whitespace-nowrap px-4 py-2">{e.form}</td>
                                    <td className="whitespace-nowrap px-4 py-2 text-primary">{e.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}