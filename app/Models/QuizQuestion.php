<?php

namespace App\Models;

use Database\Factories\QuizQuestionFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\EloquentSortable\Sortable;
use Spatie\EloquentSortable\SortableTrait;

/**
 * Une question du quiz : les options sont stockées en JSON (clés a/b/c).
 *
 * @property array<string, string> $options
 */
class QuizQuestion extends Model implements Sortable
{
    /** @use HasFactory<QuizQuestionFactory> */
    use HasFactory, SortableTrait;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'quiz_id',
        'prompt',
        'options',
        'correct_option',
        'explanation',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'options' => 'array',
        ];
    }

    /** @return BelongsTo<Quiz, $this> */
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    /**
     * The automatic order column is counted inside the parent quiz.
     *
     * @return Builder<QuizQuestion>
     */
    public function buildSortQuery(): Builder
    {
        return static::where('quiz_id', $this->quiz_id);
    }
}
