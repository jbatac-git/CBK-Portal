<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

return new class extends Migration
{
    /**
     * Price lists are now served only through the logged-in download route,
     * so files still on the public disk (reachable by anyone with the link)
     * move to the private disk.
     */
    public function up(): void
    {
        $this->moveFiles(from: 'public', to: 'local');

        Schema::table('price_lists', fn (Blueprint $table) => $table->string('file_disk')->default('local')->change());
    }

    public function down(): void
    {
        $this->moveFiles(from: 'local', to: 'public');

        Schema::table('price_lists', fn (Blueprint $table) => $table->string('file_disk')->default('public')->change());
    }

    private function moveFiles(string $from, string $to): void
    {
        DB::table('price_lists')->where('file_disk', $from)->orderBy('id')->each(function (object $row) use ($from, $to) {
            $source = Storage::disk($from);

            if ($source->exists($row->file_path)) {
                Storage::disk($to)->writeStream($row->file_path, $source->readStream($row->file_path));
                $source->delete($row->file_path);
            }

            DB::table('price_lists')->where('id', $row->id)->update(['file_disk' => $to]);
        });
    }
};
