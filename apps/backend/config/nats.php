<?php

return [
    'host' => env('NATS_HOST', 'nats'),
    'port' => (int) env('NATS_PORT', 4222),
];
