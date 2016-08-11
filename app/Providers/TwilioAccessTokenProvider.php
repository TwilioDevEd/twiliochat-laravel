<?php
namespace App\Providers;
use Illuminate\Support\ServiceProvider;
use Twilio\Jwt\AccessToken;

class TwilioAccessTokenProvider extends ServiceProvider
{
    /**
     * Register the application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind(
            AccessToken::class, function ($app) {
                $TWILIO_ACCOUNT_SID = config('services.twilio')['accountSid'];
                $TWILIO_API_KEY = config('services.twilio')['apiKey'];
                $TWILIO_API_SECRET = config('services.twilio')['apiSecret'];

                $token = new AccessToken(
                    $TWILIO_ACCOUNT_SID,
                    $TWILIO_API_KEY,
                    $TWILIO_API_SECRET,
                    3600
                );

                return $token;
            }
        );
    }
}
