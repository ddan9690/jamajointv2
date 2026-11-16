<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SchoolSeeder extends Seeder
{
    public function run(): void
    {
        $schoolsByCounty = [
            'Homa Bay' => [
                ['name' => 'Agoro Sare High School', 'type' => 'boys'],
                ['name' => 'Asumbi Girls High School', 'type' => 'girls'],
                ['name' => 'Homa Bay High School', 'type' => 'boys'],
                ['name' => 'Ringa Boys High School', 'type' => 'boys'],
                ['name' => 'Mbita High School', 'type' => 'boys'],
            ],
            'Kisumu' => [
                ['name' => 'Maseno School', 'type' => 'boys'],
                ['name' => 'Kisumu Girls High School', 'type' => 'girls'],
                ['name' => 'Chulaimbo Boys High School', 'type' => 'boys'],
                ['name' => 'Ahero Girls Secondary School', 'type' => 'girls'],
                ['name' => 'Muhoroni Secondary School', 'type' => 'mixed'],
            ],
            'Migori' => [
                ['name' => 'Kanga High School', 'type' => 'boys'],
                ['name' => 'Kehancha Mixed Secondary School', 'type' => 'mixed'],
                ['name' => 'St. Josephs Rapogi High School', 'type' => 'boys'],
                ['name' => 'Ogande Girls High School', 'type' => 'girls'],
                ['name' => 'Uriri High School', 'type' => 'boys'],
            ],
            'Siaya' => [
                ['name' => 'Maranda High School', 'type' => 'boys'],
                ['name' => 'Ngiya Girls High School', 'type' => 'girls'],
                ['name' => 'Boro Secondary School', 'type' => 'mixed'],
                ['name' => 'Lwak Girls High School', 'type' => 'girls'],
                ['name' => 'Yala Township Secondary School', 'type' => 'mixed'],
            ],
        ];

        foreach ($schoolsByCounty as $countyName => $schools) {
            $county = DB::table('counties')->where('name', $countyName)->first();

            if ($county) {
                foreach ($schools as $school) {
                    DB::table('schools')->insert([
                        'county_id' => $county->id,
                        'name' => $school['name'],
                        'slug' => Str::slug($school['name']),
                        'type' => $school['type'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }
}