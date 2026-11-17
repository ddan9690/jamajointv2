<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class ExamAdmin extends Pivot
{
    protected $table = 'exam_admins';

    protected $fillable = [
        'exam_id',
        'user_id',
        'added_by',
    ];

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function addedBy()
    {
        return $this->belongsTo(User::class, 'added_by');
    }
}