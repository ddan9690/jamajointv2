<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index()
    {
        return Inertia::render('Subjects/Index', [
            'subjects' => Subject::withCount('papers')
                ->orderBy('name')
                ->get(['id', 'name', 'slug', 'code', 'is_active']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules());

        $data['slug'] = $this->makeSlug($data['name']);

        Subject::create($data);

        return back();
    }

    public function update(Request $request, Subject $subject, string $slug)
    {
        abort_unless($subject->slug === $slug, 404);

        $data = $request->validate($this->rules($subject));

        if ($data['name'] !== $subject->name) {
            $data['slug'] = $this->makeSlug($data['name'], $subject->id);
        }

        $subject->update($data);

        return back();
    }

    /** Switches the subject between active and inactive. */
    public function toggle(Subject $subject, string $slug)
    {
        abort_unless($subject->slug === $slug, 404);

        $subject->update(['is_active' => ! $subject->is_active]);

        return back();
    }

    /** Deletes the subject and its papers. */
    public function destroy(Subject $subject, string $slug)
    {
        abort_unless($subject->slug === $slug, 404);

        if ($subject->exams()->exists()) {
            return back()->withErrors(['delete' => 'This subject is used by an exam and cannot be deleted.']);
        }

        $subject->delete(); // papers are removed by the foreign key cascade

        return back();
    }

    private function rules(?Subject $subject = null): array
    {
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('subjects', 'name')->ignore($subject?->id)],
            'code' => ['required', 'string', 'max:20', Rule::unique('subjects', 'code')->ignore($subject?->id)],
        ];
    }

    private function makeSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;

        while (Subject::where('slug', $slug)->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = $base . '-' . Str::lower(Str::random(4));
        }

        return $slug;
    }
}
