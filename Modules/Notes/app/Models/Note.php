<?php

namespace Modules\Notes\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Core\Traits\HasUuid;
use Modules\Workspace\Models\Project;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;
use Spatie\Tags\HasTags;

class Note extends Model
{
    use HasFactory;
    use HasSlug;
    use HasTags;
    use HasUuid;
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'project_id',
        'title',
        'slug',
        'content',
        'format',
        'category',
        'is_pinned',
        'is_favorite',
        'is_archived',
    ];

    protected function casts(): array
    {
        return [
            'is_pinned' => 'boolean',
            'is_favorite' => 'boolean',
            'is_archived' => 'boolean',
        ];
    }

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('title')
            ->saveSlugsTo('slug');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(NoteAttachment::class);
    }
}
