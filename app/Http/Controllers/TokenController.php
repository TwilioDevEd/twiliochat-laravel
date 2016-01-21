<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use Services_Twilio_AccessToken;

class TokenController extends Controller
{
    public function generate(Request $request)
    {
        $device = $request->input("device");
        $identity = $request->input("identity");

        $TWILIO_ACCOUNT_SID = config('services.twilio')['accountSid'];
        $TWILIO_API_KEY = config('services.twilio')['apiKey'];
        $TWILIO_API_SECRET = config('services.twilio')['apiSecret'];

        $token = new Services_Twilio_AccessToken(
            $TWILIO_ACCOUNT_SID,
            $TWILIO_API_KEY,
            $TWILIO_API_SECRET,
            3600,
            $identity
        );

        return response()->json($response);
    }
}
