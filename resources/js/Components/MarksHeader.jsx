import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/Components/ui/button';

export default function MarksHeader({ exam, title, back }) {
    return (
        <div className="mb-4 flex items-start justify-between gap-2">
            <div>
                <h1 className="text-xl font-semibold">{exam.name}</h1>
                <p className="text-sm text-muted-foreground">
                    {exam.subject} · {exam.form} · {exam.year}
                </p>
                {title && <h2 className="mt-2 font-medium">{title}</h2>}
            </div>
            {back && (
                <Button asChild variant="outline" size="sm">
                    <Link href={back}>
                        <ArrowLeft className="size-4" /> Back
                    </Link>
                </Button>
            )}
        </div>
    );
}