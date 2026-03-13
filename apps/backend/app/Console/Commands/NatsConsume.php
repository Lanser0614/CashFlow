<?php

namespace App\Console\Commands;

use Basis\Nats\Client;
use Basis\Nats\Configuration;
use Basis\Nats\Message\Payload;
use Illuminate\Console\Command;

class NatsConsume extends Command
{
    protected $signature = 'nats:consume {subject} {--queue= : Queue group name}';

    protected $description = 'Subscribe to NATS subjects and process incoming messages';

    public function handle(): int
    {
        $subject = $this->argument('subject');
        $queue = $this->option('queue');

        $config = new Configuration(
            host: config('nats.host'),
            port: config('nats.port'),
        );

        $client = new Client($config);

        if ($client->ping()) {
            $this->info("Connected to NATS at {$config->host}:{$config->port}");
        }

        $this->info("Subscribing to: {$subject}" . ($queue ? " (queue: {$queue})" : ''));

        $handler = function (Payload $body, ?string $replyTo = null) use ($client) {
            $timestamp = now()->format('H:i:s.v');
            $this->line("[{$timestamp}] {$body}");

            // If it's a request-reply, send response
            if ($replyTo) {
                $client->publish($replyTo, json_encode([
                    'status' => 'received',
                    'timestamp' => $timestamp,
                ]));
            }
        };

        if ($queue) {
            $client->subscribeQueue($subject, $queue, $handler);
        } else {
            $client->subscribe($subject, $handler);
        }

        $this->info('Listening for messages... (Ctrl+C to stop)');

        // Process messages in an infinite loop
        while (true) {
            $client->process();
        }

        return self::SUCCESS;
    }
}
