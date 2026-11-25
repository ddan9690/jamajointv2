<?php

namespace App\Observers;

use App\Models\Exam;
use App\Services\ExamSnapshotInvalidator;

class ExamObserver
{
    public function __construct(protected ExamSnapshotInvalidator $invalidator)
    {
    }

    public function updated(Exam $exam): void
    {
        // Invalidate whenever exam settings change (status, grading system, visibility, etc.)
        $this->invalidator->invalidateExam((int) $exam->id, 'exam_updated');
    }

    public function deleting(Exam $exam): void
    {
        // Clear cache before the exam and its snapshots are deleted
        $this->invalidator->forgetExam((int) $exam->id);
    }
}
