<?php

namespace App\Observers;

use App\Models\Stream;
use App\Services\ExamSnapshotInvalidator;

class StreamObserver
{
    public function __construct(protected ExamSnapshotInvalidator $invalidator)
    {
    }

    public function created(Stream $stream): void
    {
        if ($stream->school_id && $stream->form_id) {
            $this->invalidator->invalidateForSchoolAndForm(
                (int) $stream->school_id,
                (int) $stream->form_id,
                'stream_created'
            );
        }
    }

    public function updated(Stream $stream): void
    {
        if ($stream->school_id && $stream->form_id) {
            $this->invalidator->invalidateForSchoolAndForm(
                (int) $stream->school_id,
                (int) $stream->form_id,
                'stream_updated'
            );
        }
    }

    public function deleted(Stream $stream): void
    {
        if ($stream->school_id && $stream->form_id) {
            $this->invalidator->invalidateForSchoolAndForm(
                (int) $stream->school_id,
                (int) $stream->form_id,
                'stream_deleted'
            );
        }
    }
}
