export default function ProgressRow({ label, submitted, total, percent, note }) {
    const missing = total - submitted;

    return (
        <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="font-medium">{label}</span>
                <span className="text-muted-foreground">{submitted} of {total} submitted</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary transition-all" style={{ width: `${percent}%` }} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{note}</span>
                <span className={missing > 0 ? 'text-amber-600' : 'text-green-600'}>
                    {missing > 0 ? `${missing} missing` : 'Complete'}
                </span>
            </div>
        </div>
    );
}