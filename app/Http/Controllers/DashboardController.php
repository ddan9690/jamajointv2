<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\ExamSchool;
use App\Models\School;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $isSuperAdmin = $user->isSuperAdmin();

        $examQuery = Exam::with([
            'academicYear:id,name',
            'form:id,name',
            'subject:id,name',
            'gradingSystem:id,name',
        ])->latest();

        if ($isSuperAdmin) {
            $exams = $examQuery->get();
            $stats = [
                ['label' => 'Exams', 'value' => $exams->count()],
                ['label' => 'Schools', 'value' => School::count()],
                ['label' => 'Teachers', 'value' => User::where('role', 'teacher')->count()],
                ['label' => 'Total users', 'value' => User::count()],
            ];
        } else {
            $exams = ($user->isTeacher() || $user->isExamAdmin()) && $user->school_id
                ? $examQuery
                    ->whereIn('id', ExamSchool::where('school_id', $user->school_id)->select('exam_id'))
                    ->get()
                : collect();

            $stats = [
                ['label' => 'Exams', 'value' => $exams->count()],
            ];
        }

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'exams' => $exams->map(fn (Exam $exam) => $this->card($exam)),
            'isSuperAdmin' => $isSuperAdmin,
        ]);
    }

    /** Users active in the last 2 minutes (super admin only). Needs a last_active_at column on users. */
    public function onlineList(Request $request)
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        return User::with('school:id,name')
            ->where('last_active_at', '>=', now()->subMinutes(2))
            ->orderBy('name')
            ->get(['id', 'name', 'school_id', 'phone']);
    }

    private function card(Exam $exam): array
    {
        return [
            'id' => $exam->id,
            'slug' => $exam->slug,
            'name' => $exam->name,
            'year' => $exam->academicYear?->name,
            'form' => $exam->form?->name,
            'subject' => $exam->subject?->name,
            'grading_system' => $exam->gradingSystem?->name,
            'status' => $exam->status,
        ];
    }
}