import { Link } from '@inertiajs/react';
import { Eye, PencilLine } from 'lucide-react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import MarksHeader from '@/Components/MarksHeader';
import { Button } from '@/Components/ui/button';

export default function Schools({ exam, schools }) {
    return (
        <DashboardLayout title="Submit Marks">
            <div className="mx-auto max-w-5xl space-y-6">
                <MarksHeader exam={exam} title="Participating Schools" back="/" />

                <div className="rounded-lg border bg-card text-card-foreground">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="w-12 px-4 py-2.5 font-medium">#</th>
                                    <th className="px-4 py-2.5 font-medium">School</th>
                                    <th className="px-4 py-2.5 font-medium">County</th>
                                    <th className="px-4 py-2.5 font-medium">Type</th>
                                    <th className="px-4 py-2.5 font-medium">Students</th>
                                    <th className="px-4 py-2.5 text-right font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schools.map((school, index) => {
                                    const href = `/exams/${exam.id}/${exam.slug}/marks/schools/${school.id}/${school.slug}`;
                                    return (
                                        <tr key={school.id} className="border-b last:border-0 hover:bg-muted/30">
                                            <td className="px-4 py-2.5">{index + 1}</td>
                                            <td className="whitespace-nowrap px-4 py-2.5 font-medium">
                                                <Link href={href} className="text-primary hover:underline">
                                                    {school.name}
                                                </Link>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">
                                                {school.county || '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-2.5 capitalize text-muted-foreground">
                                                {school.type}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-2.5">{school.students_count}</td>
                                            <td className="whitespace-nowrap px-4 py-2.5 text-right">
                                                <Button
                                                    asChild
                                                    variant={school.has_submitted ? 'outline' : 'default'}
                                                    className="h-auto px-4 py-2 whitespace-nowrap shrink-0"
                                                >
                                                    <Link href={href}>
                                                        {school.has_submitted ? (
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
                                {schools.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-8 text-center text-muted-foreground">
                                            No school has been registered for this exam yet.
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
