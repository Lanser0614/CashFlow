<?php

namespace App\Services;

use Basis\Nats\Client;

class NatsPublisher
{
    public function __construct(private Client $client)
    {
    }

    public function publish(string $subject, array $data): void
    {
        $this->client->publish($subject, json_encode(array_merge($data, [
            'timestamp' => now()->toIso8601String(),
        ])));
    }

    public function roomEvent(string $roomCode, string $event, array $data = []): void
    {
        $this->publish("room.{$roomCode}.stream.{$event}", $data);
    }
}
