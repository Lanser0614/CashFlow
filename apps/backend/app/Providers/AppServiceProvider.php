<?php

namespace App\Providers;

use App\Services\JanusService;
use App\Services\LiveKitTokenService;
use App\Services\NatsPublisher;
use Basis\Nats\Client;
use Basis\Nats\Configuration;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(Client::class, function () {
            $config = new Configuration(
                host: config('nats.host'),
                port: config('nats.port'),
            );

            return new Client($config);
        });

        $this->app->singleton(NatsPublisher::class);
        $this->app->singleton(JanusService::class);
        $this->app->singleton(LiveKitTokenService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
