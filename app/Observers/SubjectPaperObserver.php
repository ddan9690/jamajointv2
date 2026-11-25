<?php

namespace App\Observers;

use App\Models\SubjectPaper;
use App\Services\ExamSnapshotInvalidator;

class SubjectPaperObserver
{
    public function __construct(protected ExamSnapshotInvalidator $invalidator)
    {
    }

    public function updated(SubjectPaper $subjectPaper): void
    {
        $this->invalidator->invalidateForSubjectPaper(
            (int) $subjectPaper->id,
            (int) $subjectPaper->subject_id,
            'subject_paper_updated'
        );
    }

    public function deleted(SubjectPaper $subjectPaper): void
    {
        $this->invalidator->invalidateForSubjectPaper(
            (int) $subjectPaper->id,
            (int) $subjectPaper->subject_id,
            'subject_paper_deleted'
        );
    }
}
