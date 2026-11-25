<?php

namespace App\Observers;

use App\Models\Grading;
use App\Services\ExamSnapshotInvalidator;

class GradingObserver
{
    public function __construct(protected ExamSnapshotInvalidator $invalidator)
    {
    }

    public function created(Grading $grading): void
    {
        $this->invalidator->invalidateForGradingSystem(
            (int) $grading->grading_system_id,
            'grading_band_created'
        );
    }

    public function updated(Grading $grading): void
    {
        $this->invalidator->invalidateForGradingSystem(
            (int) $grading->grading_system_id,
            'grading_band_updated'
        );
    }

    public function deleted(Grading $grading): void
    {
        $this->invalidator->invalidateForGradingSystem(
            (int) $grading->grading_system_id,
            'grading_band_deleted'
        );
    }
}

