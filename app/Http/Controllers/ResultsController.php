<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ResultsController extends Controller
{
    public function show(Request $request, $id, $slug)
    {
        $exam = $this->findExam($id, $slug);
        $user = $request->user();

        abort_unless($user->isSuperAdmin() || $exam->hasSchoolId($user->school_id), 403);

        if (! ($user->isSuperAdmin() || $user->isExamAdmin())
            && ($exam->status !== 'published' || $exam->results_visibility === 'admins_only')) {
            return redirect()->route('exams.processing', [$exam->id, $exam->slug]);
        }

        return Inertia::render('Results/Index', [
            'exam' => $this->examData($exam),
        ]);
    }

    public function processing(Request $request, $id, $slug)
    {
        $exam = $this->findExam($id, $slug);
        $user = $request->user();

        abort_unless($user->isSuperAdmin() || $exam->hasSchoolId($user->school_id), 403);

        return Inertia::render('Exams/Processing', [
            'exam' => $this->examData($exam),
        ]);
    }

    private function findExam($id, $slug): Exam
    {
        return Exam::where('id', $id)
            ->where('slug', $slug)
            ->with(['subject:id,name', 'form:id,name', 'academicYear:id,name', 'gradingSystem:id,name'])
            ->firstOrFail();
    }

    private function examData(Exam $exam): array
    {
        return [
            'id' => $exam->id,
            'slug' => $exam->slug,
            'name' => $exam->name,
            'subject' => $exam->subject?->name,
            'form' => $exam->form?->name,
            'year' => $exam->academicYear?->name,
            'grading_system' => $exam->gradingSystem?->name,
            'status' => $exam->status,
            'results_visibility' => $exam->results_visibility,
        ];
    }
}
