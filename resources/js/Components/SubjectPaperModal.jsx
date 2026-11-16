import { useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

export default function SubjectPaperModal({ open, onClose, subject, paper }) {
    const editing = Boolean(paper);
    const base = `/subjects/${subject.id}/${subject.slug}/papers`;

    const { data, setData, post, put, processing, errors } = useForm({
        name: paper?.name ?? '',
        code: paper?.code ?? '',
    });

    function submit(e) {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                Swal.fire({
                    icon: 'success',
                    title: editing ? 'Paper updated' : 'Paper added',
                    timer: 1500,
                    showConfirmButton: false,
                });
            },
        };

        editing ? put(`${base}/${paper.id}`, options) : post(base, options);
    }

    return (
        <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{editing ? 'Edit paper' : 'Add paper'}</DialogTitle>
                    <DialogDescription>{subject.name}</DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="paper-name">Paper name</Label>
                        <Input
                            id="paper-name"
                            placeholder="e.g. Paper 1"
                            autoFocus
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="paper-code">Code (optional)</Label>
                        <Input
                            id="paper-code"
                            placeholder="e.g. 101/1"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                        />
                        {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : editing ? 'Save changes' : 'Save paper'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}