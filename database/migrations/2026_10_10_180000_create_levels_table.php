<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Niveaux CECRL (A1 → B2) : chaque module en appartient un.
     * Les valeurs des codes sont portées par l'enum App\Enums\Level.
     */
    public function up(): void
    {
        Schema::create('levels', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 2)->unique();
            $table->string('name');
            $table->unsignedInteger('order_column')->default(1)->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('levels');
    }
};
