<?php

namespace App\Observers;

use App\Models\Subject;
use App\Services\ExamSnapshotInvalidator;

class SubjectObserver
{
    public function __construct(protected ExamSnapshotInvalidator $invalidator)
    {
    }

    public function updated(Subject $subject): void
    {
        $this->invalidator->invalidateForSubject((int) $subject->id, 'subject_updated');
    }

    public function deleting(Subject $subject): void
    {
        $this->invalidator->invalidateForSubject((int) $subject->id, 'subject_deleted');
    }
}
