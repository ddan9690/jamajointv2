import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Search, X } from 'lucide-react';
import FlashMessage from '@/Components/FlashMessage';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/Components/ui/dialog';

export default function ExamAdminModal({ open, onClose, exam }) {
    const base = `/exams/${exam.id}/${exam.slug}/admins`;

    const [term, setTerm] = useState('');
    const [results, setResults] = useState(null); // null = nothing searched yet
    const [searching, setSearching] = useState(false);
    const [adding, setAdding] = useState(null);

    // Live search: runs 300ms after the user stops typing
    useEffect(() => {
        const q = term.trim();

        if (q.length < 2) {
            setResults(null);
            return;
        }

        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const { data } = await axios.get(`${base}/search`, { params: { q } });
                setResults(data);
            } catch (err) {
                setResults([]);
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [term]);

    function add(user) {
        router.post(base, { user_id: user.id }, {
            preserveScroll: true,
            preserveState: true,
            onStart: () => setAdding(user.id),
            onFinish: () => setAdding(null),
            onSuccess: (page) => {
                // Remove from the list only when it was really added
                if (page.props.flash?.success) {
                    setResults((prev) => prev.filter((u) => u.id !== user.id));
                }
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add exam admin</DialogTitle>
                    <DialogDescription>
                        Search teachers from the schools registered for this exam.
                    </DialogDescription>
                </DialogHeader>

                <FlashMessage />

                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        autoFocus
                        placeholder="Search by name, phone or email..."
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        className="px-9"
                    />
                    {term && (
                        <button
                            type="button"
                            onClick={() => setTerm('')}
                            aria-label="Clear search"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                </div>

                <div className="max-h-72 overflow-y-auto">
                    {results === null && (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                            Type at least 2 characters to search.
                        </p>
                    )}

                    {results !== null && searching && (
                        <p className="py-4 text-center text-sm text-muted-foreground">Searching...</p>
                    )}

                    {results !== null && !searching && results.length === 0 && (
                        <p className="py-4 text-center text-sm text-muted-foreground">No teacher found.</p>
                    )}

                    {results !== null && results.length > 0 && (
                        <ul className="divide-y rounded-md border">
                            {results.map((user) => (
                                <li key={user.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                                    <div className="min-w-0 space-y-0.5">
                                        <p className="font-medium">{user.name}</p>
                                        <p className="truncate text-muted-foreground">{user.school}</p>
                                        <p className="truncate text-muted-foreground">
                                            {user.phone} · {user.email}
                                        </p>
                                    </div>
                                    <Button size="sm" disabled={adding === user.id} onClick={() => add(user)}>
                                        {adding === user.id ? 'Adding...' : 'Add as exam admin'}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}