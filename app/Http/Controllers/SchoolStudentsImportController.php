<?php

namespace App\Http\Controllers;

use App\Imports\SchoolStudentsImport;
use App\Models\Form;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use InvalidArgumentException;
use Maatwebsite\Excel\Facades\Excel;
use Throwable;

class SchoolStudentsImportController extends Controller
{
    public function create(School $school, string $slug, Form $form)
    {
        abort_unless($school->slug === $slug, 404);

        return Inertia::render('Schools/StudentsImport', [
            'school' => $school->only('id', 'slug', 'name'),
            'form' => $form->only('id', 'name'),
        ]);
    }

    /** Validates upload, runs the import synchronously, and returns feedback. */
    public function store(Request $request, School $school, string $slug, Form $form)
    {
        abort_unless($school->slug === $slug, 404);

        $file = $request->file('file');

        if (! $file || ! $file->isValid()) {
            $errorCode = $file ? $file->getError() : UPLOAD_ERR_NO_FILE;

            Log::error("Student import file upload failed. PHP Error Code: {$errorCode}", [
                'school_id' => $school->id,
                'form_id' => $form->id,
                'user_id' => $request->user()?->id,
            ]);

            $message = match ($errorCode) {
                UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'The selected file is too large. Please ensure it is under 10 MB.',
                UPLOAD_ERR_NO_FILE => 'Please choose an Excel file to import.',
                UPLOAD_ERR_NO_TMP_DIR, UPLOAD_ERR_CANT_WRITE => 'The server encountered a temporary storage issue while receiving the file. Please try again.',
                default => 'The file could not be uploaded due to a temporary server issue. Please try again.',
            };

            throw ValidationException::withMessages(['file' => $message]);
        }

        $extension = strtolower($file->getClientOriginalExtension());

        if (! in_array($extension, ['xlsx', 'xls', 'csv'])) {
            throw ValidationException::withMessages([
                'file' => 'Only Excel or CSV files (.xlsx, .xls, .csv) are accepted.',
            ]);
        }

        // Run synchronously inside an atomic transaction
        $import = new SchoolStudentsImport($school, $form);

        try {
            DB::transaction(fn () => Excel::import($import, $file));
        } catch (InvalidArgumentException $e) {
            throw ValidationException::withMessages([
                'file' => $e->getMessage() . ' Nothing was saved.',
            ]);
        } catch (Throwable $e) {
            Log::error('Student import processing failed: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);

            throw ValidationException::withMessages([
                'file' => 'An unexpected error occurred while processing the student rows. Nothing was saved.',
            ]);
        }

        if ($import->imported === 0) {
            $sampleReason = $import->failures[0] ?? 'No valid student rows were found.';

            throw ValidationException::withMessages([
                'file' => "0 students were imported because every row had errors (e.g., {$sampleReason}). Nothing was saved.",
            ]);
        }

        $summary = [
            'imported' => $import->imported,
            'streams_created' => $import->streamsCreated,
            'streams_used' => count($import->byStream),
            'skipped' => $import->skipped,
            'failures' => $import->failures,
            'by_stream' => $import->byStream,
        ];

        if ($import->skipped > 0) {
            return back()->with([
                'success' => "{$import->imported} student(s) imported, {$import->skipped} row(s) skipped.",
                'import_result' => $summary,
            ]);
        }

        return redirect("/schools/{$school->id}/{$school->slug}")
            ->with('success', "{$import->imported} student(s) imported successfully.");
    }
}