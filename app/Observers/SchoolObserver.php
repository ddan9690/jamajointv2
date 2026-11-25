<?php

namespace App\Observers;

use App\Models\School;
use App\Services\ExamSnapshotInvalidator;

class SchoolObserver
{
    public function __construct(protected ExamSnapshotInvalidator $invalidator)
    {
    }

    public function updated(School $school): void
    {
        // School name/type changes affect school_rankings display
        $this->invalidator->invalidateForSchool((int) $school->id, 'school_updated');
    }
}

