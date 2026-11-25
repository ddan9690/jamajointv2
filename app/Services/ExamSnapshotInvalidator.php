<?php

namespace App\Services;

use App\Jobs\BuildExamResultSnapshotJob;
use App\Models\Exam;
use App\Models\ExamPaper;
use App\Models\ExamResultSnapshot;
use App\Models\ExamSchool;
use Illuminate\Support\Facades\DB;

class ExamSnapshotInvalidator
{
    public function __construct(
        protected ExamResultSnapshotService $snapshotService,
    ) {
    }

    public function invalidateExam(int $examId, string $reason = 'exam_changed'): void
    {
        DB::afterCommit(function () use ($examId, $reason) {
            $this->retireAndQueue($examId, $reason);
        });
    }

    public function invalidateExams(iterable $examIds, string $reason = 'related_data_changed'): void
    {
        $ids = collect($examIds)->filter()->unique()->values()->all();

        if (empty($ids)) {
            return;
        }

        DB::afterCommit(function () use ($ids, $reason) {
            foreach ($ids as $examId) {
                $this->retireAndQueue((int) $examId, $reason);
            }
        });
    }

    public function invalidateForSchoolAndForm(int $schoolId, int $formId, string $reason = 'school_form_changed'): void
    {
        $examIds = Exam::where('form_id', $formId)
            ->whereHas('schools', fn ($q) => $q->where('schools.id', $schoolId))
            ->pluck('id');

        $this->invalidateExams($examIds, $reason);
    }

    public function invalidateForSchool(int $schoolId, string $reason = 'school_changed'): void
    {
        $examIds = ExamSchool::where('school_id', $schoolId)->pluck('exam_id');
        $this->invalidateExams($examIds, $reason);
    }

    public function invalidateForSubject(int $subjectId, string $reason = 'subject_changed'): void
    {
        $examIds = Exam::where('subject_id', $subjectId)->pluck('id');
        $this->invalidateExams($examIds, $reason);
    }

    public function invalidateForSubjectPaper(int $subjectPaperId, ?int $subjectId = null, string $reason = 'subject_paper_changed'): void
    {
        $byPaper = ExamPaper::where('subject_paper_id', $subjectPaperId)->pluck('exam_id');
        $bySubject = $subjectId ? Exam::where('subject_id', $subjectId)->pluck('id') : collect();

        $this->invalidateExams($byPaper->merge($bySubject), $reason);
    }

    public function invalidateForGradingSystem(int $gradingSystemId, string $reason = 'grading_system_changed'): void
    {
        $examIds = Exam::where('grading_system_id', $gradingSystemId)->pluck('id');
        $this->invalidateExams($examIds, $reason);
    }

    public function forgetExam(int $examId): void
    {
        DB::afterCommit(function () use ($examId) {
            $this->snapshotService->forgetCache($examId);
            ExamResultSnapshot::where('exam_id', $examId)
                ->where('is_current', true)
                ->update(['is_current' => false]);
        });
    }

    private function retireAndQueue(int $examId, string $reason): void
    {
        $snapshotId = null;
        $shouldDispatch = false;

        DB::transaction(function () use ($examId, $reason, &$snapshotId, &$shouldDispatch) {
            $exam = Exam::whereKey($examId)->lockForUpdate()->first();
            if (! $exam) {
                return;
            }

            ExamResultSnapshot::where('exam_id', $examId)
                ->where('is_current', true)
                ->lockForUpdate()
                ->update(['is_current' => false]);

            $nextVersion = ((int) ExamResultSnapshot::where('exam_id', $examId)->lockForUpdate()->max('version')) + 1;

            $snapshot = ExamResultSnapshot::create([
                'exam_id' => $examId,
                'version' => $nextVersion,
                'status' => ExamResultSnapshot::STATUS_PENDING,
                'is_current' => false,
                'trigger_reason' => $reason,
            ]);

            $snapshotId = $snapshot->id;
            $shouldDispatch = $exam->status === 'published';
        });

        $this->snapshotService->forgetCache($examId);

        if ($shouldDispatch && $snapshotId) {
            BuildExamResultSnapshotJob::dispatch($examId, $snapshotId, $reason);
        }
    }
}
