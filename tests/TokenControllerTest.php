<?php

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class TokenControllerTest extends TestCase
{
    public function testGenerateToken()
    {
        $mockTwilioAccessToken = Mockery::mock('Services_Twilio_AccessToken')
                                    ->makePartial();
        $mockTwilioIPMGrant = Mockery::mock('Services_Twilio_Auth_IpMessagingGrant')
                                  ->makePartial();
        $mockTwilioIPMGrant
            ->shouldReceive('setServiceSid')
            ->with(config('services.twilio')['ipmServiceSid'])
            ->once();

        $mockTwilioIPMGrant
            ->shouldReceive('setEndpointId')
            ->with('TwilioChat:username:browser')
            ->once();

        $this->app->instance(
            'Services_Twilio_AccessToken',
            $mockTwilioAccessToken
        );
        $this->app->instance(
            'Services_Twilio_Auth_IpMessagingGrant',
            $mockTwilioIPMGrant
        );

        // When
        $response = $this->call(
            'POST',
             route('token-generate'),
             ['deviceId' => 'browser',
             'identity' => 'username',
             '_token' => csrf_token()]
        );
        $JSONResponse = json_decode($response->getContent(), true);

        // Then
        $this->assertCount(2, $JSONResponse);
        $this->assertEquals($JSONResponse['identity'], 'username');
        $this->assertNotNull($JSONResponse['token']);
    }
}
