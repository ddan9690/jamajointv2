<?php

namespace App\Jobs;

use App\Services\ExamResultSnapshotService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class BuildExamResultSnapshotJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 300;

    public function __construct(
        public int $examId,
        public ?int $snapshotId = null,
        public string $triggerReason = 'queued',
    ) {
    }

    public function handle(ExamResultSnapshotService $snapshotService): void
    {
        $snapshotService->build($this->examId, $this->snapshotId, $this->triggerReason);
    }
}
