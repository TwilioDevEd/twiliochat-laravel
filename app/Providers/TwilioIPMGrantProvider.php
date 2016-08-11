<?php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Twilio\Jwt\Grants\IpMessagingGrant;

class TwilioIPMGrantProvider extends ServiceProvider
{
    /**
     * Register the application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind(
            IpMessagingGrant::class, function ($app) {
                return new IpMessagingGrant();
            }
        );
    }
}
