<?php

namespace App\Models;

use App\Enums\Level as LevelEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\EloquentSortable\Sortable;
use Spatie\EloquentSortable\SortableTrait;

/**
 * Niveau CECRL — la table levels est la source de vérité, l'enum
 * App\Enums\Level porte les valeurs typées (cast du code ci-dessous).
 *
 * @property int $id
 * @property LevelEnum $code
 * @property string $name
 * @property int $order_column
 */
class Level extends Model implements Sortable
{
    use SortableTrait;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'code',
        'name',
        'order_column',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'code' => LevelEnum::class,
            'order_column' => 'integer',
        ];
    }

    /** @return HasMany<Module, $this> */
    public function modules(): HasMany
    {
        return $this->hasMany(Module::class);
    }
}
