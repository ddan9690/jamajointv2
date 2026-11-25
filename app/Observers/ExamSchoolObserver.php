<?php

namespace App\Observers;

use App\Models\ExamSchool;
use App\Services\ExamSnapshotInvalidator;

class ExamSchoolObserver
{
    public function __construct(protected ExamSnapshotInvalidator $invalidator)
    {
    }

    public function created(ExamSchool $examSchool): void
    {
        $this->invalidator->invalidateExam((int) $examSchool->exam_id, 'school_registered');
    }

    public function deleted(ExamSchool $examSchool): void
    {
        $this->invalidator->invalidateExam((int) $examSchool->exam_id, 'school_deregistered');
    }
}
