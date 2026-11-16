<?php

namespace App\Jobs;

use App\Exceptions\ImportCancelled;
use App\Imports\SchoolStudentsImport;
use App\Models\Form;
use App\Models\School;
use Illuminate\Contracts\Cache\Repository;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;
use Maatwebsite\Excel\Facades\Excel;
use Throwable;

class ImportSchoolStudents implements ShouldQueue
{
    use Dispatchable, Queueable;

    public int $timeout = 300;
    public int $tries = 1;

    public function __construct(
        public string $importId,
        public int $schoolId,
        public int $formId,
        public string $path,
    ) {}

    public function handle(): void
    {
        if (self::wasCancelled($this->importId)) {
            $this->finish('cancelled', 'Import cancelled. Nothing was saved.');
            return;
        }

        self::update($this->importId, [
            'status' => 'importing',
            'percent' => 0,
            'message' => 'Importing students...',
        ]);

        $import = new SchoolStudentsImport(
            School::findOrFail($this->schoolId),
            Form::findOrFail($this->formId),
            fn(int $percent) => self::update($this->importId, ['percent' => $percent]),
            fn() => self::wasCancelled($this->importId),
        );

        try {
            // All or nothing: students and any new streams are saved together, or not at all
            DB::transaction(fn() => Excel::import($import, $this->path, 'local'));

            $this->finish('done', 'Import complete.', [
                'percent' => 100,
                'result' => [
                    'imported' => $import->imported,
                    'streams_created' => $import->streamsCreated,
                    'streams_used' => count($import->byStream),
                    'skipped' => $import->skipped,
                    'failures' => $import->failures,
                    'by_stream' => $import->byStream,
                ],
            ]);
        } catch (ImportCancelled) {
            $this->finish('cancelled', 'Import cancelled. Nothing was saved.');
        } catch (InvalidArgumentException $e) {
            $this->finish('failed', $e->getMessage() . ' Nothing was saved.');
        } catch (Throwable $e) {
            Log::error('Student import failed: ' . $e->getMessage());
            $this->finish('failed', 'Something went wrong on the server. Nothing was saved, so you can safely try again.');
        }
    }

    /** Runs when the worker kills the job, for example on a timeout. The transaction has already been lost. */
    public function failed(Throwable $e): void
    {
        Log::error('Student import job failed: ' . $e->getMessage());
        $this->finish('failed', 'The import took too long or stopped. Nothing was saved, so you can safely try again.');
    }

    private function finish(string $status, string $message, array $extra = []): void
    {
        self::update($this->importId, ['status' => $status, 'message' => $message] + $extra);
        Storage::disk('local')->delete($this->path);
    }

    /* ---------------- shared state (file cache) ---------------- */

    public static function store(): Repository
    {
        return Cache::store('file');
    }

    public static function key(string $id): string
    {
        return "student-import:{$id}";
    }

    public static function state(string $id): ?array
    {
        return self::store()->get(self::key($id));
    }

    public static function update(string $id, array $changes): void
    {
        self::store()->put(self::key($id), array_merge(self::state($id) ?? [], $changes), now()->addHours(2));
    }

    public static function requestCancel(string $id): void
    {
        self::store()->put(self::key($id) . ':cancel', true, now()->addHours(2));
    }

    public static function wasCancelled(string $id): bool
    {
        return (bool) self::store()->get(self::key($id) . ':cancel');
    }
}
