<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\Grading;
use App\Models\Mark;
use App\Models\Stream;
use App\Models\Student;
use Illuminate\Support\Collection;

class ExamResultService
{
    /**
     * Compute full exam results across eligible students (those with marks in all required exam papers)
     * using chunked queries so 20,000+ student cohorts stay memory-efficient.
     */
    public function compute(Exam $exam): array
    {
        $examPapers = $exam->papers()
            ->join('subject_papers', 'subject_papers.id', '=', 'exam_papers.subject_paper_id')
            ->orderBy('subject_papers.position')
            ->orderBy('exam_papers.id')
            ->select([
                'exam_papers.id',
                'exam_papers.subject_paper_id',
                'exam_papers.out_of',
                'exam_papers.percentage_contribution',
                'subject_papers.name as paper_name',
                'subject_papers.code as paper_code',
                'subject_papers.position as paper_position',
            ])
            ->get();

        $schools = $exam->schools()
            ->with('county:id,name')
            ->orderBy('schools.name')
            ->get(['schools.id', 'schools.name', 'schools.slug', 'schools.type', 'schools.county_id']);

        $gradings = Grading::where('grading_system_id', $exam->grading_system_id)
            ->orderByDesc('min_score')
            ->get(['grade', 'min_score', 'max_score', 'points']);

        $participatingSchoolsCount = $schools->count();

        if ($examPapers->isEmpty() || $schools->isEmpty() || $gradings->isEmpty()) {
            return $this->emptyResult($participatingSchoolsCount, $examPapers);
        }

        $schoolIds = $schools->pluck('id')->all();
        $paperIds = $examPapers->pluck('id')->all();
        $requiredPaperCount = $examPapers->count();
        $totalContribution = (float) $examPapers->sum('percentage_contribution');

        // Build O(1) score (0..100) -> grading band lookup and grade -> points map
        $scoreToBand = $this->buildScoreLookup($gradings);
        $gradePoints = $gradings->pluck('points', 'grade')->map(fn($p) => (int) $p)->all();
        $maxSystemPoints = (int) ($gradings->max('points') ?? 0);

        $isPassingBand = static function (?object $band) use ($maxSystemPoints): bool {
            if (! $band) {
                return false;
            }

            if ($maxSystemPoints >= 4) {
                return (int) $band->points >= 4; // D+ (4 points) and above
            }

            return (int) $band->min_score >= 40;
        };

        $streamsMap = Stream::whereIn('school_id', $schoolIds)
            ->where('form_id', $exam->form_id)
            ->pluck('name', 'id')
            ->all();

        $overallGrades = [];
        $totalStudents = 0;
        $maleStudents = 0;
        $femaleStudents = 0;
        $passedStudents = 0;

        $schoolStats = [];
        foreach ($schools as $school) {
            $schoolStats[$school->id] = [
                'school_id' => $school->id,
                'name' => $school->name,
                'slug' => $school->slug,
                'county' => $school->county?->name,
                'type' => $school->type,
                'total' => 0,
                'male' => 0,
                'female' => 0,
                'passed' => 0,
                'grades' => [],
                'streams' => [],
            ];
        }

        $paperStats = [];
        foreach ($examPapers as $paper) {
            $paperStats[$paper->id] = [
                'id' => $paper->id,
                'name' => $paper->paper_name,
                'code' => $paper->paper_code,
                'position' => (int) $paper->paper_position,
                'out_of' => (int) $paper->out_of,
                'percentage_contribution' => (float) $paper->percentage_contribution,
                'total' => 0,
                'passed' => 0,
                'grades' => [],
            ];
        }

        $studentStandings = [];
        $papersById = $examPapers->keyBy('id');

        // Chunk over participating schools' students in this exam's form
        Student::whereIn('school_id', $schoolIds)
            ->where('form_id', $exam->form_id)
            ->orderBy('id')
            ->select(['id', 'school_id', 'stream_id', 'admission_number', 'name', 'gender'])
            ->chunkById(1000, function ($students) use (
                $exam,
                $paperIds,
                $requiredPaperCount,
                $totalContribution,
                $papersById,
                $scoreToBand,
                $isPassingBand,
                &$overallGrades,
                &$totalStudents,
                &$maleStudents,
                &$femaleStudents,
                &$passedStudents,
                &$schoolStats,
                &$paperStats,
                &$studentStandings
            ) {
                $studentIds = $students->pluck('id')->all();

                $marksByStudent = Mark::where('exam_id', $exam->id)
                    ->whereIn('exam_paper_id', $paperIds)
                    ->whereIn('student_id', $studentIds)
                    ->whereNotNull('score')
                    ->get(['student_id', 'exam_paper_id', 'score'])
                    ->groupBy('student_id');

                foreach ($students as $student) {
                    $studentMarks = $marksByStudent->get($student->id);
                    if (! $studentMarks) {
                        continue;
                    }

                    $paperScores = [];
                    foreach ($studentMarks as $mark) {
                        $paperScores[$mark->exam_paper_id] = (int) $mark->score;
                    }

                    // Eligible students only: must have marks for ALL required papers
                    if (count($paperScores) !== $requiredPaperCount) {
                        continue;
                    }

                    $weightedSum = 0.0;
                    foreach ($paperScores as $paperId => $rawScore) {
                        $paper = $papersById[$paperId];
                        $outOf = max(1, (int) $paper->out_of);
                        $pctContribution = (float) $paper->percentage_contribution;

                        $weightedSum += ($rawScore / $outOf) * $pctContribution;

                        // Per-paper normalized integer percentage & grade
                        $paperPct = $this->clampScore((int) round(($rawScore / $outOf) * 100));
                        $paperBand = $scoreToBand[$paperPct];
                        $paperGrade = $paperBand->grade;

                        $paperStats[$paperId]['total']++;
                        $paperStats[$paperId]['grades'][$paperGrade] = ($paperStats[$paperId]['grades'][$paperGrade] ?? 0) + 1;
                        if ($isPassingBand($paperBand)) {
                            $paperStats[$paperId]['passed']++;
                        }
                    }

                    $overallPct = $totalContribution > 0
                        ? ($weightedSum / $totalContribution) * 100
                        : 0.0;

                    // Round student average to a whole integer (no decimals)
                    $studentAverage = $this->clampScore((int) round($overallPct));
                    $band = $scoreToBand[$studentAverage];
                    $grade = $band->grade;
                    $points = (int) $band->points;
                    $passed = $isPassingBand($band);

                    $totalStudents++;
                    if ($student->gender === 'M') {
                        $maleStudents++;
                    } elseif ($student->gender === 'F') {
                        $femaleStudents++;
                    }
                    if ($passed) {
                        $passedStudents++;
                    }

                    $overallGrades[$grade] = ($overallGrades[$grade] ?? 0) + 1;

                    // School accumulator
                    $sid = $student->school_id;
                    if (isset($schoolStats[$sid])) {
                        $schoolStats[$sid]['total']++;
                        if ($student->gender === 'M') {
                            $schoolStats[$sid]['male']++;
                        } elseif ($student->gender === 'F') {
                            $schoolStats[$sid]['female']++;
                        }
                        if ($passed) {
                            $schoolStats[$sid]['passed']++;
                        }
                        $schoolStats[$sid]['grades'][$grade] = ($schoolStats[$sid]['grades'][$grade] ?? 0) + 1;

                        $stId = $student->stream_id;
                        if (! isset($schoolStats[$sid]['streams'][$stId])) {
                            $schoolStats[$sid]['streams'][$stId] = [
                                'stream_id' => $stId,
                                'total' => 0,
                                'passed' => 0,
                                'grades' => [],
                            ];
                        }
                        $schoolStats[$sid]['streams'][$stId]['total']++;
                        if ($passed) {
                            $schoolStats[$sid]['streams'][$stId]['passed']++;
                        }
                        $schoolStats[$sid]['streams'][$stId]['grades'][$grade] =
                            ($schoolStats[$sid]['streams'][$stId]['grades'][$grade] ?? 0) + 1;
                    }

                    $studentStandings[] = [
                        'id' => $student->id,
                        'adm' => $student->admission_number,
                        'name' => $student->name,
                        'gender' => $student->gender,
                        'school_id' => $student->school_id,
                        'stream_id' => $student->stream_id,
                        'avg' => $studentAverage,
                        'grade' => $grade,
                        'points' => $points,
                    ];
                }
            }, 'id');

        // Rank students descending by average score (tie-aware competition ranking)
        usort($studentStandings, static function (array $a, array $b): int {
            return $b['avg'] <=> $a['avg']
                ?: $b['points'] <=> $a['points']
                ?: strcmp((string) $a['adm'], (string) $b['adm']);
        });

        $prevAvg = null;
        $rank = 0;
        foreach ($studentStandings as $index => &$row) {
            if ($prevAvg === null || $row['avg'] !== $prevAvg) {
                $rank = $index + 1;
                $prevAvg = $row['avg'];
            }
            $row['pos'] = $rank;
        }
        unset($row);

        // Summarize overall papers
        $paperPerformance = [];
        foreach ($paperStats as $pStat) {
            $summary = $this->summarizeGroup($pStat['grades'], $pStat['total'], $gradePoints, $gradings);
            $paperPerformance[] = [
                'id' => $pStat['id'],
                'name' => $pStat['name'],
                'code' => $pStat['code'],
                'position' => $pStat['position'],
                'out_of' => $pStat['out_of'],
                'percentage_contribution' => $pStat['percentage_contribution'],
                'eligible_students_count' => $pStat['total'],
                'mean_score' => $summary['mean_score'],
                'mean_grade' => $summary['mean_grade'],
                'pass_percentage' => $pStat['total'] > 0 ? round(($pStat['passed'] / $pStat['total']) * 100, 2) : 0.0,
            ];
        }

        // Summarize schools and streams, rank schools by mean_score desc
        $schoolRankings = [];
        foreach ($schoolStats as $sStat) {
            if ($sStat['total'] === 0) {
                continue;
            }

            $schoolSummary = $this->summarizeGroup($sStat['grades'], $sStat['total'], $gradePoints, $gradings);

            $streamsList = [];
            foreach ($sStat['streams'] as $stStat) {
                $stSummary = $this->summarizeGroup($stStat['grades'], $stStat['total'], $gradePoints, $gradings);
                $streamsList[] = [
                    'stream_id' => $stStat['stream_id'],
                    'name' => $streamsMap[$stStat['stream_id']] ?? 'Stream',
                    'total_students' => $stStat['total'],
                    'mean_score' => $stSummary['mean_score'],
                    'mean_grade' => $stSummary['mean_grade'],
                    'pass_percentage' => $stStat['total'] > 0 ? round(($stStat['passed'] / $stStat['total']) * 100, 2) : 0.0,
                ];
            }

            usort($streamsList, static fn($a, $b) => (float) $b['mean_score'] <=> (float) $a['mean_score']);

            $schoolRankings[] = [
                'school_id' => $sStat['school_id'],
                'name' => $sStat['name'],
                'slug' => $sStat['slug'],
                'county' => $sStat['county'],
                'type' => $sStat['type'],
                'total_students' => $sStat['total'],
                'male_students' => $sStat['male'],
                'female_students' => $sStat['female'],
                'mean_score' => $schoolSummary['mean_score'],
                'mean_grade' => $schoolSummary['mean_grade'],
                'pass_percentage' => round(($sStat['passed'] / $sStat['total']) * 100, 2),
                'streams' => $streamsList,
            ];
        }

        usort($schoolRankings, static function (array $a, array $b): int {
            return (float) $b['mean_score'] <=> (float) $a['mean_score']
                ?: $b['total_students'] <=> $a['total_students']
                ?: strcmp($a['name'], $b['name']);
        });

        $prevSchoolMean = null;
        $schoolRank = 0;
        foreach ($schoolRankings as $index => &$sRow) {
            if ($prevSchoolMean === null || $sRow['mean_score'] !== $prevSchoolMean) {
                $schoolRank = $index + 1;
                $prevSchoolMean = $sRow['mean_score'];
            }
            $sRow['position'] = $schoolRank;
        }
        unset($sRow);

        $overallSummary = $this->summarizeGroup($overallGrades, $totalStudents, $gradePoints, $gradings);

        return [
            'participating_schools_count' => $participatingSchoolsCount,
            'total_students_count' => $totalStudents,
            'male_students_count' => $maleStudents,
            'female_students_count' => $femaleStudents,
            'mean_score' => $overallSummary['mean_score'],
            'mean_grade' => $overallSummary['mean_grade'],
            'pass_percentage' => $totalStudents > 0 ? round(($passedStudents / $totalStudents) * 100, 2) : 0.0,
            'paper_performance' => $paperPerformance,
            'school_rankings' => $schoolRankings,
            'student_standings' => $studentStandings,
        ];
    }

