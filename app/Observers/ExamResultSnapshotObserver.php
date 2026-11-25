<?php

namespace App\Observers;

use App\Models\ExamResultSnapshot;

class ExamResultSnapshotObserver
{
    /**
     * Handle the ExamResultSnapshot "created" event.
     */
    public function created(ExamResultSnapshot $examResultSnapshot): void
    {
        //
    }

    /**
     * Handle the ExamResultSnapshot "updated" event.
     */
    public function updated(ExamResultSnapshot $examResultSnapshot): void
    {
        //
    }

    /**
     * Handle the ExamResultSnapshot "deleted" event.
     */
    public function deleted(ExamResultSnapshot $examResultSnapshot): void
    {
        //
    }

    /**
     * Handle the ExamResultSnapshot "restored" event.
     */
    public function restored(ExamResultSnapshot $examResultSnapshot): void
    {
        //
    }

    /**
     * Handle the ExamResultSnapshot "force deleted" event.
     */
    public function forceDeleted(ExamResultSnapshot $examResultSnapshot): void
    {
        //
    }
}
