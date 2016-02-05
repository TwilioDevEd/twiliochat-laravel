# twiliochat-laravel
[![Build Status](https://travis-ci.org/TwilioDevEd/twiliochat-laravel.svg?branch=master)](https://travis-ci.org/TwilioDevEd/twiliochat-laravel)

Laravel implementation of Twilio Chat

### Run the application

1. Clone the repository and `cd` into it.
1. Install the application's dependencies with [Composer](https://getcomposer.org/)

   ```bash
   $ composer install
   ```
1. Copy the sample configuration file and edit it to match your configuration.

   ```bash
   $ cp .env.example .env
   ```

  You can find your `TWILIO_ACCOUNT_SID` in your
  [Twilio Account Settings](https://www.twilio.com/user/account/settings).
  For `TWILIO_API_KEY` and `TWILIO_API_SECRET` you need to go
  [here](https://www.twilio.com/user/account/ip-messaging/dev-tools/api-keys). There
  youl'll be able to create a new API key obtaining the two required values.
  For `TWILIO_IPM_SERVICE_SID` you can go [here](https://www.twilio.com/user/account/ip-messaging/services),
  where you must create an IP Messaging Service. When the service is created you'll
  have access to the service's SID.
1. Generate an `APP_KEY`:

   ```bash
   $ php artisan key:generate
   ```

1. Run the application using Artisan.

  ```bash
  $ php artisan serve
  ```

  Now you can access the application at `http://localhost:8000`.

## Expose you localhost to the internet

If you want your chat application to be reachable publicly in the internet, you can use
a service like [ngrok](https://ngrok.com/).

1. Expose the application to the wider Internet

   ```bash
   $ ngrok http 8000
   ```

  It is `artisan serve` default behavior to use `http://localhost:8000` when
  the application is run. This means that the ip addresses where your app will be
  reachable on you local machine will vary depending on the operating system.

  The most common scenario, is that your app will be reachable through address
  `http://127.0.0.1:8000`, and this is important because ngrok creates the
  tunnel using only that address. So, if `http://127.0.0.1:8000` is not reachable
  in your local machine when you run the app, you must tell artisan to use this
  address, like this:

  ```bash
  $ php artisan serve --host=127.0.0.1
  ```

### Dependencies

This application uses this Twilio helper library:
* [twilio-php](https://www.twilio.com/docs/php/install)

### Run the tests

1. Run at the top-level directory:

   ```bash
   $ phpunit
   ```
   If you don't have phpunit installed on your system, you can follow [this
   instructions](https://phpunit.de/manual/current/en/installation.html) to
   install it.

1. Run javascript tests:
   ```bash
   $ cd public && npm install && npm test
   ```