    private function emptyResult(int $participatingSchoolsCount, Collection $examPapers): array
    {
        $paperPerformance = $examPapers->map(fn($p) => [
            'id' => $p->id,
            'name' => $p->paper_name,
            'code' => $p->paper_code,
            'position' => (int) $p->paper_position,
            'out_of' => (int) $p->out_of,
            'percentage_contribution' => (float) $p->percentage_contribution,
            'eligible_students_count' => 0,
            'mean_score' => '0.0000',
            'mean_grade' => null,
            'pass_percentage' => 0.0,
        ])->values()->all();

        return [
            'participating_schools_count' => $participatingSchoolsCount,
            'total_students_count' => 0,
            'male_students_count' => 0,
            'female_students_count' => 0,
            'mean_score' => '0.0000',
            'mean_grade' => null,
            'pass_percentage' => 0.0,
            'paper_performance' => $paperPerformance,
            'school_rankings' => [],
            'student_standings' => [],
        ];
    }

    private function buildScoreLookup(Collection $gradings): array
    {
        $lookup = [];
        $fallback = $gradings->last();

        for ($score = 0; $score <= 100; $score++) {
            $matched = $gradings->first(
                static fn($g) => $score >= (int) $g->min_score && $score <= (int) $g->max_score
            );
            $lookup[$score] = $matched ?: $fallback;
        }

        return $lookup;
    }

    private function summarizeGroup(array $gradeCounts, int $total, array $gradePoints, Collection $gradings): array
    {
        if ($total <= 0) {
            return [
                'mean_score' => '0.0000',
                'mean_grade' => null,
            ];
        }

        $totalPoints = 0;
        foreach ($gradeCounts as $grade => $count) {
            $totalPoints += $count * ($gradePoints[$grade] ?? 0);
        }

        $meanPoints = $totalPoints / $total;

        return [
            'mean_score' => number_format($meanPoints, 4, '.', ''),
            'mean_grade' => $this->resolveMeanGrade($meanPoints, $gradings),
        ];
    }

    private function resolveMeanGrade(float $meanPoints, Collection $gradings): ?string
    {
        if ($gradings->isEmpty()) {
            return null;
        }

        $targetPoints = (int) round($meanPoints);
        $best = null;
        $bestDiff = PHP_INT_MAX;

        foreach ($gradings as $band) {
            $diff = abs((int) $band->points - $targetPoints);
            if ($diff < $bestDiff) {
                $bestDiff = $diff;
                $best = $band;
            }
        }

        return $best?->grade;
    }

    private function clampScore(int $score): int
    {
        return max(0, min(100, $score));
    }
}
