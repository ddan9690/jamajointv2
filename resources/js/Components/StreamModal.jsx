import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

export default function StreamModal({ open, onClose, school, form, stream }) {
    const editing = Boolean(stream);
    const base = `/schools/${school.id}/${school.slug}/streams`;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        form_id: form.id,
        name: '',
    });

    // Fill or clear the field each time the modal opens
    useEffect(() => {
        if (open) {
            clearErrors();
            setData({ form_id: form.id, name: stream?.name ?? '' });
        }
    }, [open, stream]);

    function submit(e) {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
                Swal.fire({
                    icon: 'success',
                    title: editing ? 'Stream updated' : 'Stream added',
                    timer: 1500,
                    showConfirmButton: false,
                });
            },
        };

        editing ? put(`${base}/${stream.id}`, options) : post(base, options);
    }

    return (
        <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{editing ? 'Edit stream' : 'Add stream'}</DialogTitle>
                    <DialogDescription>
                        {school.name} · {form.name}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="stream-name">Stream name</Label>
                        <Input
                            id="stream-name"
                            placeholder="e.g. East"
                            autoFocus
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                        {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
                        {errors.form_id && <p className="text-sm text-destructive">{errors.form_id}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : editing ? 'Save changes' : 'Save stream'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}