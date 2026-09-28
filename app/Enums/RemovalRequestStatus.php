<?php

namespace App\Enums;

enum RemovalRequestStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Declined = 'declined';

    public function label(): string
    {
        return ucfirst($this->value);
    }
}