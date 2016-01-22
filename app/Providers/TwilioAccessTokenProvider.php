<?php
namespace App\Providers;
use Illuminate\Support\ServiceProvider;
use Services_Twilio_AccessToken;

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
            'Services_Twilio_AccessToken', function ($app) {
                $TWILIO_ACCOUNT_SID = config('services.twilio')['accountSid'];
                $TWILIO_API_KEY = config('services.twilio')['apiKey'];
                $TWILIO_API_SECRET = config('services.twilio')['apiSecret'];

                $token = new Services_Twilio_AccessToken(
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
