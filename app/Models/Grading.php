<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grading extends Model
{
    protected $fillable = [
        'grading_system_id',
        'grade',
        'min_score',
        'max_score',
        'points',
    ];

    protected $casts = [
        'min_score' => 'integer',
        'max_score' => 'integer',
        'points' => 'integer',
    ];

    public function gradingSystem(): BelongsTo
    {
        return $this->belongsTo(GradingSystem::class);
    }
}
