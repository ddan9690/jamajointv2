<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GradingSystem extends Model
{
    protected $fillable = [
        'name',
        'is_default',
        'is_custom',
        'created_by',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_custom' => 'boolean',
    ];

    public function gradings(): HasMany
    {
        return $this->hasMany(Grading::class)->orderBy('min_score', 'desc');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}