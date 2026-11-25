<?php

namespace App\Observers;

use App\Models\ExamPaper;
use App\Services\ExamSnapshotInvalidator;

class ExamPaperObserver
{
    public function __construct(protected ExamSnapshotInvalidator $invalidator)
    {
    }

    public function created(ExamPaper $examPaper): void
    {
        $this->invalidator->invalidateExam((int) $examPaper->exam_id, 'exam_paper_created');
    }

    public function updated(ExamPaper $examPaper): void
    {
        $this->invalidator->invalidateExam((int) $examPaper->exam_id, 'exam_paper_updated');
    }

    public function deleted(ExamPaper $examPaper): void
    {
        $this->invalidator->invalidateExam((int) $examPaper->exam_id, 'exam_paper_deleted');
    }
}
