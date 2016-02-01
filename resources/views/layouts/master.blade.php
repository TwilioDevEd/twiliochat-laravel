<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <title>@yield('title')</title>
    <!-- CSS -->
    <link rel="stylesheet"
          href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
    <link rel="stylesheet"
          href="//maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="{{ asset('css/twiliochat.css') }}">

    @yield('css')
  </head>
  <body>
    @yield('content')
    <!-- JavaScript -->
    <script src="//code.jquery.com/jquery-2.2.0.min.js"></script>
    <script src="{{ asset('js/jquery-throttle.min.js') }}"></script>
    <script src="{{ asset('js/vendor/jquery.loadTemplate-1.4.4.min.js') }}"></script>
    <script src="//maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/moment.js/2.11.1/moment.min.js"></script>
    <script src="//media.twiliocdn.com/sdk/rtc/js/ip-messaging/v0.9/twilio-ip-messaging.min.js"></script>
    <script src="{{ asset('js/twiliochat.js') }}"></script>
    <script src="{{ asset('js/dateformatter.js') }}"></script>
    @yield('javascript')
  </body>
</html>
