import { Link, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/Components/ui/select';

export default function Edit({ school, counties }) {
    const { data, setData, put, processing, errors } = useForm({
        name: school.name,
        county_id: String(school.county_id), 
        type: school.type,
    });

    // Look up the name for the selected id, so the trigger shows the name
    const selectedCounty = counties.find((c) => String(c.id) === data.county_id);

    function submit(e) {
        e.preventDefault();
        put(`/schools/${school.id}/${school.slug}`, {
            onSuccess: () =>
                Swal.fire({ icon: 'success', title: 'School updated', timer: 1500, showConfirmButton: false }),
        });
    }

    return (
        <DashboardLayout title="Edit school">
            <div className="mx-auto max-w-xl">
                <h1 className="text-xl font-semibold">Edit school</h1>
                <p className="mb-6 text-sm text-muted-foreground">Update the school details.</p>

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
                                <SelectValue placeholder="Select county">
                                    {selectedCounty?.name}
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
                            <Link href={`/schools/${school.id}/${school.slug}`}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}