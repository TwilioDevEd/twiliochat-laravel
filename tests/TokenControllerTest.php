<?php

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Twilio\Jwt\AccessToken;
use Twilio\Jwt\Grants\IpMessagingGrant;

class TokenControllerTest extends TestCase
{
    public function testGenerateToken()
    {
        $mockTwilioAccessToken = Mockery::mock(AccessToken::class)
            ->makePartial();
        $mockTwilioIPMGrant = Mockery::mock(IpMessagingGrant::class)
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
            AccessToken::class,
            $mockTwilioAccessToken
        );
        $this->app->instance(
            IpMessagingGrant::class,
            $mockTwilioIPMGrant
        );

        // When
        $response = $this->call(
            'POST',
             route('token-generate'),
             ['device' => 'browser',
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
