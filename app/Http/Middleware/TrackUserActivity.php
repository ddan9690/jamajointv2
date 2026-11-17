<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackUserActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()) {
            if (!$request->user()->last_active_at || $request->user()->last_active_at->diffInMinutes(now()) >= 1) {
                $request->user()->update([
                    'last_active_at' => now(),
                    'last_login_ip' => $request->ip(),
                ]);
            }
        }

        return $next($request);
    }
}