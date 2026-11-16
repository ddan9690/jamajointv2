<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ExamPaperController extends Controller
{
    public function update(Request $request, $id, $slug)
    {
        $exam = Exam::where('id', $id)->where('slug', $slug)->firstOrFail();

        Gate::authorize('manage', $exam);

        $subjectPaperIds = $exam->subject()
            ->firstOrFail()
            ->papers()
            ->pluck('id')
            ->all();

        abort_if(empty($subjectPaperIds), 422, 'This subject has no papers configured.');

        $validated = $request->validate([
            'papers' => ['required', 'array', 'size:' . count($subjectPaperIds)],
            'papers.*.subject_paper_id' => [
                'required',
                'integer',
                'distinct',
                Rule::in($subjectPaperIds),
            ],
            'papers.*.out_of' => ['required', 'integer', 'min:1', 'max:1000'],
            'papers.*.percentage_contribution' => ['required', 'numeric', 'min:0.01', 'max:100'],
        ], [
            'papers.*.out_of.required' => 'Max marks (out of) is required for every paper.',
            'papers.*.out_of.integer' => 'Max marks must be a whole number.',
            'papers.*.out_of.min' => 'Max marks must be at least 1.',
            'papers.*.percentage_contribution.required' => 'Percentage contribution is required for every paper.',
            'papers.*.percentage_contribution.min' => 'Percentage contribution must be greater than 0.',
        ]);

        // Compare in basis points (hundredths of a percent) to avoid floating-point rounding drift
        $totalBasisPoints = collect($validated['papers'])
            ->sum(fn($row) => (int) round(((float) $row['percentage_contribution']) * 100));

        if ($totalBasisPoints !== 10000) {
            $actual = number_format($totalBasisPoints / 100, 2);

            throw ValidationException::withMessages([
                'papers' => "Total percentage contribution must equal 100% (currently {$actual}%).",
            ]);
        }

        DB::transaction(function () use ($exam, $validated) {
            foreach ($validated['papers'] as $row) {
                $exam->papers()->updateOrCreate(
                    ['subject_paper_id' => $row['subject_paper_id']],
                    [
                        'out_of' => (int) $row['out_of'],
                        'percentage_contribution' => round((float) $row['percentage_contribution'], 2),
                    ]
                );
            }
        });

        return back();
    }
}
