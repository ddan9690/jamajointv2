import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { ShieldAlert, FileQuestion, ServerCrash, Home } from 'lucide-react';

export default function ErrorPage({ status }) {
    const title = {
        500: 'Server Error',
        503: 'Service Unavailable',
        404: 'Page Not Found',
        403: 'Forbidden / Unauthorized',
    }[status] || 'An Error Occurred';

    const description = {
        500: 'Whoops, something went wrong on our servers.',
        503: 'Sorry, we are doing some maintenance. Please check back soon.',
        404: 'Sorry, the page you are looking for could not be found.',
        403: 'Sorry, you are unauthorized to access this page or action.',
    }[status] || 'An unexpected error occurred.';

    const Icon = {
        500: ServerCrash,
        503: ServerCrash,
        404: FileQuestion,
        403: ShieldAlert,
    }[status] || ServerCrash;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
            <Head title={title} />
            
            <div className="mb-4 rounded-full bg-muted p-4 text-primary">
                <Icon className="size-10" />
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground">{status}</h1>
            <h2 className="mt-2 text-xl font-semibold text-foreground">{title}</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>

            <div className="mt-6">
                <Button asChild>
                    <Link href="/" className="inline-flex items-center gap-2">
                        <Home className="size-4" /> Back to Dashboard
                    </Link>
                </Button>
            </div>
        </div>
    );
}