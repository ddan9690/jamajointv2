import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/Components/ui/dialog';
import { Loader2 } from 'lucide-react';

export default function OnlineUsersModal({ open, onClose }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setLoading(true);
            axios.get('/users/online-list')
                .then((res) => setUsers(res.data))
                .catch(() => setUsers([]))
                .finally(() => setLoading(false));
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span className="relative flex size-2.5">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex size-2.5 rounded-full bg-green-500" />
                        </span>
                        Users Currently Online
                    </DialogTitle>
                    <DialogDescription>
                        Active users who have interacted with the system in the last 2 minutes.
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[60vh] overflow-y-auto rounded-md border mt-2">
                    {loading ? (
                        <div className="flex items-center justify-center py-8 text-muted-foreground">
                            <Loader2 className="size-5 animate-spin mr-2" /> Loading online users...
                        </div>
                    ) : users.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            No other users online right now.
                        </div>
                    ) : (
                        <table className="w-full text-xs sm:text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                                    <th className="px-3 py-2 font-medium">Name</th>
                                    <th className="px-3 py-2 font-medium">School</th>
                                    <th className="px-3 py-2 font-medium">Phone</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30">
                                        <td className="px-3 py-2 font-medium">{u.name}</td>
                                        <td className="px-3 py-2 text-muted-foreground">{u.school || 'Unassigned'}</td>
                                        <td className="px-3 py-2">+254{u.phone}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}