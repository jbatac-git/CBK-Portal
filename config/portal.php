<?php

return [
    'temporary_access_days' => 7,
    'temporary_password_length' => 12,

    'temporary_allowed_routes' => ['dashboard', 'portal.home', 'portal.learning.*'],

    'learning_materials' => [
        'max_pdf_kb' => 20480,
        // null = no app-level limit; the web server and PHP (upload_max_filesize,
        // post_max_size) still cap request size, so raise those for large videos.
        'max_video_kb' => env('LEARNING_MAX_VIDEO_KB'),
        'allowed_pdf_mimes' => ['application/pdf'],
        'allowed_video_mimes' => ['video/mp4', 'video/quicktime', 'video/webm'],
    ],

    'price_lists' => [
        'max_kb' => 20480,
        // Downloaded Excel copies are stamped with the downloader and the time in this zone.
        'stamp_timezone' => 'Asia/Manila',
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
