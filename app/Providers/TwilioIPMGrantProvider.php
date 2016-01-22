<?php
namespace App\Providers;
use Illuminate\Support\ServiceProvider;
use Services_Twilio_Auth_IpMessagingGrant;

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
            'Services_Twilio_Auth_IpMessagingGrant', function ($app) {
                return new Services_Twilio_Auth_IpMessagingGrant();
            }
        );
    }
}
