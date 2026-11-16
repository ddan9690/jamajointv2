<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\County;
use App\Models\School;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class RegisterController extends Controller
{
    public function create()
    {
        return Inertia::render('Auth/Register', [
            'counties' => County::orderBy('name')->get(['id', 'name']),
            'schools' => School::orderBy('name')->get(['id', 'name', 'county_id']),
        ]);
    }

    public function store(Request $request)
    {
        // Robust server-side phone formatting handling autofill & various formats
        $request->merge(['phone' => $this->formatPhone((string) $request->phone)]);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'county_id' => ['required', 'exists:counties,id'],
            'school_id' => [
                'required',
                Rule::exists('schools', 'id')->where('county_id', $request->county_id),
            ],
            'phone' => ['required', 'regex:/^254[17]\d{8}$/', 'unique:users,phone'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ], [
            'phone.regex' => 'Please enter a valid Kenyan phone number (e.g., 711317235).',
            'school_id.exists' => 'The selected school is not in the selected county.',
        ]);

        $user = User::create($data);

        Auth::login($user);
        $request->session()->regenerate();

        return redirect('/');
    }

    private function formatPhone(string $phone): string
    {
        // Remove all non-numeric characters
        $digits = preg_replace('/\D/', '', $phone);

        // If starts with 254, ensure length is correct
        if (str_starts_with($digits, '254')) {
            return $digits;
        }

        // If starts with 0 (e.g., 0711...), strip leading zeros
        if (str_starts_with($digits, '0')) {
            $digits = ltrim($digits, '0');
        }

        return '254' . $digits;
    }
}