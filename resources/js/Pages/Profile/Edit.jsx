import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import Swal from 'sweetalert2';
import { Check, X, Shield, User, Mail, Phone, Lock } from 'lucide-react';

export default function Edit({ user, status }) {
    // Profile info form
    const { data: profileData, setData: setProfileData, patch, processing: profileProcessing, errors: profileErrors } = useForm({
        email: user.email,
        phone: user.phone,
    });

    // Password form
    const { data: passwordData, setData: setPasswordData, put, processing: passwordProcessing, errors: passwordErrors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Live password criteria validation state
    const [passwordChecks, setPasswordChecks] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        symbol: false,
    });

    function handlePasswordChange(e) {
        const val = e.target.value;
        setPasswordData('password', val);

        setPasswordChecks({
            length: val.length >= 8,
            uppercase: /[A-Z]/.test(val),
            lowercase: /[a-z]/.test(val),
            number: /[0-9]/.test(val),
            symbol: /[^A-Za-z0-9]/.test(val),
        });
    }

    function submitProfile(e) {
        e.preventDefault();
        patch('/profile', {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Profile Updated',
                    text: 'Your contact details have been updated successfully.',
                    timer: 2000,
                    showConfirmButton: false,
                });
            },
        });
    }

    function submitPassword(e) {
        e.preventDefault();
        put('/profile/password', {
            onSuccess: () => {
                reset();
                setPasswordChecks({ length: false, uppercase: false, lowercase: false, number: false, symbol: false });
                Swal.fire({
                    icon: 'success',
                    title: 'Password Updated',
                    text: 'Your password has been changed securely.',
                    timer: 2000,
                    showConfirmButton: false,
                });
            },
        });
    }

    return (
        <DashboardLayout title="Profile Settings">
            <Head title="Profile" />

            <div className="mx-auto max-w-3xl space-y-6">
                <div>
                    <h1 className="text-xl font-semibold">Account Profile</h1>
                    <p className="text-sm text-muted-foreground">Update your account email, phone number, and security credentials.</p>
                </div>

                {/* Section 1: Read-only Identity Information */}
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h2 className="text-base font-medium mb-4 flex items-center gap-2">
                        <User className="size-4 text-primary" /> Personal Information (Locked)
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label className="text-xs text-muted-foreground">Full Name</Label>
                            <Input value={user.name} disabled className="mt-1 bg-muted cursor-not-allowed" />
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">County</Label>
                            <Input value={user.county} disabled className="mt-1 bg-muted cursor-not-allowed" />
                        </div>
                        <div className="sm:col-span-2">
                            <Label className="text-xs text-muted-foreground">Assigned School</Label>
                            <Input value={user.school} disabled className="mt-1 bg-muted cursor-not-allowed" />
                        </div>
                    </div>
                </div>

                {/* Section 2: Editable Contact Information */}
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h2 className="text-base font-medium mb-4 flex items-center gap-2">
                        <Mail className="size-4 text-primary" /> Contact Details
                    </h2>
                    <form onSubmit={submitProfile} className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData('email', e.target.value)}
                                className="mt-1"
                            />
                            {profileErrors.email && <p className="text-sm text-destructive mt-1">{profileErrors.email}</p>}
                        </div>

                        <div>
                            <Label htmlFor="phone">Phone Number (+254)</Label>
                            <Input
                                id="phone"
                                type="text"
                                value={profileData.phone}
                                onChange={(e) => setProfileData('phone', e.target.value)}
                                className="mt-1"
                            />
                            {profileErrors.phone && <p className="text-sm text-destructive mt-1">{profileErrors.phone}</p>}
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={profileProcessing}>
                                {profileProcessing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Section 3: Update Password with Live Requirements */}
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h2 className="text-base font-medium mb-4 flex items-center gap-2">
                        <Lock className="size-4 text-primary" /> Update Password
                    </h2>
                    <form onSubmit={submitPassword} className="space-y-4">
                        <div>
                            <Label htmlFor="current_password">Current Password</Label>
                            <Input
                                id="current_password"
                                type="password"
                                value={passwordData.current_password}
                                onChange={(e) => setPasswordData('current_password', e.target.value)}
                                className="mt-1"
                            />
                            {passwordErrors.current_password && (
                                <p className="text-sm text-destructive mt-1">{passwordErrors.current_password}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={passwordData.password}
                                onChange={handlePasswordChange}
                                className="mt-1"
                            />
                            {passwordErrors.password && <p className="text-sm text-destructive mt-1">{passwordErrors.password}</p>}

                            {/* Live Password Strength Checklist */}
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
                                <div className={`flex items-center gap-2 ${passwordChecks.length ? 'text-green-600 font-medium' : ''}`}>
                                    {passwordChecks.length ? <Check className="size-3.5" /> : <X className="size-3.5 text-muted-foreground" />}
                                    At least 8 characters
                                </div>
                                <div className={`flex items-center gap-2 ${passwordChecks.uppercase ? 'text-green-600 font-medium' : ''}`}>
                                    {passwordChecks.uppercase ? <Check className="size-3.5" /> : <X className="size-3.5 text-muted-foreground" />}
                                    At least one uppercase letter
                                </div>
                                <div className={`flex items-center gap-2 ${passwordChecks.lowercase ? 'text-green-600 font-medium' : ''}`}>
                                    {passwordChecks.lowercase ? <Check className="size-3.5" /> : <X className="size-3.5 text-muted-foreground" />}
                                    At least one lowercase letter
                                </div>
                                <div className={`flex items-center gap-2 ${passwordChecks.number ? 'text-green-600 font-medium' : ''}`}>
                                    {passwordChecks.number ? <Check className="size-3.5" /> : <X className="size-3.5 text-muted-foreground" />}
                                    At least one number
                                </div>
                                <div className={`flex items-center gap-2 ${passwordChecks.symbol ? 'text-green-600 font-medium' : ''}`}>
                                    {passwordChecks.symbol ? <Check className="size-3.5" /> : <X className="size-3.5 text-muted-foreground" />}
                                    At least one special character
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="password_confirmation">Confirm New Password</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={passwordData.password_confirmation}
                                onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                className="mt-1"
                            />
                            {passwordData.password_confirmation && (
                                <p className={`text-xs mt-1 font-medium ${passwordData.password === passwordData.password_confirmation ? 'text-green-600' : 'text-destructive'}`}>
                                    {passwordData.password === passwordData.password_confirmation ? '✓ Passwords match' : '✗ Passwords do not match'}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={passwordProcessing}>
                                {passwordProcessing ? 'Updating Password...' : 'Update Password'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}