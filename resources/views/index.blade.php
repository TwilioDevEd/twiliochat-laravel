@extends('layouts.master')

@section('title')
    Twilio Chat
@endsection

@section('content')
  <div class="container-fluid">
      <div class="row">
          <div class="col-md-4"></div>
          <div class="col-md-4">
              <h1 id="header">Twilio Chat</h1>
          </div>
          <div class="col-md-4"></div>
      </div>
      <div id="container" class="row">
          <div id="channel-panel" class="col-md-offset-2 col-md-2">
              <div id="channel-list" class="row"></div>
              <div class="row"><h2>Add channel</h2></div>
          </div>
          <div id="chat-window" class="col-md-4">
              <div id="message-list" class="row"></div>
              <div id="input-div" class="row">
                  <textarea id="input-text" autofocus placeholder="   Your message"></textarea>
              </div>
          </div>
      </div>
  </div>
@endsection
