<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    public const GENDERS = ['M', 'F'];

    protected $fillable = [
        'school_id',
        'form_id',
        'stream_id',
        'admission_number',
        'name',
        'gender',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function form()
    {
        return $this->belongsTo(Form::class);
    }

    public function stream()
    {
        return $this->belongsTo(Stream::class);
    }

    public function marks()
    {
        return $this->hasMany(Mark::class);
    }
}