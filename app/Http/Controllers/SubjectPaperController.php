<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use App\Models\SubjectPaper;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SubjectPaperController extends Controller
{
    public function index(Subject $subject, string $slug)
    {
        $this->check($subject, $slug);

        return Inertia::render('Subjects/Papers', [
            'subject' => $subject->only('id', 'slug', 'name', 'code'),
            'papers' => $subject->papers()->get(['id', 'name', 'code', 'position']),
            'max' => Subject::MAX_PAPERS,
        ]);
    }

    public function store(Request $request, Subject $subject, string $slug)
    {
        $this->check($subject, $slug);

        $data = $request->validate($this->rules($subject));

        if ($subject->papers()->count() >= Subject::MAX_PAPERS) {
            return back()->withErrors(['name' => 'A subject can have at most ' . Subject::MAX_PAPERS . ' papers.']);
        }

        // Lowest free position (1 to 3), so gaps left by deleted papers are reused
        $used = $subject->papers()->pluck('position')->all();
        $position = collect(range(1, Subject::MAX_PAPERS))->first(fn($n) => ! in_array($n, $used));

        $subject->papers()->create($data + [
            'position' => $position,
            'slug' => $this->makeSlug($subject, $data['name']),
        ]);

        return back();
    }

    public function update(Request $request, Subject $subject, string $slug, SubjectPaper $paper)
    {
        $this->check($subject, $slug, $paper);

        $data = $request->validate($this->rules($subject, $paper));

        if ($data['name'] !== $paper->name) {
            $data['slug'] = $this->makeSlug($subject, $data['name'], $paper->id);
        }

        $paper->update($data);

        return back();
    }

    public function destroy(Subject $subject, string $slug, SubjectPaper $paper)
    {
        $this->check($subject, $slug, $paper);

        if ($paper->examPapers()->exists()) {
            return back()->withErrors(['delete' => 'This paper is used by an exam and cannot be deleted.']);
        }

        $paper->delete();

        return back();
    }

    private function check(Subject $subject, string $slug, ?SubjectPaper $paper = null): void
    {
        abort_unless($subject->slug === $slug, 404);
        abort_if($paper && $paper->subject_id !== $subject->id, 404);
    }

    private function rules(Subject $subject, ?SubjectPaper $paper = null): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:50',
                Rule::unique('subject_papers', 'name')->where('subject_id', $subject->id)->ignore($paper?->id),
            ],
            'code' => ['nullable', 'string', 'max:30'],
        ];
    }

    private function makeSlug(Subject $subject, string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($subject->slug . '-' . $name);
        $slug = $base;

        while (SubjectPaper::where('slug', $slug)->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = $base . '-' . Str::lower(Str::random(4));
        }

        return $slug;
    }
}
