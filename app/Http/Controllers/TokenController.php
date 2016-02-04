<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use Services_Twilio_AccessToken as AccessToken;
use Services_Twilio_Auth_IpMessagingGrant as IPMGrant;

class TokenController extends Controller
{
    public function generate(Request $request, AccessToken $accessToken, IPMGrant $ipmGrant)
    {
        $appName = "TwilioChat";
        $deviceId = $request->input("device");
        $identity = $request->input("identity");

        $TWILIO_IPM_SERVICE_SID = config('services.twilio')['ipmServiceSid'];

        $endpointId = $appName . ":" . $identity . ":" . $deviceId;

        $accessToken->setIdentity($identity);

        $ipmGrant->setServiceSid($TWILIO_IPM_SERVICE_SID);
        $ipmGrant->setEndpointId($endpointId);

        $accessToken->addGrant($ipmGrant);

        $response = array(
            'identity' => $identity,
            'token' => $accessToken->toJWT()
        );

        return response()->json($response);
    }
}
