<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\ExamPaper;
use App\Models\Mark;
use App\Models\School;
use App\Models\Stream;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MarkEntryController extends Controller
{
    /** Admins see a table of participating schools. Teachers go to their school or processing page. */
    public function index(Request $request, $id, $slug)
    {
        $exam = $this->exam($id, $slug);
        $user = $request->user();

        if ($this->isAdminForExam($user, $exam)) {
            $schoolsList = $exam->schools()
                ->with('county:id,name')
                ->orderBy('schools.name')
                ->get();

            $schoolIds = $schoolsList->pluck('id');

            $studentCounts = Student::where('form_id', $exam->form_id)
                ->whereIn('school_id', $schoolIds)
                ->selectRaw('school_id, COUNT(*) as c')
                ->groupBy('school_id')
                ->pluck('c', 'school_id');

            $submittedCounts = Mark::where('marks.exam_id', $exam->id)
                ->whereNotNull('marks.score')
                ->join('students', 'students.id', '=', 'marks.student_id')
                ->whereIn('students.school_id', $schoolIds)
                ->selectRaw('students.school_id, COUNT(*) as c')
                ->groupBy('students.school_id')
                ->pluck('c', 'students.school_id');

            $schools = $schoolsList->map(fn (School $school) => [
                'id' => $school->id,
                'slug' => $school->slug,
                'name' => $school->name,
                'county' => $school->county?->name,
                'type' => $school->type,
                'students_count' => (int) ($studentCounts[$school->id] ?? 0),
                'has_submitted' => (int) ($submittedCounts[$school->id] ?? 0) > 0,
            ]);

            return Inertia::render('Marks/Schools', [
                'exam' => $this->examData($exam),
                'schools' => $schools,
            ]);
        }

        abort_unless($exam->hasSchoolId($user->school_id) && $user->school, 403);

        if ($exam->status === 'published') {
            return redirect()->route('exams.results.show', [$exam->id, $exam->slug]);
        }

        if ($exam->mark_submission_mode !== 'teachers') {
            return redirect()->route('exams.processing', [$exam->id, $exam->slug]);
        }

        return redirect()->route('exams.marks.school', [
            $exam->id,
            $exam->slug,
            $user->school->id,
            $user->school->slug,
        ]);
    }

    /** School & Streams table for an exam. */
    public function school(Request $request, $id, $slug, School $school, string $schoolSlug)
    {
        $exam = $this->exam($id, $slug);
        $user = $request->user();

        if ($redirect = $this->guardAccess($user, $exam, $school, $schoolSlug)) {
            return $redirect;
        }

        $school->loadMissing('county:id,name');

        $streamModels = Stream::where('school_id', $school->id)
            ->where('form_id', $exam->form_id)
            ->withCount('students')
            ->orderBy('name')
            ->get();

        $submittedByStream = Mark::where('marks.exam_id', $exam->id)
            ->whereNotNull('marks.score')
            ->join('students', 'students.id', '=', 'marks.student_id')
            ->where('students.school_id', $school->id)
            ->where('students.form_id', $exam->form_id)
            ->selectRaw('students.stream_id, COUNT(*) as c')
            ->groupBy('students.stream_id')
            ->pluck('c', 'students.stream_id');

        $streams = $streamModels->map(fn (Stream $st) => [
            'id' => $st->id,
            'slug' => $st->slug,
            'name' => $st->name,
            'students_count' => (int) $st->students_count,
            'has_submitted' => (int) ($submittedByStream[$st->id] ?? 0) > 0,
        ]);

        return Inertia::render('Marks/School', [
            'exam' => $this->examData($exam),
            'school' => $this->schoolData($school),
            'streams' => $streams,
            'backUrl' => $this->isAdminForExam($user, $exam)
                ? route('exams.marks.index', [$exam->id, $exam->slug])
                : route('dashboard'),
        ]);
    }

    /** Papers table for a selected stream. */
    public function stream(Request $request, $id, $slug, School $school, string $schoolSlug, Stream $stream, string $streamSlug)
    {
        $exam = $this->exam($id, $slug);
        $user = $request->user();

        if ($redirect = $this->guardAccess($user, $exam, $school, $schoolSlug)) {
            return $redirect;
        }

        $this->checkStream($exam, $school, $stream, $streamSlug);
        $school->loadMissing('county:id,name');

        $examPapers = $exam->papers()
            ->join('subject_papers', 'subject_papers.id', '=', 'exam_papers.subject_paper_id')
            ->orderBy('subject_papers.position')
            ->orderBy('exam_papers.id')
            ->select(
                'exam_papers.id',
                'exam_papers.out_of',
                'exam_papers.percentage_contribution',
                'subject_papers.name as paper_name',
                'subject_papers.code as paper_code',
                'subject_papers.position as paper_position'
            )
            ->get();

        $submittedByPaper = Mark::where('marks.exam_id', $exam->id)
            ->whereNotNull('marks.score')
            ->join('students', 'students.id', '=', 'marks.student_id')
            ->where('students.stream_id', $stream->id)
            ->selectRaw('marks.exam_paper_id, COUNT(*) as c')
            ->groupBy('marks.exam_paper_id')
            ->pluck('c', 'marks.exam_paper_id');

        $papers = $examPapers->map(fn ($p) => [
            'id' => $p->id,
            'name' => $p->paper_name,
            'code' => $p->paper_code,
            'position' => $p->paper_position,
            'out_of' => $p->out_of,
            'percentage_contribution' => (float) $p->percentage_contribution,
            'has_submitted' => (int) ($submittedByPaper[$p->id] ?? 0) > 0,
        ]);

        return Inertia::render('Marks/Stream', [
            'exam' => $this->examData($exam),
            'school' => $this->schoolData($school),
            'stream' => [
                'id' => $stream->id,
                'slug' => $stream->slug,
                'name' => $stream->name,
                'form' => $exam->form->name,
            ],
            'papers' => $papers,
        ]);
    }

    /** Student marks entry table for a stream and paper. */
    public function entry(Request $request, $id, $slug, School $school, string $schoolSlug, Stream $stream, string $streamSlug, ExamPaper $paper)
    {
        $exam = $this->exam($id, $slug);
        $user = $request->user();

        if ($redirect = $this->guardAccess($user, $exam, $school, $schoolSlug)) {
            return $redirect;
        }

        $this->checkStream($exam, $school, $stream, $streamSlug);
        abort_unless($paper->exam_id === $exam->id, 404);

        $paper->loadMissing('subjectPaper:id,name,code');
        $school->loadMissing('county:id,name');

        $students = Student::where('stream_id', $stream->id)
            ->orderByRaw('LENGTH(admission_number), admission_number')
            ->get(['id', 'admission_number', 'name', 'gender']);

        $scores = Mark::where('exam_paper_id', $paper->id)
            ->whereIn('student_id', $students->pluck('id'))
            ->pluck('score', 'student_id');

        return Inertia::render('Marks/Entry', [
            'exam' => $this->examData($exam),
            'school' => $this->schoolData($school),
            'stream' => [
                'id' => $stream->id,
                'slug' => $stream->slug,
                'name' => $stream->name,
                'form' => $exam->form->name,
            ],
            'paper' => [
                'id' => $paper->id,
                'name' => $paper->subjectPaper?->name ?? 'Paper',
                'code' => $paper->subjectPaper?->code,
                'out_of' => $paper->out_of,
            ],
            'students' => $students->map(fn ($s) => [
                'id' => $s->id,
                'admission_number' => $s->admission_number,
                'name' => $s->name,
                'gender' => $s->gender,
                'score' => $scores[$s->id] ?? null,
            ]),
        ]);
    }

    /** Mass-submits marks for all students in a stream for a specific paper. */
    public function store(Request $request, $id, $slug, School $school, string $schoolSlug, Stream $stream, string $streamSlug, ExamPaper $paper)
    {
        $exam = $this->exam($id, $slug);
        $this->authorizeStore($request->user(), $exam, $school, $schoolSlug);
        $this->checkStream($exam, $school, $stream, $streamSlug);
        abort_unless($paper->exam_id === $exam->id, 404);

        $data = $request->validate([
            'marks' => ['required', 'array', 'min:1'],
            'marks.*.student_id' => ['required', 'integer'],
            'marks.*.score' => ['nullable', 'integer', 'min:0', 'max:100'],
        ], [
            'marks.*.score.integer' => 'Marks must be a whole number between 0 and 100.',
            'marks.*.score.min' => 'Marks must be between 0 and 100.',
            'marks.*.score.max' => 'Marks must be between 0 and 100.',
        ]);

        $incoming = collect($data['marks']);

        // Only students of this stream are accepted
        $valid = Student::where('stream_id', $stream->id)
            ->whereIn('id', $incoming->pluck('student_id'))
            ->pluck('id');
        $now = now();

        $rows = $incoming->whereIn('student_id', $valid)->map(fn ($m) => [
            'exam_id' => $exam->id,
            'exam_paper_id' => $paper->id,
            'student_id' => $m['student_id'],
            'score' => $m['score'] ?? null,
            'submitted_by' => $request->user()->id,
            'created_at' => $now,
            'updated_at' => $now,
        ])->values()->all();

        Mark::upsert($rows, ['exam_paper_id', 'student_id'], ['score', 'submitted_by', 'updated_at']);

        return response()->json(['saved' => count($rows)]);
    }

    /* ------------------------------------------------------------ */

    private function isAdminForExam(User $user, Exam $exam): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->isExamAdmin() && $exam->hasSchoolId($user->school_id)) {
            return true;
        }

        return $exam->isManagedBy($user);
    }

    private function guardAccess(User $user, Exam $exam, School $school, string $schoolSlug): ?RedirectResponse
    {
        abort_unless($school->slug === $schoolSlug, 404);

        if ($this->isAdminForExam($user, $exam)) {
            abort_unless($exam->hasSchoolId($school->id), 404);
            return null;
        }

        abort_unless(
            $exam->hasSchoolId($user->school_id) && $school->id === $user->school_id,
            403
        );

        if ($exam->status === 'published') {
            return redirect()->route('exams.results.show', [$exam->id, $exam->slug]);
        }

        if ($exam->mark_submission_mode !== 'teachers') {
            return redirect()->route('exams.processing', [$exam->id, $exam->slug]);
        }

        return null;
    }

    private function authorizeStore(User $user, Exam $exam, School $school, string $schoolSlug): void
    {
        abort_unless($school->slug === $schoolSlug, 404);

        if ($this->isAdminForExam($user, $exam)) {
            abort_unless($exam->hasSchoolId($school->id), 404);
            return;
        }

        abort_unless(
            $exam->mark_submission_mode === 'teachers'
                && $exam->status !== 'published'
                && $exam->hasSchoolId($user->school_id)
                && $school->id === $user->school_id,
            403
        );
    }

    private function checkStream(Exam $exam, School $school, Stream $stream, string $streamSlug): void
    {
        abort_unless(
            $stream->school_id === $school->id && $stream->slug === $streamSlug && $stream->form_id === $exam->form_id,
            404
        );
    }

    private function exam($id, $slug): Exam
    {
        return Exam::where('id', $id)->where('slug', $slug)
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
        ];
    }

    private function schoolData(School $school): array
    {
        return [
            'id' => $school->id,
            'slug' => $school->slug,
            'name' => $school->name,
            'county' => $school->county?->name,
            'type' => $school->type,
        ];
    }
}