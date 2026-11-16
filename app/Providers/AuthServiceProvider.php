<?php

namespace App\Providers;

use App\Models\Exam;
use App\Models\School;
use App\Models\Subject;
use App\Models\User;
use App\Policies\ExamPolicy;
use App\Policies\SchoolPolicy;
use App\Policies\SubjectPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Super admin passes every check. Returning null lets other users fall through to the policies.
        Gate::before(fn (User $user) => $user->isSuperAdmin() ? true : null);

        $this->policies();
        $this->gates();
    }

    /** One policy per model. Add new ones here as we build them. */
    private function policies(): void
    {
        Gate::policy(School::class, SchoolPolicy::class);
        Gate::policy(Exam::class, ExamPolicy::class);
        Gate::policy(Subject::class, SubjectPolicy::class);
    }

    /** Standalone gates that don't belong to a model. Added gradually. */
    private function gates(): void
    {
        //
    }
}