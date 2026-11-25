<?php

namespace App\Observers;

use App\Models\Student;
use App\Services\ExamSnapshotInvalidator;

class StudentObserver
{
    public function __construct(protected ExamSnapshotInvalidator $invalidator)
    {
    }

    public function created(Student $student): void
    {
        if ($student->school_id && $student->form_id) {
            $this->invalidator->invalidateForSchoolAndForm(
                (int) $student->school_id,
                (int) $student->form_id,
                'student_created'
            );
        }
    }

    public function updated(Student $student): void
    {
        if ($student->school_id && $student->form_id) {
            $this->invalidator->invalidateForSchoolAndForm(
                (int) $student->school_id,
                (int) $student->form_id,
                'student_updated'
            );
        }
    }

    public function deleted(Student $student): void
    {
        if ($student->school_id && $student->form_id) {
            $this->invalidator->invalidateForSchoolAndForm(
                (int) $student->school_id,
                (int) $student->form_id,
                'student_deleted'
            );
        }
    }
}

