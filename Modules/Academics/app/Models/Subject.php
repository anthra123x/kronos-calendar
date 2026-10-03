<?php

namespace Modules\Academics\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Core\Traits\HasUuid;

class Subject extends Model
{
    use HasFactory;
    use HasUuid;
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'academic_period_id',
        'name',
        'code',
        'professor',
        'classroom',
        'color',
        'credits',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'credits' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function academicPeriod(): BelongsTo
    {
        return $this->belongsTo(AcademicPeriod::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(ClassSchedule::class);
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class);
    }

    /**
     * Calcula el promedio ponderado de la materia.
     */
    public function getWeightedAverageAttribute(): ?float
    {
        $grades = $this->grades->filter(fn ($g) => $g->score !== null);

        if ($grades->isEmpty()) {
            return null;
        }

        $totalWeight = $grades->sum('weight');

        if ($totalWeight === 0.0) {
            return null;
        }

        return $grades->sum(fn ($g) => $g->score * $g->weight) / $totalWeight;
    }
}
