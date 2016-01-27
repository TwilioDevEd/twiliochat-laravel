@extends('layouts.master')

@section('title')
Twilio Chat
@endsection

@section('content')
<div class="container-fluid">
  <div class="row">
    <div class="col-md-4 col-md-offset-4">
      <div class="row"><div id="logo-column" class="col-md-2 col-md-offset-5">
        <img id="logo-image" src="{{ asset('img/twilio-logo.png') }}"/>
      </div></div>
      <div id="status-row" class="row">
        <div class="col-md-12 right-align">
          <span id="status-span">Connected as <b><span id="username-span"></span></b></span>
          <span id="leave-span"><b>x Leave</b></span>
        </div>
      </div>
    </div>
  </div>
  <div id="container" class="row">
    <div id="channel-panel" class="col-md-offset-2 col-md-2">
      <div id="channel-list" class="row"></div>
      <div class="row"><img id="add-channel-image" src="{{ asset('img/add-channel-image.png') }}"/></div>
    </div>
    <div id="chat-window" class="col-md-4 with-shadow">
      <div id="message-list" class="row"></div>
      <div id="input-div" class="row">
        <textarea id="input-text" autofocus placeholder="   Your message"></textarea>
      </div>
      <div id="connect-panel" class="row with-shadow">

      </div>
    </div>
  </div>
</div>
@endsection
