<?php

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Twilio\Jwt\AccessToken;
use Twilio\Jwt\Grants\ChatGrant;

class TokenControllerTest extends TestCase
{
    public function testGenerateToken()
    {
        $mockTwilioChatGrant = Mockery::mock(ChatGrant::class)
            ->makePartial();

        $mockTwilioChatGrant
            ->shouldReceive('setServiceSid')
            ->with(config('services.twilio')['chatServiceSid'])
            ->once();

        $this->app->instance(
            ChatGrant::class,
            $mockTwilioChatGrant
        );

        // When
        $response = $this->call(
            'POST',
             route('token-generate'),
             ['identity' => 'username',
             '_token' => csrf_token()]
        );
        
        $JSONResponse = json_decode($response->getContent(), true);

        // Then
        $this->assertCount(2, $JSONResponse);
        $this->assertEquals('username', $JSONResponse['identity']);
        $this->assertNotNull($JSONResponse['token']);
    }
}
