import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { CircleAlert, CircleCheck } from 'lucide-react';

export default function FlashMessage() {
    const { flash } = usePage().props;
    const success = flash?.success;
    const error = flash?.error;

    const [visible, setVisible] = useState(true);

    useEffect(() => {
        setVisible(true);
        const timer = setTimeout(() => setVisible(false), 6000);
        return () => clearTimeout(timer);
    }, [success, error]);

    const message = error ?? success;
    if (!message || !visible) return null;

    return (
        <div
            role="alert"
            className={`flex gap-2 rounded-lg border p-3 text-sm ${
                error ? 'border-destructive/50 text-destructive' : 'border-green-600/40 text-green-700 dark:text-green-400'
            }`}
        >
            {error ? <CircleAlert className="mt-0.5 size-4 shrink-0" /> : <CircleCheck className="mt-0.5 size-4 shrink-0" />}
            <span>{message}</span>
        </div>
    );
}