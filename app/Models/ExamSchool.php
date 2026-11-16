<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExamSchool extends Model
{
    protected $fillable = ['exam_id', 'school_id', 'registered_by'];

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function registrar()
    {
        return $this->belongsTo(User::class, 'registered_by');
    }
}
