<?php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Twilio\Jwt\Grants\ChatGrant;

class TwilioChatGrantProvider extends ServiceProvider
{
    /**
     * Register the application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind(
            ChatGrant::class, function ($app) {
                return new ChatGrant();
            }
        );
    }
}
