import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

export default function GradingSystemModal({ open, onClose, gradingSystem }) {
    const editing = Boolean(gradingSystem);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
    });

    useEffect(() => {
        if (open) {
            clearErrors();
            setData({ name: gradingSystem?.name ?? '' });
        }
    }, [open, gradingSystem]);

    function submit(e) {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
                Swal.fire({
                    icon: 'success',
                    title: editing ? 'Grading system updated' : 'Grading system created',
                    timer: 1500,
                    showConfirmButton: false,
                });
            },
        };

        editing ? put(`/grading-systems/${gradingSystem.id}`, options) : post('/grading-systems', options);
    }

    return (
        <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{editing ? 'Edit grading system' : 'Add grading system'}</DialogTitle>
                    <DialogDescription>
                        {editing ? `Modify title for ${gradingSystem.name}` : 'Create a new grading scale category.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="grading-name">System Name</Label>
                        <Input
                            id="grading-name"
                            placeholder="e.g. National Standard 8-4-4 Scale"
                            autoFocus
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : editing ? 'Save changes' : 'Create system'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}