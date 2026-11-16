<?php

namespace App\Policies;

use App\Models\Exam;
use App\Models\User;

class ExamPolicy
{
    // The super admin is approved by Gate::before.

    /** See the exam: the user's school must take part. */
    public function view(User $user, Exam $exam): bool
    {
        return $exam->hasSchoolId($user->school_id);
    }

    /** Settings and school registration: assigned exam admin whose school takes part. */
    public function manage(User $user, Exam $exam): bool
    {
        return $exam->isManagedBy($user);
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, Exam $exam): bool
    {
        return false;
    }

    public function delete(User $user, Exam $exam): bool
    {
        return false;
    }
}