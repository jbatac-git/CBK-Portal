<?php

return [
    'temporary_access_days' => 7,
    'temporary_password_length' => 12,

    'temporary_allowed_routes' => ['dashboard', 'portal.home', 'portal.learning.*'],

    'learning_materials' => [
        'max_pdf_kb' => 20480,
        'max_video_kb' => 512000,
        'allowed_pdf_mimes' => ['application/pdf'],
        'allowed_video_mimes' => ['video/mp4', 'video/quicktime', 'video/webm'],
    ],

    'price_lists' => [
        'max_kb' => 20480,
        'allowed_mimes' => ['application/pdf'],
    ],

    'logo' => [
        'max_kb' => 2048,
        'width' => 512,
        'height' => 512,
    ],

    'avatar' => [
        'max_kb' => 4096,
        'width' => 400,
        'height' => 400,
    ],
];