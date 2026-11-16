<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CountySeeder extends Seeder
{
    public function run(): void
    {
        $counties = [
            ['name' => 'Homa Bay', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Kisumu', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Migori', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Siaya', 'created_at' => now(), 'updated_at' => now()],
        ];

        DB::table('counties')->insert($counties);
    }
}