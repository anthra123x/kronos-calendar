<?php

namespace Modules\Calendar\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Core\Traits\HasUuid;
use Spatie\Tags\HasTags;

class Event extends Model
{
    use HasFactory;
    use HasTags;
    use HasUuid;
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'location',
        'color',
        'starts_at',
        'ends_at',
        'is_all_day',
        'category',
        'status',
        'is_recurring',
        'recurrence_type',
        'recurrence_interval',
        'recurrence_end_date',
        'recurrence_days',
        'parent_event_id',
        'reminder',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'recurrence_end_date' => 'date',
            'recurrence_days' => 'array',
            'is_all_day' => 'boolean',
            'is_recurring' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parentEvent(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'parent_event_id');
    }
}
