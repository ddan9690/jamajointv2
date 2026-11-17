<?php

namespace App\Http\Controllers;

use App\Models\County;
use App\Models\School;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $search = trim($request->input('search', ''));
        $sort = $request->input('sort', 'name');
        $direction = $request->input('direction', 'asc');

        $allowedSorts = ['name', 'county', 'school', 'last_active_at', 'last_login_at'];
        if (!in_array($sort, $allowedSorts)) {
            $sort = 'name';
        }
        if (!in_array($direction, ['asc', 'desc'])) {
            $direction = 'asc';
        }

        $users = User::with(['county:id,name', 'school:id,name'])
            ->when($search, fn($q) => $q->where(fn($sub) => $sub
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%")))
            ->when($sort === 'county', fn($q) => $q->leftJoin('counties', 'users.county_id', '=', 'counties.id')
                ->orderBy('counties.name', $direction)
                ->select('users.*'))
            ->when($sort === 'school', fn($q) => $q->leftJoin('schools', 'users.school_id', '=', 'schools.id')
                ->orderBy('schools.name', $direction)
                ->select('users.*'))
            ->when(!in_array($sort, ['county', 'school']), fn($q) => $q->orderBy($sort, $direction))
            ->paginate(15)
            ->withQueryString()
            ->through(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'status' => $user->status,
                'county_id' => $user->county_id,
                'county' => $user->county?->name,
                'school_id' => $user->school_id,
                'school' => $user->school?->name,
                'last_login_human' => $this->formatLastLogin($user),
            ]);

        return Inertia::render('Users/Index', [
            'users' => $users,
            'counties' => County::orderBy('name')->get(['id', 'name']),
            'schools' => School::orderBy('name')->get(['id', 'name', 'county_id']),
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->merge(['phone' => $this->formatPhone((string) $request->phone)]);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'county_id' => ['required', 'exists:counties,id'],
            'school_id' => [
                'required',
                Rule::exists('schools', 'id')->where('county_id', $request->county_id),
            ],
            'phone' => ['required', 'regex:/^254[17]\d{8}$/', Rule::unique('users', 'phone')->ignore($user->id)],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        $user->update($data);

        return back()->with('success', 'User updated successfully.');
    }

    public function toggleStatus(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'You cannot change your own status.']);
        }

        $user->update([
            'status' => $user->status === 'active' ? 'inactive' : 'active',
        ]);

        return back();
    }

    public function toggleSuperAdmin(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'You cannot modify your own super admin status.']);
        }

        $newRole = $user->role === 'super_admin' ? 'teacher' : 'super_admin';
        $user->update(['role' => $newRole]);

        return back();
    }

    public function resetPassword(User $user)
    {
        $newPassword = Str::password(10);
        $user->update(['password' => bcrypt($newPassword)]);

        return response()->json(['password' => $newPassword]);
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'You cannot delete your own account.']);
        }

        $user->delete();

        return back()->with('success', 'User deleted successfully.');
    }

    private function formatLastLogin($user): string
    {
        if ($user->last_active_at && $user->last_active_at->diffInSeconds(now()) < 120) {
            return 'online';
        }

        if (!$user->last_login_at) {
            return 'Never';
        }

        return $user->last_login_at->diffForHumans();
    }

    private function formatPhone(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone);
        if (str_starts_with($digits, '254')) {
            return $digits;
        }
        if (str_starts_with($digits, '0')) {
            $digits = ltrim($digits, '0');
        }
        return '254' . $digits;
    }
}