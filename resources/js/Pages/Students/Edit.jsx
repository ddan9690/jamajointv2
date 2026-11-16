import { Link, useForm } from "@inertiajs/react";
import Swal from "sweetalert2";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";

const genderNames = { M: 'Male', F: 'Female' };

export default function Edit({ school, stream, student, streams }) {
    const streamUrl = `/schools/${school.id}/${school.slug}/streams/${stream.id}/${stream.slug}`;

    const { data, setData, put, processing, errors, transform } = useForm({
        admission_number: student.admission_number,
        name: student.name,
        gender: student.gender ?? "none",
        stream_id: String(student.stream_id),
    });

    // send null instead of "none"
    transform((d) => ({ ...d, gender: d.gender === "none" ? null : d.gender }));

    const selectedStream = streams.find((s) => String(s.id) === data.stream_id);

    function submit(e) {
        e.preventDefault();
        put(`${streamUrl}/students/${student.id}`, {
            onSuccess: () =>
                Swal.fire({
                    icon: "success",
                    title: "Student updated",
                    timer: 1500,
                    showConfirmButton: false,
                }),
        });
    }

    return (
        <DashboardLayout title="Edit student">
            <div className="mx-auto max-w-xl">
                <h1 className="text-xl font-semibold">Edit student</h1>
                <p className="mb-6 text-sm text-muted-foreground">
                    {school.name} · {stream.form} {stream.name}
                </p>

                <form
                    onSubmit={submit}
                    className="space-y-4 rounded-lg border bg-card p-6"
                >
                    <div className="space-y-2">
                        <Label htmlFor="admission_number">
                            Admission number
                        </Label>
                        <Input
                            id="admission_number"
                            value={data.admission_number}
                            onChange={(e) =>
                                setData("admission_number", e.target.value)
                            }
                        />
                        {errors.admission_number && (
                            <p className="text-sm text-destructive">
                                {errors.admission_number}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Gender</Label>
                        <Select
                            value={data.gender}
                            onValueChange={(v) => setData("gender", v)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue>
                                    {genderNames[data.gender]}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="M">M</SelectItem>
                                <SelectItem value="F">F</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.gender && (
                            <p className="text-sm text-destructive">
                                {errors.gender}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Stream ({stream.form})</Label>
                        <Select
                            value={data.stream_id}
                            onValueChange={(v) => setData("stream_id", v)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select stream">
                                    {selectedStream?.name}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {streams.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.stream_id && (
                            <p className="text-sm text-destructive">
                                {errors.stream_id}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button asChild variant="outline">
                            <Link href={streamUrl}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? "Saving..." : "Save changes"}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
