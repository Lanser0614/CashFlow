<?php

return [
    'http_url' => env('JANUS_HTTP_URL', 'http://janus:8088/janus'),
    'admin_url' => env('JANUS_ADMIN_URL', 'http://janus:7088/admin'),
    'api_secret' => env('JANUS_API_SECRET', 'cashflow-janus-secret'),
    'admin_secret' => env('JANUS_ADMIN_SECRET', 'cashflow-janus-admin-secret'),
];
