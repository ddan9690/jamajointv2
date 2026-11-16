<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubjectPaper extends Model
{
    protected $fillable = ['subject_id', 'name', 'code', 'position', 'slug'];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function examPapers()
    {
        return $this->hasMany(ExamPaper::class);
    }
}