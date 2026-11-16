import { useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/Components/ui/select';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/Components/ui/dialog';

const genderNames = { M: 'Male', F: 'Female' };

export default function StudentModal({ open, onClose, school, stream, url }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        admission_number: '',
        name: '',
        gender: '',
    });

    function submit(e) {
        e.preventDefault();
        post(url, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
                Swal.fire({ icon: 'success', title: 'Student added', timer: 1500, showConfirmButton: false });
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add student</DialogTitle>
                    <DialogDescription>
                        {school.name} · {stream.form} {stream.name}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="admission_number">Admission number</Label>
                        <Input
                            id="admission_number"
                            autoFocus
                            value={data.admission_number}
                            onChange={(e) => setData('admission_number', e.target.value)}
                        />
                        {errors.admission_number && <p className="text-sm text-destructive">{errors.admission_number}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Gender</Label>
                        <Select value={data.gender} onValueChange={(v) => setData('gender', v)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select gender">{genderNames[data.gender]}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="M">Male</SelectItem>
                                <SelectItem value="F">Female</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save student'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}