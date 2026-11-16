import { useEffect, useState } from 'react';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { CheckCircle2, CircleAlert, FileSpreadsheet, Loader2, TriangleAlert, Upload } from 'lucide-react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';

const MAX_MB = 10;

/** Client-side magic-byte check before uploading. */
async function checkFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();

    if (!['xlsx', 'xls', 'csv'].includes(ext)) return 'Only Excel or CSV files are accepted.';
    if (file.size === 0) return 'The file is empty.';
    if (file.size > MAX_MB * 1024 * 1024) return `The file is larger than ${MAX_MB} MB.`;

    return null;
}

export default function StudentsImport({ school, form }) {
    const base = `/schools/${school.id}/${school.slug}`;
    const { flash } = usePage().props;

    const [stage, setStage] = useState('select'); // select | summary
    const [inputKey, setInputKey] = useState(0);
    const [simPercent, setSimPercent] = useState(0);
    const [completedSnap, setCompletedSnap] = useState(false);
    const [result, setResult] = useState(null);

    const { data, setData, post, processing, progress, errors, reset, clearErrors, setError } = useForm({
        file: null,
    });

    const uploadPercent = progress?.percentage ?? 0;
    const isUploading = processing && uploadPercent < 100 && !completedSnap;
    const isSimulating = processing && uploadPercent >= 100 && !completedSnap;

    // Warn before closing tab while request is in flight
    useEffect(() => {
        if (!processing) return;
        const warn = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [processing]);

    // Simulated progress curve once upload reaches 100%
    useEffect(() => {
        if (!isSimulating) {
            if (!completedSnap) setSimPercent(0);
            return;
        }

        setSimPercent(15);
        const interval = setInterval(() => {
            setSimPercent((prev) => {
                const remaining = 92 - prev;
                return remaining > 0.5 ? Math.round(prev + remaining * 0.08) : 92;
            });
        }, 350);

        return () => clearInterval(interval);
    }, [isSimulating, completedSnap]);

    async function choose(e) {
        const chosen = e.target.files?.[0] ?? null;
        clearErrors();
        setCompletedSnap(false);

        if (!chosen) {
            setData('file', null);
            return;
        }

        const problem = await checkFile(chosen);
        if (problem) {
            setData('file', null);
            setInputKey((k) => k + 1);
            setError('file', problem);
            return;
        }

        setData('file', chosen);
    }

    function start(e) {
        e.preventDefault();
        if (!data.file || processing) return;

        clearErrors();
        setCompletedSnap(false);
        setSimPercent(0);

        post(`${base}/forms/${form.id}/import`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page) => {
                setSimPercent(100);
                setCompletedSnap(true);

                const res = page.props.flash?.import_result;
                const successMsg = page.props.flash?.success || 'Students imported successfully.';

                setTimeout(() => {
                    setCompletedSnap(false);
                    reset('file');
                    setInputKey((k) => k + 1);

                    if (res && res.skipped > 0) {
                        setResult(res);
                        setStage('summary');
                    } else {
                        Swal.fire({
                            icon: 'success',
                            title: 'Import complete',
                            text: successMsg,
                            confirmButtonText: 'OK',
                            allowOutsideClick: false,
                        }).then(() => {
                            router.visit(base);
                        });
                    }
                }, 300);
            },
            onError: () => {
                setCompletedSnap(false);
                setSimPercent(0);
            },
        });
    }

    const activePercent = completedSnap ? 100 : isSimulating ? simPercent : uploadPercent;
    const statusText = completedSnap
        ? 'Import complete!'
        : isSimulating
          ? 'Processing rows... Please wait'
          : `Uploading file... ${uploadPercent}%`;

    const errorMessage = errors.file || flash?.error;

    return (
        <DashboardLayout title="Import students">
            <div className="mx-auto max-w-2xl">
                <div className="mb-6 flex items-center justify-between gap-2">
                    <div>
                        <h1 className="text-xl font-semibold">Import students</h1>
                        <p className="text-sm text-muted-foreground">
                            {school.name} · {form.name}
                        </p>
                    </div>
                    {!processing && stage === 'select' && (
                        <Button asChild variant="outline">
                            <Link href={base}>Back</Link>
                        </Button>
                    )}
                </div>

                {errorMessage && (
                    <div
                        role="alert"
                        className="mb-4 flex items-start gap-2.5 rounded-lg border border-destructive/50 bg-destructive/5 p-3.5 text-sm text-destructive"
                    >
                        <CircleAlert className="mt-0.5 size-4 shrink-0" />
                        <div>
                            <p className="font-medium">Import not started</p>
                            <p className="mt-0.5">{errorMessage}</p>
                        </div>
                    </div>
                )}

                {stage === 'select' && (
                    <>
                        <div className="mb-4 rounded-lg border bg-card p-4 text-sm">
                            <h2 className="mb-2 font-semibold">Instructions</h2>
                            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                                <li>Only Excel or CSV files are accepted (.xlsx, .xls, .csv), up to {MAX_MB} MB.</li>
                                <li>
                                    The first row must contain columns named{' '}
                                    <b className="text-foreground">name</b>,{' '}
                                    <b className="text-foreground">adm</b> (or admno),{' '}
                                    <b className="text-foreground">stream</b> (or str), and{' '}
                                    <b className="text-foreground">gender</b>.
                                </li>
                            </ul>
                        </div>

                        <form onSubmit={start} className="space-y-4 rounded-lg border bg-card p-6">
                            <div className="space-y-2">
                                <Label htmlFor="file">Workbook file</Label>
                                <Input
                                    key={inputKey}
                                    id="file"
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    disabled={processing}
                                    onChange={choose}
                                />
                            </div>

                            {data.file && !processing && (
                                <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                                    <FileSpreadsheet className="size-4 shrink-0 text-primary" />
                                    <span className="truncate font-medium text-foreground">{data.file.name}</span>
                                    <span className="ml-auto shrink-0">
                                        {(data.file.size / 1024).toFixed(1)} KB
                                    </span>
                                </div>
                            )}

                            {processing && (
                                <div className="space-y-2 rounded-md border bg-muted/30 p-4">
                                    <div className="flex items-start gap-2 rounded-md border border-amber-500/50 p-2 text-xs text-amber-700 dark:text-amber-400">
                                        <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                                        <span>Please wait. Do not close or refresh this page.</span>
                                    </div>

                                    <div className="flex items-center justify-between text-xs font-medium">
                                        <span className="flex items-center gap-1.5 text-foreground">
                                            {!completedSnap && <Loader2 className="size-3.5 animate-spin text-primary" />}
                                            {statusText}
                                        </span>
                                        <span className="tabular-nums text-muted-foreground">{activePercent}%</span>
                                    </div>

                                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                                        <div
                                            className={`h-full transition-all duration-300 ease-out ${
                                                isSimulating ? 'bg-primary/85 animate-pulse' : 'bg-primary'
                                            }`}
                                            style={{ width: `${activePercent}%` }}
                                        />
                                    </div>

                                    <p className="text-[11px] text-muted-foreground">
                                        {isUploading
                                            ? 'Uploading spreadsheet to server...'
                                            : 'Validating records, creating streams, and saving...'}
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <Button type="submit" disabled={!data.file || processing}>
                                    <Upload className="mr-2 size-4" />
                                    {processing ? 'Importing...' : 'Import students'}
                                </Button>
                            </div>
                        </form>
                    </>
                )}

                {stage === 'summary' && result && (
                    <div className="space-y-4 rounded-lg border bg-card p-6">
                        <div className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400">
                            <CheckCircle2 className="size-5 shrink-0" />
                            <span>
                                Imported {result.imported} student(s); skipped {result.skipped} row(s).
                            </span>
                        </div>

                        <div className="rounded-md border p-3 text-sm">
                            <p className="mb-1 font-medium">Imported per stream</p>
                            <ul className="text-muted-foreground">
                                {Object.entries(result.by_stream || {}).map(([stream, count]) => (
                                    <li key={stream}>
                                        {stream}: {count}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <p className="mb-1 text-sm font-medium">Skipped rows & errors</p>
                            <ul className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-3 text-sm text-muted-foreground">
                                {result.failures.map((message, i) => (
                                    <li key={i}>{message}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={() => router.visit(base)}>Done</Button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}