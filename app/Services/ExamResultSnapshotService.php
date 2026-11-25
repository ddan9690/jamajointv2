<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\ExamResultSnapshot;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class ExamResultSnapshotService
{
    public function __construct(
        protected ExamResultService $resultService,
    ) {
    }

    public function cacheKey(int $examId): string
    {
        return "exam:{$examId}:result_snapshot:current";
    }

    public function forgetCache(int $examId): void
    {
        try {
            Cache::store('redis')->forget($this->cacheKey($examId));
        } catch (Throwable $e) {
            Log::warning("Redis cache forget failed for exam {$examId}: {$e->getMessage()}");
        }
    }

    /**
     * Fetch the active ready snapshot from Redis cache (falling back to DB or on-demand build).
     */
    public function getActiveSnapshot(Exam $exam): ExamResultSnapshot
    {
        $key = $this->cacheKey($exam->id);

        try {
            $cached = Cache::store('redis')->get($key);
            if ($cached instanceof ExamResultSnapshot && $cached->is_current && $cached->status === ExamResultSnapshot::STATUS_READY) {
                return $cached;
            }
        } catch (Throwable $e) {
            Log::warning("Redis cache read failed for exam {$exam->id}: {$e->getMessage()}");
        }

        $current = ExamResultSnapshot::where('exam_id', $exam->id)
            ->where('is_current', true)
            ->where('status', ExamResultSnapshot::STATUS_READY)
            ->latest('version')
            ->first();

        if ($current) {
            $this->putCache($current);
            return $current;
        }

        $pending = ExamResultSnapshot::where('exam_id', $exam->id)
            ->where('status', ExamResultSnapshot::STATUS_PENDING)
            ->latest('version')
            ->first();

        $built = $this->build($exam->id, $pending?->id, $pending?->trigger_reason ?? 'on_demand');

        if ($built && $built->status === ExamResultSnapshot::STATUS_READY) {
            return $built;
        }

        return ExamResultSnapshot::where('exam_id', $exam->id)
            ->where('is_current', true)
            ->where('status', ExamResultSnapshot::STATUS_READY)
            ->latest('version')
            ->firstOrFail();
    }

    /**
     * Compute and persist a snapshot version safely under pessimistic locks.
     */
    public function build(int $examId, ?int $snapshotId = null, string $triggerReason = 'manual'): ?ExamResultSnapshot
    {
        $exam = Exam::find($examId);
        if (! $exam) {
            $this->forgetCache($examId);
            return null;
        }

        $snapshot = DB::transaction(function () use ($examId, $snapshotId, $triggerReason) {
            Exam::whereKey($examId)->lockForUpdate()->first();

            $existing = $snapshotId
                ? ExamResultSnapshot::where('exam_id', $examId)->whereKey($snapshotId)->lockForUpdate()->first()
                : null;

            if ($existing) {
                $existing->update([
                    'status' => ExamResultSnapshot::STATUS_PROCESSING,
                    'error_message' => null,
                ]);
                return $existing;
            }

            $nextVersion = ((int) ExamResultSnapshot::where('exam_id', $examId)->lockForUpdate()->max('version')) + 1;

            return ExamResultSnapshot::create([
                'exam_id' => $examId,
                'version' => $nextVersion,
                'status' => ExamResultSnapshot::STATUS_PROCESSING,
                'is_current' => false,
                'trigger_reason' => $triggerReason,
            ]);
        });

        try {
            $computed = $this->resultService->compute($exam);

            $finalSnapshot = DB::transaction(function () use ($examId, $snapshot, $computed) {
                $lockedSnapshots = ExamResultSnapshot::where('exam_id', $examId)->lockForUpdate()->get();
                $maxVersion = (int) $lockedSnapshots->max('version');
                $isLatestVersion = $snapshot->version >= $maxVersion;

                if ($isLatestVersion) {
                    ExamResultSnapshot::where('exam_id', $examId)
                        ->where('id', '!=', $snapshot->id)
                        ->where('is_current', true)
                        ->update(['is_current' => false]);
                }

                $snapshot->update([
                    ...$computed,
                    'status' => ExamResultSnapshot::STATUS_READY,
                    'is_current' => $isLatestVersion,
                    'error_message' => null,
                    'computed_at' => now(),
                ]);

                return $snapshot->fresh();
            });

            if ($finalSnapshot && $finalSnapshot->is_current) {
                $this->putCache($finalSnapshot);
            }

            return $finalSnapshot;
        } catch (Throwable $e) {
            $snapshot->update([
                'status' => ExamResultSnapshot::STATUS_FAILED,
                'is_current' => false,
                'error_message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function toResultsPayload(ExamResultSnapshot $snapshot): array
    {
        return [
            'version' => $snapshot->version,
            'status' => $snapshot->status,
            'computed_at' => $snapshot->computed_at,
            'participating_schools_count' => (int) $snapshot->participating_schools_count,
            'total_students_count' => (int) $snapshot->total_students_count,
            'male_students_count' => (int) $snapshot->male_students_count,
            'female_students_count' => (int) $snapshot->female_students_count,
            'mean_score' => number_format((float) ($snapshot->mean_score ?? 0), 4, '.', ''),
            'mean_grade' => $snapshot->mean_grade,
            'pass_percentage' => number_format((float) ($snapshot->pass_percentage ?? 0), 2, '.', ''),
            'paper_performance' => $snapshot->paper_performance ?? [],
        ];
    }

    private function putCache(ExamResultSnapshot $snapshot): void
    {
        try {
            $cacheable = clone $snapshot;
            $cacheable->setRelations([]);

            Cache::store('redis')->put(
                $this->cacheKey($snapshot->exam_id),
                $cacheable,
                now()->addHours(24)
            );
        } catch (Throwable $e) {
            Log::warning("Redis cache write failed for exam {$snapshot->exam_id}: {$e->getMessage()}");
        }
    }
}
