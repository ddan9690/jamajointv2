<?php

namespace App\Http\Controllers;

use App\Models\County;
use App\Models\Form;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SchoolController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('viewAny', School::class);

        $schools = School::with('county:id,name')
            ->withCount('students')
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Schools/Index', [
            'schools' => $schools,
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        Gate::authorize('create', School::class);

        return Inertia::render('Schools/Create', [
            'counties' => County::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create', School::class);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:schools,name'],
            'county_id' => ['required', 'exists:counties,id'],
            'type' => ['required', Rule::in(School::TYPES)],
        ]);

        $data['slug'] = $this->makeSlug($data['name']);

        School::create($data);

        return redirect()->route('schools.index');
    }

    /** School page: every form, with this school's streams under it. */
    public function show(Request $request, School $school, string $slug)
    {
        Gate::authorize('view', $school);
        abort_unless($school->slug === $slug, 404);

        $forms = Form::orderBy('level')
            ->with(['streams' => fn($q) => $q
                ->where('school_id', $school->id)
                ->withCount('students')
                ->orderBy('name')])
            ->get();

        $teachers = $school->users()
            ->whereIn('role', ['teacher', 'exam_admin'])
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'phone']);

        return Inertia::render('Schools/Show', [
            'school' => [
                'id' => $school->id,
                'slug' => $school->slug,
                'name' => $school->name,
                'type' => $school->type,
                'county' => $school->county?->name,
            ],
            'forms' => $forms->map(fn($form) => [
                'id' => $form->id,
                'name' => $form->name,
                'streams' => $form->streams->map(fn($s) => [
                    'id' => $s->id,
                    'slug' => $s->slug,
                    'name' => $s->name,
                    'students_count' => $s->students_count,
                ]),
            ]),
            'teachers' => $teachers->map(fn($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'phone' => $t->phone,
            ]),
            'canEditSchool' => $request->user()->can('update', $school),
        ]);
    }

    public function edit(School $school, string $slug)
    {
        Gate::authorize('update', $school);
        abort_unless($school->slug === $slug, 404);

        return Inertia::render('Schools/Edit', [
            'school' => $school->only('id', 'slug', 'name', 'county_id', 'type'),
            'counties' => County::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, School $school, string $slug)
    {
        Gate::authorize('update', $school);
        abort_unless($school->slug === $slug, 404);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('schools', 'name')->ignore($school->id)],
            'county_id' => ['required', 'exists:counties,id'],
            'type' => ['required', Rule::in(School::TYPES)],
        ]);

        if ($data['name'] !== $school->name) {
            $data['slug'] = $this->makeSlug($data['name'], $school->id);
        }

        $school->update($data);

        return redirect()->route('schools.show', [$school->id, $school->slug]);
    }

    public function destroy(School $school, string $slug)
    {
        Gate::authorize('delete', $school);
        abort_unless($school->slug === $slug, 404);

        if ($school->exams()->exists()) {
            return back()->withErrors(['delete' => 'This school is registered in an exam and cannot be deleted.']);
        }

        $school->delete();

        return redirect()->route('schools.index');
    }

    private function makeSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;

        while (School::where('slug', $slug)->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = $base . '-' . Str::lower(Str::random(4));
        }

        return $slug;
    }
}