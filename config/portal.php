<?php

return [
    // Spec: temporary access is valid for 7 days.
    'temporary_access_days' => 7,

    'temporary_password_length' => 12,
    // Route names a temporary Diser may open. Everything else returns 403.
'temporary_allowed_routes' => ['dashboard', 'portal.home', 'portal.learning.*'],
];