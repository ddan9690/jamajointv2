import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { KeyRound } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/Components/ui/dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/Components/ui/select';

export default function UserModal({ open, onClose, user, counties, schools }) {
    const { data, setData, put, processing, errors, clearErrors } = useForm({
        name: '',
        county_id: '',
        school_id: '',
        phone: '',
        email: '',
        status: 'active',
    });

    useEffect(() => {
        if (user) {
            let phoneLocal = user.phone ?? '';
            if (phoneLocal.startsWith('254')) {
                phoneLocal = phoneLocal.slice(3);
            }
            setData({
                name: user.name ?? '',
                county_id: user.county_id ? String(user.county_id) : '',
                school_id: user.school_id ? String(user.school_id) : '',
                phone: phoneLocal,
                email: user.email ?? '',
                status: user.status ?? 'active',
            });
            clearErrors();
        }
    }, [user]);

    const countySchools = schools.filter((s) => String(s.county_id) === String(data.county_id));
    const selectedSchoolName = schools.find((s) => String(s.id) === String(data.school_id))?.name;

    function handlePhoneChange(e) {
        let val = e.target.value.replace(/\D/g, '');
        if (val.startsWith('254')) val = val.slice(3);
        else if (val.startsWith('0')) val = val.replace(/^0+/, '');
        if (val.length <= 9) setData('phone', val);
    }

    async function handleResetPassword() {
        const result = await Swal.fire({
            icon: 'warning',
            title: `Reset password for ${user.name}?`,
            text: 'A secure new password will be generated.',
            showCancelButton: true,
            confirmButtonText: 'Yes, reset',
            confirmButtonColor: '#2563eb',
        });
        if (!result.isConfirmed) return;

        try {
            const { data: res } = await axios.post(`/users/${user.id}/reset-password`);
            Swal.fire({
                icon: 'success',
                title: 'Password reset successfully',
                html: `New password: <code class="px-2 py-1 bg-muted rounded font-mono text-base">${res.password}</code>`,
                confirmButtonText: 'Copy & Close',
                didOpen: () => {
                    const confirmBtn = Swal.getConfirmButton();
                    confirmBtn.onclick = () => {
                        navigator.clipboard.writeText(res.password);
                        Swal.fire({ icon: 'success', title: 'Copied to clipboard!', timer: 1200, showConfirmButton: false });
                    };
                }
            });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Could not reset password.' });
        }
    }

    function submit(e) {
        e.preventDefault();

        put(`/users/${user.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                Swal.fire({
                    icon: 'success',
                    title: 'User updated successfully',
                    timer: 1500,
                    showConfirmButton: false,
                });
            },
        });
    }

    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>Update user profile details and status.</DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="user-name">Name</Label>
                        <Input
                            id="user-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>County</Label>
                        <Select
                            value={data.county_id}
                            onValueChange={(val) => setData((d) => ({ ...d, county_id: val, school_id: '' }))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select county">
                                    {counties.find((c) => String(c.id) === String(data.county_id))?.name}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {counties.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.county_id && <p className="text-sm text-destructive">{errors.county_id}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>School</Label>
                        <Select
                            value={data.school_id}
                            onValueChange={(val) => setData('school_id', val)}
                            disabled={!data.county_id}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={data.county_id ? 'Select school' : 'Select county first'}>
                                    {selectedSchoolName}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {countySchools.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.school_id && <p className="text-sm text-destructive">{errors.school_id}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="user-phone">Phone number</Label>
                        <div className="flex rounded-md shadow-sm">
                            <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">+254</span>
                            <Input
                                id="user-phone"
                                value={data.phone}
                                onChange={handlePhoneChange}
                                className="rounded-l-none"
                            />
                        </div>
                        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="user-email">Email</Label>
                        <Input
                            id="user-email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <Label>Password</Label>
                        <Button type="button" variant="outline" size="sm" onClick={handleResetPassword}>
                            <KeyRound className="size-3.5 mr-1.5" /> Reset password
                        </Button>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}