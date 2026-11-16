<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ExamSchoolController extends Controller
{
    /** Page to register schools for the exam. Lists only schools not yet registered. */
    public function index(Request $request, $id, $slug)
    {
        $exam = $this->find($id, $slug)->load(['academicYear:id,name', 'form:id,name', 'subject:id,name']);
        Gate::authorize('manage', $exam);

        $search = trim((string) $request->input('search', ''));

        $schools = School::with('county:id,name')
            ->whereDoesntHave('exams', fn ($q) => $q->where('exams.id', $exam->id))
            ->when($search, fn ($q) => $q->where(fn ($q) => $q
                ->where('name', 'like', "%{$search}%")
                ->orWhereHas('county', fn ($c) => $c->where('name', 'like', "%{$search}%"))))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Exams/Schools', [
            'exam' => [
                'id' => $exam->id,
                'slug' => $exam->slug,
                'name' => $exam->name,
                'subject' => $exam->subject->name,
                'form' => $exam->form->name,
                'year' => $exam->academicYear->name,
            ],
            'schools' => $schools,
            'filters' => ['search' => $search],
        ]);
    }

    /** Registers the selected schools. Schools already registered are skipped. */
    public function store(Request $request, $id, $slug)
    {
        $exam = $this->find($id, $slug);
        Gate::authorize('manage', $exam);

        $data = $request->validate([
            'school_ids' => ['required', 'array', 'min:1'],
            'school_ids.*' => ['integer', 'exists:schools,id'],
        ], ['school_ids.required' => 'Select at least one school.']);

        $exam->schools()->syncWithoutDetaching(
            collect($data['school_ids'])
                ->mapWithKeys(fn ($schoolId) => [$schoolId => ['registered_by' => $request->user()->id]])
                ->all()
        );

        return redirect()->route('exams.show', [$exam->id, $exam->slug]);
    }

    /** Removes the school from the exam. Students and marks are not touched. */
    public function destroy($id, $slug, School $school)
    {
        $exam = $this->find($id, $slug);
        Gate::authorize('manage', $exam);

        $exam->schools()->detach($school->id);

        return back();
    }

    private function find($id, $slug): Exam
    {
        return Exam::where('id', $id)->where('slug', $slug)->firstOrFail();
    }
}