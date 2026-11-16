import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { AlertCircle, ArrowLeft, CheckCircle2, Pencil, Save, X } from 'lucide-react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';

const STANDARD_GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'];

export default function GradingSystemShow({ gradingSystem }) {
    const [isEditing, setIsEditing] = useState(false);

    const initialBands = STANDARD_GRADES.map((gradeLetter) => {
        const found = gradingSystem.gradings?.find((g) => g.grade === gradeLetter);
        return {
            grade: gradeLetter,
            min_score: found ? found.min_score : 0,
            max_score: found ? found.max_score : 0,
            points: found ? found.points : 0,
        };
    });

    const { data, setData, put, processing, errors } = useForm({
        gradings: initialBands,
    });

    // Determine which row indices have errors for red cell highlighting
    const getErrorIndices = (bands) => {
        const errorIndices = new Set();
        if (bands.length > 12) return errorIndices;

        for (let i = 0; i < bands.length; i++) {
            const curr = bands[i];
            if (Number(curr.min_score) > Number(curr.max_score)) {
                errorIndices.add(i);
            }
        }

        for (let i = 0; i < bands.length - 1; i++) {
            const curr = bands[i];
            const next = bands[i + 1];
            if (curr.min_score <= next.max_score) {
                errorIndices.add(i);
                errorIndices.add(i + 1);
            }
        }
        return errorIndices;
    };

    const errorIndices = getErrorIndices(data.gradings);

    // Live clash and overlap validation message
    const validateBandsLive = (bands) => {
        if (bands.length > 12) {
            return { type: 'error', text: 'Maximum 12 grading bands allowed.' };
        }

        for (let i = 0; i < bands.length; i++) {
            const curr = bands[i];
            if (Number(curr.min_score) > Number(curr.max_score)) {
                return { type: 'error', text: `Grade ${curr.grade}: Minimum score cannot exceed maximum score.` };
            }
        }

        for (let i = 0; i < bands.length - 1; i++) {
            const curr = bands[i];
            const next = bands[i + 1];

            if (curr.min_score <= next.max_score) {
                return {
                    type: 'error',
                    text: `Score clash/overlap detected between Grade ${curr.grade} (min ${curr.min_score}) and Grade ${next.grade} (max ${next.max_score}).`,
                };
            }
        }

        return { type: 'success', text: 'Grading scale sequence is valid and non-overlapping.' };
    };

    const handleBandChange = (index, field, value) => {
        const updated = [...data.gradings];
        updated[index][field] = value === '' ? '' : Number(value);
        setData('gradings', updated);
    };

    function submit(e) {
        e.preventDefault();
        put(`/grading-systems/${gradingSystem.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditing(false);
                Swal.fire({
                    icon: 'success',
                    title: 'Grading bands updated',
                    timer: 1500,
                    showConfirmButton: false,
                });
            },
        });
    }

    const validationStatus = validateBandsLive(data.gradings);

    return (
        <DashboardLayout title={`Manage Bands: ${gradingSystem.name}`}>
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">Grading Bands: {gradingSystem.name}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {!isEditing ? (
                            <Button onClick={() => setIsEditing(true)} variant="default" size="sm">
                                <Pencil className="mr-1.5 size-3.5" /> Edit Bands
                            </Button>
                        ) : (
                            <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                                <X className="mr-1.5 size-3.5" /> Cancel
                            </Button>
                        )}
                        <Button asChild variant="outline" size="sm">
                            <Link href="/grading-systems">
                                <ArrowLeft className="mr-1.5 size-3.5" /> Back
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Live Feedback Banner */}
                <div className={`flex items-center gap-2.5 rounded-lg border p-3.5 text-sm ${
                    validationStatus.type === 'error' ? 'border-destructive/50 bg-destructive/5 text-destructive' : 'border-primary/40 bg-primary/5 text-foreground'
                }`}>
                    {validationStatus.type === 'error' ? <AlertCircle className="size-4 shrink-0" /> : <CheckCircle2 className="size-4 shrink-0 text-primary" />}
                    <span>{validationStatus.text}</span>
                </div>

                <form onSubmit={submit} className="space-y-6 rounded-lg border bg-card p-6 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Grade</th>
                                    <th className="px-4 py-3 font-semibold">Min Score</th>
                                    <th className="px-4 py-3 font-semibold">Max Score</th>
                                    <th className="px-4 py-3 font-semibold">Points</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {data.gradings.map((band, index) => {
                                    const hasRowError = errorIndices.has(index);

                                    return (
                                        <tr
                                            key={band.grade}
                                            className={`transition-colors ${
                                                hasRowError && isEditing
                                                    ? 'bg-destructive/10 border-l-4 border-destructive'
                                                    : 'hover:bg-muted/10'
                                            }`}
                                        >
                                            <td className="px-4 py-3 font-medium">
                                                <Input
                                                    value={band.grade}
                                                    disabled
                                                    className="w-20 font-bold bg-muted text-center cursor-not-allowed"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={band.min_score}
                                                    onChange={(e) => handleBandChange(index, 'min_score', e.target.value)}
                                                    disabled={!isEditing}
                                                    className={hasRowError && isEditing ? 'border-destructive bg-destructive/5' : ''}
                                                    required
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={band.max_score}
                                                    onChange={(e) => handleBandChange(index, 'max_score', e.target.value)}
                                                    disabled={!isEditing}
                                                    className={hasRowError && isEditing ? 'border-destructive bg-destructive/5' : ''}
                                                    required
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="12"
                                                    value={band.points}
                                                    onChange={(e) => handleBandChange(index, 'points', e.target.value)}
                                                    disabled={!isEditing}
                                                    required
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {errors.gradings && <p className="text-xs text-destructive">{errors.gradings}</p>}

                    {isEditing && (
                        <div className="flex justify-end border-t pt-4">
                            <Button type="submit" disabled={processing || validationStatus.type === 'error'}>
                                <Save className="mr-2 size-4" /> {processing ? 'Saving...' : 'Save grading bands'}
                            </Button>
                        </div>
                    )}
                </form>
            </div>
        </DashboardLayout>
    );
}