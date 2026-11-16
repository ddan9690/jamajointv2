<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\ExamSchoolController;
use App\Http\Controllers\GradingSystemController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\SchoolStudentsImportController;
use App\Http\Controllers\StreamController;
use App\Http\Controllers\StudentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Guest
|--------------------------------------------------------------------------
*/

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);

    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store']);
});

/*
|--------------------------------------------------------------------------
| Authenticated
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {

    // Dashboard
    Route::inertia('/', 'Dashboard')->name('dashboard');
    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');

    // Profile
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('profile.update');
        Route::put('/password', [ProfileController::class, 'updatePassword'])->name('password.update');
    });

    // Grading Systems (Index, Store, Show, Update, Destroy)
    Route::resource('grading-systems', GradingSystemController::class);

    // Exams
    Route::prefix('exams')->name('exams.')->group(function () {
        Route::get('/', [ExamController::class, 'index'])->name('index');
        Route::post('/', [ExamController::class, 'store'])->name('store');
        Route::get('/{id}/{slug}', [ExamController::class, 'show'])->name('show');
        Route::put('/{id}/{slug}', [ExamController::class, 'update'])->name('update');
        Route::patch('/{id}/{slug}/settings', [ExamController::class, 'updateSettings'])->name('settings');
        Route::delete('/{id}/{slug}', [ExamController::class, 'destroy'])->name('destroy');

        // Schools taking part in an exam
        Route::get('/{id}/{slug}/schools', [ExamSchoolController::class, 'index'])->name('schools.index');
        Route::post('/{id}/{slug}/schools', [ExamSchoolController::class, 'store'])->name('schools.store');
        Route::delete('/{id}/{slug}/schools/{school}', [ExamSchoolController::class, 'destroy'])->name('schools.destroy');
    });

    // Schools
    Route::prefix('schools')->name('schools.')->group(function () {
        Route::get('/', [SchoolController::class, 'index'])
            ->middleware('can:viewAny,App\Models\School')->name('index');
        Route::get('/create', [SchoolController::class, 'create'])
            ->middleware('can:create,App\Models\School')->name('create');
        Route::post('/', [SchoolController::class, 'store'])
            ->middleware('can:create,App\Models\School')->name('store');

        Route::get('/{school}/{slug}', [SchoolController::class, 'show'])
            ->middleware('can:view,school')->name('show');
        Route::get('/{school}/{slug}/edit', [SchoolController::class, 'edit'])
            ->middleware('can:update,school')->name('edit');
        Route::put('/{school}/{slug}', [SchoolController::class, 'update'])
            ->middleware('can:update,school')->name('update');
        Route::delete('/{school}/{slug}', [SchoolController::class, 'destroy'])
            ->middleware('can:delete,school')->name('destroy');

        // Streams and students of a school
        Route::middleware('can:manage,school')->group(function () {
            // Streams
            Route::post('/{school}/{slug}/streams', [StreamController::class, 'store'])->name('streams.store');
            Route::put('/{school}/{slug}/streams/{stream}', [StreamController::class, 'update'])->name('streams.update');
            Route::delete('/{school}/{slug}/streams/{stream}', [StreamController::class, 'destroy'])->name('streams.destroy');
            Route::get('/{school}/{slug}/streams/{stream}/{streamSlug}', [StreamController::class, 'show'])->name('streams.show');

            // Students of a stream
            Route::post('/{school}/{slug}/streams/{stream}/{streamSlug}/students', [StudentController::class, 'store'])->name('students.store');
            Route::delete('/{school}/{slug}/streams/{stream}/{streamSlug}/students', [StudentController::class, 'destroyMany'])->name('students.destroyMany');
            Route::get('/{school}/{slug}/streams/{stream}/{streamSlug}/students/{student}/edit', [StudentController::class, 'edit'])->name('students.edit');
            Route::put('/{school}/{slug}/streams/{stream}/{streamSlug}/students/{student}', [StudentController::class, 'update'])->name('students.update');

            // Bulk import of students into a form
            Route::prefix('/{school}/{slug}')->group(function () {
                Route::get('/forms/{form}/import', [SchoolStudentsImportController::class, 'create'])->name('students.import.create');
                Route::post('/forms/{form}/import', [SchoolStudentsImportController::class, 'store'])->name('students.import.store');
                Route::get('/import/{importId}/status', [SchoolStudentsImportController::class, 'status'])->whereUuid('importId')->name('students.import.status');
                Route::post('/import/{importId}/cancel', [SchoolStudentsImportController::class, 'cancel'])->whereUuid('importId')->name('students.import.cancel');
            });
        });
    });
});
