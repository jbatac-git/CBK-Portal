<?php

namespace App\Models;

use Database\Factories\PriceListDownloadFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Who downloaded a price list and when; the id is printed on the stamped copy as "Ref". */
class PriceListDownload extends Model
{
    /** @use HasFactory<PriceListDownloadFactory> */
    use HasFactory;

    public const UPDATED_AT = null;

    protected $fillable = ['price_list_id', 'user_id', 'user_name', 'username', 'ip_address'];

    public function priceList(): BelongsTo
    {
        return $this->belongsTo(PriceList::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
