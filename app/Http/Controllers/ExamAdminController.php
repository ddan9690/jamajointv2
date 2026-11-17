<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ExamAdminController extends Controller
{
    public function index($id, $slug)
    {
        $exam = $this->find($id, $slug)->load(['academicYear:id,name', 'form:id,name', 'subject:id,name']);
        Gate::authorize('manageAdmins', $exam);

        return Inertia::render('Exams/Admins', [
            'exam' => $this->examData($exam),
            'admins' => $exam->admins()
                ->with('school:id,name')
                ->orderBy('users.name')
                ->get()
                ->map(fn($u) => $this->userData($u)),
        ]);
    }

    /** Live search: active users from schools registered for this exam, not yet admins. */
    public function search(Request $request, $id, $slug)
    {
        $exam = $this->find($id, $slug);
        Gate::authorize('manageAdmins', $exam);

        $term = trim((string) $request->input('q', ''));

        if (mb_strlen($term) < 2) {
            return response()->json([]);
        }

        // 0711317235 also finds 254711317235
        $digits = preg_replace('/\D/', '', $term);
        if (str_starts_with($digits, '0')) {
            $digits = '254' . substr($digits, 1);
        }

        return User::with('school:id,name')
            ->whereIn('school_id', $exam->schools()->pluck('schools.id'))
            ->where('status', 'active')
            ->where('role', '!=', 'super_admin')
            ->whereNotIn('id', $exam->admins()->pluck('users.id'))
            ->where(function ($q) use ($term, $digits) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%")
                    ->orWhere('phone', 'like', "%{$term}%");

                if ($digits !== '') {
                    $q->orWhere('phone', 'like', "%{$digits}%");
                }
            })
            ->orderBy('name')
            ->limit(10)
            ->get()
            ->map(fn($u) => $this->userData($u));
    }

    public function store(Request $request, $id, $slug)
    {
        $exam = $this->find($id, $slug);
        Gate::authorize('manageAdmins', $exam);

        $data = $request->validate(['user_id' => ['required', 'integer', 'exists:users,id']]);

        $user = User::findOrFail($data['user_id']);

        if ($user->role === 'super_admin' || $user->status !== 'active') {
            return back()->with('error', "{$user->name} cannot be added as an exam admin.");
        }

        if (! $exam->hasSchoolId($user->school_id)) {
            return back()->with('error', "{$user->name}'s school is not registered for this exam.");
        }

        if ($exam->admins()->whereKey($user->id)->exists()) {
            return back()->with('error', "{$user->name} is already an admin of this exam.");
        }

        DB::transaction(function () use ($exam, $user, $request) {
            $exam->admins()->attach($user->id, ['added_by' => $request->user()->id]);

            // Teachers become exam admins. Other roles are left as they are.
            User::whereKey($user->id)->where('role', 'teacher')->update(['role' => 'exam_admin']);
        });

        return back()->with('success', "{$user->name} was added as an exam admin.");
    }

    public function destroy($id, $slug, User $user)
    {
        $exam = $this->find($id, $slug);
        Gate::authorize('manageAdmins', $exam);

        DB::transaction(function () use ($exam, $user) {
            $exam->admins()->detach($user->id);

            // No longer an admin of any exam: back to teacher
            if (! $user->adminExams()->exists()) {
                User::whereKey($user->id)->where('role', 'exam_admin')->update(['role' => 'teacher']);
            }
        });

        return back();
    }

    private function find($id, $slug): Exam
    {
        return Exam::where('id', $id)->where('slug', $slug)->firstOrFail();
    }

    private function examData(Exam $exam): array
    {
        return [
            'id' => $exam->id,
            'slug' => $exam->slug,
            'name' => $exam->name,
            'subject' => $exam->subject->name,
            'form' => $exam->form->name,
            'year' => $exam->academicYear->name,
        ];
    }

    private function userData(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'school' => $user->school?->name,
            'phone' => $user->phone,
            'email' => $user->email,
        ];
    }
}
