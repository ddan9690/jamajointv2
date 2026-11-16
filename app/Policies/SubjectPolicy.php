<?php

namespace App\Policies;

use App\Models\Subject;
use App\Models\User;

class SubjectPolicy
{
    public function viewAny(User $user): bool
    {
        return false;
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, Subject $subject): bool
    {
        return false;
    }

    public function delete(User $user, Subject $subject): bool
    {
        return false;
    }

    /** Papers of a subject. */
    public function manage(User $user, Subject $subject): bool
    {
        return false;
    }
}