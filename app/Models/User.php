<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    protected $fillable = ['name', 'county_id', 'school_id', 'phone', 'email', 'password', 'role', 'status'];

    protected $hidden = ['password', 'remember_token', 'email_otp', 'phone_otp'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'email_otp_expires_at' => 'datetime',
            'phone_otp_expires_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function county()
    {
        return $this->belongsTo(County::class);
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function adminExams()
    {
        return $this->belongsToMany(Exam::class, 'exam_admins', 'user_id', 'exam_id')
            ->using(ExamAdmin::class)
            ->withPivot('added_by')
            ->withTimestamps();
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isExamAdmin(): bool
    {
        return $this->role === 'exam_admin';
    }
}