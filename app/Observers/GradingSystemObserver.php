<?php

namespace App\Observers;

use App\Models\GradingSystem;
use App\Services\ExamSnapshotInvalidator;

class GradingSystemObserver
{
    public function __construct(protected ExamSnapshotInvalidator $invalidator)
    {
    }

    public function updated(GradingSystem $gradingSystem): void
    {
        $this->invalidator->invalidateForGradingSystem(
            (int) $gradingSystem->id,
            'grading_system_updated'
        );
    }

    public function deleting(GradingSystem $gradingSystem): void
    {
        $this->invalidator->invalidateForGradingSystem(
            (int) $gradingSystem->id,
            'grading_system_deleted'
        );
    }
}

