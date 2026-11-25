<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Services\ExamResultSnapshotService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ResultsController extends Controller
{
    public function __construct(
        protected ExamResultSnapshotService $snapshotService,
    ) {
    }

    public function index(Request $request, $id, $slug)
    {
        $exam = $this->findExam($id, $slug);
        $user = $request->user();

        abort_unless($user->isSuperAdmin() || $exam->hasSchoolId($user->school_id), 403);

        if ($user->isTeacher() && ($exam->status !== 'published' || $exam->results_visibility === 'admins_only')) {
            return redirect()->route('exams.processing', [$exam->id, $exam->slug]);
        }

        if ($exam->status !== 'published') {
            return redirect()->route('exams.processing', [$exam->id, $exam->slug]);
        }

        $snapshot = $this->snapshotService->getActiveSnapshot($exam);
        $results = $this->snapshotService->toResultsPayload($snapshot);

        return view('exams.results.index', [
            'exam' => $exam,
            'results' => $results,
            'snapshot' => $snapshot,
        ]);
    }

    public function show(Request $request, $id, $slug)
    {
        return $this->index($request, $id, $slug);
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
