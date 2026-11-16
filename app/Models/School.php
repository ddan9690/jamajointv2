<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class School extends Model
{
    public const TYPES = ['boys', 'girls', 'mixed'];

    protected $fillable = ['county_id', 'name', 'slug', 'type'];

    public function county()
    {
        return $this->belongsTo(County::class);
    }

    public function streams()
    {
        return $this->hasMany(Stream::class);
    }

    public function students()
    {
        return $this->hasMany(Student::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function exams()
    {
        return $this->belongsToMany(Exam::class, 'exam_schools')->withTimestamps();
    }

    /**
     * Schools a user may reach.
     * Super admin: all. Exam admin: schools in an exam they administer,
     * where the admin's own school also takes part. Everyone else: none.
     */
    public function scopeManageableBy($query, User $user)
    {
        if ($user->isSuperAdmin()) {
            return $query;
        }

        if (! $user->isExamAdmin() || ! $user->school_id) {
            return $query->whereRaw('1 = 0');
        }

        return $query->whereHas('exams', fn ($exam) => $exam
            ->whereHas('admins', fn ($a) => $a->where('users.id', $user->id))
            ->whereHas('schools', fn ($s) => $s->where('schools.id', $user->school_id)));
    }
}