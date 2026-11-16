import { Link, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/Components/ui/select';

export default function Create({ counties }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        county_id: '',
        type: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/schools', {
            onSuccess: () =>
                Swal.fire({ icon: 'success', title: 'School added', timer: 1500, showConfirmButton: false }),
        });
    }

    return (
        <DashboardLayout title="Add school">
            <div className="mx-auto max-w-xl">
                <h1 className="text-xl font-semibold">Add school</h1>
                <p className="mb-6 text-sm text-muted-foreground">Enter the school details.</p>

                <form onSubmit={submit} className="space-y-4 rounded-lg border bg-card p-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">School name</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>County</Label>
                        <Select value={data.county_id} onValueChange={(v) => setData('county_id', v)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select county" />
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

                    <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="boys">Boys</SelectItem>
                                <SelectItem value="girls">Girls</SelectItem>
                                <SelectItem value="mixed">Mixed</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button asChild variant="outline">
                            <Link href="/schools">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save school'}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}