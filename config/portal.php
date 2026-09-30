<?php

return [
    // Spec: temporary access is valid for 7 days.
    'temporary_access_days' => 7,

    'temporary_password_length' => 12,
    // Route names a temporary Diser may open. Everything else returns 403.
    'temporary_allowed_routes' => ['dashboard', 'portal.home', 'portal.learning.*'],
    'learning_materials' => [
        'max_pdf_kb' => 20480,     // 20 MB
        'max_video_kb' => 512000,  // 500 MB
        'allowed_pdf_mimes' => ['application/pdf'],
        'allowed_video_mimes' => ['video/mp4', 'video/quicktime', 'video/webm'],
    ],
];
