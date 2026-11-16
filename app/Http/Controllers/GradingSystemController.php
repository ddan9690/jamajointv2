<?php

namespace App\Http\Controllers;

use App\Models\GradingSystem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class GradingSystemController extends Controller
{
    public function index(Request $request)
    {
        $search = trim($request->input('search', ''));

        $gradingSystems = GradingSystem::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy('name', 'asc')
            ->get();

        return Inertia::render('GradingSystems/Index', [
            'gradingSystems' => $gradingSystems,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:grading_systems,name'],
        ]);

        DB::transaction(function () use ($request) {
            $system = GradingSystem::create([
                'name' => $request->input('name'),
                'is_default' => false,
                'is_custom' => true,
                'created_by' => $request->user()->id,
            ]);

            // Seed default 12 bands (A to E) with initial standard ranges
            $defaultBands = [
                ['grade' => 'A', 'min_score' => 80, 'max_score' => 100, 'points' => 12],
                ['grade' => 'A-', 'min_score' => 75, 'max_score' => 79, 'points' => 11],
                ['grade' => 'B+', 'min_score' => 70, 'max_score' => 74, 'points' => 10],
                ['grade' => 'B', 'min_score' => 65, 'max_score' => 69, 'points' => 9],
                ['grade' => 'B-', 'min_score' => 60, 'max_score' => 64, 'points' => 8],
                ['grade' => 'C+', 'min_score' => 55, 'max_score' => 59, 'points' => 7],
                ['grade' => 'C', 'min_score' => 50, 'max_score' => 54, 'points' => 6],
                ['grade' => 'C-', 'min_score' => 45, 'max_score' => 49, 'points' => 5],
                ['grade' => 'D+', 'min_score' => 40, 'max_score' => 44, 'points' => 4],
                ['grade' => 'D', 'min_score' => 35, 'max_score' => 39, 'points' => 3],
                ['grade' => 'D-', 'min_score' => 30, 'max_score' => 34, 'points' => 2],
                ['grade' => 'E', 'min_score' => 0, 'max_score' => 29, 'points' => 1],
            ];

            foreach ($defaultBands as $band) {
                $system->gradings()->create($band);
            }
        });

        return redirect()->route('grading-systems.index')
            ->with('success', 'Grading system created successfully.');
    }

    public function show(GradingSystem $gradingSystem)
    {
        $gradingSystem->load('gradings');

        return Inertia::render('GradingSystems/Show', [
            'gradingSystem' => $gradingSystem,
        ]);
    }

    public function update(Request $request, GradingSystem $gradingSystem)
    {
        // Toggle default status
        if ($request->has('is_default')) {
            DB::transaction(function () use ($gradingSystem) {
                GradingSystem::where('id', '!=', $gradingSystem->id)->update(['is_default' => false]);
                $gradingSystem->update(['is_default' => true]);
            });

            return back()->with('success', "{$gradingSystem->name} is now set as the default grading system.");
        }

        // Update Name from Modal
        if ($request->has('name') && ! $request->has('gradings')) {
            $request->validate([
                'name' => ['required', 'string', 'max:255', 'unique:grading_systems,name,' . $gradingSystem->id],
            ]);

            $gradingSystem->update(['name' => $request->input('name')]);
            return back()->with('success', 'Grading system name updated.');
        }

        // Update Bands from Show Page (Fully editable for all systems)
        $request->validate([
            'gradings' => ['required', 'array', 'min:1', 'max:12'],
            'gradings.*.grade' => ['required', 'string', 'max:5'],
            'gradings.*.min_score' => ['required', 'integer', 'min:0', 'max:100'],
            'gradings.*.max_score' => ['required', 'integer', 'min:0', 'max:100'],
            'gradings.*.points' => ['required', 'integer', 'min:0', 'max:12'],
        ]);

        $gradings = collect($request->input('gradings'))->values();
        $this->validateBands($gradings);

        DB::transaction(function () use ($gradingSystem, $gradings) {
            $gradingSystem->gradings()->delete();

            foreach ($gradings as $band) {
                $gradingSystem->gradings()->create([
                    'grade' => strtoupper(trim($band['grade'])),
                    'min_score' => $band['min_score'],
                    'max_score' => $band['max_score'],
                    'points' => $band['points'],
                ]);
            }
        });

        return back()->with('success', 'Grading bands updated successfully.');
    }

    public function destroy(GradingSystem $gradingSystem)
    {
        if ($gradingSystem->is_default) {
            return back()->with('error', 'Default grading systems cannot be deleted.');
        }

        $gradingSystem->delete();

        return redirect()->route('grading-systems.index')
            ->with('success', 'Grading system deleted successfully.');
    }

    private function validateBands($gradings)
    {
        foreach ($gradings as $index => $band) {
            if ($band['min_score'] > $band['max_score']) {
                throw ValidationException::withMessages([
                    'gradings' => "Grade {$band['grade']}: Minimum score cannot exceed maximum score.",
                ]);
            }

            if (isset($gradings[$index + 1])) {
                $next = $gradings[$index + 1];
                if ($band['min_score'] <= $next['max_score']) {
                    throw ValidationException::withMessages([
                        'gradings' => "Score overlap detected between grades {$band['grade']} and {$next['grade']}.",
                    ]);
                }
            }
        }
    }
}