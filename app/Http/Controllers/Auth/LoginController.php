<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LoginController extends Controller
{
    public function create()
    {
        return Inertia::render('Auth/Login');
    }

    public function store(Request $request)
    {
        // Normalize the phone number input to match db format (e.g. 254711317235)
        $request->merge(['phone' => $this->formatPhone((string) $request->phone)]);

        $credentials = $request->validate([
            'phone' => ['required', 'regex:/^254[17]\d{8}$/'],
            'password' => ['required'],
        ], [
            'phone.required' => 'Please enter your phone number.',
            'phone.regex' => 'Please enter a valid Kenyan phone number (e.g., 0711317235).',
        ]);

        $authCredentials = [
            'phone' => $credentials['phone'],
            'password' => $credentials['password'],
            'status' => 'active',
        ];

        if (! Auth::attempt($authCredentials, $request->boolean('remember'))) {
            return back()->withErrors(['phone' => 'Invalid phone number or password, or the account is not active.']);
        }

        $request->session()->regenerate();

        // Update login tracking metadata
        $request->user()->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
            'last_active_at' => now(),
        ]);

        return redirect()->intended('/');
    }

    public function destroy(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
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