<?php

namespace App\Providers;

use App\Models\Exam;
use App\Models\ExamPaper;
use App\Models\ExamSchool;
use App\Models\Grading;
use App\Models\GradingSystem;
use App\Models\Mark;
use App\Models\School;
use App\Models\Stream;
use App\Models\Student;
use App\Models\Subject;
use App\Models\SubjectPaper;
use App\Observers\ExamObserver;
use App\Observers\ExamPaperObserver;
use App\Observers\ExamSchoolObserver;
use App\Observers\GradingObserver;
use App\Observers\GradingSystemObserver;
use App\Observers\MarkObserver;
use App\Observers\SchoolObserver;
use App\Observers\StreamObserver;
use App\Observers\StudentObserver;
use App\Observers\SubjectObserver;
use App\Observers\SubjectPaperObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Exam::observe(ExamObserver::class);
        ExamPaper::observe(ExamPaperObserver::class);
        ExamSchool::observe(ExamSchoolObserver::class);
        Grading::observe(GradingObserver::class);
        GradingSystem::observe(GradingSystemObserver::class);
        Mark::observe(MarkObserver::class);
        School::observe(SchoolObserver::class);
        Stream::observe(StreamObserver::class);
        Student::observe(StudentObserver::class);
        Subject::observe(SubjectObserver::class);
        SubjectPaper::observe(SubjectPaperObserver::class);
    }
}
