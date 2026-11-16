<?php

namespace App\Http\Controllers;

use App\Models\Form;
use App\Models\School;
use App\Models\Stream;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class StreamController extends Controller
{
    /** Add a stream to a form of this school. */
    public function store(Request $request, School $school, string $slug)
    {
        abort_unless($school->slug === $slug, 404);

        $request->merge(['slug' => Str::slug((string) $request->name)]);

        $data = $request->validate([
            'form_id' => ['required', 'exists:forms,id'],
            'name' => ['required', 'string', 'max:50'],
            'slug' => [
                Rule::unique('streams', 'slug')
                    ->where('school_id', $school->id)
                    ->where('form_id', $request->form_id),
            ],
        ], ['slug.unique' => 'This stream already exists in this form.']);

        $school->streams()->create($data);

        return back();
    }

    /** Students page of a stream. */
    public function show(School $school, string $slug, Stream $stream, string $streamSlug)
    {
        abort_unless($school->slug === $slug, 404);
        abort_unless($stream->school_id === $school->id && $stream->slug === $streamSlug, 404);

        $students = $stream->students()
            ->orderByRaw('LENGTH(admission_number), admission_number')
            ->get(['id', 'admission_number', 'name', 'gender']);

        return Inertia::render('Streams/Show', [
            'school' => $school->only('id', 'slug', 'name'),
            'stream' => [
                'id' => $stream->id,
                'slug' => $stream->slug,
                'name' => $stream->name,
                'form' => $stream->form->name,
            ],
            'students' => $students,
            'counts' => [
                'total' => $students->count(),
                'male' => $students->where('gender', 'M')->count(),
                'female' => $students->where('gender', 'F')->count(),
            ],
        ]);
    }
    /** Only the name can change. A stream never moves to another form. */
    public function update(Request $request, School $school, string $slug, Stream $stream)
    {
        abort_unless($school->slug === $slug, 404);
        abort_unless($stream->school_id === $school->id, 404);

        $request->merge(['slug' => Str::slug((string) $request->name)]);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'slug' => [
                Rule::unique('streams', 'slug')
                    ->where('school_id', $school->id)
                    ->where('form_id', $stream->form_id)
                    ->ignore($stream->id),
            ],
        ], ['slug.unique' => 'This stream already exists in this form.']);

        $stream->update($data);

        return back();
    }

    /** Deletes the stream, its students and their marks. */
    public function destroy(School $school, string $slug, Stream $stream)
    {
        abort_unless($school->slug === $slug, 404);
        abort_unless($stream->school_id === $school->id, 404);

        $stream->delete();

        return back();
    }
}
