<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    public const MAX_PAPERS = 3;

    protected $fillable = ['name', 'slug', 'code', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function papers()
    {
        return $this->hasMany(SubjectPaper::class)->orderBy('position');
    }

    public function exams()
    {
        return $this->hasMany(Exam::class);
    }
}