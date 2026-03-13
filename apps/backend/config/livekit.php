<?php

return [
    'http_url' => env('LIVEKIT_HTTP_URL', 'http://livekit:7880'),
    'ws_url' => env('LIVEKIT_WS_URL', 'ws://localhost:7880'),
    'api_key' => env('LIVEKIT_API_KEY', 'devkey'),
    'api_secret' => env('LIVEKIT_API_SECRET', 'secret'),
];
