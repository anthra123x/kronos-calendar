<?php

namespace Modules\Notes\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Core\Traits\HasUuid;

class NoteAttachment extends Model
{
    use HasUuid;

    protected $fillable = [
        'note_id',
        'filename',
        'original_filename',
        'mime_type',
        'size',
        'path',
    ];

    public function note(): BelongsTo
    {
        return $this->belongsTo(Note::class);
    }
}
