import ThemeToggle from '@/Components/ThemeToggle';

export default function AuthLayout({ title, subtitle, children }) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10">
            <div className="absolute right-4 top-4">
                <ThemeToggle />
            </div>

            <div className="mb-6 text-2xl font-bold text-primary">JamaJoint</div>

            <div className="w-full max-w-md rounded-lg border bg-card p-6">
                <h1 className="text-xl font-semibold">{title}</h1>
                <p className="mb-6 mt-1 text-sm text-muted-foreground">{subtitle}</p>
                {children}
            </div>
        </div>
    );
}