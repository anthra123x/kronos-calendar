<?php

namespace Modules\Academics\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Core\Traits\HasUuid;

class ClassSchedule extends Model
{
    use HasUuid;

    protected $fillable = [
        'subject_id',
        'day_of_week',
        'starts_at',
        'ends_at',
        'classroom',
    ];

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }
}
