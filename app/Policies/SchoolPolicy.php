<?php

namespace App\Policies;

use App\Models\School;
use App\Models\User;

class SchoolPolicy
{
    // Only the super admin manages schools (approved by Gate::before).
    // Exam admin access will be added later through the exam-school logic.

    public function viewAny(User $user): bool
    {
        return false;
    }

    public function view(User $user, School $school): bool
    {
        return false;
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, School $school): bool
    {
        return false;
    }

    public function delete(User $user, School $school): bool
    {
        return false;
    }

    /** Streams and students inside the school. */
    public function manage(User $user, School $school): bool
    {
        return false;
    }
}