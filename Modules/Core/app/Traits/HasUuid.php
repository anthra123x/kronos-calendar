<?php

namespace Modules\Core\Traits;

use Illuminate\Support\Str;

/**
 * Trait para usar UUIDs como primary keys en los modelos.
 * Configura automáticamente la generación y el casting del UUID.
 */
trait HasUuid
{
    protected static function bootHasUuid(): void
    {
        static::creating(function ($model): void {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    public function getIncrementing(): bool
    {
        return false;
    }

    public function getKeyType(): string
    {
        return 'string';
    }
}
