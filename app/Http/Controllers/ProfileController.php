<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function edit(Request $request)
    {
        $user = $request->user();

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => false,
            'status' => session('status'),
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'county' => $user->county?->name ?? 'N/A',
                'school' => $user->school?->name ?? 'N/A',
            ],
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'phone' => ['required', 'string', 'max:15', 'unique:users,phone,' . $user->id],
        ]);

        $user->fill($validated);
        $user->save();

        return redirect()->back()->with('status', 'profile-updated');
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->back()->with('status', 'password-updated');
    }
}