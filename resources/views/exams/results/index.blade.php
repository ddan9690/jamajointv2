<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $exam->name }} · Results</title>
    <script>
        try {
            if (localStorage.theme === 'dark' ||
                (!localStorage.theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
            }
        } catch (e) {}
    </script>
    @vite(['resources/css/app.css'])
</head>
<body class="min-h-screen bg-background text-foreground antialiased">
    <header class="border-b bg-card text-card-foreground">
        <div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
            <a href="{{ route('dashboard') }}" class="font-bold text-primary">JamaJoint</a>

            <div class="flex items-center gap-3">
                <button
                    type="button"
                    id="theme-toggle-btn"
                    class="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                    Toggle theme
                </button>
                <a
                    href="{{ route('dashboard') }}"
                    class="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors hover:bg-muted"
                >
                    &larr; Back
                </a>
            </div>
        </div>
    </header>

    <main class="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
        {{-- Exam Details --}}
        <div class="flex flex-wrap items-start justify-between gap-4 rounded-lg border bg-card p-5 text-card-foreground">
            <div class="space-y-1">
                <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Exam Results</p>
                <h1 class="text-xl font-semibold sm:text-2xl">{{ $exam->name }}</h1>
                <p class="text-sm text-muted-foreground">
                    {{ $exam->subject?->name }} · {{ $exam->form?->name }} · {{ $exam->academicYear?->name }}
                    @if($exam->gradingSystem)
                        · Grading: <span class="font-medium text-foreground">{{ $exam->gradingSystem->name }}</span>
                    @endif
                </p>
            </div>

            <div class="flex flex-col items-end gap-1.5">
                <span class="shrink-0 rounded bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                    {{ ucfirst($exam->status) }}
                </span>
                @if(!empty($results['version']))
                    <span class="text-xs text-muted-foreground">
                        Snapshot v{{ $results['version'] }}
                        @if(!empty($results['computed_at']))
                            · Updated {{ $results['computed_at']->diffForHumans() }}
                        @endif
                    </span>
                @endif
            </div>
        </div>

        {{-- Analytics Cards --}}
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div class="rounded-lg border bg-card p-4 text-card-foreground">
                <div class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Participating Schools</div>
                <div class="mt-2 text-2xl font-semibold">{{ number_format($results['participating_schools_count']) }}</div>
            </div>

            <div class="rounded-lg border bg-card p-4 text-card-foreground">
                <div class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Eligible Students</div>
                <div class="mt-2 text-2xl font-semibold">{{ number_format($results['total_students_count']) }}</div>
                <div class="mt-1 text-xs text-muted-foreground">
                    Male: <span class="font-medium text-foreground">{{ number_format($results['male_students_count']) }}</span>
                    · Female: <span class="font-medium text-foreground">{{ number_format($results['female_students_count']) }}</span>
                </div>
            </div>

            <div class="rounded-lg border bg-card p-4 text-card-foreground">
                <div class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Overall Mean Score</div>
                <div class="mt-2 text-2xl font-semibold">{{ $results['mean_score'] }}</div>
            </div>

            <div class="rounded-lg border bg-card p-4 text-card-foreground">
                <div class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Overall Mean Grade</div>
                <div class="mt-2 text-2xl font-semibold">{{ $results['mean_grade'] ?? '-' }}</div>
            </div>

            <div class="rounded-lg border bg-card p-4 text-card-foreground">
                <div class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Percentage Pass</div>
                <div class="mt-2 text-2xl font-semibold">{{ $results['pass_percentage'] }}%</div>
            </div>
        </div>

        {{-- Analysis Report Links --}}
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <a
                href="#"
                class="flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm font-medium text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
                <span>School Ranking</span>
                <span class="text-muted-foreground">&rarr;</span>
            </a>

            <a
                href="#"
                class="flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm font-medium text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
                <span>My School Results</span>
                <span class="text-muted-foreground">&rarr;</span>
            </a>

            <a
                href="#"
                class="flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm font-medium text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
                <span>Overall Student Ranking</span>
                <span class="text-muted-foreground">&rarr;</span>
            </a>

            <a
                href="#"
                class="flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm font-medium text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
                <span>Top Students</span>
                <span class="text-muted-foreground">&rarr;</span>
            </a>
        </div>

        {{-- Overall Paper Performance --}}
        <div class="rounded-lg border bg-card text-card-foreground">
            <div class="border-b px-4 py-3">
                <h2 class="font-semibold">Overall Paper Performance</h2>
                <p class="text-xs text-muted-foreground">
                    Mean score (4 decimal places) and mean grade across eligible students for each exam paper.
                </p>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b text-left text-muted-foreground">
                            <th class="w-12 px-4 py-2.5 font-medium">#</th>
                            <th class="px-4 py-2.5 font-medium">Paper</th>
                            <th class="px-4 py-2.5 font-medium">Code</th>
                            <th class="px-4 py-2.5 font-medium">Out Of</th>
                            <th class="px-4 py-2.5 font-medium">Eligible Students</th>
                            <th class="px-4 py-2.5 font-medium">Mean Score</th>
                            <th class="px-4 py-2.5 font-medium">Mean Grade</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($results['paper_performance'] as $index => $paper)
                            <tr class="border-b last:border-0 hover:bg-muted/30">
                                <td class="px-4 py-2.5">{{ $index + 1 }}</td>
                                <td class="whitespace-nowrap px-4 py-2.5 font-medium">{{ $paper['name'] }}</td>
                                <td class="whitespace-nowrap px-4 py-2.5 text-muted-foreground">{{ $paper['code'] ?: '-' }}</td>
                                <td class="whitespace-nowrap px-4 py-2.5">{{ $paper['out_of'] }}</td>
                                <td class="whitespace-nowrap px-4 py-2.5">{{ number_format($paper['eligible_students_count'] ?? 0) }}</td>
                                <td class="whitespace-nowrap px-4 py-2.5 font-medium">{{ $paper['mean_score'] ?? '0.0000' }}</td>
                                <td class="whitespace-nowrap px-4 py-2.5">
                                    <span class="inline-flex rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                        {{ $paper['mean_grade'] ?? '-' }}
                                    </span>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="px-4 py-8 text-center text-muted-foreground">
                                    No paper performance data available yet.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </main>

    <script>
        document.getElementById('theme-toggle-btn')?.addEventListener('click', function () {
            const isDark = document.documentElement.classList.toggle('dark');
            try {
                localStorage.theme = isDark ? 'dark' : 'light';
            } catch (e) {}
        });
    </script>
</body>
</html>

