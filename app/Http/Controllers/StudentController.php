<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Models\Stream;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function store(Request $request, School $school, string $slug, Stream $stream, string $streamSlug)
    {
        $this->checkStream($school, $slug, $stream, $streamSlug);

        $data = $request->validate([
            'admission_number' => [
                'required', 'string', 'max:30',
                Rule::unique('students', 'admission_number')->where('school_id', $school->id),
            ],
            'name' => ['required', 'string', 'max:255'],
           'gender' => ['required', Rule::in(Student::GENDERS)],
        ]);

        Student::create($data + [
            'school_id' => $school->id,
            'form_id' => $stream->form_id,
            'stream_id' => $stream->id,
        ]);

        return back();
    }

    public function edit(School $school, string $slug, Stream $stream, string $streamSlug, Student $student)
    {
        $this->check($school, $slug, $stream, $streamSlug, $student);

        return Inertia::render('Students/Edit', [
            'school' => $school->only('id', 'slug', 'name'),
            'stream' => ['id' => $stream->id, 'slug' => $stream->slug, 'name' => $stream->name, 'form' => $stream->form->name],
            'student' => $student->only('id', 'admission_number', 'name', 'gender', 'stream_id'),
            'streams' => Stream::where('school_id', $school->id)
                ->where('form_id', $stream->form_id)
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, School $school, string $slug, Stream $stream, string $streamSlug, Student $student)
    {
        $this->check($school, $slug, $stream, $streamSlug, $student);

        $data = $request->validate([
            'admission_number' => [
                'required', 'string', 'max:30',
                Rule::unique('students', 'admission_number')
                    ->where('school_id', $school->id)
                    ->ignore($student->id),
            ],
            'name' => ['required', 'string', 'max:255'],
            'gender' => ['nullable', Rule::in(['M', 'F'])],
            'stream_id' => [
                'required',
                Rule::exists('streams', 'id')
                    ->where('school_id', $school->id)
                    ->where('form_id', $stream->form_id),
            ],
        ]);

        $student->update($data);

        return redirect()->route('schools.streams.show', [$school->id, $school->slug, $stream->id, $stream->slug]);
    }

    /** Deletes the selected students of this stream, and their marks. */
    public function destroyMany(Request $request, School $school, string $slug, Stream $stream, string $streamSlug)
    {
        $this->checkStream($school, $slug, $stream, $streamSlug);

        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ]);

        // Only students that really belong to this stream can be deleted
        Student::where('stream_id', $stream->id)->whereIn('id', $data['ids'])->delete();

        return back();
    }

    private function checkStream(School $school, string $slug, Stream $stream, string $streamSlug): void
    {
        abort_unless($school->slug === $slug, 404);
        abort_unless($stream->school_id === $school->id && $stream->slug === $streamSlug, 404);
    }

    private function check(School $school, string $slug, Stream $stream, string $streamSlug, Student $student): void
    {
        $this->checkStream($school, $slug, $stream, $streamSlug);
        abort_unless($student->stream_id === $stream->id, 404);
    }
}