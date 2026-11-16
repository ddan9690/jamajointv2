import { useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

export default function SubjectModal({ open, onClose, subject }) {
    const editing = Boolean(subject);

    const { data, setData, post, put, processing, errors } = useForm({
        name: subject?.name ?? '',
        code: subject?.code ?? '',
    });

    function submit(e) {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                Swal.fire({
                    icon: 'success',
                    title: editing ? 'Subject updated' : 'Subject added',
                    timer: 1500,
                    showConfirmButton: false,
                });
            },
        };

        editing ? put(`/subjects/${subject.id}/${subject.slug}`, options) : post('/subjects', options);
    }

    return (
        <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{editing ? 'Edit subject' : 'Add subject'}</DialogTitle>
                    <DialogDescription>Enter the subject name and code.</DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="subject-name">Subject name</Label>
                        <Input
                            id="subject-name"
                            placeholder="e.g. English"
                            autoFocus
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subject-code">Code</Label>
                        <Input
                            id="subject-code"
                            placeholder="e.g. 101"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                        />
                        {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : editing ? 'Save changes' : 'Save subject'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}