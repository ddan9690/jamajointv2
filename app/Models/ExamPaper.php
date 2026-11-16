<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamPaper extends Model
{
    protected $fillable = [
        'exam_id',
        'subject_paper_id',
        'out_of',
        'percentage_contribution',
    ];

    protected function casts(): array
    {
        return [
            'out_of' => 'integer',
            'percentage_contribution' => 'float',
        ];
    }

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function subjectPaper(): BelongsTo
    {
        return $this->belongsTo(SubjectPaper::class);
    }
}
