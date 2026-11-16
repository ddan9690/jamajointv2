<?php

namespace App\Imports;

use App\Models\Form;
use App\Models\School;
use App\Models\Stream;
use App\Models\Student;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class SchoolStudentsImport implements ToCollection, WithHeadingRow, WithChunkReading
{
    public const MAX_ROWS = 5000;

    public int $imported = 0;
    public int $streamsCreated = 0;
    public int $skipped = 0;
    public array $failures = [];
    public array $byStream = [];

    protected $streamCache = [];
    protected bool $headersChecked = false;
    protected int $line = 1; // Account for heading row

    public function __construct(
        protected School $school,
        protected Form $form,
    ) {
    }

    public function chunkSize(): int
    {
        return 200;
    }

    public function collection(Collection $rows): void
    {
        $now = now();
        $batch = [];

        // Preload existing admission numbers for this school to prevent duplicates
        $takenAdms = Student::where('school_id', $this->school->id)
            ->pluck('admission_number')
            ->mapWithKeys(fn ($adm) => [Str::lower($adm) => true])
            ->all();

        foreach ($rows as $row) {
            $this->line++;

            // 1. Validate headers on the first data chunk row
            if (! $this->headersChecked) {
                $this->validateIncomingHeaders($row->keys()->all());
                $this->headersChecked = true;
            }

            $name = trim((string) ($row['name'] ?? ''));
            $adm = trim((string) ($row['adm'] ?? $row['admno'] ?? ''));
            $streamName = trim((string) ($row['stream'] ?? $row['str'] ?? ''));
            $rawGender = strtoupper(trim((string) ($row['gender'] ?? '')));

            // Skip empty trailing rows safely
            if ($name === '' && $adm === '' && $streamName === '') {
                continue;
            }

            // Validation rules per row
            $problem = match (true) {
                $name === '' => 'name is missing',
                mb_strlen($name) > 255 => 'name is too long',
                $adm === '' => 'admission number is missing',
                mb_strlen($adm) > 30 => 'admission number is too long',
                $streamName === '' => 'stream is missing',
                mb_strlen($streamName) > 50 || Str::slug($streamName) === '' => 'stream name is not valid',
                preg_match('/^[=+@]/', $name . '|' . $adm . '|' . $streamName) === 1 => 'values must not start with = + or @',
                isset($takenAdms[Str::lower($adm)]) => "admission number {$adm} already exists in this school",
                default => null,
            };

            if ($problem) {
                $this->skipped++;
                if (count($this->failures) < 50) {
                    $this->failures[] = "Row {$this->line}: {$problem}.";
                }
                continue;
            }

            $takenAdms[Str::lower($adm)] = true;
            $streamId = $this->resolveStreamId($streamName);

            $gender = match (true) {
                str_starts_with($rawGender, 'M') => 'M',
                str_starts_with($rawGender, 'F') => 'F',
                default => null,
            };

            $batch[] = [
                'school_id' => $this->school->id,
                'form_id' => $this->form->id,
                'stream_id' => $streamId,
                'admission_number' => $adm,
                'name' => $name,
                'gender' => $gender,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            $this->byStream[$streamName] = ($this->byStream[$streamName] ?? 0) + 1;
            $this->imported++;
        }

        if (! empty($batch)) {
            Student::insert($batch);
        }
    }

    protected function validateIncomingHeaders(array $keys): void
    {
        $hasName = in_array('name', $keys);
        $hasAdm = in_array('adm', $keys) || in_array('admno', $keys);
        $hasStream = in_array('stream', $keys) || in_array('str', $keys);

        if (! $hasName || ! $hasAdm || ! $hasStream) {
            throw new InvalidArgumentException(
                'The file structure lacks target headers. Ensure your worksheet includes columns precisely named: name, adm, and stream.'
            );
        }
    }

    private function resolveStreamId(string $streamName): int
    {
        $cacheKey = Str::slug($streamName);

        if (isset($this->streamCache[$cacheKey])) {
            return $this->streamCache[$cacheKey];
        }

        $stream = Stream::where('school_id', $this->school->id)
            ->where('form_id', $this->form->id)
            ->where('name', $streamName)
            ->first();

        if (! $stream) {
            $stream = Stream::create([
                'school_id' => $this->school->id,
                'form_id' => $this->form->id,
                'name' => $streamName,
                'slug' => Str::slug($streamName . '-' . $this->form->id . '-' . $this->school->id),
            ]);
            $this->streamsCreated++;
        }

        $this->streamCache[$cacheKey] = $stream->id;
        return $stream->id;
    }
}