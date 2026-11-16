import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/Components/ui/dialog';

export default function ExamModal({ open, onClose, exam, academicYears, forms, subjects, gradingSystems }) {
    const editing = Boolean(exam);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        academic_year_id: academicYears[0]?.id ?? '',
        form_id: forms[0]?.id ?? '',
        subject_id: subjects[0]?.id ?? '',
        grading_system_id: gradingSystems[0]?.id ?? '',
        status: 'draft',
        results_visibility: 'admins_only',
        mark_submission_mode: 'admins_only',
    });

    useEffect(() => {
        if (open) {
            clearErrors();
            if (exam) {
                setData({
                    name: exam.name ?? '',
                    academic_year_id: exam.academic_year_id ?? '',
                    form_id: exam.form_id ?? '',
                    subject_id: exam.subject_id ?? '',
                    grading_system_id: exam.grading_system_id ?? '',
                    status: exam.status ?? 'draft',
                    results_visibility: exam.results_visibility ?? 'admins_only',
                    mark_submission_mode: exam.mark_submission_mode ?? 'admins_only',
                });
            } else {
                setData({
                    name: '',
                    academic_year_id: academicYears[0]?.id ?? '',
                    form_id: forms[0]?.id ?? '',
                    subject_id: subjects[0]?.id ?? '',
                    grading_system_id: gradingSystems[0]?.id ?? '',
                    status: 'draft',
                    results_visibility: 'admins_only',
                    mark_submission_mode: 'admins_only',
                });
            }
        }
    }, [open, exam]);

    function submit(e) {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
                Swal.fire({
                    icon: 'success',
                    title: editing ? 'Exam updated' : 'Exam created',
                    timer: 1500,
                    showConfirmButton: false,
                });
            },
        };

        if (editing) {
            put(`/exams/${exam.id}/${exam.slug}`, options);
        } else {
            post('/exams', options);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{editing ? 'Edit exam' : 'Create new exam'}</DialogTitle>
                    <DialogDescription>
                        {editing ? `Modify parameters for ${exam.name}` : 'Set up examination parameters and configurations.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="exam-name">Exam Name</Label>
                        <Input
                            id="exam-name"
                            placeholder="e.g. Term 1 Joint Evaluation 2026"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="academic_year">Academic Year</Label>
                            <select
                                id="academic_year"
                                value={data.academic_year_id}
                                onChange={(e) => setData('academic_year_id', e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                required
                            >
                                {academicYears.map((ay) => (
                                    <option key={ay.id} value={ay.id}>{ay.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="form">Form / Class</Label>
                            <select
                                id="form"
                                value={data.form_id}
                                onChange={(e) => setData('form_id', e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                required
                            >
                                {forms.map((f) => (
                                    <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <select
                                id="subject"
                                value={data.subject_id}
                                onChange={(e) => setData('subject_id', e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                required
                            >
                                {subjects.map((sub) => (
                                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="grading_system">Grading Scale</Label>
                            <select
                                id="grading_system"
                                value={data.grading_system_id}
                                onChange={(e) => setData('grading_system_id', e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                required
                            >
                                {gradingSystems.map((gs) => (
                                    <option key={gs.id} value={gs.id}>{gs.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Status</Label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Results Visibility</Label>
                            <select
                                value={data.results_visibility}
                                onChange={(e) => setData('results_visibility', e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs"
                            >
                                <option value="admins_only">Admins Only</option>
                                <option value="public">Public</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Mark Submission</Label>
                            <select
                                value={data.mark_submission_mode}
                                onChange={(e) => setData('mark_submission_mode', e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs"
                            >
                                <option value="admins_only">Admins Only</option>
                                <option value="teachers">Teachers</option>
                            </select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : editing ? 'Save changes' : 'Create exam'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}