import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        phone: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

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
        post('/login');
    }

    return (
        <AuthLayout title="Log in" subtitle="Enter your details to continue.">
            <Head title="Login" />

            <form onSubmit={submit} className="space-y-4">
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
                            placeholder="0712345678"
                            value={data.phone}
                            onChange={handlePhoneChange}
                            className="rounded-l-none"
                        />
                    </div>
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
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

                <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                        type="checkbox"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        className="rounded border-input text-primary focus:ring-primary"
                    />
                    Remember me
                </label>

                <Button type="submit" className="w-full" disabled={processing}>
                    {processing ? 'Logging in...' : 'Log in'}
                </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
                No account?{' '}
                <Link href="/register" className="text-primary hover:underline">
                    Register
                </Link>
            </p>
        </AuthLayout>
    );
}