import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/Components/ui/select';
import { Eye, EyeOff, Check, ChevronsUpDown } from 'lucide-react';

export default function Register({ counties, schools }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        county_id: '',
        school_id: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    // School combobox state
    const [schoolOpen, setSchoolOpen] = useState(false);
    const [schoolSearch, setSchoolSearch] = useState('');

    const countySchools = schools.filter((s) => String(s.county_id) === String(data.county_id));
    const filteredSchools = countySchools.filter((s) =>
        s.name.toLowerCase().includes(schoolSearch.toLowerCase())
    );

    const selectedSchoolName = schools.find((s) => String(s.id) === String(data.school_id))?.name;

    // Clean phone input on change: strip non-digits, remove leading '254' or leading '0'
    const handlePhoneChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.startsWith('254')) {
            val = val.slice(3);
        } else if (val.startsWith('0')) {
            val = val.replace(/^0+/, '');
        }
        if (val.length <= 9) {
            setData('phone', val);
        }
    };

    function submit(e) {
        e.preventDefault();
        post('/register');
    }

    return (
        <AuthLayout title="Create account" subtitle="Register with your school to get started.">
            <Head title="Register" />

            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                    <Label>County</Label>
                    <Select
                        value={data.county_id}
                        onValueChange={(countyId) => setData((d) => ({ ...d, county_id: countyId, school_id: '' }))}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select county">
                                {counties.find((c) => String(c.id) === String(data.county_id))?.name}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {counties.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.county_id && <p className="text-sm text-destructive">{errors.county_id}</p>}
                </div>

                {/* Searchable School Dropdown */}
                <div className="space-y-2 relative">
                    <Label>School</Label>
                    <div className="relative">
                        <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={schoolOpen}
                            disabled={!data.county_id}
                            onClick={() => setSchoolOpen(!schoolOpen)}
                            className="w-full justify-between font-normal"
                        >
                            {selectedSchoolName || (data.county_id ? 'Search or select school...' : 'Select a county first')}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>

                        {schoolOpen && (
                            <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-2 text-popover-foreground shadow-md">
                                <Input
                                    placeholder="Type to search school..."
                                    value={schoolSearch}
                                    onChange={(e) => setSchoolSearch(e.target.value)}
                                    className="mb-2 h-8"
                                    autoFocus
                                />
                                <div className="max-h-48 overflow-y-auto space-y-1">
                                    {filteredSchools.length === 0 ? (
                                        <p className="py-2 text-center text-sm text-muted-foreground">No schools found.</p>
                                    ) : (
                                        filteredSchools.map((s) => (
                                            <div
                                                key={s.id}
                                                onClick={() => {
                                                    setData('school_id', String(s.id));
                                                    setSchoolOpen(false);
                                                    setSchoolSearch('');
                                                }}
                                                className="flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                                            >
                                                <span>{s.name}</span>
                                                {String(data.school_id) === String(s.id) && <Check className="h-4 w-4 text-primary" />}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    {data.county_id && countySchools.length === 0 && (
                        <p className="text-sm text-muted-foreground">No schools found in this county.</p>
                    )}
                    {errors.school_id && <p className="text-sm text-destructive">{errors.school_id}</p>}
                </div>

                {/* Phone Input with Prefix 254 */}
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone number</Label>
                    <div className="flex rounded-md shadow-sm">
                        <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                            +254
                        </span>
                        <Input
                            id="phone"
                            type="tel"
                            inputMode="numeric"
                            placeholder="711317235"
                            value={data.phone}
                            onChange={handlePhoneChange}
                            className="rounded-l-none"
                        />
                    </div>
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                {/* Password with Show/Hide toggle */}
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>

                {/* Confirm Password with Show/Hide toggle */}
                <div className="space-y-2">
                    <Label htmlFor="password_confirmation">Confirm password</Label>
                    <div className="relative">
                        <Input
                            id="password_confirmation"
                            type={showPasswordConfirmation ? 'text' : 'password'}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showPasswordConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <Button type="submit" className="w-full" disabled={processing}>
                    {processing ? 'Creating account...' : 'Register'}
                </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
                Already registered?{' '}
                <Link href="/login" className="text-primary hover:underline">
                    Log in
                </Link>
            </p>

            {/* Admin Note */}
            <p className="mt-6 text-center text-xs italic text-muted-foreground">
                If you have not found your school, please contact the administrator for assistance.
            </p>
        </AuthLayout>
    );
}