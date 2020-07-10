<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use Twilio\Jwt\AccessToken;
use Twilio\Jwt\Grants\ChatGrant;

class TokenController extends Controller
{
    public function generate(Request $request, AccessToken $accessToken, ChatGrant $chatGrant)
    {
        $appName = "TwilioChat";
        $identity = $request->input("identity");

        $TWILIO_CHAT_SERVICE_SID = config('services.twilio')['chatServiceSid'];

        $accessToken->setIdentity($identity);

        $chatGrant->setServiceSid($TWILIO_CHAT_SERVICE_SID);

        $accessToken->addGrant($chatGrant);

        $response = array(
            'identity' => $identity,
            'token' => $accessToken->toJWT()
        );

        return response()->json($response);
    }
}
