<?php

namespace Modules\Academics\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Core\Traits\HasUuid;

class Grade extends Model
{
    use HasUuid;

    protected $fillable = [
        'subject_id',
        'name',
        'score',
        'max_score',
        'weight',
        'date',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'float',
            'max_score' => 'float',
            'weight' => 'float',
            'date' => 'date',
        ];
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }
}
