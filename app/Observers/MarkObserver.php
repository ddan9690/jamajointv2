<?php

namespace App\Observers;

use App\Models\Mark;
use App\Services\ExamSnapshotInvalidator;

class MarkObserver
{
    public function __construct(protected ExamSnapshotInvalidator $invalidator)
    {
    }

    public function created(Mark $mark): void
    {
        $this->invalidator->invalidateExam((int) $mark->exam_id, 'mark_created');
    }

    public function updated(Mark $mark): void
    {
        $this->invalidator->invalidateExam((int) $mark->exam_id, 'mark_updated');
    }

    public function deleted(Mark $mark): void
    {
        $this->invalidator->invalidateExam((int) $mark->exam_id, 'mark_deleted');
    }
}

