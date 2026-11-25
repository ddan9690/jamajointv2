<?php

namespace App\Http\Middleware;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        $currentUser = $request->user();

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => fn () => $currentUser
                    ? [
                        'id' => $currentUser->id,
                        'name' => $currentUser->name,
                        'email' => $currentUser->email,
                        'role' => $currentUser->role,
                        'school_id' => $currentUser->school_id,
                        'county_id' => $currentUser->county_id,
                    ]
                    : null,
            ],
            'online_users_count' => fn () => $currentUser && method_exists($currentUser, 'isSuperAdmin') && $currentUser->isSuperAdmin()
                ? User::where('last_active_at', '>=', now()->subMinutes(2))->count()
                : 0,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ]);
    }
}