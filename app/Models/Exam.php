<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Exam extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /* ---------------------------------------------------------------
     | Relationships
     |--------------------------------------------------------------- */

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function form()
    {
        return $this->belongsTo(Form::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function papers(): HasMany
    {
        return $this->hasMany(ExamPaper::class);
    }

    public function gradingSystem()
    {
        return $this->belongsTo(GradingSystem::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function examPapers()
    {
        return $this->hasMany(ExamPaper::class);
    }

    public function marks()
    {
        return $this->hasMany(Mark::class);
    }

    /** Schools registered to take part in this exam. */
    public function schools()
    {
        return $this->belongsToMany(School::class, 'exam_schools')
            ->withPivot('registered_by')
            ->withTimestamps();
    }

    /** Users assigned as exam admins. */
    public function admins()
    {
        return $this->belongsToMany(User::class, 'exam_admins')
            ->withPivot('added_by')
            ->withTimestamps();
    }

    public function invitations()
    {
        return $this->hasMany(ExamAdminInvitation::class);
    }

    /* ---------------------------------------------------------------
     | Authorization helpers
     |--------------------------------------------------------------- */

    public function hasSchool(School $school): bool
    {
        return $this->hasSchoolId($school->id);
    }

    public function hasSchoolId(?int $schoolId): bool
    {
        return $schoolId !== null && $this->schools()->whereKey($schoolId)->exists();
    }

    /**
     * Can the user manage this exam?
     * Super admin: always.
     * Exam admin: must be assigned to the exam AND their school must take part in it.
     */
    public function isManagedBy(User $user): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $this->hasSchoolId($user->school_id)
            && $this->admins()->whereKey($user->id)->exists();
    }

    /* ---------------------------------------------------------------
     | Scopes
     |--------------------------------------------------------------- */

    /**
     * Exams a user may see on the dashboard:
     * all for a super admin, otherwise only those their school is registered in.
     */
    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        if ($user->isSuperAdmin()) {
            return $query;
        }

        return $query->whereHas(
            'schools',
            fn(Builder $q) => $q->where('schools.id', $user->school_id)
        );
    }
}
