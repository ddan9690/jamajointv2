<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\Exam;
use App\Models\Form;
use App\Models\GradingSystem;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ExamController extends Controller
{
    public function index(Request $request)
    {
        $search = trim($request->input('search', ''));

        $exams = Exam::query()
            ->visibleTo($request->user())
            ->with(['academicYear', 'form', 'subject', 'gradingSystem', 'creator'])
            ->when($search, fn($query, $search) => $query->where('name', 'like', "%{$search}%"))
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Exams/Index', [
            'exams' => $exams,
            'academicYears' => AcademicYear::orderBy('name', 'desc')->get(),
            'forms' => Form::orderBy('name')->get(),
            'subjects' => Subject::orderBy('name')->get(),
            'gradingSystems' => GradingSystem::orderBy('name')->get(),
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create', Exam::class);

        $validated = $request->validate($this->rules());

        DB::transaction(function () use ($validated, $request) {
            Exam::create([
                ...$validated,
                'created_by' => $request->user()->id,
                'slug' => Str::slug($validated['name'] . '-' . uniqid()),
            ]);
        });

        return redirect()->route('exams.index')->with('success', 'Exam created successfully.');
    }

    public function show(Request $request, $id, $slug)
    {
        $exam = $this->find($id, $slug)->load([
            'academicYear:id,name',
            'form:id,name',
            'subject:id,name',
        ]);

        Gate::authorize('view', $exam);

        $search = trim((string) $request->input('search', ''));

        $schools = $exam->schools()
            ->with('county:id,name')
            ->when($search, fn($q) => $q->where(fn($q) => $q
                ->where('schools.name', 'like', "%{$search}%")
                ->orWhereHas('county', fn($c) => $c->where('name', 'like', "%{$search}%"))))
            ->orderBy('schools.name')
            ->paginate(15)
            ->withQueryString()
            ->through(fn($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'county' => $s->county?->name,
                'type' => $s->type,
            ]);

        return Inertia::render('Exams/Show', [
            'exam' => [
                'id' => $exam->id,
                'slug' => $exam->slug,
                'name' => $exam->name,
                'subject' => $exam->subject->name,
                'form' => $exam->form->name,
                'year' => $exam->academicYear->name,
                'status' => $exam->status,
                'results_visibility' => $exam->results_visibility,
                'mark_submission_mode' => $exam->mark_submission_mode,
            ],
            'schools' => $schools,
            'registeredCount' => $exam->schools()->count(),
            'filters' => ['search' => $search],
            'canManage' => $request->user()->can('manage', $exam),
        ]);
    }

    public function update(Request $request, $id, $slug)
    {
        $exam = $this->find($id, $slug);
        Gate::authorize('update', $exam);

        $validated = $request->validate($this->rules());

        DB::transaction(function () use ($exam, $validated) {
            $exam->update([
                ...$validated,
                'slug' => Str::slug($validated['name'] . '-' . $exam->id),
            ]);
        });

        return redirect()->route('exams.index')->with('success', 'Exam updated successfully.');
    }

    /** Changes one setting on the fly: status, results visibility or mark submission mode. */
    public function updateSettings(Request $request, $id, $slug)
    {
        $exam = $this->find($id, $slug);
        Gate::authorize('manage', $exam);

        $data = $request->validate([
            'status' => ['sometimes', 'in:draft,published'],
            'results_visibility' => ['sometimes', 'in:public,admins_only'],
            'mark_submission_mode' => ['sometimes', 'in:teachers,admins_only'],
        ]);

        abort_if(empty($data), 422);

        $exam->update($data);

        return back();
    }

    public function destroy($id, $slug)
    {
        $exam = $this->find($id, $slug);
        Gate::authorize('delete', $exam);

        $exam->delete();

        return redirect()->route('exams.index')->with('success', 'Exam deleted successfully.');
    }

    private function find($id, $slug): Exam
    {
        return Exam::where('id', $id)->where('slug', $slug)->firstOrFail();
    }

    private function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'academic_year_id' => ['required', 'exists:academic_years,id'],
            'form_id' => ['required', 'exists:forms,id'],
            'subject_id' => ['required', 'exists:subjects,id'],
            'grading_system_id' => ['required', 'exists:grading_systems,id'],
            'status' => ['required', 'in:draft,published'],
            'results_visibility' => ['required', 'in:public,admins_only'],
            'mark_submission_mode' => ['required', 'in:teachers,admins_only'],
        ];
    }
}
